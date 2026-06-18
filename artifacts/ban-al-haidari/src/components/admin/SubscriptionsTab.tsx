import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, BookOpen, Video, Calendar, Clock, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { subscribeBookings, type Booking } from "@/lib/bookings";

export function SubscriptionsTab() {
  const { t, lang } = useLanguage();
  const a = t.admin;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeBookings(
      (data) => {
        setBookings(data);
        setLoading(false);
        setErrorCode(null);
      },
      (code) => {
        setLoading(false);
        setErrorCode(code);
      },
    );
    return unsub;
  }, []);

  const recorded = bookings.filter((b) => b.courseType === "recorded");
  const online   = bookings.filter((b) => b.courseType === "online");
  const paid     = bookings.filter((b) => b.paymentStatus === "paid" || b.paymentStatus === "demo_paid");

  const formatDate = (b: Booking) => {
    if (b.selectedDate && b.selectedTime) return `${b.selectedDate} — ${b.selectedTime}`;
    if (b.selectedDate) return b.selectedDate;
    if (b.createdAt) {
      try {
        const ts = b.createdAt as unknown as { seconds: number };
        return new Date(ts.seconds * 1000).toLocaleDateString();
      } catch { return "—"; }
    }
    return "—";
  };

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: a.total,    value: bookings.length, icon: <Circle       size={16} className="text-primary/60" /> },
          { label: a.recorded, value: recorded.length, icon: <BookOpen     size={16} className="text-primary/60" /> },
          { label: a.online,   value: online.length,   icon: <Video        size={16} className="text-primary/60" /> },
          { label: a.paid,     value: paid.length,     icon: <CheckCircle2 size={16} className="text-emerald-400/70" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-card border border-white/8 p-4 flex items-center gap-3">
            {icon}
            <div>
              <p className="text-2xl font-serif text-foreground">{loading ? "—" : value}</p>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Firestore permission error */}
      {errorCode && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/8 border border-amber-500/25 mb-6">
          <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-400 font-medium">
              {lang === "ar"
                ? "تعذّر تحميل البيانات — خطأ في صلاحيات Firestore"
                : "Could not load data — Firestore permission error"}
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              {lang === "ar"
                ? `كود الخطأ: ${errorCode}. يرجى نشر قواعد Firestore: firebase deploy --only firestore:rules`
                : `Error code: ${errorCode}. Deploy Firestore rules: firebase deploy --only firestore:rules`}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary/50" />
        </div>
      )}

      {/* Empty */}
      {!loading && !errorCode && bookings.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/8">
          <p className="text-muted-foreground/50 text-sm">{a.noBookings}</p>
          <p className="text-xs text-muted-foreground/30 mt-2">
            {lang === "ar"
              ? "ستظهر هنا بيانات المشتركين بمجرد تسجيل أول حجز."
              : "Subscriber data will appear here once the first booking is registered."}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && bookings.length > 0 && (
        <div className="border border-white/8 overflow-x-auto">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-white/8 bg-black/20">
                {[a.colName, a.colEmail, a.colWhatsapp, a.colCourse, a.colDateTime, a.colStatus].map((h) => (
                  <th
                    key={h}
                    className="text-start px-4 py-3 text-[11px] uppercase tracking-widest text-muted-foreground font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.map((b, i) => (
                <motion.tr
                  key={b.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-primary/3 transition-colors"
                >
                  <td className="px-4 py-3 text-foreground/90 font-medium whitespace-nowrap">
                    {b.userName || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {b.userEmail || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {b.userWhatsapp || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 border font-semibold uppercase tracking-wide ${
                          b.courseType === "online"
                            ? "border-blue-400/30 text-blue-400/80 bg-blue-400/5"
                            : "border-primary/30 text-primary/80 bg-primary/5"
                        }`}
                      >
                        {b.courseType === "online" ? <Video size={9} /> : <BookOpen size={9} />}
                        {b.courseType === "online" ? a.online : a.recorded}
                      </span>
                      <span className="text-foreground/70 text-xs truncate max-w-[130px]">
                        {b.courseTitle}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {b.selectedDate && <Calendar size={11} className="text-primary/40" />}
                      {b.selectedTime && <Clock size={11} className="text-primary/40" />}
                      {formatDate(b)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 border font-semibold uppercase tracking-wide ${
                        b.paymentStatus === "paid" || b.paymentStatus === "demo_paid"
                          ? "border-emerald-400/30 text-emerald-400 bg-emerald-400/5"
                          : "border-amber-400/30 text-amber-400/70 bg-amber-400/5"
                      }`}
                    >
                      {b.paymentStatus === "demo_paid"
                        ? a.demoPaid
                        : b.paymentStatus === "paid"
                        ? a.paid
                        : a.pending}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
