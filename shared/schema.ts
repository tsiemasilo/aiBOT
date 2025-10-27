import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  caption: text("caption").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
}).extend({
  scheduledDate: z.coerce.date(),
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export const scheduleSettings = pgTable("schedule_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  selectedDays: text("selected_days").array().notNull().default(sql`ARRAY[]::text[]`),
  postsPerDay: integer("posts_per_day").notNull().default(3),
  timeSlots: jsonb("time_slots").notNull().default(sql`'[]'::jsonb`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertScheduleSettingsSchema = createInsertSchema(scheduleSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertScheduleSettings = z.infer<typeof insertScheduleSettingsSchema>;
export type ScheduleSettings = typeof scheduleSettings.$inferSelect;

export const automationSettings = pgTable("automation_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enabled: boolean("enabled").notNull().default(false),
  profileUrl: text("profile_url"),
  analyzedData: jsonb("analyzed_data"),
  lastAnalyzedAt: timestamp("last_analyzed_at"),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertAutomationSettingsSchema = createInsertSchema(automationSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertAutomationSettings = z.infer<typeof insertAutomationSettingsSchema>;
export type AutomationSettings = typeof automationSettings.$inferSelect;

export const connectedAccounts = pgTable("connected_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull().default("instagram"),
  username: text("username").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  profileUrl: text("profile_url"),
  profileImageUrl: text("profile_image_url"),
  isActive: boolean("is_active").notNull().default(true),
  connectedAt: timestamp("connected_at").notNull().default(sql`now()`),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const insertConnectedAccountSchema = createInsertSchema(connectedAccounts).omit({
  id: true,
  connectedAt: true,
});

export type InsertConnectedAccount = z.infer<typeof insertConnectedAccountSchema>;
export type ConnectedAccount = typeof connectedAccounts.$inferSelect;
