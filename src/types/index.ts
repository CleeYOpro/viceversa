import { Timestamp } from 'firebase/firestore';

// ─── Users ────────────────────────────────────────────────────────────────────

export type UserRole = 'caregiver' | 'doctor' | 'patient_proxy';

export interface User {
  displayName: string;
  email: string;
  role: UserRole;
  expoPushToken?: string;
  villageIds: string[];       // patientIds this user is connected to
  doctorProfile?: {
    licenseNumber: string;
    specialty: string;
    npi?: string;
  };
  createdAt: Timestamp;
}

// ─── Patient (replaces LovedOne as top-level entity) ─────────────────────────

export interface Patient {
  name: string;
  dob: string;
  conditions: string[];
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  photoUrl?: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// ─── Caregivers subcollection  /patients/{id}/caregivers/{userId} ─────────────

export type CaregiverRole = 'lead_caregiver' | 'caregiver' | 'aide' | 'family';

export interface PatientCaregiver {
  userId: string;
  role: CaregiverRole;
  displayName: string;
  joinedAt: Timestamp;
  permissions: CaregiverPermissions;
}

export interface CaregiverPermissions {
  canInviteMembers: boolean;
  canEditProfile: boolean;
  canViewRestrictedNotes: boolean;
}

// ─── Doctors subcollection  /patients/{id}/doctors/{userId} ──────────────────

export type DoctorAccessLevel = 'summary_only' | 'full_logs';

export interface PatientDoctor {
  userId: string;
  displayName: string;
  specialty: string;
  linkedAt: Timestamp;
  consentGrantedBy: string;
  consentGrantedAt: Timestamp;
  accessLevel: DoctorAccessLevel;
  accessExpiresAt?: Timestamp;
}

// ─── Medications  /patients/{id}/medications/{medicationId} ──────────────────

export type FrequencyType = 'daily' | 'twice_daily' | 'weekly' | 'as_needed' | 'custom';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: FrequencyType;
  scheduleTimes: string[];
  prescriber?: string;
  refillDate?: Timestamp;
  interactionFlags?: string[];
  notes?: string;
  addedBy: string;
  createdAt: Timestamp;
}

// ─── Dose Logs  /patients/{id}/doseLogs/{doseLogId} ──────────────────────────

export type DoseStatus = 'given' | 'missed' | 'refused';

export interface DoseLog {
  id: string;
  medicationId: string;
  medicationName: string;
  timestamp: Timestamp;
  administeredBy: string;
  administeredByName: string;
  photoUrl?: string;
  status: DoseStatus;
  notes?: string;
}

// ─── Health Logs  /patients/{id}/healthLogs/{logId} ──────────────────────────

export type LogType =
  | 'symptom' | 'mood' | 'bp' | 'glucose' | 'weight'
  | 'fall' | 'note' | 'meal' | 'medication' | 'appointment';

export interface HealthLog {
  id: string;
  type: LogType;
  timestamp: Timestamp;
  authorId: string;
  authorName: string;
  notes: string;
  photoUrl?: string;
  isRestricted: boolean;
  vitals?: {
    bp?: string;
    glucose?: number;
    weight?: number;
    temperature?: number;
    oxygenSat?: number;
  };
}

// ─── Tasks  /patients/{id}/tasks/{taskId} ────────────────────────────────────

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskCategory = 'medication' | 'appointment' | 'meal' | 'transport' | 'exercise' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  assigneeId?: string;
  assigneeName?: string;
  dueDateTime: Timestamp;
  status: TaskStatus;
  createdBy: string;
  claimedBy?: string;
  claimedAt?: Timestamp;
  completedAt?: Timestamp;
}

// ─── Calendar  /patients/{id}/calendar/{eventId} ─────────────────────────────

export type CalendarEventType = 'appointment' | 'task' | 'reminder' | 'medication';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  startDateTime: Timestamp;
  endDateTime?: Timestamp;
  location?: string;
  attendees?: string[];
  linkedTaskId?: string;
  notes?: string;
  createdBy: string;
}

// ─── AI Insights  /patients/{id}/insights/{insightId} ────────────────────────

export type InsightCategory = 'pattern' | 'burnout' | 'adherence' | 'trend';

export interface AIInsight {
  id: string;
  summary: string;
  category: InsightCategory;
  generatedAt: Timestamp;
  generatedBy: 'ai' | string;
  dataRange: { from: Timestamp; to: Timestamp };
  tags?: string[];
}

// ─── Documents  /patients/{id}/documents/{docId} ─────────────────────────────

export type DocumentType = 'insurance' | 'discharge_summary' | 'care_plan' | 'checklist' | 'other';

export interface PatientDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedBy: string;
  uploadedAt: Timestamp;
  isPrivate: boolean;
}

// ─── Help Requests  /patients/{id}/helpRequests/{requestId} ──────────────────

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';
export type HelpRequestStatus = 'pending' | 'accepted' | 'resolved';

export interface HelpRequest {
  id: string;
  urgency: UrgencyLevel;
  description: string;
  duration: string;
  location?: string;
  requestedBy: string;
  status: HelpRequestStatus;
  respondedBy?: string;
  createdAt: Timestamp;
}

// ─── Doctor Exports  /patients/{id}/doctorExports/{exportId} ─────────────────

export interface DoctorExport {
  id: string;
  generatedBy: string;
  generatedAt: Timestamp;
  dateRange: { from: Timestamp; to: Timestamp };
  format: 'pdf' | 'link';
  linkToken?: string;
  linkExpiresAt?: Timestamp;
  includedSections: string[];
  accessedBy?: string;
  accessedAt?: Timestamp;
}

// ─── Villages (group chat context)  /villages/{villageId} ────────────────────

export interface Village {
  id: string;
  patientId: string;
  name: string;
  createdBy: string;
  createdAt: Timestamp;
  inviteCode: string;
}

// ─── Chat Messages  /villages/{villageId}/messages/{messageId} ───────────────

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  attachmentUrl?: string;
}

// ─── Legacy aliases (backward compat) ────────────────────────────────────────

/** @deprecated Use Patient instead */
export interface LovedOne {
  name: string;
  dob: string;
  conditions: string[];
  allergies: string[];
  emergencyContact: EmergencyContact;
}

export type MemberRole = 'admin' | 'caregiver' | 'aide';

export interface Member {
  userId: string;
  role: MemberRole;
  joinedAt: Timestamp;
  displayName: string;
}
