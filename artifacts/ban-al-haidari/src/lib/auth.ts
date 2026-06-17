import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "./firebase";

export async function signUp(email: string, password: string, displayName?: string): Promise<User> {
  if (!auth) throw new Error("Firebase Auth not initialized");
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return credential.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  if (!auth) throw new Error("Firebase Auth not initialized");
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logOut(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Securely change the user's password.
 * Requires re-authentication with current password first.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (!auth?.currentUser) throw new Error("no-user");
  const user = auth.currentUser;
  if (!user.email) throw new Error("no-email");

  // Re-authenticate before changing password (Firebase requirement)
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Now update the password
  await updatePassword(user, newPassword);
}
