import { sql } from "drizzle-orm";
import { integer, jsonb, pgSchema, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
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
  // URL pública da categoria: /<slug>/<entry-slug> (docs/venore-docks.md — decisão de rota pública).
  slug: text("slug").notNull().unique(),
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
  (entry) => [
    // URL pública: /<slug> quando categoryId é null, /<categoria-slug>/<slug> quando não é —
    // content type nunca aparece na URL, então a unicidade migra de (contentTypeId, slug) pra
    // (categoryId, slug). NULL != NULL num índice único do Postgres, então este índice sozinho já
    // não colide entre entries sem categoria; o segundo cobre a unicidade isolada desse caso.
    uniqueIndex("entries_category_slug_idx").on(entry.categoryId, entry.slug),
    uniqueIndex("entries_null_category_slug_idx")
      .on(entry.slug)
      .where(sql`${entry.categoryId} is null`),
  ],
);

export const menus = cmsSchema.table("menus", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // ex: "main-nav" — identifica onde o menu é renderizado.
  location: text("location").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const menuItems = cmsSchema.table("menu_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  menuId: text("menu_id")
    .notNull()
    .references(() => menus.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  href: text("href").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
