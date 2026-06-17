import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { signIn, signUp, resetPassword } from "@/lib/auth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Mode = "login" | "signup" | "forgot";

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { t, isRTL } = useLanguage();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const reset = () => {
    setName(""); setEmail(""); setPassword("");
    setError(""); setLoading(false); setShowPassword(false);
    setResetSent(false);
  };

  const switchMode = (m: Mode) => { setMode(m); reset(); };

  // ── Login / Signup ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      reset();
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      const message = (err as { message?: string }).message ?? "";
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError(t.auth.errorInvalid);
      } else if (code === "auth/email-already-in-use") {
        setError(t.auth.errorExists);
      } else if (code === "auth/weak-password") {
        setError(t.auth.errorWeak);
      } else if (code === "auth/operation-not-allowed") {
        setError(isRTL ? "تسجيل الدخول بالبريد غير مفعّل في Firebase Console" : "Email sign-in is not enabled in Firebase Console");
      } else if (code === "auth/network-request-failed") {
        setError(isRTL ? "تحقّق من اتصالك بالإنترنت" : "Network error — check your connection");
      } else if (code === "auth/too-many-requests") {
        setError(isRTL ? "محاولات كثيرة، انتظر قليلاً" : "Too many attempts — please wait");
      } else if (!code && message.includes("not initialized")) {
        setError(isRTL ? "Firebase غير متصل — تحقّق من الـ API Key" : "Firebase not connected — check API Key");
      } else {
        setError(`${t.auth.errorGeneral} (${code || "unknown"})`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ─────────────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.auth.forgotErrorInvalid);
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/user-not-found") {
        setError(t.auth.forgotErrorNotFound);
      } else if (code === "auth/invalid-email") {
        setError(t.auth.forgotErrorInvalid);
      } else if (code === "auth/network-request-failed") {
        setError(isRTL ? "تحقّق من اتصالك بالإنترنت" : "Network error — check your connection");
      } else if (code === "auth/too-many-requests") {
        setError(isRTL ? "محاولات كثيرة، انتظر قليلاً" : "Too many attempts — please wait");
      } else {
        setError(t.auth.errorGeneral);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-primary/30 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors font-light text-sm";
  const labelClass = "text-xs uppercase tracking-widest text-muted-foreground block mb-1";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-md bg-[#0f0a12] border border-primary/20 shadow-[0_0_80px_rgba(212,175,55,0.1)] overflow-hidden"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {/* Top gold line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 end-4 text-muted-foreground hover:text-primary transition-colors z-10"
                data-testid="button-close-auth"
              >
                <X size={20} />
              </button>

              <div className="p-10">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                  <img src="/logo.png" alt="BAH" className="h-16 object-contain drop-shadow-[0_0_14px_rgba(212,175,55,0.5)]" />
                </div>

                <AnimatePresence mode="wait">

                  {/* ── FORGOT PASSWORD ─────────────────────────────── */}
                  {mode === "forgot" && (
                    <motion.div
                      key="forgot"
                      initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      {/* Back button */}
                      <button
                        onClick={() => switchMode("login")}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest mb-6"
                      >
                        {isRTL ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
                        {t.auth.forgotBackToLogin}
                      </button>

                      {resetSent ? (
                        /* ── SUCCESS STATE ── */
                        <motion.div
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center py-4 space-y-4"
                        >
                          <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
                              <CheckCircle2 size={32} className="text-primary" />
                            </div>
                          </div>
                          <h3 className="text-xl font-cormorant text-foreground">
                            {t.auth.forgotSuccessTitle}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {t.auth.forgotSuccessDesc}
                          </p>
                          <p className="text-xs text-primary/60 bg-primary/5 border border-primary/15 px-4 py-2 mt-2">
                            {email}
                          </p>
                          <button
                            onClick={() => switchMode("login")}
                            className="w-full py-3 border border-primary/30 text-primary/80 hover:bg-primary hover:text-primary-foreground transition-all text-xs uppercase tracking-widest mt-2"
                          >
                            {t.auth.forgotBackToLogin}
                          </button>
                        </motion.div>
                      ) : (
                        /* ── FORM STATE ── */
                        <form onSubmit={handleResetPassword} className="space-y-6">
                          <div>
                            <h3 className="text-xl font-cormorant text-foreground mb-1">
                              {t.auth.forgotTitle}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {t.auth.forgotDesc}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <label className={labelClass}>{t.auth.email}</label>
                            <div className="relative">
                              <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                placeholder={t.auth.emailPlaceholder}
                                className={inputClass + " pe-8"}
                                autoFocus
                                data-testid="input-reset-email"
                              />
                              <Mail size={14} className="absolute end-1 top-3.5 text-muted-foreground/40" />
                            </div>
                          </div>

                          {/* Error */}
                          <AnimatePresence>
                            {error && (
                              <motion.p
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-xs text-red-400 text-center"
                              >
                                {error}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-primary-foreground uppercase tracking-widest font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                            data-testid="button-reset-submit"
                          >
                            {loading ? t.auth.loading : t.auth.forgotSubmit}
                          </button>
                        </form>
                      )}
                    </motion.div>
                  )}

                  {/* ── LOGIN / SIGNUP ───────────────────────────────── */}
                  {mode !== "forgot" && (
                    <motion.div
                      key="auth"
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                      transition={{ duration: 0.25 }}
                    >
                      {/* Tabs */}
                      <div className="flex border-b border-primary/15 mb-8">
                        {(["login", "signup"] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => switchMode(m)}
                            className={`flex-1 pb-3 text-sm uppercase tracking-widest font-semibold transition-colors duration-300 ${
                              mode === m
                                ? "text-primary border-b-2 border-primary -mb-[1px]"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                            data-testid={`tab-${m}`}
                          >
                            {m === "login" ? t.auth.login : t.auth.signup}
                          </button>
                        ))}
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSubmit} className="space-y-6" data-testid="auth-form">
                        <AnimatePresence mode="wait">
                          {mode === "signup" && (
                            <motion.div
                              key="name-field"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1">
                                <label className={labelClass}>{t.auth.name}</label>
                                <input
                                  type="text"
                                  required
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  placeholder={t.auth.namePlaceholder}
                                  className={inputClass}
                                  data-testid="input-auth-name"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="space-y-1">
                          <label className={labelClass}>{t.auth.email}</label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.auth.emailPlaceholder}
                            className={inputClass}
                            data-testid="input-auth-email"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}>{t.auth.password}</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              minLength={6}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder={t.auth.passwordPlaceholder}
                              className={inputClass + " pe-10"}
                              data-testid="input-auth-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute end-0 top-3 text-muted-foreground hover:text-primary transition-colors"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {/* Forgot password link — login mode only */}
                          {mode === "login" && (
                            <div className="flex justify-end mt-1.5">
                              <button
                                type="button"
                                onClick={() => switchMode("forgot")}
                                className="text-[11px] text-muted-foreground/60 hover:text-primary transition-colors"
                                data-testid="button-forgot-password"
                              >
                                {t.auth.forgotPassword}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                          {error && (
                            <motion.p
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-xs text-red-400 text-center"
                              data-testid="auth-error"
                            >
                              {error}
                            </motion.p>
                          )}
                        </AnimatePresence>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-4 bg-primary text-primary-foreground uppercase tracking-widest font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 mt-2"
                          data-testid="button-auth-submit"
                        >
                          {loading
                            ? t.auth.loading
                            : mode === "login"
                            ? t.auth.submitLogin
                            : t.auth.submitSignup}
                        </button>
                      </form>

                      {/* Switch mode */}
                      <p className="text-center text-xs text-muted-foreground mt-6">
                        <button
                          onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                          className="hover:text-primary transition-colors underline underline-offset-2"
                          data-testid="button-auth-switch"
                        >
                          {mode === "login" ? t.auth.switchToSignup : t.auth.switchToLogin}
                        </button>
                      </p>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Bottom gold line */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
