import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  type Timestamp,
} from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  courseId: string;
  courseTitle: string;
  courseType: "recorded" | "online";
  userName: string;
  userEmail: string;
  userWhatsapp: string;
  issueDescription: string;
  selectedDate?: string;
  selectedTime?: string;
  paymentStatus: "demo_paid" | "paid" | "pending";
  paymentSessionId?: string;
  createdAt: Timestamp;
}

export type NewBooking = Omit<Booking, "id" | "createdAt">;

// ─── Firestore ────────────────────────────────────────────────────────────────

export function subscribeBookings(
  cb: (bookings: Booking[]) => void,
  onError?: (code: string) => void,
): () => void {
  if (!db) { cb([]); return () => {}; }
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, "id">) }))),
    (err) => {
      console.warn("[bookings] Firestore error:", err.code);
      cb([]);
      onError?.(err.code);
    },
  );
}

export async function addBooking(data: NewBooking): Promise<string> {
  if (!db) throw new Error("DB not initialized");
  const ref = await addDoc(collection(db, "bookings"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
