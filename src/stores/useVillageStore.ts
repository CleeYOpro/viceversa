import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Village, Member, LovedOne } from '../types';

export const MOCK_VILLAGE_ID = 'village_eleanor';
export const MOCK_VILLAGE_ID_2 = 'village_harold';

const MOCK_VILLAGES: Village[] = [
  {
    id: MOCK_VILLAGE_ID,
    patientId: MOCK_VILLAGE_ID,
    name: 'Eleanor',
    createdBy: 'user_cleo',
    createdAt: { seconds: 1700000000, nanoseconds: 0 } as any,
    inviteCode: 'DEMO1234',
  },
  {
    id: MOCK_VILLAGE_ID_2,
    patientId: MOCK_VILLAGE_ID_2,
    name: 'Harold',
    createdBy: 'user_nikhil',
    createdAt: { seconds: 1700000100, nanoseconds: 0 } as any,
    inviteCode: 'DEMO5678',
  },
];

const MOCK_LOVED_ONES: Record<string, LovedOne> = {
  [MOCK_VILLAGE_ID]: {
    name: 'Eleanor',
    dob: '1942-03-15',
    conditions: ['Dementia (Moderate)', 'Hypertension', 'Type 2 Diabetes', 'Osteoporosis'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    emergencyContact: { name: 'Robert (Son)', phone: '555-0192', relationship: 'Son' },
  },
  [MOCK_VILLAGE_ID_2]: {
    name: 'Harold',
    dob: '1938-07-22',
    conditions: ["Parkinson's Disease (Stage 2)", 'Congestive Heart Failure', 'Chronic Arthritis', 'Mild Depression'],
    allergies: ['Aspirin', 'Codeine', 'Latex'],
    emergencyContact: { name: 'Linda (Daughter)', phone: '555-0311', relationship: 'Daughter' },
  },
};

// Care team members per patient
export const CARE_TEAMS: Record<string, CareTeamMember[]> = {
  [MOCK_VILLAGE_ID]: [
    { id: 'ct_dr_patel', name: 'Dr. Priya Patel', role: 'Primary Physician', avatar: 'P', online: true },
    { id: 'ct_nurse_james', name: 'James R.', role: 'Home Nurse', avatar: 'J', online: false },
    { id: 'ct_robert', name: 'Robert', role: 'Son / Family', avatar: 'R', online: true },
    { id: 'ct_nikhil', name: 'Nikhil', role: 'Caregiver', avatar: 'N', online: false },
  ],
  [MOCK_VILLAGE_ID_2]: [
    { id: 'ct_dr_chen', name: 'Dr. Marcus Chen', role: 'Neurologist', avatar: 'M', online: false },
    { id: 'ct_dr_okafor', name: 'Dr. Amara Okafor', role: 'Cardiologist', avatar: 'A', online: true },
    { id: 'ct_pt_sarah', name: 'Sarah K.', role: 'Physical Therapist', avatar: 'S', online: true },
    { id: 'ct_linda', name: 'Linda', role: 'Daughter / Family', avatar: 'L', online: false },
  ],
};

export interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
}

// Rich mock health data per patient
export interface HealthEntry {
  date: string; // YYYY-MM-DD
  bp: string;
  bpStatus: 'normal' | 'elevated' | 'high';
  glucose: number;
  glucoseStatus: 'normal' | 'elevated' | 'high';
  weight: number;
  mood: 'good' | 'fair' | 'poor';
  notes: string;
}

export const HEALTH_HISTORY: Record<string, HealthEntry[]> = {
  [MOCK_VILLAGE_ID]: [
    { date: '2026-01-08', bp: '148/92', bpStatus: 'high', glucose: 187, glucoseStatus: 'high', weight: 134, mood: 'poor', notes: 'Confused in the evening, refused dinner' },
    { date: '2026-01-22', bp: '142/88', bpStatus: 'elevated', glucose: 162, glucoseStatus: 'elevated', weight: 133, mood: 'fair', notes: 'Slept most of the day, mild agitation' },
    { date: '2026-02-05', bp: '138/86', bpStatus: 'elevated', glucose: 155, glucoseStatus: 'elevated', weight: 133, mood: 'fair', notes: 'Good morning, confused after lunch' },
    { date: '2026-02-19', bp: '135/84', bpStatus: 'elevated', glucose: 148, glucoseStatus: 'elevated', weight: 132, mood: 'good', notes: 'Recognized Robert, ate full breakfast' },
    { date: '2026-03-05', bp: '132/82', bpStatus: 'elevated', glucose: 141, glucoseStatus: 'normal', weight: 132, mood: 'good', notes: 'Walked in garden, good spirits' },
    { date: '2026-03-19', bp: '128/80', bpStatus: 'normal', glucose: 136, glucoseStatus: 'normal', weight: 131, mood: 'good', notes: 'Best week in months, medication adjusted' },
  ],
  [MOCK_VILLAGE_ID_2]: [
    { date: '2026-01-10', bp: '158/96', bpStatus: 'high', glucose: 112, glucoseStatus: 'normal', weight: 168, mood: 'poor', notes: 'Tremors worse, fell getting out of bed' },
    { date: '2026-01-24', bp: '154/94', bpStatus: 'high', glucose: 108, glucoseStatus: 'normal', weight: 167, mood: 'poor', notes: 'Shortness of breath, PT session cancelled' },
    { date: '2026-02-07', bp: '150/91', bpStatus: 'high', glucose: 110, glucoseStatus: 'normal', weight: 166, mood: 'fair', notes: 'New Parkinson\'s med started, some improvement' },
    { date: '2026-02-21', bp: '146/89', bpStatus: 'elevated', glucose: 106, glucoseStatus: 'normal', weight: 165, mood: 'fair', notes: 'PT session completed, tremors slightly reduced' },
    { date: '2026-03-07', bp: '142/87', bpStatus: 'elevated', glucose: 104, glucoseStatus: 'normal', weight: 165, mood: 'fair', notes: 'Mood improved, watching TV more' },
    { date: '2026-03-21', bp: '138/85', bpStatus: 'elevated', glucose: 102, glucoseStatus: 'normal', weight: 164, mood: 'good', notes: 'Walked to mailbox independently, big win' },
  ],
};

export const MOCK_MEDS: Record<string, { name: string; dose: string; time: string; taken: boolean }[]> = {
  [MOCK_VILLAGE_ID]: [
    { name: 'Donepezil', dose: '10mg', time: '8:00 AM', taken: true },
    { name: 'Lisinopril', dose: '20mg', time: '8:00 AM', taken: true },
    { name: 'Metformin', dose: '500mg', time: '12:00 PM', taken: false },
    { name: 'Alendronate', dose: '70mg', time: '8:00 AM (weekly)', taken: true },
    { name: 'Atorvastatin', dose: '40mg', time: '9:00 PM', taken: false },
  ],
  [MOCK_VILLAGE_ID_2]: [
    { name: 'Carbidopa/Levodopa', dose: '25/100mg', time: '7:00 AM', taken: true },
    { name: 'Carvedilol', dose: '12.5mg', time: '8:00 AM', taken: true },
    { name: 'Furosemide', dose: '40mg', time: '8:00 AM', taken: false },
    { name: 'Sertraline', dose: '50mg', time: '8:00 AM', taken: true },
    { name: 'Carbidopa/Levodopa', dose: '25/100mg', time: '1:00 PM', taken: false },
    { name: 'Potassium Chloride', dose: '20mEq', time: '8:00 AM', taken: true },
  ],
};

export const MOCK_TASKS: Record<string, { title: string; assignee: string; due: string; done: boolean; priority: 'high' | 'medium' | 'low' }[]> = {
  [MOCK_VILLAGE_ID]: [
    { title: 'Blood pressure check', assignee: 'James R.', due: 'Today 10 AM', done: false, priority: 'high' },
    { title: 'Glucose reading before lunch', assignee: 'Cleo', due: 'Today 11:30 AM', done: false, priority: 'high' },
    { title: 'Afternoon walk (15 min)', assignee: 'Cleo', due: 'Today 3 PM', done: false, priority: 'medium' },
    { title: 'Evening medication', assignee: 'Nikhil', due: 'Today 9 PM', done: false, priority: 'high' },
    { title: 'Dr. Patel follow-up call', assignee: 'Robert', due: 'Tomorrow', done: false, priority: 'medium' },
  ],
  [MOCK_VILLAGE_ID_2]: [
    { title: 'Morning PT exercises', assignee: 'Sarah K.', due: 'Today 9 AM', done: true, priority: 'high' },
    { title: 'Weight & fluid intake log', assignee: 'Linda', due: 'Today 12 PM', done: false, priority: 'high' },
    { title: 'Tremor assessment', assignee: 'Dr. Chen', due: 'Today 2 PM', done: false, priority: 'medium' },
    { title: 'Evening cardiac meds', assignee: 'Linda', due: 'Today 8 PM', done: false, priority: 'high' },
    { title: 'Cardiology appointment', assignee: 'Linda', due: 'Mar 25', done: false, priority: 'medium' },
  ],
};

export const MOCK_MEMBERS: Member[] = [
  { userId: 'user_cleo', role: 'admin', joinedAt: { seconds: 1700000000, nanoseconds: 0 } as any, displayName: 'Cleo' },
  { userId: 'user_nikhil', role: 'caregiver', joinedAt: { seconds: 1700000000, nanoseconds: 0 } as any, displayName: 'Nikhil' },
];

interface VillageState {
  activeVillageId: string;
  villages: Village[];
  lovedOnes: Record<string, LovedOne>;
  members: Member[];
  lovedOne: LovedOne | null;
  setActiveVillage: (villageId: string) => void;
  updateLovedOne: (villageId: string, data: Partial<LovedOne>) => void;
  loadVillages: (userId: string) => Promise<void>;
}

export const useVillageStore = create<VillageState>()(
  persist(
    (set, get) => ({
      activeVillageId: MOCK_VILLAGE_ID,
      villages: MOCK_VILLAGES,
      lovedOnes: MOCK_LOVED_ONES,
      members: MOCK_MEMBERS,
      lovedOne: MOCK_LOVED_ONES[MOCK_VILLAGE_ID],

      setActiveVillage: (villageId) => {
        const lovedOnes = get().lovedOnes;
        set({ activeVillageId: villageId, lovedOne: lovedOnes[villageId] ?? null });
      },

      updateLovedOne: (villageId, data) => {
        const lovedOnes = get().lovedOnes;
        const updated = { ...lovedOnes[villageId], ...data } as LovedOne;
        const newLovedOnes = { ...lovedOnes, [villageId]: updated };
        set({
          lovedOnes: newLovedOnes,
          lovedOne: get().activeVillageId === villageId ? updated : get().lovedOne,
        });
      },

      loadVillages: async () => {
        const lovedOnes = get().lovedOnes;
        set({
          villages: MOCK_VILLAGES,
          activeVillageId: MOCK_VILLAGE_ID,
          lovedOne: lovedOnes[MOCK_VILLAGE_ID],
          members: MOCK_MEMBERS,
        });
      },
    }),
    {
      name: 'village-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
