import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, ArrowRight, Save, User, Sparkles, Activity, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/lib/auth";
import { getUserProfile, upsertUserProfile, UserProfile } from "@/lib/userProfile";
import { useLocation } from "wouter";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function Dashboard() {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    bio: "",
    intention: "",
    phone: "",
    recentActivity: [],
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [loadError, setLoadError] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const displayName =
    user?.displayName ?? user?.email?.split("@")[0] ?? t.auth.myAccount;
  const joinedDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(
        isRTL ? "ar-SA" : "en-GB",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : "—";

  useEffect(() => {
    if (!user) return;
    setLoadingProfile(true);
    getUserProfile(user.uid).then((data) => {
      if (data) setProfile(data);
      else {
        // Seed empty profile on first login
        upsertUserProfile(user.uid, {
          email: user.email ?? "",
          displayName: user.displayName ?? "",
          bio: "",
          intention: "",
          phone: "",
          recentActivity: [
            {
              id: "join",
              label: isRTL ? "انضممتِ إلى المنصة 🎉" : "Joined the platform 🎉",
              date: new Date().toISOString(),
            },
          ],
        });
      }
      setLoadingProfile(false);
    }).catch(() => {
      setLoadError(true);
      setLoadingProfile(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveStatus("idle");
    try {
      await upsertUserProfile(user.uid, {
        bio: profile.bio ?? "",
        intention: profile.intention ?? "",
        phone: profile.phone ?? "",
        email: user.email ?? "",
        displayName: user.displayName ?? "",
      });
      setSaveStatus("saved");
      setEditing(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  const labelClass = "text-xs uppercase tracking-widest text-muted-foreground block mb-1.5";
  const inputClass =
    "w-full bg-white/5 border border-primary/20 px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors text-sm rounded-none";

  return (
    <div
      className="min-h-screen bg-background"
      dir={isRTL ? "rtl" : "ltr"}
      style={{ backgroundImage: "radial-gradient(ellipse at 20% 0%, rgba(88,28,135,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(212,175,55,0.06) 0%, transparent 60%)" }}
    >
      {/* Top bar */}
      <header className="border-b border-primary/15 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="block">
            <img
              src="/logo.png"
              alt="BAH"
              className="h-12 object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]"
            />
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
              {t.dashboard.backHome}
              <ArrowRight size={14} className={isRTL ? "rotate-180" : ""} />
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 border border-primary/30 text-primary/80 hover:bg-primary hover:text-primary-foreground transition-all text-xs uppercase tracking-widest"
              data-testid="button-dashboard-logout"
            >
              <LogOut size={13} />
              {t.dashboard.logout}
            </button>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Welcome hero */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-12"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-primary/70 mb-2 font-medium">
            {t.dashboard.welcomeBack}
          </p>
          <h1 className="text-4xl md:text-5xl font-cormorant text-foreground">
            {displayName}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {t.dashboard.joinedOn}{" "}
            <span className="text-primary/80">{joinedDate}</span>
          </p>
        </motion.div>

        {loadError && (
          <div className="mb-8 px-4 py-3 border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {t.dashboard.loadError}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT — Profile card */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="md:col-span-2 space-y-6"
          >
            {/* Profile section */}
            <div className="border border-primary/15 bg-white/[0.02] p-6 relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-primary">
                  <User size={16} />
                  <h2 className="text-sm uppercase tracking-widest font-semibold">
                    {t.dashboard.profileSection}
                  </h2>
                </div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest border border-primary/20 px-3 py-1.5 hover:border-primary"
                    data-testid="button-edit-profile"
                  >
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
                  {/* Bio */}
                  <div>
                    <label className={labelClass}>{t.dashboard.bio}</label>
                    {editing ? (
                      <textarea
                        rows={3}
                        value={profile.bio ?? ""}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, bio: e.target.value }))
                        }
                        placeholder={t.dashboard.bioPlaceholder}
                        className={inputClass + " resize-none"}
                        data-testid="input-bio"
                      />
                    ) : (
                      <p className="text-sm text-foreground/80 min-h-[3rem]">
                        {profile.bio || (
                          <span className="text-muted-foreground/50 italic">
                            {t.dashboard.bioPlaceholder}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Intention */}
                  <div>
                    <label className={labelClass}>{t.dashboard.intention}</label>
                    {editing ? (
                      <textarea
                        rows={2}
                        value={profile.intention ?? ""}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, intention: e.target.value }))
                        }
                        placeholder={t.dashboard.intentionPlaceholder}
                        className={inputClass + " resize-none"}
                        data-testid="input-intention"
                      />
                    ) : (
                      <p className="text-sm text-foreground/80 min-h-[2rem]">
                        {profile.intention || (
                          <span className="text-muted-foreground/50 italic">
                            {t.dashboard.intentionPlaceholder}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={labelClass}>{t.dashboard.phone}</label>
                    {editing ? (
                      <input
                        type="tel"
                        value={profile.phone ?? ""}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, phone: e.target.value }))
                        }
                        placeholder={t.dashboard.phonePlaceholder}
                        className={inputClass}
                        data-testid="input-phone"
                      />
                    ) : (
                      <p className="text-sm text-foreground/80">
                        {profile.phone || (
                          <span className="text-muted-foreground/50 italic">
                            {t.dashboard.phonePlaceholder}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {editing && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                        data-testid="button-save-profile"
                      >
                        <Save size={14} />
                        {saving ? t.dashboard.saving : t.dashboard.saveChanges}
                      </button>
                      <button
                        onClick={() => { setEditing(false); setSaveStatus("idle"); }}
                        className="px-4 py-3 text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {saveStatus === "saved" && !editing && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-emerald-400"
                    >
                      {t.dashboard.profileUpdated}
                    </motion.p>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT — Stats + Activity */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Sparkles, label: isRTL ? "رحلتي" : "My Journey", value: "✦" },
                { icon: Activity, label: isRTL ? "الحضور" : "Presence", value: "∞" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="border border-primary/15 bg-white/[0.02] p-4 flex flex-col items-center justify-center gap-2 text-center"
                >
                  <Icon size={18} className="text-primary/60" />
                  <p className="text-xl font-cormorant text-primary">{value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="border border-primary/15 bg-white/[0.02] p-5">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="flex items-center gap-2 text-primary mb-4">
                <Clock size={15} />
                <h2 className="text-xs uppercase tracking-widest font-semibold">
                  {t.dashboard.activitySection}
                </h2>
              </div>
              {!profile.recentActivity?.length ? (
                <p className="text-xs text-muted-foreground/50 italic">
                  {t.dashboard.noActivity}
                </p>
              ) : (
                <ul className="space-y-3">
                  {profile.recentActivity.slice(0, 5).map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-0.5 border-b border-primary/10 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="text-xs text-foreground/80">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground/50">
                        {new Date(item.date).toLocaleDateString(
                          isRTL ? "ar-SA" : "en-GB",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>

        {/* Decorative bottom */}
        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground/30 uppercase tracking-[0.3em] font-cormorant text-base">
            Ban Al-Haidari · {isRTL ? "الشفاء الروحي المقدس" : "Sacred Energy Healing"}
          </p>
        </div>
      </main>
    </div>
  );
}
