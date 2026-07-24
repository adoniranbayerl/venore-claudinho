import { jsonb, pgSchema, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "@/contexts/auth/database/schema";

export const cmsSchema = pgSchema("cms");

export const contentTypes = cmsSchema.table("content_types", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = cmsSchema.table("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const entries = cmsSchema.table(
  "entries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    contentTypeId: text("content_type_id")
      .notNull()
      .references(() => contentTypes.id, { onDelete: "restrict" }),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    // "draft" | "published" — ver contracts/types.ts.
    status: text("status").notNull().default("draft"),
    // Conteúdo livre por content type — sem fieldsSchema nesta v1 (docs/venore-docks.md — CMS ainda não cobre page-builder).
    data: jsonb("data").notNull().default({}),
    // Sem FK: cross-schema FK entre contexts violaria o isolamento de schema por domínio
    // (docs/venore-docks.md — Schema do Postgres por domínio). Validado na aplicação via
    // contexts/media (regra 10 de composição), não no banco.
    mediaId: text("media_id"),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (entry) => [uniqueIndex("entries_content_type_slug_idx").on(entry.contentTypeId, entry.slug)],
);
