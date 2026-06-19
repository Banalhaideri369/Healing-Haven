import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LogOut, ArrowLeft, ArrowRight, Users,
  BookOpen, Video, ListOrdered, ChevronRight, Settings, Bell, BellOff, BellRing,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { useLocation } from "wouter";
import { RecordedCoursesTab } from "@/components/admin/RecordedCoursesTab";
import { OnlineCoursesTab } from "@/components/admin/OnlineCoursesTab";
import { SubscriptionsTab } from "@/components/admin/SubscriptionsTab";
import { WebsiteSettingsTab } from "@/components/admin/WebsiteSettingsTab";
import { apiGetVapidPublicKey, apiSubscribePush, apiUnsubscribePush } from "@/lib/api";

type MainTab = "courses" | "bookings" | "users" | "settings";
type CoursesSubTab = "recorded" | "online";
type PushStatus = "idle" | "subscribed" | "denied" | "unsupported" | "loading";

interface UserRow {
  uid: string;
  email: string;
  displayName: string;
  createdAt?: string;
  bio?: string;
  phone?: string;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function AdminDashboard() {
  const { isRTL, t } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const a = t.admin;

  const [mainTab, setMainTab] = useState<MainTab>("courses");
  const [coursesSubTab, setCoursesSubTab] = useState<CoursesSubTab>("recorded");

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ── Push notification state ──────────────────────────────────────────────────
  const [pushStatus, setPushStatus] = useState<PushStatus>("idle");

  const checkPushStatus = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setPushStatus("denied");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setPushStatus(sub ? "subscribed" : "idle");
    } catch {
      setPushStatus("idle");
    }
  }, []);

  useEffect(() => {
    void checkPushStatus();
  }, [checkPushStatus]);

  const handleEnablePush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setPushStatus("loading");
    try {
      const publicKey = await apiGetVapidPublicKey();
      if (!publicKey) { setPushStatus("idle"); return; }

      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setPushStatus("denied"); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as ArrayBuffer,
      });

      const subJson = sub.toJSON() as {
        endpoint: string;
        keys?: { p256dh?: string; auth?: string };
      };

      if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
        await apiSubscribePush({
          endpoint: subJson.endpoint,
          keys: { p256dh: subJson.keys.p256dh, auth: subJson.keys.auth },
        });
      }

      setPushStatus("subscribed");

      // Test notification
      setTimeout(() => {
        void reg.showNotification("🔔 Notifications Enabled!", {
          body: isRTL ? "ستتلقين إشعاراً فورياً مع كل حجز جديد." : "You'll receive instant alerts for every new booking.",
          icon: "/favicon.svg",
          tag: "enable-test",
        });
      }, 500);
    } catch {
      setPushStatus("idle");
    }
  };

  const handleDisablePush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await apiUnsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
      setPushStatus("idle");
    } catch {
      setPushStatus("idle");
    }
  };

  // ── Push notification banner ─────────────────────────────────────────────────
  const PushBanner = () => {
    if (pushStatus === "unsupported" || pushStatus === "subscribed") return null;

    if (pushStatus === "denied") {
      return (
        <div className="bg-amber-950/30 border-b border-amber-500/20 px-6 py-2">
          <p className="text-xs text-amber-400/70 text-center">
            {isRTL
              ? "⚠️ الإشعارات محظورة في المتصفح. يرجى السماح بها من إعدادات المتصفح."
              : "⚠️ Notifications are blocked. Please allow them in your browser settings."}
          </p>
        </div>
      );
    }

    return (
      <div className="bg-[#0f0a12] border-b border-primary/15 px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Bell size={14} className="text-primary/70 shrink-0" />
          <p className="text-xs text-muted-foreground/70">
            {isRTL
              ? "فعّلي الإشعارات الفورية لتلقّي تنبيه مع كل حجز جديد على هاتفك أو حاسوبك."
              : "Enable push notifications to receive instant alerts for every new booking."}
          </p>
        </div>
        <button
          onClick={() => void handleEnablePush()}
          disabled={pushStatus === "loading"}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 border border-primary/40 text-primary text-[11px] font-semibold uppercase tracking-widest hover:bg-primary/25 disabled:opacity-50 transition-colors"
        >
          {pushStatus === "loading" ? (
            <span className="w-3 h-3 border border-primary/40 border-t-primary rounded-full animate-spin" />
          ) : (
            <BellRing size={12} />
          )}
          {isRTL ? "تفعيل" : "Enable"}
        </button>
      </div>
    );
  };

  // ── Users ────────────────────────────────────────────────────────────────────
  const fetchUsers = () => {
    if (!db || loadingUsers) return;
    setLoadingUsers(true);
    const q = query(collection(db, "user_profiles"), orderBy("createdAt", "desc"), limit(100));
    getDocs(q)
      .then((snap) => setUsers(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<UserRow, "uid">) }))))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => {
    if (mainTab === "users") fetchUsers();
  }, [mainTab]);

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const mainTabs = [
    { id: "courses" as const, label: a.coursesManagement, icon: <BookOpen size={14} /> },
    { id: "bookings" as const, label: a.subscriptionsBookings, icon: <ListOrdered size={14} /> },
    { id: "users" as const, label: a.users, icon: <Users size={14} /> },
    { id: "settings" as const, label: isRTL ? "إعدادات الموقع" : "Website Settings", icon: <Settings size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a060f]" dir={isRTL ? "rtl" : "ltr"}>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-secondary/6 rounded-full blur-[200px] pointer-events-none" />

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 bg-[#0a060f]/90 backdrop-blur border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-primary text-xs uppercase tracking-widest transition-colors"
            >
              <BackArrow size={13} />
              {a.backToSite}
            </button>
            <span className="text-white/10">|</span>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="BAH" className="h-7 object-contain" />
              <span className="text-xs uppercase tracking-[0.2em] text-primary/70 font-semibold">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Push toggle for subscribed state */}
            {pushStatus === "subscribed" && (
              <button
                onClick={() => void handleDisablePush()}
                title={isRTL ? "تعطيل الإشعارات" : "Disable notifications"}
                className="flex items-center gap-1.5 text-[11px] text-primary/60 hover:text-red-400 uppercase tracking-widest transition-colors"
              >
                <BellOff size={13} />
                <span className="hidden sm:inline">{isRTL ? "إشعارات مفعّلة" : "Notifs On"}</span>
              </button>
            )}
            <span className="text-xs text-muted-foreground/50 hidden sm:block">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-red-400 uppercase tracking-widest transition-colors"
            >
              <LogOut size={13} />
              {a.logout}
            </button>
          </div>
        </div>
      </header>

      {/* ── Push notification banner ── */}
      <PushBanner />

      {/* ── Main tabs ── */}
      <div className="border-b border-white/6 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {mainTabs.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setMainTab(id)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${
                  mainTab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground/50 hover:text-muted-foreground"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ═══ COURSES MANAGEMENT ═══ */}
        {mainTab === "courses" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-2 mb-8">
              {(
                [
                  { id: "recorded" as const, label: a.recordedCourses, icon: <BookOpen size={13} /> },
                  { id: "online"   as const, label: a.onlineCourses,   icon: <Video size={13} /> },
                ] as const
              ).map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setCoursesSubTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all ${
                    coursesSubTab === id
                      ? "bg-primary/15 border border-primary/40 text-primary"
                      : "border border-white/8 text-muted-foreground/50 hover:border-white/15 hover:text-muted-foreground"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
              <span className="ms-auto flex items-center gap-1 text-xs text-muted-foreground/40">
                {a.courses}
                <ChevronRight size={12} />
                <span className="text-primary/60">{coursesSubTab === "recorded" ? a.recordedCourses : a.onlineCourses}</span>
              </span>
            </div>
            {coursesSubTab === "recorded" ? <RecordedCoursesTab /> : <OnlineCoursesTab />}
          </motion.div>
        )}

        {/* ═══ SUBSCRIPTIONS & BOOKINGS ═══ */}
        {mainTab === "bookings" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-8">
              <h2 className="font-serif text-2xl text-foreground">{a.subscriptionsBookings}</h2>
            </div>
            <SubscriptionsTab />
          </motion.div>
        )}

        {/* ═══ USERS ═══ */}
        {mainTab === "users" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-8">
              <h2 className="font-serif text-2xl text-foreground">{a.registeredUsers}</h2>
              <p className="text-xs text-muted-foreground mt-1">{a.userCount(users.length)}</p>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary animate-spin rounded-full" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/8">
                <p className="text-muted-foreground/50 text-sm">{a.noUsers}</p>
              </div>
            ) : (
              <div className="border border-white/8 overflow-x-auto">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 bg-black/20">
                      {[a.colUserName, a.colUserEmail, a.colPhone, a.colBio, a.colJoined].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] uppercase tracking-widest text-muted-foreground font-medium whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.uid} className="hover:bg-primary/3 transition-colors">
                        <td className="px-4 py-3 text-foreground/90 font-medium whitespace-nowrap">{u.displayName || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{u.email}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{u.phone || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">{u.bio || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {u.createdAt ? new Date(u.createdAt as unknown as string).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ WEBSITE SETTINGS ═══ */}
        {mainTab === "settings" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <WebsiteSettingsTab />
          </motion.div>
        )}

      </main>
    </div>
  );
}
