import { create } from 'zustand';

// Mock users — no Firebase auth needed
const MOCK_USERS: Record<string, { uid: string; email: string; displayName: string; password: string }> = {
  'cleo@caresync.dev': {
    uid: 'user_cleo',
    email: 'cleo@caresync.dev',
    displayName: 'Cleo',
    password: 'Cleo1234!',
  },
  'nikhil@caresync.dev': {
    uid: 'user_nikhil',
    email: 'nikhil@caresync.dev',
    displayName: 'Nikhil',
    password: 'Nikhil1234!',
  },
};

interface AuthState {
  user: { uid: string; email: string; displayName: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: false,

  signIn: async (email, password) => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 400)); // simulate network
    const found = MOCK_USERS[email.toLowerCase().trim()];
    if (!found || found.password !== password) {
      set({ loading: false });
      throw new Error('Invalid email or password');
    }
    set({ user: { uid: found.uid, email: found.email, displayName: found.displayName }, loading: false });
  },

  register: async (email, password, displayName) => {
    set({ loading: true });
    await new Promise(r => setTimeout(r, 400));
    set({ user: { uid: `user_${Date.now()}`, email, displayName }, loading: false });
  },

  signOut: async () => {
    set({ user: null, loading: false });
  },
}));
