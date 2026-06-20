// ─── Types ────────────────────────────────────────────────────────────────────
// Firestore dependency fully removed. All data operations use PostgreSQL via api.ts.

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
  createdAt: string;
}

export type NewBooking = Omit<Booking, "id" | "createdAt">;
