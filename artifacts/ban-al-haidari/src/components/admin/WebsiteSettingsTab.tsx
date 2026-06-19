import { useState, useEffect, useRef } from "react";
import {
  Loader2, Upload, User, Save, CheckCircle2,
  Megaphone, Plus, Trash2, ToggleLeft, ToggleRight, Pencil, X,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  apiGetSettings, apiSetSetting,
  apiGetBanners, apiCreateBanner, apiUpdateBanner, apiDeleteBanner,
  type ApiBanner,
} from "@/lib/api";

// ── Image compression ─────────────────────────────────────────────────────────
function compressImage(file: File, maxPx = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round((height * maxPx) / width); width = maxPx; }
          else { width = Math.round((width * maxPx) / height); height = maxPx; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = ev.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Empty banner form ─────────────────────────────────────────────────────────
const EMPTY_FORM = { image: "", title: "", status: "coming_soon" as "available" | "coming_soon" };

export function WebsiteSettingsTab() {
  const { isRTL } = useLanguage();

  // ── Profile image state ───────────────────────────────────────────────────
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState("/ban-photo.png");
  const [newImage, setNewImage] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // ── Banner state ──────────────────────────────────────────────────────────
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerToggling, setBannerToggling] = useState(false);
  const [banners, setBanners] = useState<ApiBanner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // ── Load everything ───────────────────────────────────────────────────────
  useEffect(() => {
    apiGetSettings()
      .then((s) => {
        if (s.profile_image) setCurrentImage(s.profile_image);
        setBannerEnabled(s.banner_enabled === "true");
      })
      .finally(() => setSettingsLoading(false));

    apiGetBanners()
      .then(setBanners)
      .finally(() => setBannersLoading(false));
  }, []);

  // ── Profile image handlers ────────────────────────────────────────────────
  const handleProfileFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast.error(isRTL ? "حجم الصورة كبير جداً" : "Image too large (max 15MB)"); return; }
    setUploading(true);
    try { setNewImage(await compressImage(file)); }
    catch { toast.error(isRTL ? "فشل في معالجة الصورة" : "Failed to process image"); }
    finally { setUploading(false); }
  };

  const handleProfileSave = async () => {
    if (!newImage) return;
    setProfileSaving(true);
    try {
      await apiSetSetting("profile_image", newImage);
      setCurrentImage(newImage);
      setNewImage(null);
      setProfileSaved(true);
      toast.success(isRTL ? "تم حفظ الصورة ✓" : "Profile photo saved ✓");
      setTimeout(() => setProfileSaved(false), 3000);
    } catch { toast.error(isRTL ? "فشل في الحفظ" : "Save failed"); }
    finally { setProfileSaving(false); }
  };

  // ── Banner toggle ─────────────────────────────────────────────────────────
  const handleBannerToggle = async () => {
    const next = !bannerEnabled;
    setBannerEnabled(next);
    setBannerToggling(true);
    try {
      await apiSetSetting("banner_enabled", next ? "true" : "false");
      toast.success(next
        ? (isRTL ? "تم تفعيل البانر ✓" : "Banner enabled ✓")
        : (isRTL ? "تم إيقاف البانر" : "Banner disabled"));
    } catch {
      setBannerEnabled(!next);
      toast.error(isRTL ? "فشل التحديث" : "Update failed");
    } finally { setBannerToggling(false); }
  };

  // ── Banner image upload ───────────────────────────────────────────────────
  const handleBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast.error(isRTL ? "حجم الصورة كبير جداً" : "Image too large"); return; }
    setBannerUploading(true);
    try { setForm((f) => ({ ...f, image: "" })); const img = await compressImage(file, 1400); setForm((f) => ({ ...f, image: img })); }
    catch { toast.error(isRTL ? "فشل في رفع الصورة" : "Upload failed"); }
    finally { setBannerUploading(false); if (bannerInputRef.current) bannerInputRef.current.value = ""; }
  };

  // ── Save / update banner ──────────────────────────────────────────────────
  const handleBannerSave = async () => {
    if (!form.title.trim()) { toast.error(isRTL ? "العنوان مطلوب" : "Title is required"); return; }
    setFormSaving(true);
    try {
      if (editingId) {
        const updated = await apiUpdateBanner(editingId, form);
        setBanners((prev) => prev.map((b) => (b.id === editingId ? updated : b)));
        toast.success(isRTL ? "تم تحديث البانر ✓" : "Banner updated ✓");
        setEditingId(null);
      } else {
        const created = await apiCreateBanner({ ...form, sortOrder: banners.length });
        setBanners((prev) => [...prev, created]);
        toast.success(isRTL ? "تم إضافة البانر ✓" : "Banner added ✓");
      }
      setForm(EMPTY_FORM);
    } catch { toast.error(isRTL ? "فشل الحفظ" : "Save failed"); }
    finally { setFormSaving(false); }
  };

  const startEdit = (b: ApiBanner) => {
    setEditingId(b.id);
    setForm({ image: b.image, title: b.title, status: b.status as "available" | "coming_soon" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { setEditingId(null); setForm(EMPTY_FORM); };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await apiDeleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success(isRTL ? "تم الحذف" : "Deleted");
    } catch { toast.error(isRTL ? "فشل الحذف" : "Delete failed"); }
    finally { setDeletingId(null); setConfirmDelete(null); }
  };

  const previewSrc = newImage ?? currentImage;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-2xl text-foreground">{isRTL ? "إعدادات الموقع" : "Website Settings"}</h2>
        <p className="text-xs text-muted-foreground mt-1">{isRTL ? "تخصيص محتوى الموقع العام" : "Customize public website content"}</p>
      </div>

      <div className="space-y-8 max-w-3xl">

        {/* ═══ Profile Image ═══ */}
        <SettingCard icon={<User size={14} className="text-primary" />} title={isRTL ? "الصورة الشخصية" : "Profile Photo"} subtitle={isRTL ? "تظهر في قسم «من أنا» في الصفحة الرئيسية" : "Appears in the 'About' section on the homepage"}>
          {settingsLoading ? (
            <div className="flex items-center justify-center h-32"><Loader2 size={22} className="animate-spin text-primary/40" /></div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  {newImage ? (isRTL ? "معاينة" : "Preview") : (isRTL ? "الحالية" : "Current")}
                </p>
                <div className="relative w-32 h-32 border border-primary/20 overflow-hidden bg-black/20">
                  <img src={previewSrc} alt="Profile" className="w-full h-full object-cover object-top"
                    onError={(e) => ((e.target as HTMLImageElement).src = "/ban-photo.png")} />
                  {newImage && <div className="absolute top-1.5 start-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(212,175,55,0.8)]" />}
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileFile} />
                <button type="button" onClick={() => profileInputRef.current?.click()} disabled={uploading}
                  className="w-full border border-dashed border-white/20 hover:border-primary/50 text-muted-foreground hover:text-primary py-5 flex flex-col items-center gap-2 transition-colors disabled:opacity-60">
                  {uploading ? <><Loader2 size={18} className="animate-spin text-primary" /><span className="text-xs">{isRTL ? "جاري المعالجة..." : "Processing..."}</span></>
                    : <><Upload size={18} /><span className="text-xs">{isRTL ? "اضغط لاختيار صورة" : "Click to choose photo"}</span><span className="text-[10px] text-muted-foreground/40">PNG, JPG – Max 15MB</span></>}
                </button>
                {newImage && (
                  <div className="flex items-center gap-3">
                    <button onClick={handleProfileSave} disabled={profileSaving}
                      className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 disabled:opacity-60 transition-colors">
                      {profileSaving ? <Loader2 size={13} className="animate-spin" /> : profileSaved ? <CheckCircle2 size={13} /> : <Save size={13} />}
                      {profileSaving ? (isRTL ? "جاري الحفظ..." : "Saving...") : profileSaved ? (isRTL ? "تم!" : "Saved!") : (isRTL ? "حفظ الصورة" : "Save Photo")}
                    </button>
                    <button onClick={() => { setNewImage(null); if (profileInputRef.current) profileInputRef.current.value = ""; }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors">{isRTL ? "إلغاء" : "Cancel"}</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </SettingCard>

        {/* ═══ Hero Banner Management ═══ */}
        <SettingCard icon={<Megaphone size={14} className="text-primary" />} title={isRTL ? "البانر الإعلاني" : "Hero Banner / Ad Box"} subtitle={isRTL ? "يظهر في أعلى الصفحة الرئيسية تحت القسم الرئيسي" : "Appears at the top of the homepage below the hero section"}>

          {/* Global toggle */}
          <div className="flex items-center justify-between p-4 bg-black/20 border border-white/8 mb-5">
            <div>
              <p className="text-sm font-medium text-foreground">{isRTL ? "إظهار البانر على الموقع" : "Show Banner on Website"}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{isRTL ? "تشغيل/إيقاف ظهور البانر للزوار" : "Toggle banner visibility for visitors"}</p>
            </div>
            <button type="button" onClick={handleBannerToggle} disabled={bannerToggling}
              className="flex items-center gap-2 transition-colors disabled:opacity-60">
              {bannerToggling ? <Loader2 size={18} className="animate-spin text-primary" />
                : bannerEnabled ? <ToggleRight size={30} className="text-primary" /> : <ToggleLeft size={30} className="text-muted-foreground/40" />}
              <span className={`text-xs font-semibold uppercase tracking-widest ${bannerEnabled ? "text-primary" : "text-muted-foreground/40"}`}>
                {bannerEnabled ? (isRTL ? "مفعّل" : "ON") : (isRTL ? "متوقف" : "OFF")}
              </span>
            </button>
          </div>

          {/* Add / Edit banner form */}
          <div className="border border-white/8 p-4 mb-5 space-y-4 bg-black/10">
            <p className="text-[11px] uppercase tracking-widest text-primary/70 font-semibold">
              {editingId ? (isRTL ? "تعديل البانر" : "Edit Banner") : (isRTL ? "إضافة بانر جديد" : "Add New Banner")}
            </p>

            {/* Banner image upload */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">{isRTL ? "صورة البانر" : "Banner Image"}</label>
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerFile} />

              {form.image ? (
                <div className="relative w-full h-32 border border-primary/20 overflow-hidden group mb-2">
                  <img src={form.image} alt="banner preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, image: "" }))}
                    className="absolute top-2 end-2 w-7 h-7 bg-black/70 flex items-center justify-center text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => bannerInputRef.current?.click()} disabled={bannerUploading}
                  className="w-full h-24 border border-dashed border-white/15 hover:border-primary/40 text-muted-foreground hover:text-primary flex flex-col items-center justify-center gap-1.5 transition-colors disabled:opacity-60 mb-2">
                  {bannerUploading ? <><Loader2 size={16} className="animate-spin text-primary" /><span className="text-xs">{isRTL ? "جاري الرفع..." : "Uploading..."}</span></>
                    : <><Upload size={16} /><span className="text-xs">{isRTL ? "اضغط لرفع صورة البانر" : "Click to upload banner image"}</span></>}
                </button>
              )}
              {form.image && (
                <button type="button" onClick={() => bannerInputRef.current?.click()} disabled={bannerUploading}
                  className="text-[11px] text-primary/60 hover:text-primary transition-colors">
                  {isRTL ? "تغيير الصورة" : "Change image"}
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                {isRTL ? "عنوان الكورس / الإعلان" : "Course / Announcement Title"} <span className="text-red-400">*</span>
              </label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={isRTL ? "مثال: ورشة البيع والوفرة" : "e.g. Sales & Abundance Workshop"}
                className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-2.5 focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40" />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">{isRTL ? "الحالة" : "Status"}</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "available" | "coming_soon" }))}
                className="w-full bg-black/20 border border-white/10 text-foreground text-sm px-4 py-2.5 focus:outline-none focus:border-primary/50">
                <option value="coming_soon">{isRTL ? "قريباً" : "Coming Soon"}</option>
                <option value="available">{isRTL ? "متاح الآن" : "Available Now"}</option>
              </select>
              {form.status === "available" && (
                <p className="text-[10px] text-primary/60 mt-1">{isRTL ? "سيتم توجيه الزائر تلقائياً لقسم الكورسات عند الضغط" : "Clicking will automatically scroll to the courses section"}</p>
              )}
            </div>

            {/* Form actions */}
            <div className="flex items-center gap-3 pt-1">
              <button onClick={handleBannerSave} disabled={formSaving || !form.title.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {formSaving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                {formSaving ? (isRTL ? "جاري الحفظ..." : "Saving...") : editingId ? (isRTL ? "تحديث البانر" : "Update Banner") : (isRTL ? "إضافة البانر" : "Add Banner")}
              </button>
              {editingId && (
                <button onClick={cancelEdit} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{isRTL ? "إلغاء" : "Cancel"}</button>
              )}
            </div>
          </div>

          {/* Banners list */}
          {bannersLoading ? (
            <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-primary/40" /></div>
          ) : banners.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-white/8">
              <p className="text-xs text-muted-foreground/40">{isRTL ? "لا توجد بانرات بعد. أضف واحداً أعلاه." : "No banners yet. Add one above."}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">{isRTL ? "البانرات الحالية" : "Current Banners"} ({banners.length})</p>
              {banners.map((b) => (
                <div key={b.id} className={`flex items-center gap-3 p-3 border transition-colors ${editingId === b.id ? "border-primary/40 bg-primary/5" : "border-white/8 bg-black/10"}`}>
                  {/* Thumbnail */}
                  <div className="w-20 h-12 flex-shrink-0 bg-black/30 overflow-hidden border border-white/8">
                    {b.image ? <img src={b.image} alt={b.title} className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                      : <div className="w-full h-full flex items-center justify-center bg-primary/5"><Megaphone size={14} className="text-primary/20" /></div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">{b.title}</p>
                    <span className={`text-[10px] font-semibold uppercase tracking-widest ${b.status === "available" ? "text-emerald-400" : "text-primary/60"}`}>
                      {b.status === "available" ? (isRTL ? "متاح" : "Available") : (isRTL ? "قريباً" : "Coming Soon")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(b)} title={isRTL ? "تعديل" : "Edit"}
                      className="w-7 h-7 flex items-center justify-center border border-white/15 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                      <Pencil size={11} />
                    </button>
                    {confirmDelete === b.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(b.id)} disabled={deletingId === b.id}
                          className="text-[10px] text-red-400 border border-red-400/30 px-2 py-1 hover:bg-red-400/10 transition-colors">
                          {deletingId === b.id ? <Loader2 size={9} className="animate-spin" /> : (isRTL ? "نعم" : "Yes")}
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-muted-foreground border border-white/10 px-2 py-1">
                          {isRTL ? "لا" : "No"}
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(b.id)} title={isRTL ? "حذف" : "Delete"}
                        className="w-7 h-7 flex items-center justify-center border border-white/15 text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-colors">
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SettingCard>

      </div>
    </div>
  );
}

// ── Helper card wrapper ───────────────────────────────────────────────────────
function SettingCard({ icon, title, subtitle, children }: {
  icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-white/8 overflow-hidden">
      <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="p-6">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
          {icon}{title}
        </h3>
        <p className="text-xs text-muted-foreground mb-6">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
