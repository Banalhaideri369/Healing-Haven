import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, ArrowLeft, ArrowRight, Save, User, Sparkles,
  Clock, KeyRound, Eye, EyeOff, ShieldCheck,
  BookOpen, CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { logOut, changePassword, updateDisplayName } from "@/lib/auth";
import { getUserProfile, upsertUserProfile, addActivity, UserProfile } from "@/lib/userProfile";
import { apiGetMyBookings, ApiBooking } from "@/lib/api";
import { useLocation } from "wouter";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

// Map Firebase error codes to user-friendly messages
function pwErrorMessage(code: string, isRTL: boolean): string {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return isRTL ? "كلمة المرور الحالية غير صحيحة" : "Current password is incorrect";
    case "auth/weak-password":
      return isRTL ? "كلمة المرور الجديدة ضعيفة — استخدم 6 أحرف على الأقل" : "New password is too weak — use at least 6 characters";
    case "auth/too-many-requests":
      return isRTL ? "محاولات كثيرة، انتظر قليلاً وحاول مجدداً" : "Too many attempts — please wait and try again";
    case "auth/network-request-failed":
      return isRTL ? "تحقّق من اتصالك بالإنترنت" : "Network error — check your connection";
    default:
      return isRTL ? "حدث خطأ، حاول مجدداً" : "Something went wrong, please try again";
  }
}

export default function Profile() {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // ── Profile state ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    bio: "", intention: "", phone: "", recentActivity: [],
  });
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ── Password change state ──────────────────────────────────────────────────
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  // ── My Bookings ────────────────────────────────────────────────────────────
  const [myBookings, setMyBookings] = useState<ApiBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const displayName = profile.displayName || user?.displayName || user?.email?.split("@")[0] || t.auth.myAccount;
  const joinedDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(
        isRTL ? "ar-SA" : "en-GB",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : "—";

  // Real-time password validation
  const pwMatch = confirmPw.length === 0 || newPw === confirmPw;
  const newPwStrong = newPw.length === 0 || newPw.length >= 6;
  const pwFormValid = currentPw.length > 0 && newPw.length >= 6 && newPw === confirmPw;

  useEffect(() => {
    if (!user) return;
    setLoadingProfile(true);
    getUserProfile(user.uid)
      .then((data) => {
        if (data) {
          setProfile(data);
        } else {
          const joinActivity = {
            id: "join",
            label: isRTL ? "انضممت إلى المنصة 🎉" : "Joined the platform 🎉",
            date: new Date().toISOString(),
          };
          upsertUserProfile(user.uid, {
            email: user.email ?? "",
            displayName: user.displayName ?? "",
            bio: "", intention: "", phone: "",
            recentActivity: [joinActivity],
          });
          setProfile({ bio: "", intention: "", phone: "", recentActivity: [joinActivity] });
        }
        setLoadingProfile(false);
      })
      .catch(() => { setLoadError(true); setLoadingProfile(false); });
  }, [user, isRTL]);

  useEffect(() => {
    if (!user) { setBookingsLoading(false); return; }
    setBookingsLoading(true);
    apiGetMyBookings()
      .then(setMyBookings)
      .finally(() => setBookingsLoading(false));
  }, [user]);

  // ── Profile save — syncs name to Firebase Auth + Firestore ────────────────
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const trimmedName = editName.trim();

      // 1. If name changed — update Firebase Auth first, then Firestore
      const nameChanged = trimmedName.length > 0 && trimmedName !== (user.displayName ?? "");
      if (nameChanged) {
        await updateDisplayName(trimmedName);
      }

      const finalName = nameChanged ? trimmedName : (user.displayName ?? profile.displayName ?? "");

      // 2. Save everything to Firestore
      await upsertUserProfile(user.uid, {
        bio: profile.bio ?? "",
        intention: profile.intention ?? "",
        phone: profile.phone ?? "",
        email: user.email ?? "",
        displayName: finalName,
      });

      // 3. Update local state so heading updates immediately
      setProfile((p) => ({ ...p, displayName: finalName }));

      const activityItem = {
        id: `profile-update-${Date.now()}`,
        label: isRTL ? "تم تحديث الملف الشخصي ✏️" : "Profile updated ✏️",
        date: new Date().toISOString(),
      };
      await addActivity(user.uid, activityItem);
      setProfile((p) => ({
        ...p,
        recentActivity: [activityItem, ...(p.recentActivity ?? [])].slice(0, 10),
      }));

      setEditing(false);
      toast.success(isRTL ? "تم حفظ التغييرات بنجاح ✓" : "Changes saved successfully ✓", {
        description: isRTL ? "تم تحديث ملفك الشخصي" : "Your profile has been updated",
        duration: 4000,
      });
    } catch {
      toast.error(isRTL ? "فشل الحفظ، حاول مجدداً" : "Save failed, please try again", { duration: 4000 });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditName(user?.displayName ?? profile.displayName ?? "");
    if (user) getUserProfile(user.uid).then((data) => { if (data) setProfile(data); });
  };

  const handleStartEditing = () => {
    setEditName(user?.displayName ?? profile.displayName ?? "");
    setEditing(true);
  };

  // ── Password change ────────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwFormValid) return;

    setChangingPw(true);
    try {
      await changePassword(currentPw, newPw);

      // Log activity
      const activityItem = {
        id: `pw-change-${Date.now()}`,
        label: isRTL ? "تم تغيير كلمة المرور 🔒" : "Password changed 🔒",
        date: new Date().toISOString(),
      };
      if (user) {
        await addActivity(user.uid, activityItem);
        setProfile((p) => ({
          ...p,
          recentActivity: [activityItem, ...(p.recentActivity ?? [])].slice(0, 10),
        }));
      }

      // Reset form & close
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwOpen(false);

      toast.success(isRTL ? "تم تغيير كلمة المرور بنجاح 🔒" : "Password changed successfully 🔒", {
        description: isRTL ? "كلمة مرورك الجديدة محفوظة" : "Your new password is now active",
        duration: 5000,
      });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      toast.error(pwErrorMessage(code, isRTL), { duration: 5000 });
    } finally {
      setChangingPw(false);
    }
  };

  const handleLogout = async () => { await logOut(); navigate("/"); };

  const labelClass = "text-xs uppercase tracking-widest text-muted-foreground block mb-1.5";
  const inputClass =
    "w-full bg-white/5 border border-primary/20 px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors text-sm rounded-none";
  const pwInputClass =
    "w-full bg-white/5 border border-primary/20 px-4 py-3 pe-11 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors text-sm rounded-none";

  return (
    <div
      className="min-h-screen bg-background"
      dir={isRTL ? "rtl" : "ltr"}
      style={{ backgroundImage: "radial-gradient(ellipse at 20% 0%, rgba(88,28,135,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(212,175,55,0.06) 0%, transparent 60%)" }}
    >
      {/* Top bar */}
      <header className="border-b border-primary/15 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/"><img src="/logo.png" alt="BAH" className="h-12 object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]" /></a>
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
              {isRTL ? <ArrowRight size={14} className="rotate-180" /> : <ArrowLeft size={14} />}
              {t.dashboard.backHome}
            </a>
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-4 py-2 border border-primary/30 text-primary/80 hover:bg-primary hover:text-primary-foreground transition-all text-xs uppercase tracking-widest">
              <LogOut size={13} />{t.dashboard.logout}
            </button>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Welcome */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-primary/70 mb-2 font-medium">{t.dashboard.welcomeBack}</p>
          <h1 className="text-4xl md:text-5xl font-cormorant text-foreground">{displayName}</h1>
          <p className="text-muted-foreground text-sm mt-2">
            {t.dashboard.joinedOn} <span className="text-primary/80">{joinedDate}</span>
          </p>
        </motion.div>

        {loadError && (
          <div className="mb-8 px-4 py-3 border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{t.dashboard.loadError}</div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="md:col-span-2 space-y-6">

            {/* ── Profile Info Card ─────────────────────────────────────── */}
            <div className="border border-primary/15 bg-white/[0.02] p-6 relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-primary">
                  <User size={16} />
                  <h2 className="text-sm uppercase tracking-widest font-semibold">{t.dashboard.profileSection}</h2>
                </div>
                {!editing && (
                  <button onClick={handleStartEditing} className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest border border-primary/20 px-3 py-1.5 hover:border-primary">
                    {t.dashboard.editProfile}
                  </button>
                )}
              </div>

              {loadingProfile ? (
                <div className="flex items-center gap-3 text-muted-foreground text-sm py-4">
                  <div className="w-5 h-5 border border-primary/30 border-t-primary rounded-full animate-spin" />
                  {t.auth.loading}
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Email — read-only */}
                  <div>
                    <label className={labelClass}>{isRTL ? "البريد الإلكتروني" : "Email"}</label>
                    <p className="text-sm text-foreground/60 py-1">{user?.email}</p>
                  </div>

                  {/* Display Name — editable, syncs to Firebase Auth + Firestore */}
                  <div>
                    <label className={labelClass}>{isRTL ? "الاسم المعروض" : "Display Name"}</label>
                    <AnimatePresence mode="wait">
                      {editing ? (
                        <motion.input
                          key="name-edit"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder={isRTL ? "اسمك الكامل" : "Your full name"}
                          className={inputClass}
                          maxLength={60}
                          autoFocus
                        />
                      ) : (
                        <motion.p key="name-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="text-sm text-foreground/80 py-1">
                          {displayName}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className={labelClass}>{t.dashboard.bio}</label>
                    <AnimatePresence mode="wait">
                      {editing ? (
                        <motion.textarea key="bio-edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} rows={3}
                          value={profile.bio ?? ""} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                          placeholder={t.dashboard.bioPlaceholder} className={inputClass + " resize-none"} maxLength={500} />
                      ) : (
                        <motion.p key="bio-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-foreground/80 min-h-[3rem] py-1">
                          {profile.bio || <span className="text-muted-foreground/40 italic">{t.dashboard.bioPlaceholder}</span>}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className={labelClass}>{t.dashboard.intention}</label>
                    <AnimatePresence mode="wait">
                      {editing ? (
                        <motion.textarea key="intention-edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} rows={2}
                          value={profile.intention ?? ""} onChange={(e) => setProfile((p) => ({ ...p, intention: e.target.value }))}
                          placeholder={t.dashboard.intentionPlaceholder} className={inputClass + " resize-none"} maxLength={300} />
                      ) : (
                        <motion.p key="intention-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-foreground/80 min-h-[2rem] py-1">
                          {profile.intention || <span className="text-muted-foreground/40 italic">{t.dashboard.intentionPlaceholder}</span>}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className={labelClass}>{t.dashboard.phone}</label>
                    <AnimatePresence mode="wait">
                      {editing ? (
                        <motion.input key="phone-edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} type="tel"
                          value={profile.phone ?? ""} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                          placeholder={t.dashboard.phonePlaceholder} className={inputClass} maxLength={30} />
                      ) : (
                        <motion.p key="phone-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-foreground/80 py-1">
                          {profile.phone || <span className="text-muted-foreground/40 italic">{t.dashboard.phonePlaceholder}</span>}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {editing && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        className="flex items-center gap-3 pt-2">
                        <button onClick={handleSave} disabled={saving}
                          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                          {saving ? (
                            <><div className="w-3.5 h-3.5 border border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />{t.dashboard.saving}</>
                          ) : (
                            <><Save size={14} />{t.dashboard.saveChanges}</>
                          )}
                        </button>
                        <button onClick={handleCancel} disabled={saving}
                          className="px-4 py-3 text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors disabled:opacity-40">
                          ✕
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ── Change Password Card ──────────────────────────────────── */}
            <div className="border border-primary/15 bg-white/[0.02] p-6 relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              {/* Header */}
              <div className="flex items-center gap-2 text-primary mb-6">
                <KeyRound size={16} />
                <h2 className="text-sm uppercase tracking-widest font-semibold">
                  {isRTL ? "تغيير كلمة المرور" : "Change Password"}
                </h2>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5">
                {/* Current password */}
                <div>
                  <label className={labelClass}>
                    {isRTL ? "كلمة المرور الحالية" : "Current Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="••••••••"
                      className={pwInputClass}
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowCurrentPw((v) => !v)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                      {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className={labelClass}>
                    {isRTL ? "كلمة المرور الجديدة" : "New Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="••••••••"
                      className={`${pwInputClass} ${!newPwStrong ? "border-red-500/50 focus:border-red-500" : newPw.length >= 6 ? "border-emerald-500/40 focus:border-emerald-500" : ""}`}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowNewPw((v) => !v)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                      {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {newPw.length > 0 && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`text-[10px] mt-1.5 ${newPw.length >= 6 ? "text-emerald-400" : "text-red-400"}`}>
                        {newPw.length >= 6
                          ? (isRTL ? "✓ كلمة مرور قوية" : "✓ Strong password")
                          : (isRTL ? `${6 - newPw.length} أحرف بعد` : `${6 - newPw.length} more characters needed`)}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm new password */}
                <div>
                  <label className={labelClass}>
                    {isRTL ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="••••••••"
                      className={`${pwInputClass} ${!pwMatch ? "border-red-500/50 focus:border-red-500" : confirmPw.length >= 6 && pwMatch ? "border-emerald-500/40 focus:border-emerald-500" : ""}`}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowConfirmPw((v) => !v)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                      {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {confirmPw.length > 0 && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`text-[10px] mt-1.5 flex items-center gap-1 ${pwMatch ? "text-emerald-400" : "text-red-400"}`}>
                        {pwMatch
                          ? <><ShieldCheck size={11} />{isRTL ? "كلمتا المرور متطابقتان" : "Passwords match"}</>
                          : <>{isRTL ? "✗ كلمتا المرور غير متطابقتان" : "✗ Passwords do not match"}</>}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={changingPw || !pwFormValid}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {changingPw ? (
                      <><div className="w-3.5 h-3.5 border border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />{isRTL ? "جاري التغيير..." : "Updating..."}</>
                    ) : (
                      <><KeyRound size={14} />{isRTL ? "تغيير كلمة المرور" : "Update Password"}</>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </motion.div>

          {/* RIGHT COLUMN — Enrolled Courses + Activity */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" className="space-y-6">

            {/* Enrolled Courses */}
            <div className="border border-primary/15 bg-white/[0.02] p-5 relative">
              <div className="flex items-center gap-2 text-primary mb-4">
                <BookOpen size={15} />
                <h2 className="text-xs uppercase tracking-widest font-semibold">
                  {isRTL ? "دوراتي وجلساتي المشتركة" : "My Enrolled Courses & Sessions"}
                </h2>
                {myBookings.length > 0 && (
                  <span className="ms-auto text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                    {myBookings.length}
                  </span>
                )}
              </div>

              {bookingsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground/50 text-xs py-2">
                  <div className="w-3 h-3 border border-primary/20 border-t-primary rounded-full animate-spin" />
                  {isRTL ? "جاري التحميل..." : "Loading..."}
                </div>
              ) : myBookings.length === 0 ? (
                <div className="text-center py-6">
                  <Sparkles size={22} className="text-primary/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground/40 italic">
                    {isRTL ? "لا توجد دورات مسجلة بعد" : "No enrolled courses yet"}
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {myBookings.map((b) => (
                    <li key={b.id} className="border border-primary/10 bg-white/[0.01] p-3 flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs text-foreground/90 font-medium leading-snug flex-1">{b.courseTitle}</span>
                        <span className={`text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 flex-shrink-0 ${
                          b.paymentStatus === "paid" || b.paymentStatus === "demo_paid"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-primary/10 text-primary/60"
                        }`}>
                          {b.paymentStatus === "paid" || b.paymentStatus === "demo_paid"
                            ? (isRTL ? "مؤكد" : "Confirmed")
                            : (isRTL ? "قيد الانتظار" : "Pending")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={9} />
                          {new Date(b.createdAt).toLocaleDateString(isRTL ? "ar-SA" : "en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        <span className="uppercase tracking-widest text-primary/30">
                          {b.courseType === "recorded"
                            ? (isRTL ? "مسجل" : "Recorded")
                            : (isRTL ? "جلسة" : "Session")}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Activity */}
            <div className="border border-primary/15 bg-white/[0.02] p-5 relative">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Clock size={15} />
                <h2 className="text-xs uppercase tracking-widest font-semibold">{t.dashboard.activitySection}</h2>
                {(profile.recentActivity?.length ?? 0) > 0 && (
                  <span className="ms-auto text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                    {profile.recentActivity?.length}
                  </span>
                )}
              </div>

              {loadingProfile ? (
                <div className="flex items-center gap-2 text-muted-foreground/50 text-xs py-2">
                  <div className="w-3 h-3 border border-primary/20 border-t-primary rounded-full animate-spin" />
                  {t.auth.loading}
                </div>
              ) : !profile.recentActivity?.length ? (
                <p className="text-xs text-muted-foreground/50 italic">{t.dashboard.noActivity}</p>
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {profile.recentActivity.slice(0, 8).map((item) => (
                      <motion.li key={item.id}
                        initial={{ opacity: 0, x: isRTL ? 10 : -10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-0.5 border-b border-primary/8 pb-2 last:border-0 last:pb-0">
                        <span className="text-xs text-foreground/80">{item.label}</span>
                        <span className="text-[10px] text-muted-foreground/50">
                          {new Date(item.date).toLocaleDateString(
                            isRTL ? "ar-SA" : "en-GB",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground/30 uppercase tracking-[0.3em] font-cormorant text-base">
            Ban Al-Haidari · {isRTL ? "الشفاء الروحي المقدس" : "Sacred Energy Healing"}
          </p>
        </div>
      </main>
    </div>
  );
}
