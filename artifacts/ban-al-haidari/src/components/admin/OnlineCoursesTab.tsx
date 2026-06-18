import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, Video } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  subscribeOnlineCourses,
  updateOnlineCourse,
  deleteOnlineCourse,
  type OnlineCourse,
  type Availability,
} from "@/lib/courses";
import { CourseFormModal } from "./CourseFormModal";
import { AvailabilityEditor } from "./AvailabilityEditor";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

export function OnlineCoursesTab() {
  const { t } = useLanguage();
  const a = t.admin;

  const [courses, setCourses] = useState<OnlineCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeOnlineCourses((data) => {
      setCourses(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleStatusToggle = async (course: OnlineCourse) => {
    const next = course.status === "available" ? "unavailable" : "available";
    try {
      await updateOnlineCourse(course.id, { status: next });
      toast.success(a.statusUpdated);
    } catch {
      toast.error(a.statusError);
    }
  };

  const handleAvailabilityChange = useCallback(async (id: string, availability: Availability) => {
    setSavingId(id);
    try {
      await updateOnlineCourse(id, { availability });
    } catch {
      toast.error(a.availabilityError);
    } finally {
      setSavingId(null);
    }
  }, [a]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteOnlineCourse(id);
      toast.success(a.deletedSuccess);
      if (expandedId === id) setExpandedId(null);
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
          <h3 className="text-lg text-foreground font-medium">{a.onlineCourses}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{a.courseCount(courses.length)}</p>
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
          <p className="text-muted-foreground/50 text-sm">{a.noOnlineCourses}</p>
          <button onClick={() => setShowAdd(true)} className="mt-3 text-primary text-sm hover:underline">
            {a.addFirstOnlineCourse}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {courses.map((course, i) => {
          const isExpanded = expandedId === course.id;
          const isAvailable = course.status === "available";

          return (
            <motion.div
              key={course.id}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={i}
              className="bg-card border border-white/8 overflow-hidden"
            >
              <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              <div className="flex items-center gap-4 p-5">
                {/* Thumbnail */}
                <div className="w-20 h-14 flex-shrink-0 bg-black/30 overflow-hidden">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Video size={20} className="text-primary/20" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-base text-foreground truncate">{course.title}</h4>
                  {course.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{course.description}</p>
                  )}
                  <p className="text-xs text-primary/70 font-mono mt-1.5">
                    ${course.price.toFixed(2)} {a.perSession}
                  </p>
                </div>

                {/* Status toggle */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{a.statusLabel}</span>
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(course)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      isAvailable ? "bg-emerald-500/70" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        isAvailable ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className={`text-[10px] font-medium ${isAvailable ? "text-emerald-400" : "text-muted-foreground/50"}`}>
                    {isAvailable ? a.available : a.unavailable}
                  </span>
                </div>

                {/* Expand / delete */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : course.id)}
                    className="flex items-center gap-1 text-xs text-primary/60 hover:text-primary border border-primary/20 px-3 py-1.5 hover:border-primary/40 transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {a.schedule}
                  </button>

                  {confirmDelete === course.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(course.id)}
                        disabled={deletingId === course.id}
                        className="text-[10px] text-red-400 border border-red-400/30 px-2 py-1 hover:bg-red-400/10 transition-colors"
                      >
                        {deletingId === course.id ? <Loader2 size={10} className="animate-spin" /> : a.deleteYes}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-[10px] text-muted-foreground border border-white/10 px-2 py-1"
                      >
                        {a.deleteNo}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(course.id)}
                      className="text-muted-foreground/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Availability panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/8 p-5 bg-black/20">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-xs uppercase tracking-widest text-muted-foreground">
                          {a.availabilitySchedule}
                        </h5>
                        {savingId === course.id && (
                          <span className="flex items-center gap-1 text-xs text-primary/60">
                            <Loader2 size={11} className="animate-spin" /> {a.saving}
                          </span>
                        )}
                      </div>
                      <AvailabilityEditor
                        availability={course.availability}
                        onChange={(updated) => handleAvailabilityChange(course.id, updated)}
                        disabled={!isAvailable}
                      />
                      {!isAvailable && (
                        <p className="mt-3 text-xs text-amber-400/70 italic">{a.enableToEdit}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {showAdd && (
        <CourseFormModal
          mode="online"
          onClose={() => setShowAdd(false)}
          onSaved={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
