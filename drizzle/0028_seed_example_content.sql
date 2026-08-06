-- Custom SQL migration file, put your code below! --

-- Dados de exemplo para uma instalação nova começar com alguma taxonomia pronta em vez de telas
-- vazias no admin. Escopo deliberadamente pequeno e limitado a tabelas sem FK para auth.users:
-- cms.entries exige um author_id de um usuário real (só existe após login via OAuth — não há
-- usuário "sistema" no projeto, ver AGENTS.md), e a home (src/app/(platform)/page.tsx) já trata
-- "nenhuma entry ainda" como estado normal com empty state próprio — não precisa de entry seed
-- pra ficar funcional.
-- id não tem DEFAULT no banco (só $defaultFn no lado do Drizzle — src/contexts/cms/database/
-- schema/index.ts), então SQL cru precisa gerar o uuid explicitamente via gen_random_uuid()
-- (nativo no Postgres, sem extensão) em vez de depender do client.
INSERT INTO "cms"."content_types" ("id", "key", "name", "description") VALUES
	(gen_random_uuid(), 'aula', 'Aula', 'Conteúdo de apoio às aulas do curso — material complementar, dicas de prática.'),
	(gen_random_uuid(), 'noticia', 'Notícia', 'Comunicados e novidades da escola.'),
	(gen_random_uuid(), 'evento', 'Evento', 'Recitais, workshops e apresentações.')
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint

INSERT INTO "cms"."categories" ("id", "key", "slug", "name", "description") VALUES
	(gen_random_uuid(), 'blog', 'blog', 'Blog', 'Artigos e conteúdo editorial da escola.'),
	(gen_random_uuid(), 'noticias', 'noticias', 'Notícias', 'Comunicados e novidades.'),
	(gen_random_uuid(), 'eventos-exemplo', 'eventos-exemplo', 'Eventos', 'Agenda de recitais, workshops e apresentações.')
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint

INSERT INTO "media"."categories" ("id", "key", "name") VALUES
	(gen_random_uuid(), 'partituras', 'Partituras'),
	(gen_random_uuid(), 'fotos', 'Fotos'),
	(gen_random_uuid(), 'capas-de-curso', 'Capas de curso')
ON CONFLICT ("key") DO NOTHING;
