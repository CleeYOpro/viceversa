/**
 * seedAuth.ts
 * Run once to create demo caregiver accounts in Firebase Auth.
 * Call seedDemoAuth() from a dev screen or temporarily from app startup.
 */
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase';

const DEMO_USERS = [
  { email: 'cleo@komekare.dev', password: 'Cleo1234!', displayName: 'Cleo' },
  { email: 'nikhil@komekare.dev', password: 'Nikhil1234!', displayName: 'Nikhil' },
];

export async function seedDemoAuth() {
  for (const u of DEMO_USERS) {
    try {
      // Try sign-in first — if it works, account already exists
      await signInWithEmailAndPassword(auth, u.email, u.password);
      console.log(`[seedAuth] ${u.email} already exists`);
    } catch {
      // Account doesn't exist — create it
      try {
        const cred = await createUserWithEmailAndPassword(auth, u.email, u.password);
        await updateProfile(cred.user, { displayName: u.displayName });
        console.log(`[seedAuth] Created ${u.email}`);
      } catch (err) {
        console.error(`[seedAuth] Failed to create ${u.email}:`, err);
      }
    }
  }
}
