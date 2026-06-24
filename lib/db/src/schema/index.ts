import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Recorded Courses ─────────────────────────────────────────────────────────

export const recordedCoursesTable = pgTable("recorded_courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
  telegramLink: text("telegram_link").notNull().default(""),
  price: doublePrecision("price").notNull().default(0),
  discountEnabled: boolean("discount_enabled").notNull().default(false),
  discountPercent: integer("discount_percent").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type RecordedCourseRow = typeof recordedCoursesTable.$inferSelect;

// ─── Online Courses ───────────────────────────────────────────────────────────

export const onlineCoursesTable = pgTable("online_courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
  telegramLink: text("telegram_link").notNull().default(""),
  price: doublePrecision("price").notNull().default(0),
  status: text("status").notNull().default("available"),
  availability: jsonb("availability").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OnlineCourseRow = typeof onlineCoursesTable.$inferSelect;

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookingsTable = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: text("course_id").notNull(),
  courseTitle: text("course_title").notNull(),
  courseType: text("course_type").notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  userWhatsapp: text("user_whatsapp").notNull(),
  issueDescription: text("issue_description").notNull().default(""),
  selectedDate: text("selected_date"),
  selectedTime: text("selected_time"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentSessionId: text("payment_session_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BookingRow = typeof bookingsTable.$inferSelect;

// ─── Hero Banners ─────────────────────────────────────────────────────────────

export const heroBannersTable = pgTable("hero_banners", {
  id: uuid("id").defaultRandom().primaryKey(),
  image: text("image").notNull().default(""),
  title: text("title").notNull().default(""),
  status: text("status").notNull().default("coming_soon"), // "available" | "coming_soon"
  linkedCourseId: text("linked_course_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type HeroBannerRow = typeof heroBannersTable.$inferSelect;

// ─── Push Subscriptions ───────────────────────────────────────────────────────

export const pushSubscriptionsTable = pgTable("push_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PushSubscriptionRow = typeof pushSubscriptionsTable.$inferSelect;

// ─── Client Testimonials ──────────────────────────────────────────────────────

export const clientTestimonialsTable = pgTable("client_testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientName: text("client_name").notNull().default(""),
  content: text("content").notNull(),
  rating: integer("rating").notNull().default(5),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ClientTestimonialRow = typeof clientTestimonialsTable.$inferSelect;

// ─── Site Settings ────────────────────────────────────────────────────────────

export const siteSettingsTable = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SiteSettingRow = typeof siteSettingsTable.$inferSelect;

// ─── User Profiles ────────────────────────────────────────────────────────────

export const userProfilesTable = pgTable("user_profiles", {
  uid: text("uid").primaryKey(),
  email: text("email").notNull().default(""),
  displayName: text("display_name").notNull().default(""),
  bio: text("bio").notNull().default(""),
  intention: text("intention").notNull().default(""),
  phone: text("phone").notNull().default(""),
  recentActivity: jsonb("recent_activity").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserProfileRow = typeof userProfilesTable.$inferSelect;
