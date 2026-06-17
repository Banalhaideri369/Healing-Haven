import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LogOut, ArrowLeft, ArrowRight, Users, MessageSquare,
  Settings, LayoutDashboard, UserCheck, Activity,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { useLocation } from "wouter";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

interface UserRow {
  uid: string;
  email: string;
  displayName: string;
  createdAt?: string;
  bio?: string;
  phone?: string;
}

export default function AdminDashboard() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "settings">("overview");

  useEffect(() => {
    if (!db) return;
    setLoadingUsers(true);
    const q = query(collection(db, "user_profiles"), orderBy("createdAt", "desc"), limit(50));
    getDocs(q)
      .then((snap) => {
        const rows: UserRow[] = snap.docs.map((d) => ({
          uid: d.id,
          ...(d.data() as Omit<UserRow, "uid">),
        }));
        setUsers(rows);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  const statCards = [
    {
      icon: Users,
      label: isRTL ? "إجمالي المستخدمين" : "Total Users",
      value: loadingUsers ? "..." : users.length,
      color: "text-primary",
    },
    {
      icon: UserCheck,
      label: isRTL ? "الملفات المكتملة" : "Completed Profiles",
      value: loadingUsers ? "..." : users.filter((u) => u.bio).length,
      color: "text-emerald-400",
    },
    {
      icon: Activity,
      label: isRTL ? "المنصة" : "Platform",
      value: "Live",
      color: "text-amber-400",
    },
  ];

  const tabs = [
    { id: "overview", icon: LayoutDashboard, label: isRTL ? "نظرة عامة" : "Overview" },
    { id: "users", icon: Users, label: isRTL ? "المستخدمون" : "Users" },
    { id: "settings", icon: Settings, label: isRTL ? "الإعدادات" : "Settings" },
  ] as const;

  return (
    <div
      className="min-h-screen bg-background"
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 20% 0%, rgba(88,28,135,0.22) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(212,175,55,0.07) 0%, transparent 60%)",
      }}
    >
      {/* Top bar */}
      <header className="border-b border-primary/15 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="block">
              <img src="/logo.png" alt="BAH" className="h-10 object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]" />
            </a>
            <div className="h-5 w-px bg-primary/20" />
            <span className="text-xs uppercase tracking-[0.25em] text-primary/70 font-semibold">
              {isRTL ? "لوحة الإدارة" : "Admin Panel"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
              {isRTL ? <ArrowRight size={14} className="rotate-180" /> : <ArrowLeft size={14} />}
              {isRTL ? "الرئيسية" : "Home"}
            </a>
            <a
              href="/profile"
              onClick={(e) => { e.preventDefault(); navigate("/profile"); }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
              {isRTL ? "ملفي" : "My Profile"}
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 border border-primary/30 text-primary/80 hover:bg-primary hover:text-primary-foreground transition-all text-xs uppercase tracking-widest"
            >
              <LogOut size={13} />
              {isRTL ? "خروج" : "Sign Out"}
            </button>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </header>

      <main className="container mx-auto px-6 py-10 max-w-6xl">
        {/* Page title */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-primary/60 mb-1">
            {isRTL ? "أهلاً" : "Welcome"}, {user?.displayName ?? user?.email?.split("@")[0]}
          </p>
          <h1 className="text-3xl md:text-4xl font-cormorant text-foreground">
            {isRTL ? "لوحة الإدارة" : "Admin Dashboard"}
          </h1>
        </motion.div>

        {/* Tabs */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="flex gap-1 border-b border-primary/15 mb-8">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-widest font-semibold transition-all ${
                tab === id
                  ? "text-primary border-b-2 border-primary -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </motion.div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {statCards.map(({ icon: Icon, label, value, color }, i) => (
                <div key={i} className="border border-primary/15 bg-white/[0.02] p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
                      <p className={`text-3xl font-cormorant font-bold ${color}`}>{value}</p>
                    </div>
                    <Icon size={22} className="text-primary/30" />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent users preview */}
            <div className="border border-primary/15 bg-white/[0.02] p-6">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-primary">
                  <Users size={15} />
                  <h2 className="text-xs uppercase tracking-widest font-semibold">
                    {isRTL ? "آخر المسجّلين" : "Latest Sign-ups"}
                  </h2>
                </div>
                <button
                  onClick={() => setTab("users")}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                >
                  {isRTL ? "عرض الكل" : "View All"}
                </button>
              </div>
              {loadingUsers ? (
                <div className="flex items-center gap-3 text-muted-foreground text-sm py-4">
                  <div className="w-4 h-4 border border-primary/30 border-t-primary rounded-full animate-spin" />
                  {isRTL ? "جاري التحميل..." : "Loading..."}
                </div>
              ) : users.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 italic">
                  {isRTL ? "لا يوجد مستخدمون بعد." : "No users yet."}
                </p>
              ) : (
                <ul className="space-y-2">
                  {users.slice(0, 5).map((u) => (
                    <li key={u.uid} className="flex items-center justify-between py-2 border-b border-primary/8 last:border-0">
                      <div>
                        <p className="text-sm text-foreground/90">{u.displayName || "—"}</p>
                        <p className="text-xs text-muted-foreground/60">{u.email}</p>
                      </div>
                      {u.phone && (
                        <span className="text-xs text-muted-foreground/50">{u.phone}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Coming soon features */}
            <div className="border border-primary/10 bg-primary/[0.03] p-6">
              <div className="flex items-center gap-2 text-primary/60 mb-3">
                <MessageSquare size={14} />
                <h3 className="text-xs uppercase tracking-widest font-semibold">
                  {isRTL ? "قادم قريباً" : "Coming Soon"}
                </h3>
              </div>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  isRTL ? "إدارة المنتجات" : "Products Management",
                  isRTL ? "إدارة الحجوزات" : "Bookings Management",
                  isRTL ? "إرسال الإشعارات" : "Send Notifications",
                  isRTL ? "إدارة الشهادات" : "Testimonials Management",
                  isRTL ? "تقارير الإيرادات" : "Revenue Reports",
                  isRTL ? "إعدادات الموقع" : "Site Settings",
                ].map((item) => (
                  <li key={item} className="text-xs text-muted-foreground/50 flex items-center gap-1.5">
                    <span className="text-primary/30">◆</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* USERS TAB */}
        {tab === "users" && (
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
            <div className="border border-primary/15 bg-white/[0.02]">
              <div className="p-5 border-b border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Users size={15} />
                  <h2 className="text-xs uppercase tracking-widest font-semibold">
                    {isRTL ? "جميع المستخدمين" : "All Users"} ({users.length})
                  </h2>
                </div>
              </div>
              {loadingUsers ? (
                <div className="flex items-center gap-3 text-muted-foreground text-sm p-8">
                  <div className="w-5 h-5 border border-primary/30 border-t-primary rounded-full animate-spin" />
                  {isRTL ? "جاري التحميل..." : "Loading users..."}
                </div>
              ) : users.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 italic p-8">
                  {isRTL ? "لا يوجد مستخدمون بعد." : "No users yet."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-primary/10">
                        <th className="text-start p-4 text-xs uppercase tracking-widest text-muted-foreground font-medium">
                          {isRTL ? "الاسم" : "Name"}
                        </th>
                        <th className="text-start p-4 text-xs uppercase tracking-widest text-muted-foreground font-medium">
                          {isRTL ? "البريد" : "Email"}
                        </th>
                        <th className="text-start p-4 text-xs uppercase tracking-widest text-muted-foreground font-medium">
                          {isRTL ? "الهاتف" : "Phone"}
                        </th>
                        <th className="text-start p-4 text-xs uppercase tracking-widest text-muted-foreground font-medium">
                          {isRTL ? "النبذة" : "Bio"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.uid} className="border-b border-primary/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 text-foreground/80">{u.displayName || "—"}</td>
                          <td className="p-4 text-muted-foreground/70">{u.email}</td>
                          <td className="p-4 text-muted-foreground/60">{u.phone || "—"}</td>
                          <td className="p-4 text-muted-foreground/60 max-w-xs truncate">
                            {u.bio || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show">
            <div className="border border-primary/15 bg-white/[0.02] p-8">
              <div className="flex items-center gap-2 text-primary mb-6">
                <Settings size={16} />
                <h2 className="text-sm uppercase tracking-widest font-semibold">
                  {isRTL ? "إعدادات الموقع" : "Site Settings"}
                </h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 border border-primary/10 bg-white/[0.01]">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    {isRTL ? "بريد الإدارة" : "Admin Email"}
                  </p>
                  <p className="text-sm text-foreground/80">{user?.email}</p>
                </div>
                <div className="p-4 border border-primary/10 bg-white/[0.01]">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    {isRTL ? "المشروع" : "Firebase Project"}
                  </p>
                  <p className="text-sm text-foreground/80">ban-alhaidari-energy</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/40 mt-8 italic">
                {isRTL
                  ? "المزيد من إعدادات الموقع قادمة قريباً."
                  : "More site settings coming soon."}
              </p>
            </div>
          </motion.div>
        )}

        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground/30 uppercase tracking-[0.3em] font-cormorant text-base">
            Ban Al-Haidari · {isRTL ? "لوحة الإدارة" : "Admin Panel"}
          </p>
        </div>
      </main>
    </div>
  );
}
