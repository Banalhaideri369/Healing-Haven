import { useState } from "react";
import { Plus, X, Clock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { type Availability, type DayKey } from "@/lib/courses";

const DAY_ORDER: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

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

type AddMode = "single" | "range";

interface Props {
  availability: Availability;
  onChange: (updated: Availability) => void;
  disabled?: boolean;
}

export function AvailabilityEditor({ availability, onChange, disabled }: Props) {
  const { t, isRTL } = useLanguage();
  const a = t.admin;

  const [addMode, setAddMode] = useState<Partial<Record<DayKey, AddMode>>>({});
  const [customSingle, setCustomSingle] = useState<Partial<Record<DayKey, string>>>({});
  const [rangeFrom, setRangeFrom] = useState<Partial<Record<DayKey, string>>>({});
  const [rangeTo, setRangeTo] = useState<Partial<Record<DayKey, string>>>({});

  const dayLabels: Record<DayKey, string> = {
    sun: a.daySun, mon: a.dayMon, tue: a.dayTue,
    wed: a.dayWed, thu: a.dayThu, fri: a.dayFri, sat: a.daySat,
  };

  const toggleDay = (day: DayKey) => {
    onChange({ ...availability, [day]: { ...availability[day], enabled: !availability[day].enabled } });
  };

  const addSlot = (day: DayKey, slot: string) => {
    const trimmed = slot.trim();
    if (!trimmed || availability[day].slots.includes(trimmed)) return;
    onChange({ ...availability, [day]: { ...availability[day], slots: [...availability[day].slots, trimmed] } });
  };

  const addSingle = (day: DayKey) => {
    const time = customSingle[day];
    if (!time) return;
    addSlot(day, time);
    setCustomSingle((p) => ({ ...p, [day]: "" }));
  };

  const addRange = (day: DayKey) => {
    const from = rangeFrom[day];
    const to = rangeTo[day];
    if (!from || !to || from >= to) return;
    addSlot(day, `${from}-${to}`);
    setRangeFrom((p) => ({ ...p, [day]: "" }));
    setRangeTo((p) => ({ ...p, [day]: "" }));
  };

  const removeSlot = (day: DayKey, slot: string) => {
    onChange({ ...availability, [day]: { ...availability[day], slots: availability[day].slots.filter((s) => s !== slot) } });
  };

  const getModeForDay = (day: DayKey): AddMode => addMode[day] ?? "single";

  return (
    <div className="space-y-3">
      {DAY_ORDER.map((day) => {
        const { enabled, slots } = availability[day];
        const mode = getModeForDay(day);

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
                <div className="flex flex-wrap gap-1.5">
                  {slots.map((slot) => (
                    <span
                      key={slot}
                      className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-medium ${
                        isTimeRange(slot)
                          ? "bg-secondary/10 border-secondary/30 text-secondary"
                          : "bg-primary/15 border-primary/30 text-primary"
                      }`}
                    >
                      {isTimeRange(slot) ? <ArrowRight size={10} /> : <Clock size={10} />}
                      {formatSlot(slot, isRTL)}
                      {!disabled && (
                        <button type="button" onClick={() => removeSlot(day, slot)} className="hover:text-red-400 transition-colors ms-0.5">
                          <X size={10} />
                        </button>
                      )}
                    </span>
                  ))}
                  {slots.length === 0 && (
                    <span className="text-xs text-muted-foreground/50 italic py-1">{a.noSlotsYet}</span>
                  )}
                </div>

                {/* Add controls */}
                {!disabled && (
                  <div className="space-y-2">

                    {/* Mode toggle */}
                    <div className="flex border border-white/8 rounded-sm overflow-hidden w-fit text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAddMode((p) => ({ ...p, [day]: "single" }))}
                        className={`px-3 py-1.5 uppercase tracking-wider transition-colors border-e border-white/8 flex items-center gap-1 ${
                          mode === "single" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        <Clock size={10} />
                        {isRTL ? "وقت محدد" : "Single"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddMode((p) => ({ ...p, [day]: "range" }))}
                        className={`px-3 py-1.5 uppercase tracking-wider transition-colors flex items-center gap-1 ${
                          mode === "range" ? "bg-secondary/20 text-secondary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        <ArrowRight size={10} />
                        {isRTL ? "نطاق زمني" : "Range"}
                      </button>
                    </div>

                    {/* Single time picker */}
                    {mode === "single" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={customSingle[day] ?? ""}
                          onChange={(e) => setCustomSingle((p) => ({ ...p, [day]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && addSingle(day)}
                          className="bg-black/20 border border-white/10 text-foreground text-sm px-3 py-2 focus:outline-none focus:border-primary/50 w-36"
                        />
                        <button
                          type="button"
                          onClick={() => addSingle(day)}
                          disabled={!customSingle[day]}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary/20 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={13} />
                          {isRTL ? "إضافة" : "Add"}
                        </button>
                      </div>
                    )}

                    {/* Range picker */}
                    {mode === "range" && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{isRTL ? "من" : "From"}</span>
                          <input
                            type="time"
                            value={rangeFrom[day] ?? ""}
                            onChange={(e) => setRangeFrom((p) => ({ ...p, [day]: e.target.value }))}
                            className="flex-1 min-w-0 bg-black/20 border border-white/10 text-foreground text-sm px-2 py-2 focus:outline-none focus:border-secondary/50"
                          />
                        </div>
                        <ArrowRight size={12} className="text-muted-foreground flex-shrink-0" />
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{isRTL ? "إلى" : "To"}</span>
                          <input
                            type="time"
                            value={rangeTo[day] ?? ""}
                            onChange={(e) => setRangeTo((p) => ({ ...p, [day]: e.target.value }))}
                            className="flex-1 min-w-0 bg-black/20 border border-white/10 text-foreground text-sm px-2 py-2 focus:outline-none focus:border-secondary/50"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => addRange(day)}
                          disabled={!rangeFrom[day] || !rangeTo[day] || (rangeFrom[day]! >= rangeTo[day]!)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-secondary/20 border border-secondary/30 text-secondary text-xs font-semibold hover:bg-secondary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={13} />
                          {isRTL ? "إضافة" : "Add"}
                        </button>
                      </div>
                    )}

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
