import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Upload, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { DEFAULT_AVAILABILITY } from "@/lib/courses";
import { apiCreateRecordedCourse, apiCreateOnlineCourse } from "@/lib/api";

type Mode = "recorded" | "online";
type ImgMode = "upload" | "url";

interface Props {
  mode: Mode;
  onClose: () => void;
  onSaved: () => void;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = reject;
      img.src = ev.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CourseFormModal({ mode, onClose, onSaved }: Props) {
  const { t, isRTL } = useLanguage();
  const a = t.admin;

  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imgMode, setImgMode] = useState<ImgMode>("upload");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [telegramLink, setTelegramLink] = useState("");
  const [price, setPrice] = useState<string>("");
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<string>("10");
  const [sessionPrice, setSessionPrice] = useState<string>("");

  const parsedPrice = parseFloat(price) || 0;
  const parsedDiscount = parseFloat(discountPercent) || 0;
  const parsedSessionPrice = parseFloat(sessionPrice) || 0;

  const computedFinalPrice =
    discountEnabled && parsedDiscount > 0
      ? Math.round(parsedPrice * (1 - parsedDiscount / 100) * 100) / 100
      : parsedPrice;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error(isRTL ? "حجم الصورة كبير جداً (الحد الأقصى 15MB)" : "Image too large (max 15MB)");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      setImage(dataUrl);
    } catch {
      toast.error(isRTL ? "فشل في تحميل الصورة" : "Failed to load image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) { toast.error(a.titleRequired); return; }
    setSaving(true);
    try {
      if (mode === "recorded") {
        await apiCreateRecordedCourse({
          title: title.trim(), description: description.trim(),
          image: image.trim(), telegramLink: telegramLink.trim(),
          price: parsedPrice, discountEnabled, discountPercent: parsedDiscount,
        });
        toast.success(a.saveSuccessRecorded);
      } else {
        await apiCreateOnlineCourse({
          title: title.trim(), description: description.trim(),
          image: image.trim(), price: parsedSessionPrice,
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

  // Use createPortal so the modal renders directly in document.body,
  // bypassing any Framer Motion transform context that breaks position:fixed on mobile
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Backdrop */}
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          position: "relative",
          width: "min(500px, calc(100vw - 2rem))",
          maxHeight: "min(90dvh, 700px)",
          display: "flex",
          flexDirection: "column",
          background: "#0f0a12",
          border: "1px solid rgba(212,175,55,0.3)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 0 80px rgba(212,175,55,0.12)",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(to right, transparent, rgba(212,175,55,0.8), transparent)" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
          <h3 style={{ fontFamily: "serif", fontSize: "1.1rem", color: "var(--foreground)", margin: 0 }}>
            {mode === "recorded" ? a.addRecordedTitle : a.addOnlineTitle}
          </h3>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: "var(--muted-foreground)", cursor: "pointer", borderRadius: "50%" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable form */}
        <form
          onSubmit={handleSubmit}
          style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {/* Image */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{a.fieldImage}</label>

            {/* Toggle */}
            <div className="flex mb-3 border border-white/10 rounded-sm overflow-hidden">
              {(["upload", "url"] as ImgMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setImgMode(m)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs uppercase tracking-widest transition-colors ${
                    imgMode === m ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  } ${m === "upload" ? "border-e border-white/8" : ""}`}
                >
                  {m === "upload" ? <Upload size={12} /> : <Link2 size={12} />}
                  {m === "upload" ? (isRTL ? "رفع من الجهاز" : "Upload File") : (isRTL ? "رابط URL" : "Image URL")}
                </button>
              ))}
            </div>

            {imgMode === "upload" ? (
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full border border-dashed border-white/20 hover:border-primary/50 text-muted-foreground hover:text-primary py-5 flex flex-col items-center gap-2 transition-colors rounded-sm disabled:opacity-60"
                >
                  {uploading ? (
                    <><Loader2 size={20} className="animate-spin text-primary" /><span className="text-xs">{isRTL ? "جاري المعالجة..." : "Processing..."}</span></>
                  ) : image && image.startsWith("data:") ? (
                    <><img src={image} alt="preview" className="h-16 object-cover rounded" /><span className="text-xs text-primary">{isRTL ? "انقر لتغيير الصورة" : "Click to change"}</span></>
                  ) : (
                    <><Upload size={20} /><span className="text-xs">{isRTL ? "اضغط لاختيار صورة من جهازك" : "Tap to select an image"}</span></>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={image.startsWith("data:") ? "" : image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40 rounded-sm"
                />
                {image && !image.startsWith("data:") && (
                  <div className="mt-2 w-20 h-14 border border-white/10 overflow-hidden rounded-sm">
                    <img src={image} alt="preview" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {a.fieldTitle} <span className="text-red-400 normal-case text-[10px]">({a.fieldRequired})</span>
            </label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 rounded-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{a.fieldDescription}</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder={a.fieldDescPlaceholder}
              className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40 resize-none rounded-sm"
            />
          </div>

          {/* Recorded-only */}
          {mode === "recorded" && (
            <>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{a.fieldTelegramLink}</label>
                <input
                  type="url" value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)} placeholder="https://t.me/..."
                  className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40 rounded-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{a.fieldPrice}</label>
                <input
                  type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00"
                  className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40 rounded-sm"
                />
              </div>
              <div className="border border-white/8 p-4 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{a.fieldDiscount}</span>
                  <button
                    type="button" onClick={() => setDiscountEnabled(!discountEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${discountEnabled ? "bg-primary" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${discountEnabled ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
                {discountEnabled && (
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex-1">
                      <label className="block text-xs text-muted-foreground mb-1.5">{a.fieldDiscountPercent}</label>
                      <input
                        type="number" min={1} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="10"
                        className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-3 py-2.5 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40 rounded-sm"
                      />
                    </div>
                    <div className="text-center pt-5">
                      <p className="text-xs text-muted-foreground line-through">${parsedPrice.toFixed(2)}</p>
                      <p className="text-primary font-semibold text-xl">${computedFinalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Online-only */}
          {mode === "online" && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">{a.fieldSessionPrice}</label>
              <input
                type="number" min={0} step={0.01} value={sessionPrice} onChange={(e) => setSessionPrice(e.target.value)} placeholder="0.00"
                className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-3 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40 rounded-sm"
              />
              <p className="text-xs text-muted-foreground/50 mt-1.5">{a.availabilityNote}</p>
            </div>
          )}

          <div style={{ height: 4 }} />
        </form>

        {/* Sticky footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, background: "#0f0a12" }}>
          <button
            type="button" onClick={onClose}
            className="px-5 py-2.5 text-sm text-muted-foreground border border-white/10 hover:border-white/25 hover:text-foreground transition-colors rounded-sm"
          >
            {a.cancel}
          </button>
          <button
            type="button" onClick={() => void handleSubmit()} disabled={saving || uploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 disabled:opacity-60 transition-colors rounded-sm"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? a.savingBtn : a.save}
          </button>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(to right, transparent, rgba(212,175,55,0.3), transparent)" }} />
      </div>
    </div>,
    document.body
  );
}
