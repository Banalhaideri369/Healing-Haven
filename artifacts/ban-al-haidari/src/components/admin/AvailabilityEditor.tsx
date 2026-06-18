import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { type Availability, type DayKey } from "@/lib/courses";

const DAY_ORDER: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const PRESET_SLOTS = [
  "08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00",
];

interface Props {
  availability: Availability;
  onChange: (updated: Availability) => void;
  disabled?: boolean;
}

export function AvailabilityEditor({ availability, onChange, disabled }: Props) {
  const { t } = useLanguage();
  const a = t.admin;
  const [customSlot, setCustomSlot] = useState<Partial<Record<DayKey, string>>>({});

  const dayLabels: Record<DayKey, string> = {
    sun: a.daySun, mon: a.dayMon, tue: a.dayTue,
    wed: a.dayWed, thu: a.dayThu, fri: a.dayFri, sat: a.daySat,
  };

  const toggleDay = (day: DayKey) => {
    onChange({
      ...availability,
      [day]: { ...availability[day], enabled: !availability[day].enabled },
    });
  };

  const addSlot = (day: DayKey, slot: string) => {
    const trimmed = slot.trim();
    if (!trimmed || availability[day].slots.includes(trimmed)) return;
    onChange({
      ...availability,
      [day]: { ...availability[day], slots: [...availability[day].slots, trimmed].sort() },
    });
    setCustomSlot((prev) => ({ ...prev, [day]: "" }));
  };

  const removeSlot = (day: DayKey, slot: string) => {
    onChange({
      ...availability,
      [day]: { ...availability[day], slots: availability[day].slots.filter((s) => s !== slot) },
    });
  };

  return (
    <div className="space-y-3">
      {DAY_ORDER.map((day) => {
        const { enabled, slots } = availability[day];
        return (
          <div
            key={day}
            className={`border rounded-none transition-colors ${
              enabled ? "border-primary/30 bg-primary/5" : "border-white/5 bg-white/2"
            }`}
          >
            {/* Day header */}
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className={`text-sm font-medium ${enabled ? "text-foreground" : "text-muted-foreground/50"}`}>
                {dayLabels[day]}
              </span>
              <button
                type="button"
                onClick={() => !disabled && toggleDay(day)}
                disabled={disabled}
                className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none ${
                  enabled ? "bg-primary" : "bg-white/10"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  enabled ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </button>
            </div>

            {/* Slots */}
            {enabled && (
              <div className="px-4 pb-3 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {slots.map((slot) => (
                    <span
                      key={slot}
                      className="flex items-center gap-1 px-2.5 py-1 bg-primary/15 border border-primary/30 text-primary text-xs font-mono"
                    >
                      {slot}
                      {!disabled && (
                        <button type="button" onClick={() => removeSlot(day, slot)} className="hover:text-red-400 transition-colors">
                          <X size={10} />
                        </button>
                      )}
                    </span>
                  ))}
                  {slots.length === 0 && (
                    <span className="text-xs text-muted-foreground/50 italic">{a.noSlotsYet}</span>
                  )}
                </div>

                {!disabled && (
                  <div className="flex items-center gap-2 pt-1">
                    <select
                      className="flex-1 bg-black/20 border border-white/10 text-foreground text-xs px-2 py-1.5 focus:outline-none focus:border-primary/50"
                      value=""
                      onChange={(e) => { if (e.target.value) addSlot(day, e.target.value); }}
                    >
                      <option value="">{a.quickAdd}</option>
                      {PRESET_SLOTS.filter((s) => !slots.includes(s)).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={customSlot[day] ?? ""}
                      onChange={(e) => setCustomSlot((prev) => ({ ...prev, [day]: e.target.value }))}
                      className="bg-black/20 border border-white/10 text-foreground text-xs px-2 py-1.5 focus:outline-none focus:border-primary/50 w-28"
                    />
                    <button
                      type="button"
                      onClick={() => customSlot[day] && addSlot(day, customSlot[day]!)}
                      className="p-1.5 bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors"
                    >
                      <Plus size={13} />
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
