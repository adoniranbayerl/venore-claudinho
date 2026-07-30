import { index, integer, pgSchema, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "@/contexts/auth/database/schema";

export const mediaSchema = pgSchema("media");

// Categoria é classificação organizacional de um asset (uma por asset, não tag — ver
// contracts/types.ts MediaCategory), não a classificação técnica de mimeType (MediaAssetCategory,
// que já existia). Vive no mesmo schema `media` que `files`: FK real entre elas é seguro porque
// as duas são donas do mesmo domínio (diferente de mediaId em cms.entries/academy.courses, que
// cruza schema e por isso não tem FK — ver comentários lá).
export const categories = mediaSchema.table("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

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
  // Nullable: nem todo asset precisa de categoria. Um asset tem no máximo UMA categoria — decisão
  // de produto (não N:N): categoria aqui é classificação organizacional ("que tipo de conteúdo é
  // isto"), não tag descritiva, então valor único mantém o filtro (biblioteca/seletor) e a regra
  // "categoria em uso não apaga sem tratar os assets" simples (contagem direta por categoryId, sem
  // ambiguidade de "apaga o vínculo ou some com o asset"). onDelete "restrict": mesma regra
  // reforçada no banco, não só na aplicação — apagar uma categoria com arquivos vinculados falha
  // mesmo se algum caminho novo esquecer de checar antes.
  categoryId: text("category_id").references(() => categories.id, { onDelete: "restrict" }),
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
