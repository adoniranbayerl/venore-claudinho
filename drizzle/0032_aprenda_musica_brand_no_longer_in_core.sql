-- Custom SQL migration file, put your code below! --

-- CORREÇÃO DE ROTA DA 0030 -----------------------------------------------------
--
-- A 0030 (`0030_aprenda_musica_navigation_and_content.sql`) embutiu na cadeia de
-- migrations do CORE conteúdo e identidade de UMA instalação específica ("Aprenda
-- Música"): content types, categorias, assets placeholder, entries de blog, itens
-- de menu e — o problema real — um `INSERT ... ON CONFLICT ("key") DO UPDATE` em
-- `settings.settings` para `brand.siteName` / `brand.footerDescription`.
--
-- Todo o resto da 0030 era idempotente e/ou no-op numa instalação nova (os INSERT
-- de asset/entry usam `CROSS JOIN auth.users WHERE email = '...'`, que não devolve
-- linha sem aquele usuário logado). Só o bloco de marca era DESTRUTIVO: o
-- `DO UPDATE` sobrescreve a marca de QUALQUER instalação já existente toda vez que
-- `npm run db:migrate` roda — e `vercel-build` roda isso em todo deploy. Uma
-- migration de core nunca deve carregar identidade de tenant, muito menos de forma
-- que reescreve dado que o admin já personalizou.
--
-- O QUE MUDA DE ESTRATÉGIA:
--   * O conteúdo tenant-específico da 0030 saiu da cadeia de migrations e virou um
--     seed opt-in: `scripts/seed-aprenda-musica.ts` (`npm run db:seed:aprenda-musica`),
--     rodado só na instalação da Aprenda Música, no padrão de
--     `scripts/seed-enrollment-dashboard.ts`. O seed é idempotente e recria o mesmo
--     estado que a 0030 dava (taxonomia + posts + navegação + marca).
--   * O default de código de marca (`src/platform/brand/get-brand-config.ts`)
--     deixou de ser "Aprenda Música" e passou a ser genérico/neutro — o default de
--     código não pode carregar identidade de tenant.
--
-- O QUE ESTA MIGRATION FAZ:
--   Uma migration já aplicada é imutável — não dá pra "neutralizar a 0030 in-place".
--   Esta 0032 também NÃO tenta reverter a taxonomia/posts/menus da 0030 (onde a 0030
--   rodou com um usuário real, esse conteúdo é legítimo e pode já estar em uso; onde
--   rodou sem usuário, já não existe). O único dano a desfazer é o da marca, e só
--   com segurança: restaura `brand.siteName` / `brand.footerDescription` para o
--   default APENAS se o valor atual for EXATAMENTE a string que a 0030 gravou (ou
--   seja, ninguém editou a marca depois da 0030). Instalações que já
--   personalizaram a marca — para "Aprenda Música" de propósito ou para qualquer
--   outra coisa — ficam intactas.
--
--   "Restaurar para o default" aqui = APAGAR a linha. `get-brand-config.ts` chama
--   `registerDefaultSetting` (upsert `ON CONFLICT DO NOTHING`) a cada leitura, então
--   a linha ausente volta a ser semeada com o default de código neutro na próxima
--   renderização. Deixar uma linha explícita com o texto neutro seria
--   indistinguível de uma personalização real para esse mesmo texto.

DELETE FROM "settings"."settings"
WHERE "key" = 'brand.siteName'
  AND "value" = '"Aprenda Música"'::jsonb;
--> statement-breakpoint

DELETE FROM "settings"."settings"
WHERE "key" = 'brand.footerDescription'
  AND "value" = '"Aulas de música com acompanhamento próximo, do primeiro acorde ao seu jeito de tocar."'::jsonb;
