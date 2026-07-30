import { index, integer, pgSchema, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
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
  // "private" (só dono e quem tem media.manage) ou "public" (biblioteca, visível a qualquer
  // ator autenticado). Default "private" de propósito — nenhum upload nasce público por
  // omissão (docs/media/visibility.md, decisão de correção do vazamento de avatar).
  visibility: text("visibility").notNull().default("private"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Tabela nova do fluxo de client-upload direto ao Blob (docs/media/blob-spec.md, seção 3).
// Convive com `files` (fluxo server-buffered legado) de propósito — a migração de dados de
// `files` para `assets` é decisão de implementação futura, fora desta sessão (spec, seção 0.1).
export const assets = mediaSchema.table(
  "assets",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pathname: text("pathname").notNull(),
    url: text("url").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    width: integer("width"),
    height: integer("height"),
    alt: text("alt"),
    checksum: text("checksum").notNull(),
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => users.id),
    // Mesma semântica de `files.visibility` acima — mantida para as duas tabelas convivendo.
    visibility: text("visibility").notNull().default("private"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("media_assets_pathname_idx").on(table.pathname),
    index("media_assets_checksum_idx").on(table.checksum),
    index("media_assets_uploaded_by_idx").on(table.uploadedBy),
    index("media_assets_deleted_at_idx").on(table.deletedAt),
  ],
);
