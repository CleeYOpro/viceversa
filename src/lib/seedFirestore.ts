/**
 * seedFirestore.ts — idempotent demo seed
 * Patients: Eleanor, Harold
 * Doctor:   Dr. Priya Patel (linked to both)
 * Caregivers: Cleo + Nikhil on both patients
 */
import {
  doc, setDoc, addDoc, collection, getDocs,
  Timestamp, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

export const PATIENT_ELEANOR_ID = 'patient_eleanor_demo';
export const PATIENT_HAROLD_ID  = 'patient_harold_demo';
export const USER_CLEO_ID       = 'user_cleo_demo';
export const USER_NIKHIL_ID     = 'user_nikhil_demo';
export const USER_DOCTOR_ID     = 'user_drpatel_demo';

const ts = (daysAgo = 0, hour = 8) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return Timestamp.fromDate(d);
};

async function clearSub(patientId: string, sub: string) {
  try {
    const snap = await getDocs(collection(db, 'patients', patientId, sub));
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  } catch { /* ignore */ }
}

export async function seedDemoPatients() {
  console.log('[seed] Starting...');
  const { getAuth } = await import('firebase/auth');
  const me = getAuth().currentUser;
  const myUid = me?.uid ?? USER_CLEO_ID;
  const myName = me?.displayName ?? 'Cleo';

  // ── User docs ──────────────────────────────────────────────────────────────
  await setDoc(doc(db, 'users', USER_CLEO_ID), {
    displayName: 'Cleo', email: 'cleo@komekare.dev', role: 'caregiver',
    villageIds: [PATIENT_ELEANOR_ID, PATIENT_HAROLD_ID], createdAt: ts(60),
  }, { merge: true });
  await setDoc(doc(db, 'users', USER_NIKHIL_ID), {
    displayName: 'Nikhil', email: 'nikhil@komekare.dev', role: 'caregiver',
    villageIds: [PATIENT_ELEANOR_ID, PATIENT_HAROLD_ID], createdAt: ts(60),
  }, { merge: true });
  await setDoc(doc(db, 'users', USER_DOCTOR_ID), {
    displayName: 'Dr. Priya Patel', email: 'drpatel@komekare.dev', role: 'doctor',
    villageIds: [], createdAt: ts(90),
    doctorProfile: { licenseNumber: 'CA-MD-88421', specialty: 'Geriatrics', npi: '1234567890' },
  }, { merge: true });
  if (me) {
    await setDoc(doc(db, 'users', myUid), {
      displayName: myName, email: me.email ?? '', role: 'caregiver',
      villageIds: [PATIENT_ELEANOR_ID, PATIENT_HAROLD_ID], createdAt: ts(60),
    }, { merge: true });
  }

  // ── Patients ───────────────────────────────────────────────────────────────
  await setDoc(doc(db, 'patients', PATIENT_ELEANOR_ID), {
    name: 'Eleanor', dob: '1942-03-15',
    conditions: ['Dementia (Moderate)', 'Hypertension', 'Type 2 Diabetes', 'Osteoporosis'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    emergencyContacts: [{ name: 'Robert', phone: '555-0192', relationship: 'Son' }],
    createdBy: USER_CLEO_ID, createdAt: ts(60),
  });
  await setDoc(doc(db, 'patients', PATIENT_HAROLD_ID), {
    name: 'Harold', dob: '1938-07-22',
    conditions: ["Parkinson's Disease (Stage 2)", 'Congestive Heart Failure', 'Chronic Arthritis', 'Mild Depression'],
    allergies: ['Aspirin', 'Codeine', 'Latex'],
    emergencyContacts: [{ name: 'Linda', phone: '555-0311', relationship: 'Daughter' }],
    createdBy: USER_NIKHIL_ID, createdAt: ts(60),
  });

  // ── Villages ───────────────────────────────────────────────────────────────
  await setDoc(doc(db, 'villages', PATIENT_ELEANOR_ID), {
    patientId: PATIENT_ELEANOR_ID, name: 'Eleanor',
    createdBy: USER_CLEO_ID, createdAt: ts(60), inviteCode: 'DEMO1234',
  });
  await setDoc(doc(db, 'villages', PATIENT_HAROLD_ID), {
    patientId: PATIENT_HAROLD_ID, name: 'Harold',
    createdBy: USER_NIKHIL_ID, createdAt: ts(60), inviteCode: 'DEMO5678',
  });

  await seedEleanor(myUid, myName);
  await seedHarold(myUid, myName);
  console.log('[seed] Done.');
}

// ─── Shared caregiver + doctor writer ────────────────────────────────────────
async function writeCareTeam(pid: string, myUid: string, myName: string) {
  const perms = (lead: boolean) => ({
    canInviteMembers: lead, canEditProfile: lead, canViewRestrictedNotes: lead,
  });
  // Current logged-in user as lead
  await setDoc(doc(db, 'patients', pid, 'caregivers', myUid), {
    userId: myUid, role: 'lead_caregiver', displayName: myName,
    joinedAt: ts(60), permissions: perms(true),
  });
  // Cleo
  await setDoc(doc(db, 'patients', pid, 'caregivers', USER_CLEO_ID), {
    userId: USER_CLEO_ID, role: 'caregiver', displayName: 'Cleo',
    joinedAt: ts(55), permissions: perms(false),
  });
  // Nikhil
  await setDoc(doc(db, 'patients', pid, 'caregivers', USER_NIKHIL_ID), {
    userId: USER_NIKHIL_ID, role: 'caregiver', displayName: 'Nikhil',
    joinedAt: ts(55), permissions: perms(false),
  });
  // Doctor
  await setDoc(doc(db, 'patients', pid, 'doctors', USER_DOCTOR_ID), {
    userId: USER_DOCTOR_ID, displayName: 'Dr. Priya Patel',
    specialty: 'Geriatrics', linkedAt: ts(50),
    consentGrantedBy: USER_CLEO_ID, consentGrantedAt: ts(50),
    accessLevel: 'full_logs',
  });
}

// ─── Eleanor ──────────────────────────────────────────────────────────────────
async function seedEleanor(myUid: string, myName: string) {
  const pid = PATIENT_ELEANOR_ID;
  for (const sub of ['medications','doseLogs','healthLogs','tasks','calendar','insights','helpRequests']) {
    await clearSub(pid, sub);
  }
  await writeCareTeam(pid, myUid, myName);

  // Medications
  const eMeds = [
    { id: 'emed1', name: 'Donepezil',    dosage: '10mg',   frequency: 'daily',      scheduleTimes: ['20:00'], prescriber: 'Dr. Patel' },
    { id: 'emed2', name: 'Lisinopril',   dosage: '20mg',   frequency: 'daily',      scheduleTimes: ['08:00'], prescriber: 'Dr. Patel' },
    { id: 'emed3', name: 'Metformin',    dosage: '500mg',  frequency: 'twice_daily', scheduleTimes: ['08:00','20:00'], prescriber: 'Dr. Patel' },
    { id: 'emed4', name: 'Alendronate',  dosage: '70mg',   frequency: 'weekly',     scheduleTimes: ['08:00'], prescriber: 'Dr. Patel' },
    { id: 'emed5', name: 'Atorvastatin', dosage: '40mg',   frequency: 'daily',      scheduleTimes: ['21:00'], prescriber: 'Dr. Patel' },
    { id: 'emed6', name: 'Aspirin',      dosage: '81mg',   frequency: 'daily',      scheduleTimes: ['08:00'], prescriber: 'Dr. Patel' },
    { id: 'emed7', name: 'Vitamin D3',   dosage: '2000IU', frequency: 'daily',      scheduleTimes: ['08:00'], prescriber: 'Dr. Patel' },
  ];
  for (const m of eMeds) {
    await setDoc(doc(db, 'patients', pid, 'medications', m.id), {
      ...m, addedBy: USER_CLEO_ID, createdAt: ts(30),
    });
  }

  // Health logs
  const eLogs = [
    [70,'148/92',187,134,'poor','Confused in the evening, refused dinner'],
    [63,'145/90',175,134,'poor','Slept most of the day, mild agitation'],
    [56,'142/88',162,133,'fair','Good morning, confused after lunch'],
    [49,'140/87',158,133,'fair','Ate full breakfast, short walk outside'],
    [42,'138/86',155,133,'fair','Recognized Robert, good spirits'],
    [35,'135/84',148,132,'good','Walked in garden, ate well'],
    [28,'133/83',144,132,'good','Watched TV with family, calm'],
    [21,'132/82',141,132,'good','Best week in months, medication adjusted'],
    [14,'130/81',138,131,'good','Completed PT session, no confusion'],
    [ 7,'128/80',136,131,'good','Slept 8 hours, morning walk completed'],
    [ 3,'129/81',139,131,'fair','Mild agitation in afternoon'],
    [ 1,'127/79',133,130,'good','Great day, recognized all family members'],
  ] as const;
  for (const [d,bp,gl,wt,mood,notes] of eLogs) {
    await addDoc(collection(db,'patients',pid,'healthLogs'), {
      type:'bp', timestamp:ts(d,9), authorId:USER_CLEO_ID, authorName:'Cleo',
      notes, isRestricted:false, vitals:{bp,glucose:gl,weight:wt},
    });
    await addDoc(collection(db,'patients',pid,'healthLogs'), {
      type:'mood', timestamp:ts(d,10), authorId:USER_CLEO_ID, authorName:'Cleo',
      notes:`Mood: ${mood}. ${notes}`, isRestricted:false, vitals:{},
    });
  }

  // Dose logs
  const dosePairs = [
    [1,'emed1','Donepezil','given','Cleo'],
    [1,'emed2','Lisinopril','given','Nikhil'],
    [2,'emed3','Metformin','missed','Cleo'],
    [3,'emed5','Atorvastatin','given','Cleo'],
    [4,'emed2','Lisinopril','given','Nikhil'],
    [5,'emed1','Donepezil','refused','Cleo'],
    [6,'emed3','Metformin','given','Nikhil'],
    [7,'emed2','Lisinopril','given','Cleo'],
  ] as const;
  for (const [d,mid,mname,status,who] of dosePairs) {
    await addDoc(collection(db,'patients',pid,'doseLogs'), {
      medicationId:mid, medicationName:mname,
      timestamp:ts(d,8), administeredBy:who==='Cleo'?USER_CLEO_ID:USER_NIKHIL_ID,
      administeredByName:who, status, notes:'',
    });
  }

  // Tasks
  const eTasks = [
    ['Blood pressure check','other','James R.',0,10,'pending'],
    ['Glucose reading before lunch','other','Cleo',0,11,'pending'],
    ['Afternoon walk (15 min)','exercise','Cleo',0,15,'pending'],
    ['Evening medications','medication','Nikhil',0,21,'pending'],
    ['Dr. Patel follow-up call','appointment','Robert',1,10,'pending'],
    ['Morning medications','medication','Cleo',0,8,'completed'],
    ['Weekly weight check','other','Cleo',2,9,'pending'],
    ['Physical therapy session','exercise','James R.',3,14,'pending'],
  ] as const;
  for (const [title,cat,who,dOff,hr,status] of eTasks) {
    await addDoc(collection(db,'patients',pid,'tasks'), {
      title, category:cat, assigneeName:who, assigneeId:USER_CLEO_ID,
      dueDateTime:ts(-dOff,hr), status, createdBy:USER_CLEO_ID,
    });
  }

  // Calendar
  const eCal = [
    ['Morning Medications','medication',0,8,'Daily Meds'],
    ['Blood Pressure Check','appointment',0,10,'Home monitoring'],
    ['Therapy Session','appointment',0,14,'Dr. Patel'],
    ['Light Exercise Walk','task',0,16,'15 min'],
    ['Evening Medications','medication',0,21,'Nightly Meds'],
    ['Dr. Patel Follow-up','appointment',1,10,'Phone call'],
    ['Morning Medications','medication',1,8,'Daily Meds'],
    ['Weekly Weight Check','task',2,9,'Home scale'],
    ['Morning Medications','medication',2,8,'Daily Meds'],
    ['Physical Therapy','appointment',3,14,'St. Jude Rehab'],
    ['Morning Medications','medication',3,8,'Daily Meds'],
    ['Cardiology Consult','appointment',5,11,'Dr. Okafor'],
    ['Morning Medications','medication',-1,8,'Daily Meds'],
    ['Blood Pressure Check','appointment',-1,10,'Home monitoring'],
    ['Morning Medications','medication',-2,8,'Daily Meds'],
    ['Morning Medications','medication',-3,8,'Daily Meds'],
  ] as const;
  for (const [title,type,dOff,hr,notes] of eCal) {
    await addDoc(collection(db,'patients',pid,'calendar'), {
      title, type, startDateTime:ts(-dOff,hr), notes, createdBy:USER_CLEO_ID,
    });
  }

  // Insights
  await addDoc(collection(db,'patients',pid,'insights'), {
    summary:'Confusion events cluster between 4-6 PM. Consider adjusting afternoon activity schedule.',
    category:'pattern', generatedAt:ts(1), generatedBy:'ai',
    dataRange:{from:ts(30),to:ts(0)}, tags:['confusion','sundowning'],
  });
  await addDoc(collection(db,'patients',pid,'insights'), {
    summary:'BP trending high — 3 readings above 130 this week. Notify Dr. Patel.',
    category:'trend', generatedAt:ts(0), generatedBy:'ai',
    dataRange:{from:ts(7),to:ts(0)}, tags:['bp','hypertension'],
  });
  await addDoc(collection(db,'patients',pid,'insights'), {
    summary:'Metformin refill due in 4 days based on current dosage schedule.',
    category:'adherence', generatedAt:ts(0), generatedBy:'ai',
    dataRange:{from:ts(30),to:ts(0)}, tags:['medication','refill'],
  });
  await addDoc(collection(db,'patients',pid,'insights'), {
    summary:'Caregiver Cleo has logged 18 entries this week — consider scheduling a respite break.',
    category:'burnout', generatedAt:ts(0), generatedBy:'ai',
    dataRange:{from:ts(7),to:ts(0)}, tags:['burnout','caregiver'],
  });

  // Help requests
  await addDoc(collection(db,'patients',pid,'helpRequests'), {
    urgency:'high', description:'Eleanor fell in the bathroom. Need someone to help assess.',
    duration:'2 hours', location:'Home', requestedBy:USER_CLEO_ID,
    status:'resolved', respondedBy:USER_NIKHIL_ID, createdAt:ts(5),
  });
  await addDoc(collection(db,'patients',pid,'helpRequests'), {
    urgency:'medium', description:'Need coverage for evening meds on Saturday.',
    duration:'1 hour', location:'Home', requestedBy:USER_CLEO_ID,
    status:'accepted', respondedBy:USER_NIKHIL_ID, createdAt:ts(2),
  });
}

// ─── Harold ───────────────────────────────────────────────────────────────────
async function seedHarold(myUid: string, myName: string) {
  const pid = PATIENT_HAROLD_ID;
  for (const sub of ['medications','doseLogs','healthLogs','tasks','calendar','insights','helpRequests']) {
    await clearSub(pid, sub);
  }
  await writeCareTeam(pid, myUid, myName);

  // Medications
  const hMeds = [
    { id:'hmed1', name:'Carbidopa/Levodopa', dosage:'25/100mg', frequency:'twice_daily', scheduleTimes:['07:00','13:00'], prescriber:'Dr. Chen' },
    { id:'hmed2', name:'Carvedilol',         dosage:'12.5mg',   frequency:'daily',       scheduleTimes:['08:00'], prescriber:'Dr. Okafor' },
    { id:'hmed3', name:'Furosemide',         dosage:'40mg',     frequency:'daily',       scheduleTimes:['08:00'], prescriber:'Dr. Okafor' },
    { id:'hmed4', name:'Sertraline',         dosage:'50mg',     frequency:'daily',       scheduleTimes:['08:00'], prescriber:'Dr. Chen' },
    { id:'hmed5', name:'Potassium Chloride', dosage:'20mEq',    frequency:'daily',       scheduleTimes:['08:00'], prescriber:'Dr. Okafor' },
    { id:'hmed6', name:'Rivastigmine',       dosage:'4.6mg/24h',frequency:'daily',       scheduleTimes:['08:00'], prescriber:'Dr. Chen' },
  ];
  for (const m of hMeds) {
    await setDoc(doc(db,'patients',pid,'medications',m.id), {
      ...m, addedBy:USER_NIKHIL_ID, createdAt:ts(30),
    });
  }

  // Health logs
  const hLogs = [
    [70,'158/96',112,168,'poor','Tremors worse, fell getting out of bed'],
    [63,'156/95',110,168,'poor','Shortness of breath, PT session cancelled'],
    [56,'154/94',110,167,'poor',"New Parkinson's med started, some improvement"],
    [49,'152/92',108,167,'fair','PT session completed, tremors slightly reduced'],
    [42,'150/91',108,166,'fair','Mood improved, watching TV more'],
    [35,'148/90',106,166,'fair','Walked to mailbox with assistance'],
    [28,'146/89',106,165,'fair','Appetite improving, less tremor at rest'],
    [21,'144/88',104,165,'fair','PT session completed, good balance'],
    [14,'142/87',104,165,'fair','Mood improved, watching TV more'],
    [ 7,'140/86',102,164,'good','Walked to mailbox independently, big win'],
    [ 3,'139/85',102,164,'good','Completed full PT session'],
    [ 1,'138/85',100,164,'good','Best day in weeks, minimal tremors'],
  ] as const;
  for (const [d,bp,gl,wt,mood,notes] of hLogs) {
    await addDoc(collection(db,'patients',pid,'healthLogs'), {
      type:'bp', timestamp:ts(d,9), authorId:USER_NIKHIL_ID, authorName:'Nikhil',
      notes, isRestricted:false, vitals:{bp,glucose:gl,weight:wt},
    });
    await addDoc(collection(db,'patients',pid,'healthLogs'), {
      type:'mood', timestamp:ts(d,10), authorId:USER_CLEO_ID, authorName:'Cleo',
      notes:`Mood: ${mood}. ${notes}`, isRestricted:false, vitals:{},
    });
  }

  // Dose logs
  const hDosePairs = [
    [1,'hmed1','Carbidopa/Levodopa','given','Nikhil'],
    [1,'hmed2','Carvedilol','given','Cleo'],
    [2,'hmed3','Furosemide','given','Nikhil'],
    [3,'hmed1','Carbidopa/Levodopa','missed','Cleo'],
    [4,'hmed4','Sertraline','given','Nikhil'],
    [5,'hmed2','Carvedilol','given','Cleo'],
    [6,'hmed5','Potassium Chloride','given','Nikhil'],
    [7,'hmed1','Carbidopa/Levodopa','given','Cleo'],
  ] as const;
  for (const [d,mid,mname,status,who] of hDosePairs) {
    await addDoc(collection(db,'patients',pid,'doseLogs'), {
      medicationId:mid, medicationName:mname,
      timestamp:ts(d,8), administeredBy:who==='Cleo'?USER_CLEO_ID:USER_NIKHIL_ID,
      administeredByName:who, status, notes:'',
    });
  }

  // Tasks
  const hTasks = [
    ['Morning PT exercises','exercise','Sarah K.',0,9,'completed'],
    ['Weight & fluid intake log','other','Linda',0,12,'pending'],
    ['Tremor assessment','appointment','Dr. Chen',0,14,'pending'],
    ['Evening cardiac meds','medication','Nikhil',0,20,'pending'],
    ['Cardiology appointment','appointment','Linda',4,10,'pending'],
    ['Morning medications','medication','Cleo',0,8,'completed'],
    ['Afternoon PT session','exercise','Sarah K.',2,14,'pending'],
    ['Fluid restriction check','other','Nikhil',1,12,'pending'],
  ] as const;
  for (const [title,cat,who,dOff,hr,status] of hTasks) {
    await addDoc(collection(db,'patients',pid,'tasks'), {
      title, category:cat, assigneeName:who, assigneeId:USER_NIKHIL_ID,
      dueDateTime:ts(-dOff,hr), status, createdBy:USER_NIKHIL_ID,
    });
  }

  // Calendar
  const hCal = [
    ['Morning Medications','medication',0,8,'Daily Meds'],
    ['Morning PT Exercises','task',0,9,'30 min session'],
    ['Tremor Assessment','appointment',0,14,'Dr. Chen'],
    ['Evening Cardiac Meds','medication',0,20,'Carvedilol + Furosemide'],
    ['Morning Medications','medication',1,8,'Daily Meds'],
    ['Fluid Restriction Check','task',1,12,'Linda'],
    ['Afternoon PT Session','task',2,14,'Sarah K.'],
    ['Morning Medications','medication',2,8,'Daily Meds'],
    ['Morning Medications','medication',3,8,'Daily Meds'],
    ['Cardiology Appointment','appointment',4,10,'Dr. Okafor'],
    ['Morning Medications','medication',-1,8,'Daily Meds'],
    ['PT Session','task',-1,14,'Sarah K.'],
    ['Morning Medications','medication',-2,8,'Daily Meds'],
    ['Morning Medications','medication',-3,8,'Daily Meds'],
  ] as const;
  for (const [title,type,dOff,hr,notes] of hCal) {
    await addDoc(collection(db,'patients',pid,'calendar'), {
      title, type, startDateTime:ts(-dOff,hr), notes, createdBy:USER_NIKHIL_ID,
    });
  }

  // Insights
  await addDoc(collection(db,'patients',pid,'insights'), {
    summary:'Tremor frequency reduced 30% since Carbidopa/Levodopa dose adjustment 3 weeks ago.',
    category:'trend', generatedAt:ts(1), generatedBy:'ai',
    dataRange:{from:ts(30),to:ts(0)}, tags:['tremor','parkinson'],
  });
  await addDoc(collection(db,'patients',pid,'insights'), {
    summary:'BP still elevated. Recommend cardiology follow-up before next week.',
    category:'trend', generatedAt:ts(0), generatedBy:'ai',
    dataRange:{from:ts(7),to:ts(0)}, tags:['bp','cardiology'],
  });
  await addDoc(collection(db,'patients',pid,'insights'), {
    summary:'Furosemide adherence at 87% — two missed doses this month. Monitor fluid retention.',
    category:'adherence', generatedAt:ts(0), generatedBy:'ai',
    dataRange:{from:ts(30),to:ts(0)}, tags:['medication','adherence'],
  });
  await addDoc(collection(db,'patients',pid,'insights'), {
    summary:'Nikhil has covered 14 of 16 shifts this week. Consider redistributing tasks to Cleo.',
    category:'burnout', generatedAt:ts(0), generatedBy:'ai',
    dataRange:{from:ts(7),to:ts(0)}, tags:['burnout','caregiver'],
  });

  // Help requests
  await addDoc(collection(db,'patients',pid,'helpRequests'), {
    urgency:'emergency', description:'Harold had a fall. Possible hip injury. Need immediate help.',
    duration:'3 hours', location:'Home', requestedBy:USER_NIKHIL_ID,
    status:'resolved', respondedBy:USER_CLEO_ID, createdAt:ts(10),
  });
  await addDoc(collection(db,'patients',pid,'helpRequests'), {
    urgency:'low', description:'Need someone to pick up Harold prescriptions from pharmacy.',
    duration:'30 min', location:'CVS Pharmacy', requestedBy:USER_NIKHIL_ID,
    status:'pending', createdAt:ts(1),
  });
}
