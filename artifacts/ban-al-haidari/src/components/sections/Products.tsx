import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Calendar, Loader2, Send, Tag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiGetRecordedCourses, apiGetOnlineCourses, type ApiRecordedCourse, type ApiOnlineCourse } from "@/lib/api";
import { finalPrice } from "@/lib/courses";
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
    Promise.all([apiGetRecordedCourses(), apiGetOnlineCourses()])
      .then(([rec, onl]) => {
        setRecordedCourses(rec);
        setOnlineCourses(onl.filter((c) => c.status === "available"));
      })
      .catch(() => {})
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

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary/40" />
          </div>
        )}

        {/* Empty state */}
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
          <div className="space-y-16">
            {recordedCourses.length > 1 && (
              <div className="flex items-center gap-4 mb-4">
                <span className="block h-[1px] flex-1 bg-primary/20" />
                <span className="text-[11px] uppercase tracking-[0.22em] text-primary/60">
                  {isRTL ? "الكورسات المسجلة" : "Recorded Courses"}
                </span>
                <span className="block h-[1px] flex-1 bg-primary/20" />
              </div>
            )}

            <div className={recordedCourses.length === 1 ? "" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"}>
              {recordedCourses.map((course, i) =>
                recordedCourses.length === 1 ? (
                  <FeaturedCourseCard key={course.id} course={course} isRTL={isRTL} t={t} />
                ) : (
                  <motion.div
                    key={course.id}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    custom={i}
                  >
                    <SmallCourseCard course={course} isRTL={isRTL} />
                  </motion.div>
                )
              )}
            </div>
          </div>
        )}

        {/* ── Online Courses ── */}
        {!loading && onlineCourses.length > 0 && (
          <div className={recordedCourses.length > 0 ? "mt-20" : ""}>
            {onlineCourses.length > 0 && (
              <div className="flex items-center gap-4 mb-10">
                <span className="block h-[1px] flex-1 bg-primary/20" />
                <span className="text-[11px] uppercase tracking-[0.22em] text-primary/60">
                  {isRTL ? "الجلسات الفردية" : "One-on-One Sessions"}
                </span>
                <span className="block h-[1px] flex-1 bg-primary/20" />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {onlineCourses.map((course, i) => (
                <motion.div
                  key={course.id}
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

// ─── Featured (single) Recorded Course ───────────────────────────────────────

function FeaturedCourseCard({
  course, isRTL, t,
}: {
  course: ApiRecordedCourse;
  isRTL: boolean;
  t: ReturnType<typeof useLanguage>["t"];
}) {
  const fp = finalPrice(course);
  const hasDiscount = course.discountEnabled && course.discountPercent > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative bg-card border border-primary/20 overflow-hidden shadow-[0_0_80px_rgba(212,175,55,0.07)]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent z-10" />

      {/* Cover image */}
      {course.image ? (
        <div className="relative w-full">
          <div className="absolute top-5 start-5 z-10 px-4 py-1.5 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-[0.18em]">
            {t.products.workshopBadge}
          </div>
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-auto block"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
        </div>
      ) : (
        <div className="w-full h-48 bg-primary/5 flex items-center justify-center border-b border-primary/10">
          <ShoppingBag size={40} className="text-primary/20" />
        </div>
      )}

      {/* Title block */}
      <div className="px-8 md:px-14 pt-10 pb-6 text-center border-b border-primary/10">
        <h3 className="font-serif text-3xl md:text-4xl lg:text-[2.6rem] text-foreground leading-snug mb-4">
          {course.title}
        </h3>
        <div className="flex justify-center mb-6">
          <span className="block w-20 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
        {course.description && (
          <p className="text-muted-foreground text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto">
            {course.description}
          </p>
        )}
      </div>

      {/* Price + CTA */}
      <div className="px-8 md:px-14 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className={isRTL ? "text-right" : "text-left"}>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
            {t.products.workshopPriceLabel}
          </p>
          {hasDiscount && (
            <p className="text-muted-foreground line-through text-sm mb-0.5">${course.price.toFixed(2)}</p>
          )}
          <span className="font-serif text-5xl md:text-6xl text-primary tracking-tight">
            ${fp.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="ms-2 text-xs bg-primary/15 text-primary px-2 py-0.5 border border-primary/20">
              -{course.discountPercent}%
            </span>
          )}
        </div>

        {course.telegramLink ? (
          <a
            href={course.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 px-8 py-4 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all duration-200 min-w-[180px]"
          >
            <Send size={16} />
            {isRTL ? "احصل على الكورس" : "Get Course"}
          </a>
        ) : (
          <div className="flex items-center gap-2.5 px-8 py-4 bg-primary/10 border border-primary/30 text-primary text-sm uppercase tracking-widest min-w-[180px] justify-center">
            <ShoppingBag size={16} />
            {isRTL ? "تواصل معنا" : "Contact Us"}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </motion.div>
  );
}

// ─── Small Recorded Course Card ───────────────────────────────────────────────

function SmallCourseCard({ course, isRTL }: { course: ApiRecordedCourse; isRTL: boolean }) {
  const fp = finalPrice(course);
  const hasDiscount = course.discountEnabled && course.discountPercent > 0;

  return (
    <div className="relative bg-card border border-primary/15 overflow-hidden hover:border-primary/40 transition-colors group h-full flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Image */}
      <div className="aspect-video bg-black/30 overflow-hidden flex-shrink-0">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <Tag size={28} className="text-primary/20" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1" dir={isRTL ? "rtl" : "ltr"}>
        <h4 className="font-serif text-xl text-foreground mb-2 line-clamp-2 leading-snug">{course.title}</h4>
        {course.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 flex-1">
            {course.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-3">
          <div>
            {hasDiscount && (
              <p className="text-xs text-muted-foreground line-through">${course.price.toFixed(2)}</p>
            )}
            <span className="text-primary font-semibold text-2xl">${fp.toFixed(2)}</span>
            {hasDiscount && (
              <span className="ms-1.5 text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 border border-primary/20">
                -{course.discountPercent}%
              </span>
            )}
          </div>
          {course.telegramLink && (
            <a
              href={course.telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest hover:bg-primary/90 transition-colors"
            >
              <Send size={13} />
              {isRTL ? "احصل عليه" : "Get It"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Online Course Card ───────────────────────────────────────────────────────

function OnlineCourseCard({
  course, isRTL, onBook,
}: {
  course: ApiOnlineCourse;
  isRTL: boolean;
  onBook: () => void;
}) {
  return (
    <div className="relative bg-card border border-secondary/20 overflow-hidden hover:border-secondary/40 transition-colors group h-full flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />

      {/* Image */}
      <div className="aspect-video bg-black/30 overflow-hidden flex-shrink-0">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/5">
            <Calendar size={28} className="text-secondary/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1" dir={isRTL ? "rtl" : "ltr"}>
        {/* Badge */}
        <div className="mb-3">
          <span className="text-[10px] uppercase tracking-widest border border-secondary/30 text-secondary/70 px-2.5 py-1">
            {isRTL ? "جلسة فردية" : "1-on-1 Session"}
          </span>
        </div>

        <h4 className="font-serif text-xl text-foreground mb-2 line-clamp-2 leading-snug">{course.title}</h4>
        {course.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 flex-1">
            {course.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5">
              {isRTL ? "سعر الجلسة" : "Per Session"}
            </p>
            <span className="text-secondary font-semibold text-2xl">${course.price.toFixed(2)}</span>
          </div>
          <button
            onClick={onBook}
            className="flex items-center gap-2 px-4 py-2.5 border border-secondary text-secondary text-xs font-semibold uppercase tracking-widest hover:bg-secondary hover:text-white transition-all"
          >
            <Calendar size={13} />
            {isRTL ? "احجز الآن" : "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
