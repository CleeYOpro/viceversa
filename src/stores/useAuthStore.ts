import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';

interface AuthState {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      signIn: async (email, password) => {
        set({ loading: true });
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          set({ user: { uid: cred.user.uid, email: cred.user.email }, loading: false });
        } catch (e) {
          set({ loading: false });
          throw new Error('Invalid email or password');
        }
      },
      register: async (email, password, displayName) => {
        set({ loading: true });
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          set({ user: { uid: cred.user.uid, email: cred.user.email, displayName }, loading: false });
        } catch (e) {
          set({ loading: false });
          throw e; // specific error handling could be here
        }
      },
      signOut: async () => {
        set({ loading: true });
        await fbSignOut(auth);
        set({ user: null, loading: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
