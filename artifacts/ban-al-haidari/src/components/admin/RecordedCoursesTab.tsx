import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Send, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  subscribeRecordedCourses,
  deleteRecordedCourse,
  finalPrice,
  type RecordedCourse,
} from "@/lib/courses";
import { CourseFormModal } from "./CourseFormModal";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

export function RecordedCoursesTab() {
  const [courses, setCourses] = useState<RecordedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeRecordedCourses((data) => {
      setCourses(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteRecordedCourse(id);
      toast.success("Course deleted");
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg text-foreground font-medium">Recorded Courses</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          Add Course
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary/50" />
        </div>
      )}

      {/* Empty state */}
      {!loading && courses.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/8">
          <p className="text-muted-foreground/50 text-sm">No recorded courses yet.</p>
          <button onClick={() => setShowAdd(true)} className="mt-3 text-primary text-sm hover:underline">
            Add your first course →
          </button>
        </div>
      )}

      {/* Course grid */}
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
              {/* Gold top line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              {/* Course image */}
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

              {/* Content */}
              <div className="p-5">
                <h4 className="font-serif text-base text-foreground mb-2 line-clamp-2">{course.title}</h4>
                {course.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                    {course.description}
                  </p>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  {hasDiscount ? (
                    <>
                      <span className="text-muted-foreground line-through text-sm">${course.price.toFixed(2)}</span>
                      <span className="text-primary font-semibold text-xl">${fp.toFixed(2)}</span>
                      <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 border border-primary/20">
                        -{course.discountPercent}%
                      </span>
                    </>
                  ) : (
                    <span className="text-primary font-semibold text-xl">${course.price.toFixed(2)}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  {course.telegramLink && (
                    <a
                      href={course.telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary transition-colors"
                    >
                      <Send size={12} />
                      Telegram
                    </a>
                  )}
                  <div className="flex-1" />

                  {confirmDelete === course.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-400">Delete?</span>
                      <button
                        onClick={() => handleDelete(course.id)}
                        disabled={deletingId === course.id}
                        className="text-xs text-red-400 border border-red-400/30 px-2 py-1 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                      >
                        {deletingId === course.id ? <Loader2 size={11} className="animate-spin" /> : "Yes"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-muted-foreground border border-white/10 px-2 py-1 hover:border-white/20 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(course.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom line */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
            </motion.div>
          );
        })}
      </div>

      {/* Add modal */}
      {showAdd && (
        <CourseFormModal
          mode="recorded"
          onClose={() => setShowAdd(false)}
          onSaved={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
