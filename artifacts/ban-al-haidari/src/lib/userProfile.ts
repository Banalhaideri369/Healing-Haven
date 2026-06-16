import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  intention: string;
  phone: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  label: string;
  date: string;
}

const COLLECTION = "user_profiles";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  try {
    const ref = doc(db, COLLECTION, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch {
    return null;
  }
}

export async function upsertUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, "uid" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  const ref = doc(db, COLLECTION, uid);
  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      uid,
      ...data,
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
}

export async function addActivity(
  uid: string,
  item: ActivityItem
): Promise<void> {
  if (!db) return;
  const ref = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);
  const existing: ActivityItem[] = snap.exists()
    ? (snap.data()?.recentActivity ?? [])
    : [];
  const updated = [item, ...existing].slice(0, 10);
  await setDoc(ref, { recentActivity: updated, updatedAt: serverTimestamp() }, { merge: true });
}
