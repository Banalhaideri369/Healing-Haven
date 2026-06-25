import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Calendar, Loader2, Send, Tag, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiGetRecordedCourses, apiGetOnlineCourses, type ApiRecordedCourse, type ApiOnlineCourse } from "@/lib/api";
import { finalPrice } from "@/lib/courses";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

export function Products() {
  const { t, isRTL } = useLanguage();
  const [, navigate] = useLocation();

  const [recordedCourses, setRecordedCourses] = useState<ApiRecordedCourse[]>([]);
  const [onlineCourses, setOnlineCourses] = useState<ApiOnlineCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGetRecordedCourses().catch((err) => {
        console.error("[Products] recorded courses error:", err);
        return [] as ApiRecordedCourse[];
      }),
      apiGetOnlineCourses().catch((err) => {
        console.error("[Products] online courses error:", err);
        return [] as ApiOnlineCourse[];
      }),
    ])
      .then(([rec, onl]) => {
        console.log("[Products] recorded courses:", rec.length, rec);
        console.log("[Products] online courses raw:", onl.length, onl);
        const available = onl.filter((c) => c.status === "available");
        console.log("[Products] online courses after filter:", available.length, available);
        setRecordedCourses(rec);
        setOnlineCourses(available);
      })
      .finally(() => setLoading(false));
  }, []);

  const hasContent = recordedCourses.length > 0 || onlineCourses.length > 0;

  return (
    <section
      id="products"
      className="py-24 md:py-32 relative bg-[#0f0a12] border-y border-primary/10 overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-secondary/8 rounded-full blur-[180px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary uppercase tracking-[0.25em] text-xs font-semibold">
            {t.products.label}
          </span>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary/40" />
          </div>
        )}

        {!loading && !hasContent && (
          <div className="text-center py-20 border border-dashed border-white/8">
            <Tag size={32} className="text-primary/20 mx-auto mb-4" />
            <p className="text-muted-foreground/50 text-sm">
              {isRTL ? "لا توجد كورسات متاحة حالياً" : "No courses available yet"}
            </p>
          </div>
        )}

        {/* ── Recorded Courses ── */}
        {!loading && recordedCourses.length > 0 && (
          <div className="space-y-4">
            {recordedCourses.length > 1 && (
              <div className="flex items-center gap-4 mb-8">
                <span className="block h-[1px] flex-1 bg-primary/20" />
                <span className="text-[11px] uppercase tracking-[0.22em] text-primary/60">
                  {isRTL ? "الكورسات المسجلة" : "Recorded Courses"}
                </span>
                <span className="block h-[1px] flex-1 bg-primary/20" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recordedCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  data-course-id={course.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={i}
                >
                  <RecordedCourseCard course={course} isRTL={isRTL} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Online Courses ── */}
        {!loading && onlineCourses.length > 0 && (
          <div className={recordedCourses.length > 0 ? "mt-20" : ""}>
            <div className="flex items-center gap-4 mb-10">
              <span className="block h-[1px] flex-1 bg-primary/20" />
              <span className="text-[11px] uppercase tracking-[0.22em] text-primary/60">
                {isRTL ? "الجلسات الفردية" : "One-on-One Sessions"}
              </span>
              <span className="block h-[1px] flex-1 bg-primary/20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {onlineCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  data-course-id={course.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={i}
                >
                  <OnlineCourseCard
                    course={course}
                    isRTL={isRTL}
                    onBook={() => navigate(`/booking/${course.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Unified Recorded Course Card ─────────────────────────────────────────────

function RecordedCourseCard({
  course,
  isRTL,
}: {
  course: ApiRecordedCourse;
  isRTL: boolean;
}) {
  const { add, openCart } = useCart();
  const fp = finalPrice(course);
  const hasDiscount = course.discountEnabled && course.discountPercent > 0;

  const handleAddToCart = () => {
    add({
      id: course.id,
      title: course.title,
      price: course.price,
      finalPrice: fp,
      type: "recorded",
      image: course.image,
      telegramLink: course.telegramLink,
    });
    toast.success(isRTL ? "تمت الإضافة إلى السلة 🛒" : "Added to cart 🛒", {
      action: {
        label: isRTL ? "عرض السلة" : "View cart",
        onClick: openCart,
      },
    });
  };

  const handleBuyNow = async () => {
    try {
      const fp = finalPrice(course);
      const res = await fetch(`https://healing-haven.onrender.com/api/checkout/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: course.title,
          price: fp,
          image: course.image ?? "",
          description: course.description ?? "",
        }),
      });
      if (!res.ok) throw new Error("checkout-failed");
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("checkout-failed");
      window.location.href = data.url;
    } catch {
      toast.error(isRTL ? "حدث خطأ، يرجى المحاولة مجدداً." : "Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="relative bg-card border border-primary/15 overflow-hidden hover:border-primary/35 transition-colors group h-full flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      {/* Image */}
      {course.image ? (
        <div className="w-full bg-[#0b0712] flex-shrink-0">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-auto block"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        </div>
      ) : (
        <div className="w-full h-44 bg-primary/5 flex items-center justify-center border-b border-primary/10 flex-shrink-0">
          <ShoppingBag size={32} className="text-primary/20" />
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h4 className="font-serif text-xl text-foreground mb-2 leading-snug">{course.title}</h4>
        {course.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 flex-1">
            {course.description}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto pt-4 border-t border-white/5 mb-4">
          {hasDiscount && (
            <p className="text-xs text-muted-foreground line-through">${course.price.toFixed(2)}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-primary font-semibold text-2xl">${fp.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 border border-primary/20">
                -{course.discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border border-primary/50 text-primary text-xs font-semibold uppercase tracking-widest hover:bg-primary/10 active:scale-95 transition-all duration-200"
          >
            <ShoppingCart size={13} />
            {isRTL ? "أضف للسلة" : "Add to Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all duration-200"
          >
            <Send size={13} />
            {isRTL ? "اشتري الآن" : "Buy Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Online Course Card ───────────────────────────────────────────────────────

function OnlineCourseCard({
  course,
  isRTL,
  onBook,
}: {
  course: ApiOnlineCourse;
  isRTL: boolean;
  onBook: () => void;
}) {
  const { add, openCart } = useCart();

  const handleAddToCart = () => {
    add({
      id: course.id,
      title: course.title,
      price: course.price,
      finalPrice: course.price,
      type: "online",
      image: course.image,
    });
    toast.success(isRTL ? "تمت الإضافة إلى السلة 🛒" : "Added to cart 🛒", {
      action: {
        label: isRTL ? "عرض السلة" : "View cart",
        onClick: openCart,
      },
    });
  };

  return (
    <div className="relative bg-card border border-secondary/20 overflow-hidden hover:border-secondary/40 transition-colors group h-full flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />

      {/* Image */}
      {course.image ? (
        <div className="w-full bg-[#0b0712] flex-shrink-0">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-auto block"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        </div>
      ) : (
        <div className="w-full h-44 bg-secondary/5 flex items-center justify-center border-b border-secondary/10 flex-shrink-0">
          <Calendar size={28} className="text-secondary/30" />
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex flex-col flex-1" dir={isRTL ? "rtl" : "ltr"}>
        <div className="mb-3">
          <span className="text-[10px] uppercase tracking-widest border border-secondary/30 text-secondary/70 px-2.5 py-1">
            {isRTL ? "جلسة فردية" : "1-on-1 Session"}
          </span>
        </div>

        <h4 className="font-serif text-xl text-foreground mb-2 leading-snug">{course.title}</h4>
        {course.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 flex-1">
            {course.description}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto pt-4 border-t border-white/5 mb-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5">
            {isRTL ? "سعر الجلسة" : "Per Session"}
          </p>
          <span className="text-secondary font-semibold text-2xl">${course.price.toFixed(2)}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border border-secondary/40 text-secondary/70 text-xs font-semibold uppercase tracking-widest hover:bg-secondary/10 hover:text-secondary active:scale-95 transition-all duration-200"
          >
            <ShoppingCart size={13} />
            {isRTL ? "أضف للسلة" : "Add to Cart"}
          </button>
          <button
            onClick={onBook}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border border-secondary text-secondary text-xs font-semibold uppercase tracking-widest hover:bg-secondary hover:text-white active:scale-95 transition-all duration-200"
          >
            <Calendar size={13} />
            {isRTL ? "احجز الآن" : "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
