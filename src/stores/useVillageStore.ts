import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Village, Member, LovedOne } from '../types';

export const MOCK_VILLAGE_ID = 'village_eleanor';
export const MOCK_VILLAGE_ID_2 = 'village_harold';

const MOCK_VILLAGES: Village[] = [
  {
    id: MOCK_VILLAGE_ID,
    name: 'Eleanor',
    createdBy: 'user_cleo',
    createdAt: { seconds: 1700000000, nanoseconds: 0 } as any,
    inviteCode: 'DEMO1234',
  },
  {
    id: MOCK_VILLAGE_ID_2,
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
    conditions: ['Dementia', 'Hypertension', 'Type 2 Diabetes', 'Osteoporosis'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    emergencyContact: { name: 'Robert (Son)', phone: '555-0192', relationship: 'Son' },
  },
  [MOCK_VILLAGE_ID_2]: {
    name: 'Harold',
    dob: '1938-07-22',
    conditions: ["Parkinson's", 'Heart Failure', 'Arthritis'],
    allergies: ['Aspirin'],
    emergencyContact: { name: 'Linda (Daughter)', phone: '555-0311', relationship: 'Daughter' },
  },
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
