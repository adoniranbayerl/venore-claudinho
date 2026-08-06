-- Custom SQL migration file, put your code below! --

-- Conteúdo real da Aprenda Música: taxonomia de blog, posts com blocos (heading/imagem/rich
-- text) e navegação principal. Autor é o superadmin já existente (não há usuário "sistema"
-- no projeto — ver AGENTS.md/0028). Imagens de capa são placeholders via placehold.co: este
-- projeto não gera imagens, o texto do placeholder identifica qual post cada capa pertence
-- pra facilitar a substituição depois por um upload real (troca o mediaId no bloco de imagem).

INSERT INTO "cms"."content_types" ("id", "key", "name", "description") VALUES
	('cf4bf40d-5a55-4d4e-8f8a-687da4d4c25e', 'artigo', 'Artigo', 'Conteúdo do blog — dicas, novidades e bastidores da Aprenda Música.')
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint

INSERT INTO "cms"."categories" ("id", "key", "slug", "name", "description") VALUES
	('58613dc9-d364-4f8d-97eb-9cd9a81c0a55', 'blog', 'blog', 'Blog', 'Artigos, dicas e novidades da Aprenda Música.')
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint

INSERT INTO "media"."categories" ("id", "key", "name") VALUES
	('a8a2bb62-7ba2-445b-84d5-024e2da7b262', 'capas-de-post', 'Capas de post')
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint

-- Placeholder via placehold.co (serviço externo real, a imagem carrega de verdade) — substituir
-- depois trocando a "url"/"pathname" por um upload real via /admin/media, ou repontando o
-- mediaId do bloco de imagem de cada post pra um novo asset.
-- INSERT ... SELECT (não VALUES) de propósito: "uploaded_by" tem que ser um usuário real (não
-- existe usuário "sistema" — só nasce via login OAuth). Numa instalação nova, sem esse email
-- ainda logado, o CROSS JOIN não devolve linha e isto vira um no-op seguro em vez de violar a
-- FK — o conteúdo abaixo é o desta instalação específica da Aprenda Música, não um seed genérico.
INSERT INTO "media"."assets" ("id", "filename", "pathname", "url", "content_type", "size", "width", "height", "alt", "checksum", "uploaded_by", "visibility", "category_id")
SELECT v."id", v."filename", v."pathname", v."url", v."content_type", v."size", v."width", v."height", v."alt", md5(random()::text || clock_timestamp()::text), u."id", v."visibility", 'a8a2bb62-7ba2-445b-84d5-024e2da7b262'
FROM (VALUES
	('e186b0cf-f470-44ff-b7d6-effa63b2b8e3', 'capa-praticar-todos-os-dias.png', 'placeholders/e186b0cf-f470-44ff-b7d6-effa63b2b8e3-capa-praticar-todos-os-dias.png', 'https://placehold.co/1200x630/143b52/f2f2ee.png?text=Pratique+todos+os+dias&font=roboto', 'image/png', 24000, 1200, 630, 'Imagem placeholder — substituir pela capa definitiva', 'public'),
	('b8a2f56c-5800-4ce4-a184-b528f8cec41a', 'capa-escolher-instrumento.png', 'placeholders/b8a2f56c-5800-4ce4-a184-b528f8cec41a-capa-escolher-instrumento.png', 'https://placehold.co/1200x630/143b52/f2f2ee.png?text=Escolha+seu+instrumento&font=roboto', 'image/png', 24000, 1200, 630, 'Imagem placeholder — substituir pela capa definitiva', 'public'),
	('78cae755-09a4-4210-8b5a-ab937db2c088', 'capa-teoria-musical.png', 'placeholders/78cae755-09a4-4210-8b5a-ab937db2c088-capa-teoria-musical.png', 'https://placehold.co/1200x630/143b52/f2f2ee.png?text=Teoria+musical&font=roboto', 'image/png', 24000, 1200, 630, 'Imagem placeholder — substituir pela capa definitiva', 'public')
) AS v("id", "filename", "pathname", "url", "content_type", "size", "width", "height", "alt", "visibility")
CROSS JOIN (SELECT "id" FROM "auth"."users" WHERE "email" = 'adoniransbayerl@gmail.com' LIMIT 1) AS u
ON CONFLICT ("pathname") DO NOTHING;
--> statement-breakpoint

-- Mesmo raciocínio do INSERT de assets acima: "author_id" só existe se o usuário já logou pelo
-- menos uma vez. category_id resolvido por key (não pelo literal gerado acima) — insere só se a
-- categoria "blog" (criada nesta mesma migration, alguns statements acima) já existir.
INSERT INTO "cms"."entries" ("id", "category_id", "title", "slug", "status", "visibility", "data", "author_id", "published_at")
SELECT v."id", cat."id", v."title", v."slug", 'published', 'public', v."data", u."id", now()
FROM (VALUES
	('3192746e-5555-4a8e-8178-5b17dc594964', '5 dicas para praticar música todos os dias', 'dicas-para-praticar-musica-todos-os-dias', '{"body":"","blocks":[{"id":"01948286-6f41-4acf-bd62-d922334584ba","key":"core.layout.section","data":{"icon":"","title":"5 dicas para praticar música todos os dias","maxWidth":"3xl","paddingX":"md","paddingY":"lg","background":"none","titleAlign":"start"},"slot":"","areas":[{"key":"content","blocks":[{"id":"c24feb75-ac39-4f1c-8a69-56e0e4f59785","key":"core.content.image","data":{"mediaId":"e186b0cf-f470-44ff-b7d6-effa63b2b8e3","alt":"Capa do post: 5 dicas para praticar música todos os dias","width":"full","caption":""},"slot":"","areas":[]},{"id":"137391c3-6a67-4e3c-b4d6-8dc7cc037be0","key":"core.content.richtext","data":{"content":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Praticar todos os dias é o que mais separa quem avança rápido de quem estaciona no aprendizado — e não precisa ser muito tempo, precisa ser constante."}]},{"type":"orderedList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Defina um horário fixo, mesmo que sejam só 15 minutos por dia."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Aqueça antes de tocar: escalas simples ou exercícios de respiração já ajudam."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Grave a si mesmo de vez em quando — é a forma mais rápida de ouvir o que precisa melhorar."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Divida a prática em blocos curtos com objetivos claros, em vez de tocar sem rumo."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Celebre pequenos progressos — eles são o que mantém a prática sustentável no longo prazo."}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Comece pequeno, seja consistente, e o resultado aparece."}]}]}},"slot":"","areas":[]}]}]}]}'::jsonb),
	('8ef497ad-efd7-4fc6-bdd9-7deab8708d3b', 'Como escolher o instrumento certo para começar', 'como-escolher-o-instrumento-certo-para-comecar', '{"body":"","blocks":[{"id":"4d19d23f-20e7-41a0-bdc8-1fbe7d29665d","key":"core.layout.section","data":{"icon":"","title":"Como escolher o instrumento certo para começar","maxWidth":"3xl","paddingX":"md","paddingY":"lg","background":"none","titleAlign":"start"},"slot":"","areas":[{"key":"content","blocks":[{"id":"621f1d07-4bf2-414f-9018-5ad8f53f4c87","key":"core.content.image","data":{"mediaId":"b8a2f56c-5800-4ce4-a184-b528f8cec41a","alt":"Capa do post: Como escolher o instrumento certo para começar","width":"full","caption":""},"slot":"","areas":[]},{"id":"1ee9953a-ee6f-487e-a02b-4803ff14b17d","key":"core.content.richtext","data":{"content":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Não existe instrumento certo pra todo mundo — existe o instrumento certo pra você, e alguns fatores ajudam a decidir."}]},{"type":"orderedList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Gosto pessoal: o som que te empolga é o som que você vai ter vontade de praticar."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Orçamento: dá pra começar bem com opções acessíveis antes de investir em um instrumento mais caro."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Espaço em casa: piano e bateria pedem mais espaço (e vizinhos pacientes) do que violão ou teclado."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Facilidade inicial: instrumentos como o teclado costumam ter uma curva de aprendizado mais suave no começo."}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Na dúvida, converse com um professor antes de comprar — e dá uma olhada nos nossos cursos pra conhecer os instrumentos na prática."}]}]}},"slot":"","areas":[]}]}]}]}'::jsonb),
	('50b62399-2a66-426d-ae28-0eebeb78f28e', 'Por que a teoria musical facilita (e não atrapalha) a prática', 'por-que-teoria-musical-facilita-a-pratica', '{"body":"","blocks":[{"id":"33004c1e-1d64-41b2-895d-fb07559c64ea","key":"core.layout.section","data":{"icon":"","title":"Por que a teoria musical facilita (e não atrapalha) a prática","maxWidth":"3xl","paddingX":"md","paddingY":"lg","background":"none","titleAlign":"start"},"slot":"","areas":[{"key":"content","blocks":[{"id":"e23c2ade-43b3-4fa2-942b-e20d9e1e02df","key":"core.content.image","data":{"mediaId":"78cae755-09a4-4210-8b5a-ab937db2c088","alt":"Capa do post: Por que a teoria musical facilita (e não atrapalha) a prática","width":"full","caption":""},"slot":"","areas":[]},{"id":"a151151d-858d-4e23-8dbc-47c08fd247b0","key":"core.content.richtext","data":{"content":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Muita gente evita teoria musical achando que ela engessa a criatividade — na prática, é o contrário: entender o que você está tocando acelera tudo."}]},{"type":"paragraph","content":[{"type":"text","text":"Saber ler uma cifra, reconhecer um intervalo ou entender como uma escala se forma tira o aprendizado do modo tentativa-e-erro e te dá atalhos reais."}]},{"type":"paragraph","content":[{"type":"text","text":"Se quiser começar pelo básico, temos uma trilha completa em Introdução à Teoria Musical — vale a pena dar uma olhada."}]}]}},"slot":"","areas":[]}]}]}]}'::jsonb)
) AS v("id", "title", "slug", "data")
CROSS JOIN (SELECT "id" FROM "cms"."categories" WHERE "key" = 'blog' LIMIT 1) AS cat
CROSS JOIN (SELECT "id" FROM "auth"."users" WHERE "email" = 'adoniransbayerl@gmail.com' LIMIT 1) AS u
ON CONFLICT ("category_id", "slug") DO NOTHING;
--> statement-breakpoint

-- Vincula pela slug (não pelo id gerado acima) — só liga a tag "artigo" às entries que de fato
-- foram inseridas (nada acontece se o INSERT acima virou no-op por falta de usuário).
INSERT INTO "cms"."entry_content_types" ("entry_id", "content_type_id")
SELECT e."id", ct."id"
FROM "cms"."entries" e, "cms"."content_types" ct
WHERE e."slug" IN ('dicas-para-praticar-musica-todos-os-dias', 'como-escolher-o-instrumento-certo-para-comecar', 'por-que-teoria-musical-facilita-a-pratica') AND ct."key" = 'artigo'
ON CONFLICT DO NOTHING;
--> statement-breakpoint

-- Navegação principal: "Início" apontava (targetType=content) pra uma entry já apagada — troca
-- pra route "/" (sempre resolve certo, sem depender de uma entry existir). O item que já
-- apontava pra "Cursos" de verdade só tinha o rótulo de teste "CLICA AQUI ELON" — só o label muda.
UPDATE "cms"."menu_items" SET "target_type" = 'route', "route_path" = '/', "content_id" = NULL, "updated_at" = now()
WHERE "id" = 'ffaabbb8-30c8-4caa-b331-75de00a97932';
--> statement-breakpoint

UPDATE "cms"."menu_items" SET "label" = 'Cursos', "updated_at" = now()
WHERE "id" = '6a45e994-8188-42fb-a2ab-03911066c0c8';
--> statement-breakpoint

-- INSERT ... SELECT: menu_id tem que apontar pra um menu "main" que já exista — numa instalação
-- nova não existe nenhum (menus nascem só quando um admin cria pela tela), e a sidebar cai no
-- fallback mockado (resolve-theme-slot-props.ts) até lá; sem o guard, isto violaria a FK.
INSERT INTO "cms"."menu_items" ("id", "menu_id", "label", "order", "target_type", "route_path", "is_visible")
SELECT '87730bed-413b-4835-9880-5d38bde687fb', m."id", 'Blog', 2, 'route', '/blog', true
FROM "cms"."menus" m WHERE m."id" = '3b79dd53-3028-4173-9e22-6ede6b0e0619'
ON CONFLICT DO NOTHING;
--> statement-breakpoint

-- Marca: nome e descrição passam a ser os da Aprenda Música (fallback também trocado em
-- src/platform/brand/get-brand-config.ts, pra uma instalação nova nascer com o mesmo default).
-- Sem logo de propósito — o tema aprenda-musica já resolve a marca sem depender de imagem.
INSERT INTO "settings"."settings" ("key", "value", "updated_at") VALUES
	('brand.siteName', '"Aprenda Música"'::jsonb, now()),
	('brand.footerDescription', '"Aulas de música com acompanhamento próximo, do primeiro acorde ao seu jeito de tocar."'::jsonb, now())
ON CONFLICT ("key") DO UPDATE SET "value" = excluded."value", "updated_at" = excluded."updated_at";

