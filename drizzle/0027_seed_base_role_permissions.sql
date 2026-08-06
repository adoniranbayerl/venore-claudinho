-- Custom SQL migration file, put your code below! --

-- Concede ao papel de sistema "admin" todas as permissions base já registradas em
-- src/contexts/rbac/contracts/permissions.ts, exceto "media.purge" (reservada a superadmin, ver
-- abaixo). Superadmin nunca precisa de linha em role_permissions: authorize-actor.ts libera tudo
-- pra ele via isSuperadmin (roles.key === 'superadmin'), sem consultar esta tabela.
--
-- Consolida em migration o que hoje só existia como scripts/seed-*-permission.mjs individuais
-- (rodados manualmente, fora do fluxo de `npm run db:migrate`) — os scripts continuam existindo e
-- são idempotentes (ON CONFLICT DO NOTHING), mas deixam de ser necessários numa instalação nova.
INSERT INTO "rbac"."role_permissions" ("role_id", "permission_key")
SELECT r."id", p."permission_key"
FROM "rbac"."roles" r
CROSS JOIN (
	VALUES
		('rbac.roles.manage'),
		('rbac.roles.assign'),
		('rbac.registrations.approve'),
		('settings.manage'),
		('cms.content-types.manage'),
		('cms.categories.manage'),
		('cms.entries.manage'),
		('cms.entries.publish'),
		('cms.menus.manage'),
		('platform.admin.access'),
		('platform.extensions.manage'),
		('media.manage'),
		('observability.logs.view'),
		('observability.logs.clear'),
		('observability.audit.view')
) AS p ("permission_key")
WHERE r."key" = 'admin'
ON CONFLICT ("role_id", "permission_key") DO NOTHING;
--> statement-breakpoint

-- "media.purge" é restrita a superadmin (docs/media/blob-spec.md — hard delete que perde o blob
-- de verdade). A linha abaixo só existe pra manter role_permissions documentando a intenção do
-- produto; authorize-actor.ts nunca a lê pra esse papel (superadmin já é liberado incondicional).
INSERT INTO "rbac"."role_permissions" ("role_id", "permission_key")
SELECT r."id", 'media.purge'
FROM "rbac"."roles" r
WHERE r."key" = 'superadmin'
ON CONFLICT ("role_id", "permission_key") DO NOTHING;
