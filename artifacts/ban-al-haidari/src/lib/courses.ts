// ─── Types ────────────────────────────────────────────────────────────────────
// Firestore dependency fully removed. All data operations use PostgreSQL via api.ts.

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
  createdAt: string;
}

export interface OnlineCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  status: "available" | "unavailable";
  availability: Availability;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function finalPrice(
  course: Pick<RecordedCourse, "price" | "discountEnabled" | "discountPercent">,
): number {
  if (!course.discountEnabled || course.discountPercent <= 0) return course.price;
  return Math.round(course.price * (1 - course.discountPercent / 100) * 100) / 100;
}

export const DEFAULT_AVAILABILITY: Availability = {
  sun: { enabled: false, slots: [] },
  mon: { enabled: false, slots: [] },
  tue: { enabled: false, slots: [] },
  wed: { enabled: false, slots: [] },
  thu: { enabled: false, slots: [] },
  fri: { enabled: false, slots: [] },
  sat: { enabled: false, slots: [] },
};
