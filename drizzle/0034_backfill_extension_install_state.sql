-- Backfill do estado "instalado" para plugins/temas já registrados em código.
-- Antes desta migration, uma linha em extensions.extension_state só existia quando alguém
-- desabilitava algo -> toda linha existente estava, de fato, instalada.
UPDATE "extensions"."extension_state" SET "installed_at" = now() WHERE "installed_at" IS NULL;
--> statement-breakpoint

-- Snapshot ponto-no-tempo das chaves de PLUGIN_REGISTRY (src/plugins/registry.ts) e
-- THEME_REGISTRY (src/themes/registry.ts) no momento desta migration. Marca cada uma como
-- instalada e habilitada; ON CONFLICT preserva o `enabled` de quem já tinha linha (ex: um
-- plugin/tema desabilitado continua desabilitado, só ganha o installed_at).
INSERT INTO "extensions"."extension_state" ("kind", "key", "enabled", "installed_at") VALUES
  ('plugin', 'academy', true, now()),
  ('plugin', 'birthdays', true, now()),
  ('plugin', 'donations', true, now()),
  ('plugin', 'broadcast', true, now()),
  ('plugin', 'enrollment-dashboard', true, now()),
  ('theme', 'venore-slime', true, now()),
  ('theme', 'venore-basic', true, now()),
  ('theme', 'venore-nightcity', true, now()),
  ('theme', 'venore-kazordoon', true, now()),
  ('theme', 'venore-pulse', true, now()),
  ('theme', 'venore-frost', true, now()),
  ('theme', 'menonita-classic', true, now()),
  ('theme', 'aprenda-musica', true, now())
ON CONFLICT ("kind", "key")
DO UPDATE SET "installed_at" = COALESCE("extension_state"."installed_at", now());
