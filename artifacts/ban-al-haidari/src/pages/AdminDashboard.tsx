import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LogOut, ArrowLeft, ArrowRight, Users,
  BookOpen, Video, ListOrdered, ChevronRight,
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

type MainTab = "courses" | "bookings" | "users";
type CoursesSubTab = "recorded" | "online";

interface UserRow {
  uid: string;
  email: string;
  displayName: string;
  createdAt?: string;
  bio?: string;
  phone?: string;
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

      {/* ── Main tabs ── */}
      <div className="border-b border-white/6 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {(
              [
                { id: "courses" as const, label: a.coursesManagement, icon: <BookOpen size={14} /> },
                { id: "bookings" as const, label: a.subscriptionsBookings, icon: <ListOrdered size={14} /> },
                { id: "users" as const, label: a.users, icon: <Users size={14} /> },
              ] as const
            ).map(({ id, label, icon }) => (
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
      </main>
    </div>
  );
}
