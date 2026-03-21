import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  init: () => () => void;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,

  init: () => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? '',
          },
          loading: false,
        });
      } else {
        set({ user: null, loading: false });
      }
    });
    return unsub;
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      set({
        user: {
          uid: cred.user.uid,
          email: cred.user.email ?? '',
          displayName: cred.user.displayName ?? '',
        },
        loading: false,
      });
    } catch {
      set({ loading: false });
      throw new Error('Invalid email or password');
    }
  },

  register: async (email, password, displayName) => {
    set({ loading: true });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName });
      set({
        user: { uid: cred.user.uid, email: cred.user.email ?? '', displayName },
        loading: false,
      });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, loading: false });
  },
}));
