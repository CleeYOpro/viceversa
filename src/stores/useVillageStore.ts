import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, getDoc, getDocs, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Village, Patient, Task, Medication, HealthLog, CalendarEvent, AIInsight } from '../types';
import { PATIENT_ELEANOR_ID } from '../lib/seedFirestore';

export interface VillageState {
  activePatientId: string;
  patients: Patient[];
  patientIds: string[];
  patient: Patient | null;
  tasks: Task[];
  medications: Medication[];
  healthLogs: HealthLog[];
  calendarEvents: CalendarEvent[];
  insights: AIInsight[];
  loading: boolean;

  setActivePatient: (patientId: string) => void;
  loadPatients: (patientIds: string[]) => Promise<void>;
  loadPatientData: (patientId: string) => Promise<void>;

  // Legacy compat
  activeVillageId: string;
  villages: { id: string; name: string; patientId: string }[];
  lovedOne: { name: string; dob: string; conditions: string[]; allergies: string[]; emergencyContact: any } | null;
  setActiveVillage: (id: string) => void;
}

export const useVillageStore = create<VillageState>()(
  persist(
    (set, get) => ({
      activePatientId: PATIENT_ELEANOR_ID,
      patients: [],
      patientIds: [],
      patient: null,
      tasks: [],
      medications: [],
      healthLogs: [],
      calendarEvents: [],
      insights: [],
      loading: false,

      // Legacy compat fields
      activeVillageId: PATIENT_ELEANOR_ID,
      villages: [],
      lovedOne: null,

      setActivePatient: (patientId) => {
        const patients = get().patients;
        const p = patients.find(x => x.createdAt && (x as any).id === patientId) ?? null;
        set({ activePatientId: patientId, activeVillageId: patientId });
        get().loadPatientData(patientId);
      },

      setActiveVillage: (id) => {
        set({ activeVillageId: id, activePatientId: id });
        get().loadPatientData(id);
      },

      loadPatients: async (patientIds) => {
        set({ loading: true, patientIds });
        const loaded: Patient[] = [];
        const villages: { id: string; name: string; patientId: string }[] = [];

        for (const pid of patientIds) {
          const snap = await getDoc(doc(db, 'patients', pid));
          if (snap.exists()) {
            const data = { id: snap.id, ...snap.data() } as any;
            loaded.push(data);
            villages.push({ id: pid, name: data.name, patientId: pid });
          }
        }

        const activeId = patientIds[0] ?? PATIENT_ELEANOR_ID;
        const activePatient = loaded.find((p: any) => (p as any).id === activeId) ?? loaded[0] ?? null;

        set({
          patients: loaded,
          villages,
          activePatientId: activeId,
          activeVillageId: activeId,
          patient: activePatient,
          lovedOne: activePatient ? {
            name: activePatient.name,
            dob: activePatient.dob,
            conditions: activePatient.conditions,
            allergies: activePatient.allergies,
            emergencyContact: activePatient.emergencyContacts?.[0] ?? null,
          } : null,
          loading: false,
        });

        if (activeId) get().loadPatientData(activeId);
      },

      loadPatientData: async (patientId) => {
        set({ loading: true });
        try {
          // Patient doc
          const patSnap = await getDoc(doc(db, 'patients', patientId));
          const patient = patSnap.exists() ? ({ id: patSnap.id, ...patSnap.data() } as any) : null;

          // Medications
          const medSnap = await getDocs(collection(db, 'patients', patientId, 'medications'));
          const medications = medSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Medication[];

          // Tasks (today + upcoming)
          const taskSnap = await getDocs(
            query(collection(db, 'patients', patientId, 'tasks'), orderBy('dueDateTime', 'asc'), limit(20))
          );
          const tasks = taskSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Task[];

          // Health logs (recent)
          const logSnap = await getDocs(
            query(collection(db, 'patients', patientId, 'healthLogs'), orderBy('timestamp', 'desc'), limit(20))
          );
          const healthLogs = logSnap.docs.map(d => ({ id: d.id, ...d.data() })) as HealthLog[];

          // Calendar events
          const calSnap = await getDocs(
            query(collection(db, 'patients', patientId, 'calendar'), orderBy('startDateTime', 'asc'), limit(50))
          );
          const calendarEvents = calSnap.docs.map(d => ({ id: d.id, ...d.data() })) as CalendarEvent[];

          // Insights
          const insightSnap = await getDocs(
            query(collection(db, 'patients', patientId, 'insights'), orderBy('generatedAt', 'desc'), limit(5))
          );
          const insights = insightSnap.docs.map(d => ({ id: d.id, ...d.data() })) as AIInsight[];

          set({
            patient,
            medications,
            tasks,
            healthLogs,
            calendarEvents,
            insights,
            loading: false,
            lovedOne: patient ? {
              name: patient.name,
              dob: patient.dob,
              conditions: patient.conditions,
              allergies: patient.allergies,
              emergencyContact: patient.emergencyContacts?.[0] ?? null,
            } : null,
          });
        } catch (e) {
          console.error('[loadPatientData]', e);
          set({ loading: false });
        }
      },
    }),
    {
      name: 'village-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activePatientId: state.activePatientId,
        activeVillageId: state.activeVillageId,
        patientIds: state.patientIds,
      }),
    }
  )
);
