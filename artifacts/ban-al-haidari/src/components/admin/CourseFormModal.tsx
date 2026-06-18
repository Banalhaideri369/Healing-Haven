import { useState } from "react";
import { X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  addRecordedCourse,
  addOnlineCourse,
  DEFAULT_AVAILABILITY,
} from "@/lib/courses";

type Mode = "recorded" | "online";

interface Props {
  mode: Mode;
  onClose: () => void;
  onSaved: () => void;
}

export function CourseFormModal({ mode, onClose, onSaved }: Props) {
  const { t, isRTL } = useLanguage();
  const a = t.admin;

  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [sessionPrice, setSessionPrice] = useState<number>(0);

  const computedFinalPrice =
    discountEnabled && discountPercent > 0
      ? Math.round(price * (1 - discountPercent / 100) * 100) / 100
      : price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error(a.titleRequired); return; }
    setSaving(true);
    try {
      if (mode === "recorded") {
        await addRecordedCourse({
          title: title.trim(), description: description.trim(),
          image: image.trim(), telegramLink: telegramLink.trim(),
          price, discountEnabled, discountPercent,
        });
        toast.success(a.saveSuccessRecorded);
      } else {
        await addOnlineCourse({
          title: title.trim(), description: description.trim(),
          image: image.trim(), price: sessionPrice,
          status: "available", availability: DEFAULT_AVAILABILITY,
        });
        toast.success(a.saveSuccessOnline);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(a.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#0f0a12] border border-primary/25 shadow-[0_0_80px_rgba(212,175,55,0.1)] overflow-y-auto max-h-[90vh]">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/80 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <h3 className="font-serif text-xl text-foreground">
            {mode === "recorded" ? a.addRecordedTitle : a.addOnlineTitle}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Image URL */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {a.fieldImage}
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40"
            />
            {image ? (
              <div className="mt-2 w-24 h-16 border border-white/10 overflow-hidden">
                <img
                  src={image}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              </div>
            ) : (
              <div className="mt-2 w-24 h-16 border border-white/8 flex items-center justify-center bg-white/3">
                <ImageIcon size={18} className="text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {a.fieldTitle} <span className="text-red-400 normal-case text-[10px]">({a.fieldRequired})</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {a.fieldDescription}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={a.fieldDescPlaceholder}
              className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40 resize-none"
            />
          </div>

          {/* ── Recorded-only fields ── */}
          {mode === "recorded" && (
            <>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {a.fieldTelegramLink}
                </label>
                <input
                  type="url"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                  placeholder="https://t.me/..."
                  className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {a.fieldPrice}
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Discount toggle */}
              <div className="border border-white/8 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{a.fieldDiscount}</span>
                  <button
                    type="button"
                    onClick={() => setDiscountEnabled(!discountEnabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      discountEnabled ? "bg-primary" : "bg-white/10"
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      discountEnabled ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>

                {discountEnabled && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1">
                      <label className="block text-xs text-muted-foreground mb-1">{a.fieldDiscountPercent}</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
                        className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-3 py-2 focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div className="text-center pt-4">
                      <p className="text-xs text-muted-foreground line-through">${price.toFixed(2)}</p>
                      <p className="text-primary font-semibold text-lg">${computedFinalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Online-only fields ── */}
          {mode === "online" && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                {a.fieldSessionPrice}
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={sessionPrice}
                onChange={(e) => setSessionPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground/50 mt-1">{a.availabilityNote}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-muted-foreground border border-white/10 hover:border-white/20 hover:text-foreground transition-colors"
            >
              {a.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? a.savingBtn : a.save}
            </button>
          </div>
        </form>

        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </div>
  );
}
