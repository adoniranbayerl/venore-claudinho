ALTER TABLE "media"."assets" ADD COLUMN "filename" text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE "media"."assets" ADD COLUMN "category_id" text;--> statement-breakpoint
ALTER TABLE "media"."assets" ADD CONSTRAINT "assets_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "media"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media"."assets" ADD CONSTRAINT "media_assets_visibility_valid" CHECK ("media"."assets"."visibility" IN ('public', 'restricted', 'private'));--> statement-breakpoint
-- Backfill manual (não gerado pelo drizzle-kit): descontinuar `files` (Fase 4/M1-M3 —
-- docs/implementation-roadmap.md) não deveria apagar upload existente sem tentar preservar —
-- migra cada linha pra `assets` antes da tabela antiga sumir. `checksum` não existe em `files`
-- (calculado só a partir do conteúdo real do arquivo, que este script não tem em mãos) — usa um
-- placeholder derivado do id antigo só pra satisfazer a coluna NOT NULL; não participa de
-- deduplicação real até o arquivo ser reenviado.
INSERT INTO "media"."assets" ("id", "filename", "pathname", "url", "content_type", "size", "checksum", "uploaded_by", "visibility", "created_at", "updated_at")
SELECT gen_random_uuid(), "filename", "storage_key", "url", "mime_type", "size", 'legacy-' || "id", "uploaded_by", "visibility", "created_at", "created_at"
FROM "media"."files";--> statement-breakpoint
-- Reconcilia `auth.users.avatar_media_id` que apontava pra uma linha de `files` com o novo id em
-- `assets` (mesmo pathname == storage_key, único em ambas as tabelas).
UPDATE "auth"."users" AS u
SET "avatar_media_id" = a."id"
FROM "media"."files" AS f
JOIN "media"."assets" AS a ON a."pathname" = f."storage_key"
WHERE u."avatar_media_id" = f."id";--> statement-breakpoint
ALTER TABLE "media"."assets" ALTER COLUMN "filename" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "media"."files" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "media"."files" CASCADE;
