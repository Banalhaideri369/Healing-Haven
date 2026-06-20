import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, BookOpen, Video, Calendar, Clock, CheckCircle2, Circle, Download, CreditCard, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiGetBookings, apiUpdateBookingStatus, type ApiBooking } from "@/lib/api";

// ── CSV helpers ────────────────────────────────────────────────────────────────
function csvCell(value: string | null | undefined): string {
  const s = (value ?? "").toString();
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadCSV(bookings: ApiBooking[], isRTL: boolean) {
  const headers = isRTL
    ? ["الاسم", "البريد الإلكتروني", "واتساب", "الكورس", "نوع الكورس", "التاريخ", "الوقت", "وصف المشكلة", "حالة الدفع", "تاريخ الحجز"]
    : ["Name", "Email", "WhatsApp", "Course", "Course Type", "Date", "Time", "Issue Description", "Payment Status", "Booked At"];

  const rows = bookings.map((b) => [
    csvCell(b.userName),
    csvCell(b.userEmail),
    csvCell(b.userWhatsapp),
    csvCell(b.courseTitle),
    csvCell(b.courseType),
    csvCell(b.selectedDate),
    csvCell(b.selectedTime),
    csvCell(b.issueDescription),
    csvCell(b.paymentStatus),
    csvCell(b.createdAt ? new Date(b.createdAt).toLocaleString() : ""),
  ].join(","));

  const bom = "\uFEFF";
  const csv = bom + [headers.map(csvCell).join(","), ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Component ──────────────────────────────────────────────────────────────────
export function SubscriptionsTab() {
  const { t, isRTL } = useLanguage();
  const a = t.admin;

  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmStatusId, setConfirmStatusId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiGetBookings();
      setBookings(data);
    } catch {
      // admin token may not be ready yet, keep current state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 30_000);
    return () => clearInterval(timer);
  }, [load]);

  const handleStatusToggle = async (b: ApiBooking) => {
    const next = b.paymentStatus === "pending" ? "paid" : "pending";
    setUpdatingId(b.id);
    setConfirmStatusId(null);
    try {
      const updated = await apiUpdateBookingStatus(b.id, next);
      setBookings((prev) => prev.map((x) => (x.id === b.id ? updated : x)));
      toast.success(
        next === "paid"
          ? (isRTL ? "تم تأكيد الدفع ✓" : "Marked as paid ✓")
          : (isRTL ? "أُعيد إلى قيد الانتظار" : "Reverted to pending")
      );
    } catch {
      toast.error(isRTL ? "فشل التحديث" : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const recorded = bookings.filter((b) => b.courseType === "recorded");
  const online   = bookings.filter((b) => b.courseType === "online");
  const paid     = bookings.filter((b) => b.paymentStatus === "paid" || b.paymentStatus === "demo_paid");

  const formatDateTime = (b: ApiBooking) => {
    if (b.selectedDate && b.selectedTime) return `${b.selectedDate} — ${b.selectedTime}`;
    if (b.selectedDate) return b.selectedDate;
    try { return new Date(b.createdAt).toLocaleDateString(); } catch { return "—"; }
  };

  return (
    <div>
      {/* Header row: title + export button */}
      <div className="flex items-center justify-between mb-8">
        <div />
        {bookings.length > 0 && (
          <button
            onClick={() => downloadCSV(bookings, isRTL)}
            className="flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-widest hover:bg-primary/10 transition-colors"
          >
            <Download size={13} />
            {isRTL ? `تصدير CSV (${bookings.length})` : `Export CSV (${bookings.length})`}
          </button>
        )}
      </div>

      {/* Stats */}
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

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary/50" />
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/8">
          <p className="text-muted-foreground/50 text-sm">{a.noBookings}</p>
          <p className="text-xs text-muted-foreground/30 mt-2">
            ستظهر هنا بيانات المشتركين بمجرد تسجيل أول حجز.
          </p>
        </div>
      )}

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
                      {formatDateTime(b)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {/* Status badge */}
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

                      {/* Spinner while saving */}
                      {updatingId === b.id && (
                        <Loader2 size={12} className="animate-spin text-primary/60 flex-shrink-0" />
                      )}

                      {/* Inline confirm: pending → paid */}
                      {updatingId !== b.id && b.paymentStatus === "pending" && (
                        confirmStatusId === b.id ? (
                          <span className="inline-flex items-center gap-1">
                            <button
                              onClick={() => void handleStatusToggle(b)}
                              className="text-[10px] px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 transition-colors font-semibold uppercase tracking-wider"
                            >
                              {isRTL ? "تأكيد" : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmStatusId(null)}
                              className="text-[10px] px-2 py-0.5 border border-white/10 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                            >
                              {isRTL ? "إلغاء" : "Cancel"}
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmStatusId(b.id)}
                            title={isRTL ? "تأكيد الدفع" : "Mark as paid"}
                            className="flex items-center gap-1 text-[10px] px-2 py-0.5 border border-emerald-400/20 text-emerald-400/50 hover:border-emerald-400/50 hover:text-emerald-400 transition-colors uppercase tracking-wider"
                          >
                            <CreditCard size={9} />
                            {isRTL ? "تأكيد دفع" : "Mark paid"}
                          </button>
                        )
                      )}

                      {/* Inline confirm: paid → pending (revert) */}
                      {updatingId !== b.id && (b.paymentStatus === "paid" || b.paymentStatus === "demo_paid") && (
                        confirmStatusId === b.id ? (
                          <span className="inline-flex items-center gap-1">
                            <button
                              onClick={() => void handleStatusToggle(b)}
                              className="text-[10px] px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400/80 hover:bg-red-500/20 transition-colors font-semibold uppercase tracking-wider"
                            >
                              {isRTL ? "تأكيد" : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmStatusId(null)}
                              className="text-[10px] px-2 py-0.5 border border-white/10 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                            >
                              {isRTL ? "إلغاء" : "Cancel"}
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmStatusId(b.id)}
                            title={isRTL ? "إعادة إلى قيد الانتظار" : "Revert to pending"}
                            className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 text-muted-foreground/25 hover:text-muted-foreground/60 transition-colors"
                          >
                            <RotateCcw size={9} />
                          </button>
                        )
                      )}
                    </div>
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
