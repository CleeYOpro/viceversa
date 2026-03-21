import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Village, Member, LovedOne } from '../types';

interface VillageState {
  activeVillageId: string | null;
  villages: Village[];
  members: Member[];
  lovedOne: LovedOne | null;
  setActiveVillage: (villageId: string) => void;
  loadVillages: (userId: string) => Promise<void>;
}

export const useVillageStore = create<VillageState>()(
  persist(
    (set) => ({
      activeVillageId: null,
      villages: [],
      members: [],
      lovedOne: null,
      setActiveVillage: (villageId: string) => {
        set({ activeVillageId: villageId });
      },
      loadVillages: async (userId: string) => {
        // Mock implementation for UI, real implementation would fetch from firestore
        set({ villages: [] });
      },
    }),
    {
      name: 'village-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
