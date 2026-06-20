import { auth } from "./firebase";
import type { Availability } from "./courses";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
const BASE = `${API_ORIGIN}/api`;

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

export async function apiDeleteBooking(id: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/bookings/${id}`, {
    method: "DELETE",
    headers: await adminHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function apiUpdateBookingStatus(
  id: string,
  paymentStatus: "pending" | "paid" | "demo_paid"
): Promise<ApiBooking> {
  const res = await fetch(`${BASE}/admin/bookings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await adminHeaders()) },
    body: JSON.stringify({ paymentStatus }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiBooking>;
}

// ─── Hero Banners ──────────────────────────────────────────────────────────────

export interface ApiBanner {
  id: string;
  image: string;
  title: string;
  status: "available" | "coming_soon";
  linkedCourseId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export async function apiGetBanners(): Promise<ApiBanner[]> {
  try {
    const res = await fetch(`${BASE}/banners`);
    if (!res.ok) return [];
    return res.json() as Promise<ApiBanner[]>;
  } catch {
    return [];
  }
}

export async function apiCreateBanner(data: {
  image: string;
  title: string;
  status: "available" | "coming_soon";
  linkedCourseId?: string | null;
  sortOrder?: number;
}): Promise<ApiBanner> {
  const res = await fetch(`${BASE}/admin/banners`, {
    method: "POST",
    headers: await adminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiBanner>;
}

export async function apiUpdateBanner(
  id: string,
  data: Partial<{ image: string; title: string; status: string; linkedCourseId: string | null; sortOrder: number }>,
): Promise<ApiBanner> {
  const res = await fetch(`${BASE}/admin/banners/${id}`, {
    method: "PATCH",
    headers: await adminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiBanner>;
}

export async function apiDeleteBanner(id: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/banners/${id}`, {
    method: "DELETE",
    headers: await adminHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ─── Push Notifications ────────────────────────────────────────────────────────

export async function apiGetVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/push/vapid-public-key`);
    if (!res.ok) return null;
    const data = (await res.json()) as { publicKey: string };
    return data.publicKey;
  } catch {
    return null;
  }
}

export async function apiSubscribePush(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<void> {
  const res = await fetch(`${BASE}/admin/push/subscribe`, {
    method: "POST",
    headers: await adminHeaders(),
    body: JSON.stringify(subscription),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function apiUnsubscribePush(endpoint: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/push/unsubscribe`, {
    method: "POST",
    headers: await adminHeaders(),
    body: JSON.stringify({ endpoint }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ─── My Bookings (authenticated user) ─────────────────────────────────────────

export async function apiGetMyBookings(): Promise<ApiBooking[]> {
  const token = await auth?.currentUser?.getIdToken().catch(() => null);
  if (!token) return [];
  try {
    const res = await fetch(`${BASE}/bookings/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json() as Promise<ApiBooking[]>;
  } catch {
    return [];
  }
}

// ─── User Profiles (admin + own) ──────────────────────────────────────────────

export interface ApiUserProfile {
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  intention: string;
  phone: string;
  recentActivity: Array<{ id: string; label: string; date: string }>;
  createdAt: string;
  updatedAt: string;
}

export async function apiGetUsers(): Promise<ApiUserProfile[]> {
  const res = await fetch(`${BASE}/admin/users`, {
    headers: await adminHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiUserProfile[]>;
}

export async function apiDeleteUser(uid: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/users/${encodeURIComponent(uid)}`, {
    method: "DELETE",
    headers: await adminHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ─── Client Testimonials ───────────────────────────────────────────────────────

export interface ApiTestimonial {
  id: string;
  clientName: string;
  content: string;
  rating: number;
  enabled: boolean;
  createdAt: string;
}

/** Public: only enabled testimonials */
export async function apiGetTestimonials(): Promise<ApiTestimonial[]> {
  try {
    const res = await fetch(`${BASE}/testimonials`);
    if (!res.ok) return [];
    return res.json() as Promise<ApiTestimonial[]>;
  } catch {
    return [];
  }
}

/** Admin: all testimonials including disabled */
export async function apiGetAdminTestimonials(): Promise<ApiTestimonial[]> {
  const res = await fetch(`${BASE}/admin/testimonials`, {
    headers: await adminHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiTestimonial[]>;
}

export async function apiCreateTestimonial(data: {
  clientName: string;
  content: string;
  rating: number;
}): Promise<ApiTestimonial> {
  const res = await fetch(`${BASE}/admin/testimonials`, {
    method: "POST",
    headers: await adminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiTestimonial>;
}

export async function apiUpdateTestimonial(
  id: string,
  data: Partial<{ clientName: string; content: string; rating: number; enabled: boolean }>,
): Promise<ApiTestimonial> {
  const res = await fetch(`${BASE}/admin/testimonials/${id}`, {
    method: "PATCH",
    headers: await adminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ApiTestimonial>;
}

export async function apiDeleteTestimonial(id: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/testimonials/${id}`, {
    method: "DELETE",
    headers: await adminHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
