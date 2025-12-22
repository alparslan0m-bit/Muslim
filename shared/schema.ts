import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  niyyah: text("niyyah").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  durationSeconds: integer("duration_seconds").notNull(),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    startTime: z.union([z.date(), z.string().pipe(z.coerce.date())]),
    endTime: z.union([z.date(), z.string().pipe(z.coerce.date())]).nullable().optional(),
  });

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
