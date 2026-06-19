import { auth } from "./firebase";
import type { Availability } from "./courses";

const BASE = "/api";

async function adminHeaders(): Promise<Record<string, string>> {
  const token = await auth?.currentUser?.getIdToken().catch(() => null);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Types (mirror DB rows, but with JS-friendly dates) ──────────────────────

export interface ApiRecordedCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  telegramLink: string;
  price: number;
  discountEnabled: boolean;
  discountPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOnlineCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  status: "available" | "unavailable";
  availability: Availability;
  createdAt: string;
  updatedAt: string;
}

export interface ApiBooking {
  id: string;
  courseId: string;
  courseTitle: string;
  courseType: "recorded" | "online";
  userName: string;
  userEmail: string;
  userWhatsapp: string;
  issueDescription: string;
  selectedDate: string | null;
  selectedTime: string | null;
  paymentStatus: "demo_paid" | "paid" | "pending";
  paymentSessionId: string | null;
  createdAt: string;
}

// ─── Recorded Courses ─────────────────────────────────────────────────────────

export async function apiGetRecordedCourses(): Promise<ApiRecordedCourse[]> {
  const res = await fetch(`${BASE}/courses/recorded`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiRecordedCourse[]>;
}

export async function apiCreateRecordedCourse(data: {
  title: string;
  description: string;
  image: string;
  telegramLink: string;
  price: number;
  discountEnabled: boolean;
  discountPercent: number;
}): Promise<ApiRecordedCourse> {
  const res = await fetch(`${BASE}/admin/courses/recorded`, {
    method: "POST",
    headers: await adminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiRecordedCourse>;
}

export async function apiDeleteRecordedCourse(id: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/courses/recorded/${id}`, {
    method: "DELETE",
    headers: await adminHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function apiSeedWorkshop(): Promise<boolean> {
  const res = await fetch(`${BASE}/admin/courses/seed`, {
    method: "POST",
    headers: await adminHeaders(),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { seeded: boolean };
  return data.seeded;
}

// ─── Online Courses ───────────────────────────────────────────────────────────

export async function apiGetOnlineCourses(): Promise<ApiOnlineCourse[]> {
  const res = await fetch(`${BASE}/courses/online`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiOnlineCourse[]>;
}

export async function apiGetOnlineCourse(id: string): Promise<ApiOnlineCourse | null> {
  const res = await fetch(`${BASE}/courses/online/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiOnlineCourse>;
}

export async function apiCreateOnlineCourse(data: {
  title: string;
  description: string;
  image: string;
  price: number;
  status: string;
  availability: Availability;
}): Promise<ApiOnlineCourse> {
  const res = await fetch(`${BASE}/admin/courses/online`, {
    method: "POST",
    headers: await adminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiOnlineCourse>;
}

export async function apiUpdateOnlineCourse(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    image: string;
    price: number;
    status: string;
    availability: Availability;
  }>,
): Promise<ApiOnlineCourse> {
  const res = await fetch(`${BASE}/admin/courses/online/${id}`, {
    method: "PATCH",
    headers: await adminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiOnlineCourse>;
}

export async function apiDeleteOnlineCourse(id: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/courses/online/${id}`, {
    method: "DELETE",
    headers: await adminHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function apiGetBookings(): Promise<ApiBooking[]> {
  const res = await fetch(`${BASE}/admin/bookings`, {
    headers: await adminHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiBooking[]>;
}

export async function apiCreateBooking(data: {
  courseId: string;
  courseTitle: string;
  courseType: string;
  userName: string;
  userEmail: string;
  userWhatsapp: string;
  issueDescription: string;
  selectedDate?: string;
  selectedTime?: string;
  paymentStatus: string;
  paymentSessionId?: string;
}): Promise<ApiBooking> {
  const res = await fetch(`${BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiBooking>;
}

// ─── Site Settings ─────────────────────────────────────────────────────────────

export async function apiGetSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${BASE}/settings`);
    if (!res.ok) return {};
    return res.json() as Promise<Record<string, string>>;
  } catch {
    return {};
  }
}

export async function apiSetSetting(key: string, value: string): Promise<void> {
  const headers = await adminHeaders();
  const res = await fetch(`${BASE}/admin/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error(`Failed to save setting "${key}"`);
}
