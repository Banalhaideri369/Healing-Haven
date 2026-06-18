import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Zap, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Products() {
  const { t, isRTL } = useLanguage();
  const [inCart, setInCart] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const handleAddToCart = () => {
    setInCart(true);
  };

  const handleBuyNow = async () => {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("checkout-failed");
      const data = await response.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? "no-url");
      }
    } catch {
      setCheckoutError(isRTL ? "حدث خطأ، يرجى المحاولة مجدداً" : "Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <section
      id="products"
      className="py-24 md:py-32 relative bg-[#0f0a12] border-y border-primary/10 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary uppercase tracking-[0.2em] text-sm font-semibold mb-4"
          >
            {t.products.label}
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground"
          >
            {t.products.heading1}{" "}
            <span className="italic text-muted">{t.products.heading2}</span>
          </motion.h3>
        </div>

        {/* Workshop Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative bg-card border border-primary/20 overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.06)]"
        >
          {/* Top gold line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent z-10" />

          {/* Cover Image */}
          <div className="relative overflow-hidden" style={{ aspectRatio: "16/7" }}>
            <img
              src="/workshop-cover.jpg"
              alt={t.products.workshopTitle}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />

            {/* Badge */}
            <div className="absolute top-5 start-5 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest z-10">
              {t.products.workshopBadge}
            </div>

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
              <h4 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-3 drop-shadow-lg">
                {t.products.workshopTitle}
              </h4>
              <p className="text-primary/90 text-sm md:text-base font-light italic max-w-2xl leading-relaxed">
                ✨ {t.products.workshopTagline}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 md:p-12" dir={isRTL ? "rtl" : "ltr"}>
            {/* Problem questions */}
            <div className="mb-10 space-y-3 max-w-2xl">
              {t.products.workshopProblems.map((q, i) => (
                <p
                  key={i}
                  className="text-muted-foreground font-light leading-relaxed flex items-start gap-3"
                >
                  <span className="text-primary/60 mt-1 flex-shrink-0 text-xs">◆</span>
                  {q}
                </p>
              ))}
              <p className="text-foreground/70 font-light leading-relaxed mt-4 pt-4 border-t border-primary/10">
                {t.products.workshopIntro}
              </p>
            </div>

            {/* 3-column content grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {/* What you'll discover */}
              <div>
                <h5 className="text-primary uppercase tracking-widest text-[11px] font-semibold mb-5 flex items-center gap-2">
                  <span className="w-5 h-[1px] bg-primary inline-block" />
                  {t.products.workshopDiscoverTitle}
                </h5>
                <ul className="space-y-3">
                  {t.products.workshopDiscover.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground font-light leading-relaxed"
                    >
                      <span className="flex-shrink-0 mt-0.5">💎</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What's included */}
              <div>
                <h5 className="text-primary uppercase tracking-widest text-[11px] font-semibold mb-5 flex items-center gap-2">
                  <span className="w-5 h-[1px] bg-primary inline-block" />
                  {t.products.workshopIncludesTitle}
                </h5>
                <ul className="space-y-3">
                  {t.products.workshopIncludes.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground font-light leading-relaxed"
                    >
                      <span className="flex-shrink-0 mt-0.5">✨</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Who it's for */}
              <div>
                <h5 className="text-primary uppercase tracking-widest text-[11px] font-semibold mb-5 flex items-center gap-2">
                  <span className="w-5 h-[1px] bg-primary inline-block" />
                  {t.products.workshopForTitle}
                </h5>
                <ul className="space-y-3">
                  {t.products.workshopFor.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground font-light leading-relaxed"
                    >
                      <span className="flex-shrink-0 mt-0.5">🌷</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Benefits bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 mb-10 border-y border-primary/10">
              {t.products.workshopBenefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check size={13} className="text-primary flex-shrink-0" />
                  {b}
                </div>
              ))}
            </div>

            {/* Closing quote */}
            <blockquote className="text-center mb-10 px-4 md:px-16">
              <p className="font-serif text-base md:text-lg text-primary/80 italic leading-relaxed">
                💜 {t.products.workshopQuote}
              </p>
            </blockquote>

            {/* Price + Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-primary/20">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
                  {t.products.workshopPriceLabel}
                </p>
                <span className="font-serif text-5xl md:text-6xl text-primary tracking-tight">
                  $150
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {checkoutError && (
                  <p className="text-red-400 text-xs text-center sm:col-span-2">
                    {checkoutError}
                  </p>
                )}
                <button
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center gap-2 px-8 py-4 border font-semibold text-sm uppercase tracking-widest transition-all duration-300 min-w-[180px] ${
                    inCart
                      ? "border-primary bg-primary/10 text-primary cursor-default"
                      : "border-primary/40 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary/5"
                  }`}
                  data-testid="button-add-cart"
                >
                  <ShoppingCart size={16} />
                  {inCart ? t.products.workshopInCart : t.products.workshopAddToCart}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={checkoutLoading}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all duration-200 disabled:opacity-60 min-w-[180px]"
                  data-testid="button-buy-now"
                >
                  <Zap size={16} />
                  {checkoutLoading ? t.products.workshopProcessing : t.products.workshopBuyNow}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom gold line */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
