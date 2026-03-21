/**
 * Firestore Schema Initializer
 *
 * Call `initializePatientSchema(patientId, createdByUserId)` after creating a
 * new patient to seed all required subcollections with their first document.
 *
 * Collection paths mirror the schema:
 *   /users/{userId}
 *   /patients/{patientId}
 *     /caregivers/{userId}
 *     /doctors/{userId}
 *     /medications/{medicationId}
 *     /doseLogs/{doseLogId}
 *     /healthLogs/{logId}
 *     /tasks/{taskId}
 *     /calendar/{eventId}
 *     /insights/{insightId}
 *     /documents/{docId}
 *     /helpRequests/{requestId}
 *     /doctorExports/{exportId}
 *   /villages/{villageId}
 *     /messages/{messageId}
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  User,
  Patient,
  PatientCaregiver,
  Village,
} from '../types';

// ─── Collection path helpers ──────────────────────────────────────────────────

export const Collections = {
  users: () => collection(db, 'users'),
  user: (userId: string) => doc(db, 'users', userId),

  patients: () => collection(db, 'patients'),
  patient: (patientId: string) => doc(db, 'patients', patientId),

  caregivers: (patientId: string) =>
    collection(db, 'patients', patientId, 'caregivers'),
  caregiver: (patientId: string, userId: string) =>
    doc(db, 'patients', patientId, 'caregivers', userId),

  doctors: (patientId: string) =>
    collection(db, 'patients', patientId, 'doctors'),
  doctor: (patientId: string, userId: string) =>
    doc(db, 'patients', patientId, 'doctors', userId),

  medications: (patientId: string) =>
    collection(db, 'patients', patientId, 'medications'),
  medication: (patientId: string, medId: string) =>
    doc(db, 'patients', patientId, 'medications', medId),

  doseLogs: (patientId: string) =>
    collection(db, 'patients', patientId, 'doseLogs'),
  doseLog: (patientId: string, logId: string) =>
    doc(db, 'patients', patientId, 'doseLogs', logId),

  healthLogs: (patientId: string) =>
    collection(db, 'patients', patientId, 'healthLogs'),
  healthLog: (patientId: string, logId: string) =>
    doc(db, 'patients', patientId, 'healthLogs', logId),

  tasks: (patientId: string) =>
    collection(db, 'patients', patientId, 'tasks'),
  task: (patientId: string, taskId: string) =>
    doc(db, 'patients', patientId, 'tasks', taskId),

  calendar: (patientId: string) =>
    collection(db, 'patients', patientId, 'calendar'),
  calendarEvent: (patientId: string, eventId: string) =>
    doc(db, 'patients', patientId, 'calendar', eventId),

  insights: (patientId: string) =>
    collection(db, 'patients', patientId, 'insights'),
  insight: (patientId: string, insightId: string) =>
    doc(db, 'patients', patientId, 'insights', insightId),

  documents: (patientId: string) =>
    collection(db, 'patients', patientId, 'documents'),
  document: (patientId: string, docId: string) =>
    doc(db, 'patients', patientId, 'documents', docId),

  helpRequests: (patientId: string) =>
    collection(db, 'patients', patientId, 'helpRequests'),
  helpRequest: (patientId: string, requestId: string) =>
    doc(db, 'patients', patientId, 'helpRequests', requestId),

  doctorExports: (patientId: string) =>
    collection(db, 'patients', patientId, 'doctorExports'),
  doctorExport: (patientId: string, exportId: string) =>
    doc(db, 'patients', patientId, 'doctorExports', exportId),

  villages: () => collection(db, 'villages'),
  village: (villageId: string) => doc(db, 'villages', villageId),

  messages: (villageId: string) =>
    collection(db, 'villages', villageId, 'messages'),
  message: (villageId: string, messageId: string) =>
    doc(db, 'villages', villageId, 'messages', messageId),
} as const;

// ─── User document ────────────────────────────────────────────────────────────

export async function createUserDocument(
  userId: string,
  data: Pick<User, 'displayName' | 'email' | 'role'>
): Promise<void> {
  const ref = Collections.user(userId);
  const snap = await getDoc(ref);
  if (snap.exists()) return; // don't overwrite on re-login

  await setDoc(ref, {
    displayName: data.displayName,
    email: data.email,
    role: data.role,
    villageIds: [],
    createdAt: serverTimestamp(),
  });
}

// ─── Patient + village creation ───────────────────────────────────────────────

export interface CreatePatientInput {
  name: string;
  dob: string;
  conditions?: string[];
  allergies?: string[];
  emergencyContacts?: Patient['emergencyContacts'];
  createdByUserId: string;
  createdByDisplayName: string;
  inviteCode: string;
}

/**
 * Creates:
 *  - /patients/{patientId}
 *  - /patients/{patientId}/caregivers/{createdByUserId}  (as lead_caregiver)
 *  - /villages/{patientId}  (village shares the same ID for simplicity)
 */
export async function createPatient(input: CreatePatientInput): Promise<string> {
  const patientRef = doc(Collections.patients());
  const patientId = patientRef.id;
  const now = serverTimestamp() as Timestamp;

  // 1. Patient document
  await setDoc(patientRef, {
    name: input.name,
    dob: input.dob,
    conditions: input.conditions ?? [],
    allergies: input.allergies ?? [],
    emergencyContacts: input.emergencyContacts ?? [],
    createdBy: input.createdByUserId,
    createdAt: now,
  } satisfies Omit<Patient, 'photoUrl'>);

  // 2. Creator as lead caregiver
  await setDoc(Collections.caregiver(patientId, input.createdByUserId), {
    userId: input.createdByUserId,
    role: 'lead_caregiver',
    displayName: input.createdByDisplayName,
    joinedAt: now,
    permissions: {
      canInviteMembers: true,
      canEditProfile: true,
      canViewRestrictedNotes: true,
    },
  } satisfies Omit<PatientCaregiver, 'joinedAt'> & { joinedAt: Timestamp });

  // 3. Village (group chat context)
  await setDoc(Collections.village(patientId), {
    patientId,
    name: input.name,
    createdBy: input.createdByUserId,
    createdAt: now,
    inviteCode: input.inviteCode,
  } satisfies Omit<Village, 'id'>);

  return patientId;
}

// ─── Add caregiver to patient ─────────────────────────────────────────────────

export async function addCaregiverToPatient(
  patientId: string,
  userId: string,
  displayName: string,
  role: PatientCaregiver['role'] = 'caregiver'
): Promise<void> {
  await setDoc(Collections.caregiver(patientId, userId), {
    userId,
    role,
    displayName,
    joinedAt: serverTimestamp(),
    permissions: {
      canInviteMembers: role === 'lead_caregiver',
      canEditProfile: role === 'lead_caregiver',
      canViewRestrictedNotes: role === 'lead_caregiver',
    },
  });
}

// ─── Link doctor to patient ───────────────────────────────────────────────────

export async function linkDoctorToPatient(
  patientId: string,
  doctorUserId: string,
  doctorDisplayName: string,
  specialty: string,
  consentGrantedBy: string,
  accessLevel: 'summary_only' | 'full_logs' = 'summary_only',
  expiresInDays?: number
): Promise<void> {
  const now = Timestamp.now();
  const expiresAt = expiresInDays
    ? Timestamp.fromMillis(now.toMillis() + expiresInDays * 86_400_000)
    : undefined;

  await setDoc(Collections.doctor(patientId, doctorUserId), {
    userId: doctorUserId,
    displayName: doctorDisplayName,
    specialty,
    linkedAt: serverTimestamp(),
    consentGrantedBy,
    consentGrantedAt: serverTimestamp(),
    accessLevel,
    ...(expiresAt ? { accessExpiresAt: expiresAt } : {}),
  });
}
