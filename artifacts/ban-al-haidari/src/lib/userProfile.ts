// ─── User Profile ─────────────────────────────────────────────────────────────
// Firestore dependency fully removed. All data stored in Neon PostgreSQL.
// Calls /api/profile endpoints (auth via Firebase ID token).

import { auth } from "./firebase";

export interface ActivityItem {
  id: string;
  label: string;
  date: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  intention: string;
  phone: string;
  recentActivity: ActivityItem[];
  createdAt: string | null;
  updatedAt: string | null;
}

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
const BASE = `${API_ORIGIN}/api`;

async function authHeaders(): Promise<Record<string, string>> {
  const token = await auth?.currentUser?.getIdToken().catch(() => null);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getUserProfile(_uid: string): Promise<UserProfile | null> {
  try {
    const headers = await authHeaders();
    if (!headers.Authorization) return null;
    const res = await fetch(`${BASE}/profile`, { headers });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json() as Promise<UserProfile>;
  } catch {
    return null;
  }
}

export async function upsertUserProfile(
  _uid: string,
  data: Partial<Omit<UserProfile, "uid" | "createdAt" | "updatedAt">>,
): Promise<void> {
  const headers = await authHeaders();
  if (!headers.Authorization) throw new Error("Not authenticated");
  const res = await fetch(`${BASE}/profile`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save profile: HTTP ${res.status}`);
}

export async function addActivity(_uid: string, item: ActivityItem): Promise<void> {
  try {
    const headers = await authHeaders();
    if (!headers.Authorization) return;
    await fetch(`${BASE}/profile/activity`, {
      method: "POST",
      headers,
      body: JSON.stringify(item),
    });
  } catch {
    // Activity logging is non-critical — fail silently
  }
}
