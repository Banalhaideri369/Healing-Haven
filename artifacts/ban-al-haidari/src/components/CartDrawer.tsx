import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Trash2, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function CartDrawer() {
  const { items, remove, clear, isOpen, closeCart } = useCart();
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, item) => sum + item.finalPrice, 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`https://healing-haven.onrender.com/api/checkout/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            title: item.title,
            price: item.finalPrice,
            image: item.image ?? "",
          })),
        }),
      });
      if (!res.ok) throw new Error("checkout-failed");
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("checkout-failed");
      window.location.href = data.url;
    } catch {
      toast.error(isRTL ? "حدث خطأ في بوابة الدفع، يرجى المحاولة مجدداً." : "Payment gateway error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 35 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-[#0d0912] border-l border-primary/15 flex flex-col shadow-2xl"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={15} className="text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                  {isRTL ? "سلة المشتريات" : "Cart"}
                </h3>
                {items.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingCart size={40} className="text-primary/15" />
                  <p className="text-muted-foreground/50 text-sm">
                    {isRTL ? "سلتك فارغة" : "Your cart is empty"}
                  </p>
                  <p className="text-xs text-muted-foreground/30">
                    {isRTL ? "أضف كورساً من قسم الكورسات" : "Add a course from the courses section"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 bg-white/[0.03] border border-white/8 group"
                    >
                      {item.image ? (
                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-black/40">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 flex-shrink-0 bg-primary/5 flex items-center justify-center border border-primary/10">
                          <ShoppingCart size={16} className="text-primary/30" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground/90 leading-snug line-clamp-2">
                          {item.title}
                        </p>
                        <p className="text-primary font-semibold text-sm mt-1">
                          ${item.finalPrice.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        title={isRTL ? "إزالة من السلة" : "Remove"}
                        className="flex-shrink-0 self-start mt-0.5 w-6 h-6 flex items-center justify-center text-muted-foreground/40 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/8 space-y-4">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent -mt-5 mb-4" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {isRTL ? "الإجمالي" : "Total"}
                  </span>
                  <span className="font-serif text-3xl text-primary">${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => void handleCheckout()}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 transition-all"
                >
                  {loading ? (
                    <><Loader2 size={13} className="animate-spin" />{isRTL ? "جاري التحويل..." : "Redirecting..."}</>
                  ) : (
                    <><CreditCard size={13} />{isRTL ? "إتمام الشراء عبر Stripe" : "Checkout with Stripe"}</>
                  )}
                </button>

                <button
                  onClick={clear}
                  className="w-full text-[11px] text-muted-foreground/25 hover:text-muted-foreground/50 transition-colors"
                >
                  {isRTL ? "إفراغ السلة" : "Clear cart"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function FloatingCartButton() {
  const { items, openCart } = useCart();

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          onClick={openCart}
          className="fixed bottom-8 right-8 z-30 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-[0_0_32px_rgba(201,168,76,0.45)] flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-colors"
        >
          <ShoppingCart size={20} />
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-[#0a0608] text-[10px] font-black flex items-center justify-center shadow">
            {items.length}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
