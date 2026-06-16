import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { SocialIconsPulsing } from "@/components/SocialLinks";

export function Contact() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const { t, isRTL } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setTimeout(() => setStatus("success"), 1500);
  };

  return (
    <section id="contact" className="py-24 md:py-32 relative bg-[#0f0a12] border-t border-primary/20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-6 max-w-4xl relative z-10">

        {/* ── Social Icons Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center gap-6 mb-20"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary/70 font-semibold">
            {isRTL ? "تواصلي معنا عبر" : "Connect with us on"}
          </p>

          <SocialIconsPulsing size="lg" showLabel className="justify-center" />

          <div className="w-48 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </motion.div>

        <div className="flex flex-col md:flex-row gap-16">

          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-5/12"
          >
            <h2 className="text-primary uppercase tracking-[0.2em] text-sm font-semibold mb-4">
              {t.contact.label}
            </h2>
            <h3 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
              {t.contact.heading1}{" "}
              <span className="italic text-muted">{t.contact.heading2}</span>
            </h3>
            <p className="text-muted-foreground font-light leading-relaxed mb-10">
              {t.contact.intro}
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-serif text-xl text-primary mb-2">{t.contact.locationTitle}</h4>
                <p className="text-muted-foreground font-light whitespace-pre-line">{t.contact.locationText}</p>
              </div>
              <div>
                <h4 className="font-serif text-xl text-primary mb-2">{t.contact.contactTitle}</h4>
                <p className="text-muted-foreground font-light">
                  concierge@banalhaidari.com
                </p>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-7/12"
          >
            {status === "success" ? (
              <div
                className="h-full flex flex-col items-center justify-center p-12 border border-primary/20 bg-card/50 text-center"
                data-testid="contact-success"
              >
                <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center mb-6 text-primary">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 className="font-serif text-3xl text-foreground mb-4">{t.contact.successTitle}</h4>
                <p className="text-muted-foreground font-light">{t.contact.successText}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">
                      {t.contact.nameLabel}
                    </label>
                    <input
                      id="name"
                      required
                      className="w-full bg-background border-b border-primary/30 py-3 text-foreground focus:outline-none focus:border-primary transition-colors font-light"
                      placeholder={t.contact.namePlaceholder}
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">
                      {t.contact.emailLabel}
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      className="w-full bg-background border-b border-primary/30 py-3 text-foreground focus:outline-none focus:border-primary transition-colors font-light"
                      placeholder={t.contact.emailPlaceholder}
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="service" className="text-xs uppercase tracking-widest text-muted-foreground">
                    {t.contact.serviceLabel}
                  </label>
                  <select
                    id="service"
                    className="w-full bg-background border-b border-primary/30 py-3 text-foreground focus:outline-none focus:border-primary transition-colors font-light appearance-none"
                    data-testid="select-service"
                  >
                    {t.contact.services.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs uppercase tracking-widest text-muted-foreground">
                    {t.contact.messageLabel}
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full bg-background border-b border-primary/30 py-3 text-foreground focus:outline-none focus:border-primary transition-colors font-light resize-none"
                    placeholder={t.contact.messagePlaceholder}
                    data-testid="textarea-message"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-4 bg-primary text-primary-foreground uppercase tracking-widest font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-70 mt-4"
                  data-testid="button-submit-contact"
                >
                  {status === "submitting" ? t.contact.submitting : t.contact.submit}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
