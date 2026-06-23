import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Send, Tag, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { finalPrice } from "@/lib/courses";
import {
  apiGetRecordedCourses,
  apiDeleteRecordedCourse,
  type ApiRecordedCourse,
} from "@/lib/api";
import { CourseFormModal } from "./CourseFormModal";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

export function RecordedCoursesTab() {
  const { t } = useLanguage();
  const a = t.admin;

  const [courses, setCourses] = useState<ApiRecordedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ApiRecordedCourse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      const data = await apiGetRecordedCourses();
      setCourses(data);
    } catch {
      // silently keep old data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 30_000);
    return () => clearInterval(t);
  }, [load]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await apiDeleteRecordedCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success(a.deletedSuccess);
    } catch {
      toast.error(a.deleteError);
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg text-foreground font-medium">{a.recordedCourses}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? "..." : a.courseCount(courses.length)}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          {a.addCourse}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary/50" />
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/8">
          <p className="text-muted-foreground/50 text-sm">{a.noCourses}</p>
          <button onClick={() => setShowAdd(true)} className="mt-3 text-primary text-sm hover:underline">
            {a.addFirstCourse}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.map((course, i) => {
          const fp = finalPrice(course);
          const hasDiscount = course.discountEnabled && course.discountPercent > 0;
          return (
            <motion.div
              key={course.id}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={i}
              className="relative bg-card border border-white/8 overflow-hidden group hover:border-primary/25 transition-colors"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              <div className="aspect-video bg-black/30 overflow-hidden">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <Tag size={32} className="text-primary/20" />
                  </div>
                )}
              </div>

              <div className="p-5">
                <h4 className="font-serif text-base text-foreground mb-2 line-clamp-2">{course.title}</h4>
                {course.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                    {course.description}
                  </p>
                )}

                <div className="flex items-baseline gap-2 mb-4">
                  {hasDiscount ? (
                    <>
                      <span className="text-muted-foreground line-through text-sm">
                        ${course.price.toFixed(2)}
                      </span>
                      <span className="text-primary font-semibold text-xl">${fp.toFixed(2)}</span>
                      <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 border border-primary/20">
                        -{course.discountPercent}%
                      </span>
                    </>
                  ) : (
                    <span className="text-primary font-semibold text-xl">${course.price.toFixed(2)}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  {course.telegramLink && (
                    <a
                      href={course.telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors"
                    >
                      <Send size={12} />
                      {a.telegram}
                    </a>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={() => setEditingCourse(course)}
                    title={a.editBtn}
                    className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-primary transition-colors"
                  >
                    <Pencil size={13} />
                    {a.editBtn}
                  </button>
                  {confirmDelete === course.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-400">{a.deleteConfirm}</span>
                      <button
                        onClick={() => handleDelete(course.id)}
                        disabled={deletingId === course.id}
                        className="text-xs text-red-400 border border-red-400/30 px-2 py-1 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                      >
                        {deletingId === course.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          a.deleteYes
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-muted-foreground border border-white/10 px-2 py-1 hover:border-white/20 transition-colors"
                      >
                        {a.deleteNo}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(course.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                      {a.deleteBtn}
                    </button>
                  )}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
            </motion.div>
          );
        })}
      </div>

      {showAdd && (
        <CourseFormModal
          mode="recorded"
          onClose={() => setShowAdd(false)}
          onSaved={() => { void load(); setShowAdd(false); }}
        />
      )}

      {editingCourse && (
        <CourseFormModal
          mode="recorded"
          editId={editingCourse.id}
          initialData={{
            title: editingCourse.title,
            description: editingCourse.description ?? "",
            image: editingCourse.image ?? "",
            telegramLink: editingCourse.telegramLink ?? "",
            price: editingCourse.price,
            discountEnabled: editingCourse.discountEnabled,
            discountPercent: editingCourse.discountPercent,
          }}
          onClose={() => setEditingCourse(null)}
          onSaved={() => { void load(); setEditingCourse(null); }}
        />
      )}
    </div>
  );
}
