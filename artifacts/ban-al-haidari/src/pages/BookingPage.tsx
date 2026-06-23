import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight,
  User, Mail, Phone, MessageSquare, Loader2, CheckCircle2, Clock,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import PhoneInput from "react-phone-number-input";
import type { Value as PhoneValue } from "react-phone-number-input";
import { apiGetOnlineCourse, apiCreateBooking, type ApiOnlineCourse } from "@/lib/api";
import { type DayKey } from "@/lib/courses";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

// ─── Calendar ────────────────────────────────────────────────────────────────

function CalendarPicker({
  availability,
  selectedDate,
  onSelect,
  isRTL,
}: {
  availability: ApiOnlineCourse["availability"];
  selectedDate: string;
  onSelect: (date: string) => void;
  isRTL: boolean;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const isAvailableDate = (d: Date) => {
    if (d < today) return false;
    const key = DAY_KEYS[d.getDay()];
    return availability[key]?.enabled ?? false;
  };

  const prevMonth = () => {
    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    if (isCurrentMonth) return;
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    const maxDate = new Date(today);
    maxDate.setMonth(today.getMonth() + 3);
    const atMax = viewYear > maxDate.getFullYear() ||
      (viewYear === maxDate.getFullYear() && viewMonth >= maxDate.getMonth());
    if (atMax) return;
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const canGoPrev = !(viewYear === today.getFullYear() && viewMonth === today.getMonth());
  const maxDate = new Date(today);
  maxDate.setMonth(today.getMonth() + 3);
  const canGoNext = !(viewYear > maxDate.getFullYear() ||
    (viewYear === maxDate.getFullYear() && viewMonth >= maxDate.getMonth()));

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const monthLabel = isRTL
    ? new Intl.DateTimeFormat("ar-SA", { month: "long", year: "numeric" }).format(new Date(viewYear, viewMonth))
    : new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(viewYear, viewMonth));

  const dayHeaders = isRTL
    ? ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"]
    : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const cells: Array<{ day: number; date: Date } | null> = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return { day, date: new Date(viewYear, viewMonth, day) };
    }),
  ];

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={isRTL ? nextMonth : prevMonth}
          disabled={isRTL ? !canGoNext : !canGoPrev}
          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <PrevIcon size={16} />
        </button>
        <span className="text-sm font-medium text-foreground">{monthLabel}</span>
        <button
          type="button"
          onClick={isRTL ? prevMonth : nextMonth}
          disabled={isRTL ? !canGoPrev : !canGoNext}
          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <NextIcon size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {dayHeaders.map((h, i) => {
          const dayKey = DAY_KEYS[i];
          const active = availability[dayKey]?.enabled;
          return (
            <div key={h} className={`text-center text-[11px] py-1.5 font-medium ${active ? "text-primary/70" : "text-muted-foreground/30"}`}>
              {h}
            </div>
          );
        })}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, idx) => {
          if (!cell) return <div key={idx} />;
          const available = isAvailableDate(cell.date);
          const isPast = cell.date < today;
          const isSelected = toISO(cell.date) === selectedDate;
          const isToday = toISO(cell.date) === toISO(today);

          return (
            <button
              key={idx}
              type="button"
              disabled={!available}
              onClick={() => onSelect(toISO(cell.date))}
              className={[
                "relative aspect-square flex items-center justify-center text-sm rounded transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground font-bold shadow-[0_0_12px_rgba(212,175,55,0.5)]"
                  : available
                  ? "text-foreground hover:bg-primary/20 hover:text-primary cursor-pointer"
                  : isPast
                  ? "text-muted-foreground/20 cursor-not-allowed"
                  : "text-muted-foreground/25 cursor-not-allowed",
              ].join(" ")}
            >
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/60" />
              )}
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary/80" />
          <span className="text-[10px] text-muted-foreground">{isRTL ? "متاح" : "Available"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <span className="text-[10px] text-muted-foreground">{isRTL ? "غير متاح" : "Unavailable"}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

function to12h(time: string, isRTL: boolean): string {
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? (isRTL ? "ص" : "AM") : (isRTL ? "م" : "PM");
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function isTimeRange(slot: string): boolean {
  const parts = slot.split("-");
  return parts.length === 2 && /^\d{1,2}:\d{2}$/.test(parts[0]) && /^\d{1,2}:\d{2}$/.test(parts[1]);
}

function formatSlot(slot: string, isRTL: boolean): string {
  if (isTimeRange(slot)) {
    const [from, to] = slot.split("-");
    return `${to12h(from, isRTL)} — ${to12h(to, isRTL)}`;
  }
  return to12h(slot, isRTL);
}

// ─── Time Slot Picker ─────────────────────────────────────────────────────────

function TimeSlotPicker({
  slots,
  selected,
  onSelect,
  isRTL,
}: {
  slots: string[];
  selected: string;
  onSelect: (t: string) => void;
  isRTL: boolean;
}) {
  if (!slots.length)
    return (
      <p className="text-xs text-amber-400/70 italic py-2">
        {isRTL ? "لا توجد مواعيد متاحة لهذا اليوم." : "No slots available for this day."}
      </p>
    );
  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot) => {
        const isRange = isTimeRange(slot);
        return (
          <button
            key={slot}
            type="button"
            onClick={() => onSelect(slot)}
            className={`flex items-center gap-1.5 px-3 py-2 border text-xs transition-all ${
              selected === slot
                ? isRange
                  ? "border-secondary bg-secondary/15 text-secondary shadow-[0_0_8px_rgba(120,80,200,0.3)]"
                  : "border-primary bg-primary/15 text-primary shadow-[0_0_8px_rgba(212,175,55,0.3)]"
                : "border-white/10 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <Clock size={11} />
            {formatSlot(slot, isRTL)}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

export default function BookingPage() {
  const { isRTL } = useLanguage();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/booking/:courseId");
  const courseId = params?.courseId ?? "";

  const [course, setCourse] = useState<ApiOnlineCourse | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [step, setStep] = useState<Step>(1);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userWhatsapp, setUserWhatsapp] = useState<PhoneValue>("");
  const [issueDescription, setIssueDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) { setLoadingCourse(false); return; }
    apiGetOnlineCourse(courseId)
      .then((data) => setCourse(data))
      .catch(() => setCourse(null))
      .finally(() => setLoadingCourse(false));
  }, [courseId]);

  const timeSlotsForDate: string[] = (() => {
    if (!selectedDate || !course) return [];
    const dow = new Date(selectedDate + "T00:00:00").getDay();
    return course.availability[DAY_KEYS[dow]]?.slots ?? [];
  })();

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handlePay = async () => {
    setPaying(true);
    setError("");
    try {
      const apiOrigin = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
      const res = await fetch(`${apiOrigin}/api/checkout/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: course?.title ?? "",
          price: course?.price ?? 0,
          image: course?.image ?? "",
          description: course?.description ?? "",
        }),
      });
      if (!res.ok) throw new Error("checkout-failed");
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("checkout-failed");
      const sessionId =
        new URL(data.url).searchParams.get("session_id") ?? data.url;

      await apiCreateBooking({
        courseId, courseTitle: course?.title ?? "",
        courseType: "online",
        userName, userEmail, userWhatsapp, issueDescription,
        selectedDate, selectedTime,
        paymentStatus: "pending",
        paymentSessionId: sessionId,
      });

      fetch(`${apiOrigin}/api/notify/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, userEmail, userWhatsapp, issueDescription, courseName: course?.title ?? "", courseType: "online", selectedDate, selectedTime }),
      }).catch(() => {});

      window.location.href = data.url;
    } catch {
      setError(isRTL ? "حدث خطأ، يرجى المحاولة مجدداً." : "Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  if (loadingCourse)
    return (
      <div className="min-h-screen bg-[#0a060f] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary/50" />
      </div>
    );

  if (!course)
    return (
      <div className="min-h-screen bg-[#0a060f] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{isRTL ? "لم يتم العثور على الجلسة." : "Session not found."}</p>
          <button onClick={() => navigate("/")} className="text-primary text-sm hover:underline">{isRTL ? "العودة للرئيسية" : "Back to Home"}</button>
        </div>
      </div>
    );

  if (course.status === "unavailable")
    return (
      <div className="min-h-screen bg-[#0a060f] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-foreground/80 mb-4">{isRTL ? "هذه الجلسة غير متاحة حالياً." : "This session is currently unavailable."}</p>
          <button onClick={() => navigate("/")} className="text-primary text-sm hover:underline">{isRTL ? "العودة" : "Back"}</button>
        </div>
      </div>
    );

  const steps = [
    { n: 1, label: isRTL ? "معلوماتك" : "Your Info" },
    { n: 2, label: isRTL ? "الموعد" : "Pick Slot" },
    { n: 3, label: isRTL ? "الدفع" : "Payment" },
    { n: 4, label: isRTL ? "تأكيد" : "Done" },
  ];

  return (
    <div className="min-h-screen bg-[#0a060f] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-secondary/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-lg">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-primary transition-colors mb-8 uppercase tracking-widest"
          >
            <BackArrow size={12} />
            {isRTL ? "الرئيسية" : "Home"}
          </button>

          <div className="text-center mb-8">
            <img src="/logo.png" alt="BAH" className="h-14 object-contain mx-auto mb-5 drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]" />
            <h1 className="font-serif text-2xl md:text-3xl text-foreground mb-1">{course.title}</h1>
            <p className="text-muted-foreground text-sm">{isRTL ? "احجز جلستك" : "Book Your Session"}</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {steps.map(({ n, label }, i) => (
              <div key={n} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step > n ? "bg-primary border-primary text-primary-foreground" : step === n ? "border-primary text-primary bg-primary/10" : "border-white/15 text-muted-foreground/30"}`}>
                    {step > n ? "✓" : n}
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest hidden sm:block ${step === n ? "text-primary" : "text-muted-foreground/30"}`}>{label}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-[1px] mx-2 transition-colors ${step > n ? "bg-primary/60" : "bg-white/8"}`} />}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-[#0f0a12] border border-primary/20 relative shadow-[0_0_60px_rgba(212,175,55,0.07)]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

            <AnimatePresence mode="wait">
              {/* Step 1 */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-6 space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-primary/70 mb-5">{isRTL ? "معلوماتك الشخصية" : "Personal Information"}</h3>
                  {[
                    { icon: <User size={13} />, label: isRTL ? "الاسم الكامل" : "Full Name", value: userName, set: setUserName, type: "text" },
                    { icon: <Mail size={13} />, label: isRTL ? "البريد الإلكتروني" : "Email", value: userEmail, set: setUserEmail, type: "email" },
                  ].map(({ icon, label, value, set, type }) => (
                    <div key={label}>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">{icon}{label}</label>
                      <input type={type} value={value} onChange={(e) => set(e.target.value)} className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50" />
                    </div>
                  ))}

                  {/* WhatsApp — smart international phone input */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                      <Phone size={13} />
                      {isRTL ? "رقم واتساب" : "WhatsApp Number"}
                    </label>
                    <div className="bah-phone-wrapper">
                      <PhoneInput
                        international
                        defaultCountry="JO"
                        value={userWhatsapp}
                        onChange={(val) => setUserWhatsapp(val ?? "")}
                        placeholder={isRTL ? "+962 7X XXX XXXX" : "+1 (555) 000-0000"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5"><MessageSquare size={13} />{isRTL ? "وصف حالتك" : "Describe your situation"}</label>
                    <textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} rows={3} placeholder={isRTL ? "أخبرينا عن ما تمر به..." : "Tell us what you're going through..."} className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/30 resize-none" />
                  </div>
                  <button onClick={() => { if (userName && userEmail && userWhatsapp && String(userWhatsapp).length > 5) setStep(2); }} disabled={!userName || !userEmail || !userWhatsapp || String(userWhatsapp).length <= 5} className="w-full py-3 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-40 transition-colors mt-2">
                    {isRTL ? "التالي ←" : "Next →"}
                  </button>
                </motion.div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-6 space-y-6">
                  <h3 className="text-xs uppercase tracking-widest text-primary/70">{isRTL ? "اختر التاريخ والوقت" : "Select Date & Time"}</h3>
                  <CalendarPicker availability={course.availability} selectedDate={selectedDate} onSelect={handleDateSelect} isRTL={isRTL} />
                  <AnimatePresence>
                    {selectedDate && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="border-t border-white/8 pt-5">
                          <p className="text-xs text-muted-foreground mb-3">{isRTL ? `المواعيد المتاحة ليوم ${selectedDate}` : `Available times for ${selectedDate}`}</p>
                          <TimeSlotPicker slots={timeSlotsForDate} selected={selectedTime} onSelect={setSelectedTime} isRTL={isRTL} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 border border-white/10 text-muted-foreground text-sm hover:border-white/20 transition-colors">{isRTL ? "→ السابق" : "← Back"}</button>
                    <button onClick={() => { if (selectedDate && selectedTime) setStep(3); }} disabled={!selectedDate || !selectedTime} className="flex-1 py-3 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-40 transition-colors">{isRTL ? "التالي ←" : "Next →"}</button>
                  </div>
                </motion.div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-6 space-y-5">
                  <h3 className="text-xs uppercase tracking-widest text-primary/70">{isRTL ? "مراجعة وتأكيد الدفع" : "Review & Confirm Payment"}</h3>
                  <div className="bg-black/20 border border-white/8 divide-y divide-white/5">
                    {[
                      [isRTL ? "الجلسة" : "Session", course.title],
                      [isRTL ? "الاسم" : "Name", userName],
                      [isRTL ? "البريد" : "Email", userEmail],
                      [isRTL ? "واتساب" : "WhatsApp", userWhatsapp],
                      [isRTL ? "التاريخ" : "Date", selectedDate],
                      [isRTL ? "الوقت" : "Time", selectedTime],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                        <span className="text-muted-foreground flex-shrink-0">{k}</span>
                        <span className="text-foreground/80 text-end truncate">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-muted-foreground font-medium text-sm">{isRTL ? "الإجمالي" : "Total"}</span>
                      <span className="text-primary font-semibold text-xl">${course.price.toFixed(2)}</span>
                    </div>
                  </div>
                  {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex-1 py-3 border border-white/10 text-muted-foreground text-sm hover:border-white/20 transition-colors">{isRTL ? "→ السابق" : "← Back"}</button>
                    <button onClick={handlePay} disabled={paying} className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-60 transition-colors">
                      {paying && <Loader2 size={14} className="animate-spin" />}
                      {paying ? (isRTL ? "جاري..." : "Processing...") : (isRTL ? "تأكيد الدفع" : "Confirm & Pay")}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="p-8 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-foreground mb-2">{isRTL ? "شكراً على تسجيلك!" : "Thank You!"}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{isRTL ? "شكراً على اشتراكك، سنتواصل معك قريباً." : "Thank you for your subscription, we will contact you shortly."}</p>
                  </div>
                  <div className="bg-primary/5 border border-primary/15 p-4 text-xs text-muted-foreground space-y-1 text-start">
                    <p><span className="text-primary/70">{isRTL ? "الجلسة:" : "Session:"}</span> {course.title}</p>
                    <p><span className="text-primary/70">{isRTL ? "الموعد:" : "Booked:"}</span> {selectedDate} — {selectedTime}</p>
                  </div>
                  <button onClick={() => navigate("/")} className="text-sm text-primary hover:underline">{isRTL ? "العودة للرئيسية" : "Back to Home"}</button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
