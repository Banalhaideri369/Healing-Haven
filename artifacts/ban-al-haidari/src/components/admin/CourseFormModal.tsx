import { useState } from "react";
import { X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { DEFAULT_AVAILABILITY } from "@/lib/courses";
import { apiCreateRecordedCourse, apiCreateOnlineCourse } from "@/lib/api";

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
        await apiCreateRecordedCourse({
          title: title.trim(), description: description.trim(),
          image: image.trim(), telegramLink: telegramLink.trim(),
          price, discountEnabled, discountPercent,
        });
        toast.success(a.saveSuccessRecorded);
      } else {
        await apiCreateOnlineCourse({
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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — bottom-sheet on mobile, centered on sm+ */}
      <div className="relative w-full sm:w-[560px] sm:mx-4 bg-[#0f0a12] border-t sm:border border-primary/30 shadow-[0_-8px_60px_rgba(212,175,55,0.12)] sm:shadow-[0_0_80px_rgba(212,175,55,0.1)] rounded-t-2xl sm:rounded-none flex flex-col max-h-[92dvh] sm:max-h-[88vh]">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/80 to-transparent rounded-t-2xl sm:rounded-none" />

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-white/8 flex-shrink-0">
          <h3 className="font-serif text-lg sm:text-xl text-foreground">
            {mode === "recorded" ? a.addRecordedTitle : a.addOnlineTitle}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 space-y-4">
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
              className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40 rounded-sm"
            />
            {image ? (
              <div className="mt-2 w-20 h-14 border border-white/10 overflow-hidden rounded-sm">
                <img
                  src={image}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              </div>
            ) : (
              <div className="mt-2 w-20 h-14 border border-white/8 flex items-center justify-center bg-white/3 rounded-sm">
                <ImageIcon size={16} className="text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {a.fieldTitle}{" "}
              <span className="text-red-400 normal-case text-[10px]">({a.fieldRequired})</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 rounded-sm"
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
              className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40 resize-none rounded-sm"
            />
          </div>

          {/* Recorded-only fields */}
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
                  className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40 rounded-sm"
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
                  className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 rounded-sm"
                />
              </div>

              <div className="border border-white/8 p-4 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{a.fieldDiscount}</span>
                  <button
                    type="button"
                    onClick={() => setDiscountEnabled(!discountEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      discountEnabled ? "bg-primary" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        discountEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {discountEnabled && (
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex-1">
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        {a.fieldDiscountPercent}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
                        className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-3 py-2.5 focus:outline-none focus:border-primary/50 rounded-sm"
                      />
                    </div>
                    <div className="text-center pt-5">
                      <p className="text-xs text-muted-foreground line-through">${price.toFixed(2)}</p>
                      <p className="text-primary font-semibold text-xl">${computedFinalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Online-only fields */}
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
                className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 rounded-sm"
              />
              <p className="text-xs text-muted-foreground/50 mt-1.5">{a.availabilityNote}</p>
            </div>
          )}

          <div className="h-2" />
        </form>

        {/* Sticky footer */}
        <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-white/8 flex-shrink-0 bg-[#0f0a12]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-muted-foreground border border-white/10 hover:border-white/25 hover:text-foreground transition-colors rounded-sm"
          >
            {a.cancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 disabled:opacity-60 transition-colors rounded-sm"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? a.savingBtn : a.save}
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </div>
  );
}
