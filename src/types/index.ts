import { Timestamp } from 'firebase/firestore';

export interface User {
  displayName: string;
  email: string;
  expoPushToken?: string;
  villageIds: string[];
}

export interface Village {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Timestamp;
  inviteCode: string;
}

export type MemberRole = 'admin' | 'caregiver' | 'aide';

export interface Member {
  userId: string;
  role: MemberRole;
  joinedAt: Timestamp;
  displayName: string;
}

export interface LovedOne {
  name: string;
  dob: string;
  conditions: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export type LogType = 'medication' | 'mood' | 'symptom' | 'appointment' | 'note' | 'meal';

export interface HealthLog {
  id: string;
  type: LogType;
  timestamp: Timestamp;
  notes: string;
  photoUrl?: string;
  authorId: string;
}

export type FrequencyType = 'daily' | 'twice_daily' | 'weekly' | 'as_needed' | 'custom';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: FrequencyType;
  scheduleTimes: string[];
  prescriber?: string;
  notes?: string;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  timestamp: Timestamp;
  photoUrl?: string;
  administeredBy: string;
  notes?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDateTime: Timestamp;
  status: TaskStatus;
  createdBy: string;
}

export interface AIInsight {
  id: string;
  summary: string;
  generatedAt: Timestamp;
  authorId: string;
}

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
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}
