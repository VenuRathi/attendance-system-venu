import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const attendanceTable = pgTable("attendance", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  uid: text("uid").notNull(),
  status: text("status").notNull().default("present"),
  lectureNumber: integer("lecture_number").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAttendanceSchema = createInsertSchema(attendanceTable).omit({
  id: true,
  timestamp: true,
});
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendanceTable.$inferSelect;

export const lectureStateTable = pgTable("lecture_state", {
  id: serial("id").primaryKey(),
  lectureNumber: integer("lecture_number"),
  isActive: text("is_active").notNull().default("false"),
  startedAt: timestamp("started_at", { withTimezone: true }),
});

export type LectureState = typeof lectureStateTable.$inferSelect;
