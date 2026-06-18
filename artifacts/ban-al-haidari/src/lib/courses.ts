import { db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  type Timestamp,
} from "firebase/firestore";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DaySchedule {
  enabled: boolean;
  slots: string[];
}

export type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type Availability = Record<DayKey, DaySchedule>;

export interface RecordedCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  telegramLink: string;
  price: number;
  discountEnabled: boolean;
  discountPercent: number;
  createdAt: Timestamp;
}

export interface OnlineCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  status: "available" | "unavailable";
  availability: Availability;
  createdAt: Timestamp;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function finalPrice(course: Pick<RecordedCourse, "price" | "discountEnabled" | "discountPercent">): number {
  if (!course.discountEnabled || course.discountPercent <= 0) return course.price;
  return Math.round(course.price * (1 - course.discountPercent / 100) * 100) / 100;
}

export const DEFAULT_AVAILABILITY: Availability = {
  sun: { enabled: false, slots: [] },
  mon: { enabled: true,  slots: ["09:00", "10:00", "11:00", "14:00", "15:00"] },
  tue: { enabled: true,  slots: ["09:00", "10:00", "11:00", "14:00", "15:00"] },
  wed: { enabled: true,  slots: ["09:00", "10:00", "11:00", "14:00", "15:00"] },
  thu: { enabled: true,  slots: ["09:00", "10:00", "11:00", "14:00", "15:00"] },
  fri: { enabled: false, slots: [] },
  sat: { enabled: false, slots: [] },
};

// ─── Recorded Courses ─────────────────────────────────────────────────────────

export function subscribeRecordedCourses(cb: (courses: RecordedCourse[]) => void): () => void {
  if (!db) return () => {};
  const q = query(collection(db, "recorded_courses"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RecordedCourse, "id">) }))),
  );
}

export async function addRecordedCourse(data: Omit<RecordedCourse, "id" | "createdAt">) {
  if (!db) throw new Error("DB not initialized");
  return addDoc(collection(db, "recorded_courses"), { ...data, createdAt: serverTimestamp() });
}

export async function updateRecordedCourse(id: string, data: Partial<Omit<RecordedCourse, "id" | "createdAt">>) {
  if (!db) throw new Error("DB not initialized");
  return updateDoc(doc(db, "recorded_courses", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteRecordedCourse(id: string) {
  if (!db) throw new Error("DB not initialized");
  return deleteDoc(doc(db, "recorded_courses", id));
}

// ─── Online Courses ───────────────────────────────────────────────────────────

export function subscribeOnlineCourses(cb: (courses: OnlineCourse[]) => void): () => void {
  if (!db) return () => {};
  const q = query(collection(db, "online_courses"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<OnlineCourse, "id">) }))),
  );
}

export async function addOnlineCourse(data: Omit<OnlineCourse, "id" | "createdAt">) {
  if (!db) throw new Error("DB not initialized");
  return addDoc(collection(db, "online_courses"), { ...data, createdAt: serverTimestamp() });
}

export async function updateOnlineCourse(id: string, data: Partial<Omit<OnlineCourse, "id" | "createdAt">>) {
  if (!db) throw new Error("DB not initialized");
  return updateDoc(doc(db, "online_courses", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteOnlineCourse(id: string) {
  if (!db) throw new Error("DB not initialized");
  return deleteDoc(doc(db, "online_courses", id));
}
