import { useState, useEffect, useRef } from "react";
import { Loader2, Upload, User, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiGetSettings, apiSetSetting } from "@/lib/api";

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
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.80));
      };
      img.onerror = reject;
      img.src = ev.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function WebsiteSettingsTab() {
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [currentImage, setCurrentImage] = useState("/ban-photo.png");
  const [newImage, setNewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiGetSettings()
      .then((settings) => {
        if (settings.profile_image) setCurrentImage(settings.profile_image);
      })
      .finally(() => setLoading(false));
  }, []);

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
      setNewImage(dataUrl);
    } catch {
      toast.error(isRTL ? "فشل في معالجة الصورة" : "Failed to process image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!newImage) return;
    setSaving(true);
    try {
      await apiSetSetting("profile_image", newImage);
      setCurrentImage(newImage);
      setNewImage(null);
      setSaved(true);
      toast.success(isRTL ? "تم حفظ الصورة بنجاح ✓" : "Profile image saved successfully ✓");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error(isRTL ? "فشل في حفظ الصورة" : "Failed to save image");
    } finally {
      setSaving(false);
    }
  };

  const previewSrc = newImage ?? currentImage;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-2xl text-foreground">
          {isRTL ? "إعدادات الموقع" : "Website Settings"}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {isRTL ? "تخصيص محتوى الموقع العام" : "Customize public website content"}
        </p>
      </div>

      <div className="space-y-8 max-w-2xl">

        {/* Profile Image Card */}
        <div className="bg-card border border-white/8 overflow-hidden">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="p-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
              <User size={14} className="text-primary" />
              {isRTL ? "الصورة الشخصية" : "Profile Photo"}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              {isRTL
                ? "هذه الصورة تظهر في قسم «من أنا» في الصفحة الرئيسية"
                : "This image appears in the 'About' section on the main page"}
            </p>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={22} className="animate-spin text-primary/40" />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                {/* Current image preview */}
                <div className="flex-shrink-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    {newImage
                      ? (isRTL ? "معاينة الصورة الجديدة" : "New image preview")
                      : (isRTL ? "الصورة الحالية" : "Current image")}
                  </p>
                  <div className="relative w-36 h-36 border border-primary/20 overflow-hidden rounded-sm bg-black/20">
                    <img
                      src={previewSrc}
                      alt="Profile"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => ((e.target as HTMLImageElement).src = "/ban-photo.png")}
                    />
                    {newImage && (
                      <div className="absolute top-1.5 start-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                    )}
                  </div>
                </div>

                {/* Upload controls */}
                <div className="flex-1 space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full border border-dashed border-white/20 hover:border-primary/50 text-muted-foreground hover:text-primary py-6 flex flex-col items-center gap-2 transition-colors disabled:opacity-60"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={20} className="animate-spin text-primary" />
                        <span className="text-xs">{isRTL ? "جاري المعالجة..." : "Processing..."}</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span className="text-xs font-medium">
                          {isRTL ? "اضغط لاختيار صورة جديدة" : "Click to choose a new photo"}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">
                          {isRTL ? "PNG, JPG – الحد الأقصى 15MB" : "PNG, JPG – Max 15MB"}
                        </span>
                      </>
                    )}
                  </button>

                  {newImage && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 disabled:opacity-60 transition-colors"
                      >
                        {saving ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : saved ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Save size={14} />
                        )}
                        {saving
                          ? (isRTL ? "جاري الحفظ..." : "Saving...")
                          : saved
                          ? (isRTL ? "تم الحفظ" : "Saved!")
                          : (isRTL ? "حفظ الصورة" : "Save Photo")}
                      </button>
                      <button
                        onClick={() => { setNewImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isRTL ? "إلغاء" : "Cancel"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
