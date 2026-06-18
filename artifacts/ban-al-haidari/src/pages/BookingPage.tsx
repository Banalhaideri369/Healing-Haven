import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CalendarDays, Clock,
  User, Mail, Phone, MessageSquare, Loader2, CheckCircle2,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { addBooking } from "@/lib/bookings";
import { type OnlineCourse, type DayKey } from "@/lib/courses";
import { useLanguage } from "@/contexts/LanguageContext";

const DAY_LABELS: Record<DayKey, string> = {
  sun: "Sunday", mon: "Monday", tue: "Tuesday",
  wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday",
};

const DAY_ORDER: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function getNextOccurrences(dayKey: DayKey, weeksAhead = 4): string[] {
  const targetDow = DAY_ORDER.indexOf(dayKey);
  const results: string[] = [];
  const today = new Date();
  for (let i = 1; i <= weeksAhead * 7 && results.length < weeksAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() === targetDow) {
      results.push(d.toISOString().slice(0, 10));
    }
  }
  return results;
}

type Step = 1 | 2 | 3 | 4;

export default function BookingPage() {
  const { isRTL } = useLanguage();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/booking/:courseId");
  const courseId = params?.courseId ?? "";

  const [course, setCourse] = useState<OnlineCourse | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [step, setStep] = useState<Step>(1);

  // Step 1 — personal info
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userWhatsapp, setUserWhatsapp] = useState("");
  const [issueDescription, setIssueDescription] = useState("");

  // Step 2 — slot selection
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Step 3 — payment + save
  const [paying, setPaying] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId || !db) { setLoadingCourse(false); return; }
    getDoc(doc(db, "online_courses", courseId))
      .then((snap) => {
        if (snap.exists()) setCourse({ id: snap.id, ...(snap.data() as Omit<OnlineCourse, "id">) });
      })
      .finally(() => setLoadingCourse(false));
  }, [courseId]);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  /* ── Available date options ── */
  const availableDays =
    course?.availability
      ? DAY_ORDER.filter((d) => course.availability[d]?.enabled)
      : [];

  const dateOptions = availableDays.flatMap((d) =>
    getNextOccurrences(d, 4).map((date) => ({ date, day: d })),
  ).sort((a, b) => a.date.localeCompare(b.date));

  const timeOptions =
    selectedDate && course?.availability
      ? (() => {
          const found = dateOptions.find((o) => o.date === selectedDate);
          return found ? course.availability[found.day]?.slots ?? [] : [];
        })()
      : [];

  /* ── Step 3: checkout ── */
  const handlePay = async () => {
    setPaying(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/session", { method: "POST", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error("checkout-failed");
      const data = (await res.json()) as { url?: string; error?: string };
      if (!data.url) throw new Error("no-url");

      // Extract demo session_id from URL
      const urlObj = new URL(data.url);
      const sessionId = urlObj.searchParams.get("session_id") ?? `demo_${Date.now()}`;

      // Save booking
      const id = await addBooking({
        courseId,
        courseTitle: course?.title ?? "",
        courseType: "online",
        userName, userEmail, userWhatsapp, issueDescription,
        selectedDate, selectedTime,
        paymentStatus: "demo_paid",
        paymentSessionId: sessionId,
      });
      setBookingId(id);

      // Notify backend
      fetch("/api/notify/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName, userEmail, userWhatsapp, issueDescription,
          courseName: course?.title ?? "",
          courseType: "online",
          selectedDate, selectedTime,
        }),
      }).catch(() => {});

      setStep(4);
    } catch {
      setError(isRTL ? "حدث خطأ، يرجى المحاولة مجدداً." : "Something went wrong. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-[#0a060f] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary/50" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0a060f] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{isRTL ? "لم يتم العثور على الجلسة." : "Session not found."}</p>
          <button onClick={() => navigate("/")} className="text-primary text-sm hover:underline">
            {isRTL ? "العودة للرئيسية" : "Back to Home"}
          </button>
        </div>
      </div>
    );
  }

  if (course.status === "unavailable") {
    return (
      <div className="min-h-screen bg-[#0a060f] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-lg text-foreground/80 mb-2">
            {isRTL ? "هذه الجلسة غير متاحة حالياً." : "This session is currently unavailable."}
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            {isRTL ? "يرجى المراجعة لاحقاً أو التواصل معنا." : "Please check back later or contact us."}
          </p>
          <button onClick={() => navigate("/")} className="text-primary text-sm hover:underline">
            {isRTL ? "العودة للرئيسية" : "Back to Home"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Step indicator ───────────────────────────────────────────────────────────
  const steps = [
    { n: 1, label: isRTL ? "معلوماتك" : "Your Info" },
    { n: 2, label: isRTL ? "الموعد" : "Pick Slot" },
    { n: 3, label: isRTL ? "الدفع" : "Payment" },
    { n: 4, label: isRTL ? "تأكيد" : "Done" },
  ];

  return (
    <div className="min-h-screen bg-[#0a060f] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-secondary/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Back */}
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-primary transition-colors mb-8 uppercase tracking-widest">
            <BackArrow size={12} />
            {isRTL ? "الرئيسية" : "Home"}
          </button>

          {/* Logo + title */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="BAH" className="h-14 object-contain mx-auto mb-5 drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]" />
            <h1 className="font-serif text-2xl md:text-3xl text-foreground mb-2">{course.title}</h1>
            <p className="text-muted-foreground text-sm">{isRTL ? "احجز جلستك" : "Book Your Session"}</p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map(({ n, label }) => (
              <div key={n} className={`flex items-center gap-1 ${n < steps.length ? "flex-1" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  step > n ? "bg-primary border-primary text-primary-foreground"
                  : step === n ? "border-primary text-primary"
                  : "border-white/15 text-muted-foreground/40"
                }`}>
                  {step > n ? "✓" : n}
                </div>
                <span className={`text-[10px] uppercase tracking-widest hidden sm:block ${step === n ? "text-primary" : "text-muted-foreground/40"}`}>
                  {label}
                </span>
                {n < steps.length && <div className={`flex-1 h-[1px] mx-1 ${step > n ? "bg-primary/50" : "bg-white/8"}`} />}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-[#0f0a12] border border-primary/20 relative shadow-[0_0_60px_rgba(212,175,55,0.07)]">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

            <AnimatePresence mode="wait">

              {/* ── Step 1: Personal info ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-4">
                  <h3 className="text-sm uppercase tracking-widest text-primary/70 mb-4">{isRTL ? "معلوماتك الشخصية" : "Personal Information"}</h3>

                  {[
                    { icon: <User size={13} />, label: isRTL ? "الاسم الكامل" : "Full Name", value: userName, set: setUserName, type: "text", required: true },
                    { icon: <Mail size={13} />, label: isRTL ? "البريد الإلكتروني" : "Email Address", value: userEmail, set: setUserEmail, type: "email", required: true },
                    { icon: <Phone size={13} />, label: isRTL ? "رقم واتساب" : "WhatsApp Number", value: userWhatsapp, set: setUserWhatsapp, type: "tel", required: true },
                  ].map(({ icon, label, value, set, type, required }) => (
                    <div key={label}>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">{icon}{label}</label>
                      <input
                        type={type}
                        value={value}
                        required={required}
                        onChange={(e) => set(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-2.5 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/30"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                      <MessageSquare size={13} />
                      {isRTL ? "وصف حالتك" : "Describe your situation"}
                    </label>
                    <textarea
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      rows={3}
                      placeholder={isRTL ? "أخبرينا عن ما تمر به..." : "Tell us what you're going through..."}
                      className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-2.5 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/30 resize-none"
                    />
                  </div>

                  <button
                    onClick={() => { if (userName && userEmail && userWhatsapp) setStep(2); }}
                    disabled={!userName || !userEmail || !userWhatsapp}
                    className="w-full py-3 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-colors mt-2"
                  >
                    {isRTL ? "التالي" : "Next"} →
                  </button>
                </motion.div>
              )}

              {/* ── Step 2: Pick slot ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-5">
                  <h3 className="text-sm uppercase tracking-widest text-primary/70">{isRTL ? "اختر الموعد" : "Select Date & Time"}</h3>

                  {/* Date */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <CalendarDays size={13} />
                      {isRTL ? "التاريخ" : "Date"}
                    </label>
                    {dateOptions.length === 0 ? (
                      <p className="text-xs text-amber-400/70 italic">
                        {isRTL ? "لا توجد مواعيد متاحة حالياً." : "No available dates at the moment."}
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {dateOptions.map(({ date, day }) => (
                          <button
                            key={date}
                            type="button"
                            onClick={() => { setSelectedDate(date); setSelectedTime(""); }}
                            className={`text-left px-3 py-2 border text-xs transition-colors ${
                              selectedDate === date
                                ? "border-primary bg-primary/15 text-primary"
                                : "border-white/10 text-muted-foreground hover:border-white/20"
                            }`}
                          >
                            <span className="block font-medium">{date}</span>
                            <span className="text-muted-foreground/50">{DAY_LABELS[day]}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  {selectedDate && (
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <Clock size={13} />
                        {isRTL ? "الوقت" : "Time"}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {timeOptions.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTime(t)}
                            className={`px-4 py-2 border text-xs font-mono transition-colors ${
                              selectedTime === t
                                ? "border-primary bg-primary/15 text-primary"
                                : "border-white/10 text-muted-foreground hover:border-white/20"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                        {timeOptions.length === 0 && (
                          <p className="text-xs text-muted-foreground/50 italic">No slots for this day.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 border border-white/10 text-muted-foreground text-sm hover:border-white/20 transition-colors">
                      ← {isRTL ? "السابق" : "Back"}
                    </button>
                    <button
                      onClick={() => { if (selectedDate && selectedTime) setStep(3); }}
                      disabled={!selectedDate || !selectedTime}
                      className="flex-1 py-3 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {isRTL ? "التالي" : "Next"} →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Payment ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-5">
                  <h3 className="text-sm uppercase tracking-widest text-primary/70">{isRTL ? "مراجعة وتأكيد" : "Review & Pay"}</h3>

                  {/* Summary */}
                  <div className="bg-black/20 border border-white/8 p-4 space-y-2 text-sm">
                    {[
                      [isRTL ? "الجلسة" : "Session", course.title],
                      [isRTL ? "الاسم" : "Name", userName],
                      [isRTL ? "البريد" : "Email", userEmail],
                      [isRTL ? "واتساب" : "WhatsApp", userWhatsapp],
                      [isRTL ? "التاريخ" : "Date", selectedDate],
                      [isRTL ? "الوقت" : "Time", selectedTime],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="text-foreground/80 truncate text-end">{v}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/8 pt-2 flex justify-between">
                      <span className="text-muted-foreground font-medium">{isRTL ? "المبلغ" : "Amount"}</span>
                      <span className="text-primary font-semibold text-lg">${course.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex-1 py-3 border border-white/10 text-muted-foreground text-sm hover:border-white/20 transition-colors">
                      ← {isRTL ? "السابق" : "Back"}
                    </button>
                    <button
                      onClick={handlePay}
                      disabled={paying}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-60 transition-colors"
                    >
                      {paying && <Loader2 size={14} className="animate-spin" />}
                      {paying ? (isRTL ? "جاري..." : "Processing...") : (isRTL ? "تأكيد الدفع" : "Confirm & Pay")}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Confirmation ── */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-foreground mb-2">
                      {isRTL ? "شكراً على تسجيلك!" : "Thank You!"}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {isRTL
                        ? "شكراً على اشتراكك، سنتواصل معك قريباً."
                        : "Thank you for your subscription, we will contact you shortly."}
                    </p>
                  </div>
                  <div className="bg-primary/5 border border-primary/15 p-4 text-xs text-muted-foreground space-y-1 text-start">
                    <p><span className="text-primary/70">{isRTL ? "الجلسة:" : "Session:"}</span> {course.title}</p>
                    <p><span className="text-primary/70">{isRTL ? "الموعد:" : "Booked:"}</span> {selectedDate} {selectedTime}</p>
                  </div>
                  <button onClick={() => navigate("/")} className="text-sm text-primary hover:underline">
                    {isRTL ? "العودة للرئيسية" : "Back to Home"}
                  </button>
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
