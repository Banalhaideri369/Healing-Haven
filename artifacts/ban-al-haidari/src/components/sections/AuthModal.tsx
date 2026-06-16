import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { signIn, signUp } from "@/lib/auth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { t, isRTL } = useLanguage();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName(""); setEmail(""); setPassword("");
    setError(""); setLoading(false); setShowPassword(false);
  };

  const switchMode = (m: "login" | "signup") => { setMode(m); reset(); };

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
      console.error("Auth error — code:", code, "message:", message);

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
        setError(isRTL ? "تسجيل الدخول بالبريد غير مفعّل في Firebase — فعّليه من Console" : "Email sign-in is not enabled in Firebase Console");
      } else if (code === "auth/network-request-failed") {
        setError(isRTL ? "تحقّقي من اتصالك بالإنترنت" : "Network error — check your connection");
      } else if (code === "auth/too-many-requests") {
        setError(isRTL ? "محاولات كثيرة، انتظري قليلاً وحاولي مجدداً" : "Too many attempts — please wait and try again");
      } else if (!code && message.includes("not initialized")) {
        setError(isRTL ? "Firebase غير متصل — تحقّقي من الـ API Key" : "Firebase not connected — check API Key");
      } else {
        setError(`${t.auth.errorGeneral} (${code || "unknown"})`);
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

                  <div className="space-y-1 relative">
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
