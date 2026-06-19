import { useState } from "react";
import { Plus, X, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { type Availability, type DayKey } from "@/lib/courses";

const DAY_ORDER: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function to12h(time: string, isRTL: boolean): string {
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? (isRTL ? "ص" : "AM") : (isRTL ? "م" : "PM");
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

interface Props {
  availability: Availability;
  onChange: (updated: Availability) => void;
  disabled?: boolean;
}

export function AvailabilityEditor({ availability, onChange, disabled }: Props) {
  const { t, isRTL } = useLanguage();
  const a = t.admin;

  const [pending, setPending] = useState<Partial<Record<DayKey, string>>>({});

  const dayLabels: Record<DayKey, string> = {
    sun: a.daySun, mon: a.dayMon, tue: a.dayTue,
    wed: a.dayWed, thu: a.dayThu, fri: a.dayFri, sat: a.daySat,
  };

  const toggleDay = (day: DayKey) => {
    onChange({ ...availability, [day]: { ...availability[day], enabled: !availability[day].enabled } });
  };

  const addSlot = (day: DayKey) => {
    const time = pending[day]?.trim();
    if (!time || availability[day].slots.includes(time)) return;
    onChange({ ...availability, [day]: { ...availability[day], slots: [...availability[day].slots, time] } });
    setPending((p) => ({ ...p, [day]: "" }));
  };

  const removeSlot = (day: DayKey, slot: string) => {
    onChange({ ...availability, [day]: { ...availability[day], slots: availability[day].slots.filter((s) => s !== slot) } });
  };

  return (
    <div className="space-y-3">
      {DAY_ORDER.map((day) => {
        const { enabled, slots } = availability[day];

        return (
          <div
            key={day}
            className={`border transition-colors ${enabled ? "border-primary/30 bg-primary/5" : "border-white/5 bg-white/[0.02]"}`}
          >
            {/* Day toggle row */}
            <div className="flex items-center justify-between px-4 py-3">
              <span className={`text-sm font-medium ${enabled ? "text-foreground" : "text-muted-foreground/50"}`}>
                {dayLabels[day]}
              </span>
              <button
                type="button"
                onClick={() => !disabled && toggleDay(day)}
                disabled={disabled}
                className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-white/10"} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            {/* Slots area */}
            {enabled && (
              <div className="px-4 pb-4 space-y-3">

                {/* Saved slots */}
                {slots.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {slots.map((slot) => (
                      <span
                        key={slot}
                        className="flex items-center gap-1.5 px-3 py-1.5 border bg-primary/15 border-primary/30 text-primary text-xs font-medium"
                      >
                        <Clock size={10} />
                        {to12h(slot, isRTL)}
                        {!disabled && (
                          <button
                            type="button"
                            onClick={() => removeSlot(day, slot)}
                            className="hover:text-red-400 transition-colors ms-0.5"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {slots.length === 0 && (
                  <span className="text-xs text-muted-foreground/50 italic">{a.noSlotsYet}</span>
                )}

                {/* Time picker + add button */}
                {!disabled && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={pending[day] ?? ""}
                      onChange={(e) => setPending((p) => ({ ...p, [day]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && addSlot(day)}
                      className="bg-black/20 border border-white/10 text-foreground text-sm px-3 py-2 focus:outline-none focus:border-primary/50 w-36"
                    />
                    <button
                      type="button"
                      onClick={() => addSlot(day)}
                      disabled={!pending[day]}
                      className="flex items-center gap-1.5 px-3 py-2 bg-primary/20 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={13} />
                      {isRTL ? "إضافة" : "Add"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
