import { Client } from "pg";

// Seed OPT-IN da instalação "Aprenda Música" — rodado só nessa instalação, nunca na
// cadeia de migrations do core (mesmo espírito de scripts/seed-enrollment-dashboard.ts:
// conteúdo que antes vivia hardcoded, agora só um seed inicial).
//
// Origem: todo o conteúdo tenant-específico que a migration
// `drizzle/0030_aprenda_musica_navigation_and_content.sql` embutia no core —
// taxonomia de blog, três posts com blocos, navegação principal e a marca
// (brand.siteName / brand.footerDescription). A 0030 nunca deveria ter tocado em
// settings de marca de forma destrutiva; ver
// `drizzle/0032_aprenda_musica_brand_no_longer_in_core.sql`.
//
// Idempotente: cada statement usa ON CONFLICT DO NOTHING, ou é um UPDATE por id, ou
// (marca) só sobrescreve se o valor atual ainda for o default neutro de código.
// Rodar duas vezes no mesmo banco não muda nada além da primeira.
//
// Autor dos posts: cms.entries.author_id / media.assets.uploaded_by exigem um
// usuário real (não há usuário "sistema" no projeto — só nasce via login). Este
// script resolve, nesta ordem: SEED_AUTHOR_EMAIL (env) -> primeiro superadmin ->
// primeiro usuário criado. Sem nenhum usuário no banco, os assets/posts são
// pulados (mesmo no-op que a 0030 tinha via CROSS JOIN), e o resto roda.

const CATEGORY_BLOG_ID = "58613dc9-d364-4f8d-97eb-9cd9a81c0a55";
const MEDIA_CATEGORY_CAPAS_ID = "a8a2bb62-7ba2-445b-84d5-024e2da7b262";
const MAIN_MENU_ID = "3b79dd53-3028-4173-9e22-6ede6b0e0619";

// Default de código neutro de src/platform/brand/get-brand-config.ts — a marca só é
// sobrescrita pelo seed enquanto ninguém tiver personalizado.
const NEUTRAL_SITE_NAME = '"Meu Site"';
const NEUTRAL_FOOTER_DESCRIPTION = '""';

const APRENDA_MUSICA_SITE_NAME = '"Aprenda Música"';
const APRENDA_MUSICA_FOOTER_DESCRIPTION =
  '"Aulas de música com acompanhamento próximo, do primeiro acorde ao seu jeito de tocar."';

type AssetSeed = {
  id: string;
  filename: string;
  pathname: string;
  url: string;
  alt: string;
};

const ASSETS: AssetSeed[] = [
  {
    id: "e186b0cf-f470-44ff-b7d6-effa63b2b8e3",
    filename: "capa-praticar-todos-os-dias.png",
    pathname: "placeholders/e186b0cf-f470-44ff-b7d6-effa63b2b8e3-capa-praticar-todos-os-dias.png",
    url: "https://placehold.co/1200x630/143b52/f2f2ee.png?text=Pratique+todos+os+dias&font=roboto",
    alt: "Imagem placeholder — substituir pela capa definitiva",
  },
  {
    id: "b8a2f56c-5800-4ce4-a184-b528f8cec41a",
    filename: "capa-escolher-instrumento.png",
    pathname: "placeholders/b8a2f56c-5800-4ce4-a184-b528f8cec41a-capa-escolher-instrumento.png",
    url: "https://placehold.co/1200x630/143b52/f2f2ee.png?text=Escolha+seu+instrumento&font=roboto",
    alt: "Imagem placeholder — substituir pela capa definitiva",
  },
  {
    id: "78cae755-09a4-4210-8b5a-ab937db2c088",
    filename: "capa-teoria-musical.png",
    pathname: "placeholders/78cae755-09a4-4210-8b5a-ab937db2c088-capa-teoria-musical.png",
    url: "https://placehold.co/1200x630/143b52/f2f2ee.png?text=Teoria+musical&font=roboto",
    alt: "Imagem placeholder — substituir pela capa definitiva",
  },
];

type EntrySeed = {
  id: string;
  title: string;
  slug: string;
  data: string;
};

// `data` copiado verbatim da 0030 (JSONB de blocos: layout.section > image + richtext).
const ENTRIES: EntrySeed[] = [
  {
    id: "3192746e-5555-4a8e-8178-5b17dc594964",
    title: "5 dicas para praticar música todos os dias",
    slug: "dicas-para-praticar-musica-todos-os-dias",
    data: '{"body":"","blocks":[{"id":"01948286-6f41-4acf-bd62-d922334584ba","key":"core.layout.section","data":{"icon":"","title":"5 dicas para praticar música todos os dias","maxWidth":"3xl","paddingX":"md","paddingY":"lg","background":"none","titleAlign":"start"},"slot":"","areas":[{"key":"content","blocks":[{"id":"c24feb75-ac39-4f1c-8a69-56e0e4f59785","key":"core.content.image","data":{"mediaId":"e186b0cf-f470-44ff-b7d6-effa63b2b8e3","alt":"Capa do post: 5 dicas para praticar música todos os dias","width":"full","caption":""},"slot":"","areas":[]},{"id":"137391c3-6a67-4e3c-b4d6-8dc7cc037be0","key":"core.content.richtext","data":{"content":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Praticar todos os dias é o que mais separa quem avança rápido de quem estaciona no aprendizado — e não precisa ser muito tempo, precisa ser constante."}]},{"type":"orderedList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Defina um horário fixo, mesmo que sejam só 15 minutos por dia."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Aqueça antes de tocar: escalas simples ou exercícios de respiração já ajudam."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Grave a si mesmo de vez em quando — é a forma mais rápida de ouvir o que precisa melhorar."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Divida a prática em blocos curtos com objetivos claros, em vez de tocar sem rumo."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Celebre pequenos progressos — eles são o que mantém a prática sustentável no longo prazo."}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Comece pequeno, seja consistente, e o resultado aparece."}]}]}},"slot":"","areas":[]}]}]}]}',
  },
  {
    id: "8ef497ad-efd7-4fc6-bdd9-7deab8708d3b",
    title: "Como escolher o instrumento certo para começar",
    slug: "como-escolher-o-instrumento-certo-para-comecar",
    data: '{"body":"","blocks":[{"id":"4d19d23f-20e7-41a0-bdc8-1fbe7d29665d","key":"core.layout.section","data":{"icon":"","title":"Como escolher o instrumento certo para começar","maxWidth":"3xl","paddingX":"md","paddingY":"lg","background":"none","titleAlign":"start"},"slot":"","areas":[{"key":"content","blocks":[{"id":"621f1d07-4bf2-414f-9018-5ad8f53f4c87","key":"core.content.image","data":{"mediaId":"b8a2f56c-5800-4ce4-a184-b528f8cec41a","alt":"Capa do post: Como escolher o instrumento certo para começar","width":"full","caption":""},"slot":"","areas":[]},{"id":"1ee9953a-ee6f-487e-a02b-4803ff14b17d","key":"core.content.richtext","data":{"content":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Não existe instrumento certo pra todo mundo — existe o instrumento certo pra você, e alguns fatores ajudam a decidir."}]},{"type":"orderedList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Gosto pessoal: o som que te empolga é o som que você vai ter vontade de praticar."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Orçamento: dá pra começar bem com opções acessíveis antes de investir em um instrumento mais caro."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Espaço em casa: piano e bateria pedem mais espaço (e vizinhos pacientes) do que violão ou teclado."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Facilidade inicial: instrumentos como o teclado costumam ter uma curva de aprendizado mais suave no começo."}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"Na dúvida, converse com um professor antes de comprar — e dá uma olhada nos nossos cursos pra conhecer os instrumentos na prática."}]}]}},"slot":"","areas":[]}]}]}]}',
  },
  {
    id: "50b62399-2a66-426d-ae28-0eebeb78f28e",
    title: "Por que a teoria musical facilita (e não atrapalha) a prática",
    slug: "por-que-teoria-musical-facilita-a-pratica",
    data: '{"body":"","blocks":[{"id":"33004c1e-1d64-41b2-895d-fb07559c64ea","key":"core.layout.section","data":{"icon":"","title":"Por que a teoria musical facilita (e não atrapalha) a prática","maxWidth":"3xl","paddingX":"md","paddingY":"lg","background":"none","titleAlign":"start"},"slot":"","areas":[{"key":"content","blocks":[{"id":"e23c2ade-43b3-4fa2-942b-e20d9e1e02df","key":"core.content.image","data":{"mediaId":"78cae755-09a4-4210-8b5a-ab937db2c088","alt":"Capa do post: Por que a teoria musical facilita (e não atrapalha) a prática","width":"full","caption":""},"slot":"","areas":[]},{"id":"a151151d-858d-4e23-8dbc-47c08fd247b0","key":"core.content.richtext","data":{"content":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Muita gente evita teoria musical achando que ela engessa a criatividade — na prática, é o contrário: entender o que você está tocando acelera tudo."}]},{"type":"paragraph","content":[{"type":"text","text":"Saber ler uma cifra, reconhecer um intervalo ou entender como uma escala se forma tira o aprendizado do modo tentativa-e-erro e te dá atalhos reais."}]},{"type":"paragraph","content":[{"type":"text","text":"Se quiser começar pelo básico, temos uma trilha completa em Introdução à Teoria Musical — vale a pena dar uma olhada."}]}]}},"slot":"","areas":[]}]}]}]}',
  },
];

const ENTRY_SLUGS = ENTRIES.map((entry) => entry.slug);

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function resolveAuthorId(): Promise<string | null> {
  const overrideEmail = process.env.SEED_AUTHOR_EMAIL?.trim();
  if (overrideEmail) {
    const { rows } = await client.query<{ id: string }>(
      'SELECT "id" FROM "auth"."users" WHERE "email" = $1 LIMIT 1',
      [overrideEmail],
    );
    if (!rows[0]) {
      throw new Error(`SEED_AUTHOR_EMAIL="${overrideEmail}" não corresponde a nenhum usuário.`);
    }
    return rows[0].id;
  }

  const superadmin = await client.query<{ id: string }>(
    `SELECT u."id"
       FROM "auth"."users" u
       JOIN "rbac"."user_roles" ur ON ur."user_id" = u."id"
       JOIN "rbac"."roles" r ON r."id" = ur."role_id"
      WHERE r."key" = 'superadmin'
      ORDER BY ur."assigned_at" ASC
      LIMIT 1`,
  );
  if (superadmin.rows[0]) return superadmin.rows[0].id;

  const firstUser = await client.query<{ id: string }>(
    'SELECT "id" FROM "auth"."users" ORDER BY "created_at" ASC LIMIT 1',
  );
  return firstUser.rows[0]?.id ?? null;
}

async function seedTaxonomy() {
  await client.query(
    `INSERT INTO "cms"."content_types" ("id", "key", "name", "description") VALUES
       ('cf4bf40d-5a55-4d4e-8f8a-687da4d4c25e', 'artigo', 'Artigo', 'Conteúdo do blog — dicas, novidades e bastidores da Aprenda Música.')
     ON CONFLICT ("key") DO NOTHING`,
  );
  await client.query(
    `INSERT INTO "cms"."categories" ("id", "key", "slug", "name", "description") VALUES
       ($1, 'blog', 'blog', 'Blog', 'Artigos, dicas e novidades da Aprenda Música.')
     ON CONFLICT ("key") DO NOTHING`,
    [CATEGORY_BLOG_ID],
  );
  await client.query(
    `INSERT INTO "media"."categories" ("id", "key", "name") VALUES
       ($1, 'capas-de-post', 'Capas de post')
     ON CONFLICT ("key") DO NOTHING`,
    [MEDIA_CATEGORY_CAPAS_ID],
  );
  console.log("Taxonomia: content type 'artigo', categoria 'blog', categoria de mídia 'capas-de-post' garantidas.");
}

async function seedAssets(authorId: string) {
  for (const asset of ASSETS) {
    await client.query(
      `INSERT INTO "media"."assets"
         ("id", "filename", "pathname", "url", "content_type", "size", "width", "height", "alt", "checksum", "uploaded_by", "visibility", "category_id")
       VALUES ($1, $2, $3, $4, 'image/png', 24000, 1200, 630, $5, md5(random()::text || clock_timestamp()::text), $6, 'public', $7)
       ON CONFLICT ("pathname") DO NOTHING`,
      [asset.id, asset.filename, asset.pathname, asset.url, asset.alt, authorId, MEDIA_CATEGORY_CAPAS_ID],
    );
  }
  console.log(`Assets placeholder: ${ASSETS.length} capa(s) de post garantida(s).`);
}

async function seedEntries(authorId: string) {
  for (const entry of ENTRIES) {
    await client.query(
      `INSERT INTO "cms"."entries"
         ("id", "category_id", "title", "slug", "status", "visibility", "data", "author_id", "published_at")
       SELECT $1, cat."id", $2, $3, 'published', 'public', $4::jsonb, $5, now()
       FROM "cms"."categories" cat
       WHERE cat."key" = 'blog'
       ON CONFLICT ("category_id", "slug") DO NOTHING`,
      [entry.id, entry.title, entry.slug, entry.data, authorId],
    );
  }
  await client.query(
    `INSERT INTO "cms"."entry_content_types" ("entry_id", "content_type_id")
     SELECT e."id", ct."id"
       FROM "cms"."entries" e, "cms"."content_types" ct
      WHERE e."slug" = ANY($1) AND ct."key" = 'artigo'
     ON CONFLICT DO NOTHING`,
    [ENTRY_SLUGS],
  );
  console.log(`Posts do blog: ${ENTRIES.length} entry(ies) publicada(s) e marcada(s) como 'artigo'.`);
}

async function seedNavigation() {
  // "Início": aponta pra route "/" em vez de uma entry apagada (verbatim da 0030).
  await client.query(
    `UPDATE "cms"."menu_items"
        SET "target_type" = 'route', "route_path" = '/', "content_id" = NULL, "updated_at" = now()
      WHERE "id" = 'ffaabbb8-30c8-4caa-b331-75de00a97932'`,
  );
  // Item de "Cursos": só o rótulo muda (era um label de teste).
  await client.query(
    `UPDATE "cms"."menu_items"
        SET "label" = 'Cursos', "updated_at" = now()
      WHERE "id" = '6a45e994-8188-42fb-a2ab-03911066c0c8'`,
  );
  // "Blog": só entra se o menu "main" já existir (numa instalação nova não existe;
  // a sidebar cai no fallback mockado até um admin criar o menu).
  const inserted = await client.query(
    `INSERT INTO "cms"."menu_items" ("id", "menu_id", "label", "order", "target_type", "route_path", "is_visible")
     SELECT '87730bed-413b-4835-9880-5d38bde687fb', m."id", 'Blog', 2, 'route', '/blog', true
       FROM "cms"."menus" m
      WHERE m."id" = $1
     ON CONFLICT DO NOTHING`,
    [MAIN_MENU_ID],
  );
  console.log(
    inserted.rowCount
      ? "Navegação: itens 'Início'/'Cursos' ajustados, item 'Blog' adicionado ao menu principal."
      : "Navegação: itens 'Início'/'Cursos' ajustados (menu principal ainda não existe — item 'Blog' não adicionado).",
  );
}

async function seedBrand() {
  // Marca da Aprenda Música — só sobrescreve enquanto o valor atual for o default
  // neutro de código (ou estiver ausente). Se alguém já personalizou a marca, fica
  // intacto. Mesma lógica de segurança da 0032, no sentido inverso.
  const siteName = await client.query(
    `INSERT INTO "settings"."settings" AS s ("key", "value", "updated_at")
     VALUES ('brand.siteName', $1::jsonb, now())
     ON CONFLICT ("key") DO UPDATE
        SET "value" = excluded."value", "updated_at" = excluded."updated_at"
      WHERE s."value" = $2::jsonb`,
    [APRENDA_MUSICA_SITE_NAME, NEUTRAL_SITE_NAME],
  );
  const footer = await client.query(
    `INSERT INTO "settings"."settings" AS s ("key", "value", "updated_at")
     VALUES ('brand.footerDescription', $1::jsonb, now())
     ON CONFLICT ("key") DO UPDATE
        SET "value" = excluded."value", "updated_at" = excluded."updated_at"
      WHERE s."value" = $2::jsonb`,
    [APRENDA_MUSICA_FOOTER_DESCRIPTION, NEUTRAL_FOOTER_DESCRIPTION],
  );
  const touched = (siteName.rowCount ?? 0) + (footer.rowCount ?? 0);
  console.log(
    touched
      ? "Marca: brand.siteName / brand.footerDescription definidos para a Aprenda Música."
      : "Marca: valor atual não é o default neutro (já é da Aprenda Música ou foi personalizado) — nada alterado.",
  );
}

async function main() {
  await client.connect();
  try {
    await client.query("BEGIN");

    await seedTaxonomy();

    const authorId = await resolveAuthorId();
    if (authorId) {
      await seedAssets(authorId);
      await seedEntries(authorId);
    } else {
      console.warn(
        "Nenhum usuário no banco — assets e posts do blog foram pulados (precisam de um author_id real).\n" +
          "Rode o seed de novo depois do primeiro login, ou defina SEED_AUTHOR_EMAIL.",
      );
    }

    await seedNavigation();
    await seedBrand();

    await client.query("COMMIT");
    console.log("Seed da Aprenda Música concluído.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

main()
  .then(async () => {
    await client.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await client.end();
    process.exit(1);
  });
