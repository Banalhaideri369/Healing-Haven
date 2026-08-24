import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Send, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { API_BASE } from "@/lib/apiBase";

interface VerifyResponse {
  success: boolean;
  telegramUrl?: string;
  productName?: string;
  error?: string;
}

export default function Success() {
  const { isRTL } = useLanguage();
  const [, navigate] = useLocation();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [productName, setProductName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setState("error");
      return;
    }

    fetch(`${API_BASE}/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data: VerifyResponse) => {
        if (data.success) {
          setTelegramUrl(data.telegramUrl ?? "");
          setProductName(data.productName ?? "");
          setState("success");
        } else {
          setState("error");
        }
      })
      .catch(() => setState("error"));
  }, []);

  return (
    <div
      className="min-h-screen bg-[#0a060f] flex items-center justify-center px-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/8 rounded-full blur-[180px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-lg w-full bg-[#0f0a12] border border-primary/20 p-10 md:p-14 text-center shadow-[0_0_80px_rgba(212,175,55,0.08)]"
      >
        {/* Top gold line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

        {/* Logo */}
        <img
          src="/logo.png"
          alt="Ban Al-Haidari"
          className="h-16 object-contain mx-auto mb-8 drop-shadow-[0_0_14px_rgba(212,175,55,0.4)]"
        />

        {/* Loading */}
        {state === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <Loader2 className="w-12 h-12 text-primary/60 mx-auto animate-spin" />
            <p className="text-muted-foreground font-light">
              {isRTL ? "جاري التحقق من الدفع..." : "Verifying payment..."}
            </p>
          </motion.div>
        )}

        {/* Success */}
        {state === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-primary" />
              </div>
            </div>

            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
                {isRTL ? "مبروك! 🎉" : "Congratulations! 🎉"}
              </h1>
              <p className="text-muted-foreground font-light leading-relaxed">
                {isRTL
                  ? "تم الدفع بنجاح. ورشتك في انتظارك!"
                  : "Payment successful. Your workshop is waiting for you!"}
              </p>
              {productName && (
                <p className="text-primary/70 text-sm mt-2 font-light italic">
                  {productName}
                </p>
              )}
            </div>

            {/* Telegram link */}
            <div className="bg-primary/5 border border-primary/20 p-6 space-y-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {isRTL ? "قناة الورشة على تيليجرام" : "Workshop Telegram Channel"}
              </p>

              {telegramUrl ? (
                <>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {isRTL
                      ? "انضم إلى القناة الخاصة للوصول إلى جميع المحتويات والتسجيلات والملفات."
                      : "Join the private channel to access all content, recordings, and files."}
                  </p>
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
                    data-testid="link-telegram"
                  >
                    <Send size={16} />
                    {isRTL ? "انضم الآن عبر تيليجرام" : "Join Now on Telegram"}
                  </a>
                </>
              ) : (
                <p className="text-sm text-muted-foreground font-light leading-relaxed italic">
                  {isRTL
                    ? "سيتواصل معك المدرب قريباً لمشاركة رابط المجموعة."
                    : "Your instructor will contact you to share the course link."}
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground/50 leading-relaxed">
              {isRTL
                ? "احتفظ بهذا الرابط. يمكنك العودة إليه في أي وقت من نفس هذه الصفحة."
                : "Save this link. You can return to this page anytime using the same URL."}
            </p>
          </motion.div>
        )}

        {/* Error */}
        {state === "error" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <p className="text-lg text-foreground/80 font-light leading-relaxed">
              {isRTL
                ? "حدث خطأ في التحقق من الدفع. إذا أتممت الدفع، يرجى التواصل معنا."
                : "Payment verification failed. If you completed the payment, please contact us."}
            </p>
            <a
              href="/#contact"
              className="inline-block text-primary text-sm hover:underline"
            >
              {isRTL ? "تواصل معنا" : "Contact Us"}
            </a>
          </motion.div>
        )}

        {/* Back to home */}
        <button
          onClick={() => navigate("/")}
          className="mt-8 flex items-center gap-1.5 mx-auto text-xs text-muted-foreground/50 hover:text-primary transition-colors uppercase tracking-widest"
        >
          {isRTL ? <ArrowRight size={12} /> : <ArrowLeft size={12} />}
          {isRTL ? "العودة للرئيسية" : "Back to Home"}
        </button>

        {/* Bottom gold line */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </motion.div>
    </div>
  );
}
