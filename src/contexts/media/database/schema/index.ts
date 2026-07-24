import { integer, pgSchema, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "@/contexts/auth/database/schema";

export const mediaSchema = pgSchema("media");

export const files = mediaSchema.table("files", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  filename: text("filename").notNull(),
  storageKey: text("storage_key").notNull().unique(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
