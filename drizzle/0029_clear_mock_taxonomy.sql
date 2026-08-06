-- Custom SQL migration file, put your code below! --

-- Reverte os dados de exemplo genéricos inseridos em 0028 (content types "aula"/"noticia"/
-- "evento", categorias "blog"/"noticias"/"eventos-exemplo", categorias de mídia "partituras"/
-- "fotos"/"capas-de-curso") — nenhum tinha referência real (entry, asset) até este ponto,
-- confirmado antes de escrever esta migration. 0030 recria o necessário com conteúdo real da
-- Aprenda Música em vez de mockup genérico. Nunca mexe em conteúdo interno da Academy
-- (internal_owner = 'academy') nem em categorias/content types que já existiam antes de 0028.
DELETE FROM "cms"."content_types" WHERE "key" IN ('aula', 'noticia', 'evento');
--> statement-breakpoint

DELETE FROM "cms"."categories" WHERE "key" IN ('blog', 'noticias', 'eventos-exemplo');
--> statement-breakpoint

DELETE FROM "media"."categories" WHERE "key" IN ('partituras', 'fotos', 'capas-de-curso');
