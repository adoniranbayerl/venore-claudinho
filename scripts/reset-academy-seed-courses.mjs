// Apaga os dois cursos-seed da Academy ("Teoria Musical na Prática" e "Jesus Cristo mudou meu
// viver") e as entries ocultas do CMS que eles usam nas seções. Serve para RE-SEMEAR com conteúdo
// novo: o seed é idempotente-por-slug-publicado, então enquanto o curso existir ele é pulado.
//
// Depois de rodar isto, vá em /admin/plugins e clique "Popular dados de exemplo" no plugin Academy
// (com o deploy que traz o conteúdo novo já no ar).
//
// Uso (a URL do banco a limpar, NÃO o .env de dev):
//   DATABASE_URL='postgresql://...' node scripts/reset-academy-seed-courses.mjs

import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Defina DATABASE_URL com o banco a limpar.");
  process.exit(1);
}

const SLUGS = ["teoria-musical-na-pratica", "jesus-cristo-mudou-meu-viver"];

const pool = new pg.Pool({ connectionString: url });
const client = await pool.connect();
try {
  const [{ current_database: db }] = (await client.query("select current_database()")).rows;
  console.log(`Banco: ${db}`);

  await client.query("begin");

  const courses = (
    await client.query("select id, title, slug from academy.courses where slug = any($1)", [SLUGS])
  ).rows;
  if (courses.length === 0) {
    console.log("Nenhum dos cursos-seed existe neste banco. Nada a fazer.");
    await client.query("rollback");
  } else {
    const courseIds = courses.map((c) => c.id);
    courses.forEach((c) => console.log(`  curso: "${c.title}" (${c.slug})`));

    // Entries ocultas do CMS usadas pelas seções — não têm FK cross-schema, então apagamos à mão.
    const entryIds = (
      await client.query(
        `select distinct s.cms_entry_id
           from academy.lesson_sections s
           join academy.lessons l on l.id = s.lesson_id
          where l.course_id = any($1) and s.cms_entry_id is not null`,
        [courseIds],
      )
    ).rows.map((r) => r.cms_entry_id);

    // academy.courses -> lessons -> (sections, quiz_questions, lesson_activities, requirements,
    // completions, attempts, submissions, messages) tudo com ON DELETE CASCADE.
    const del = await client.query("delete from academy.courses where id = any($1)", [courseIds]);
    console.log(`Cursos apagados: ${del.rowCount} (aulas/seções/quizzes/atividades em cascata)`);

    if (entryIds.length > 0) {
      const delEntries = await client.query("delete from cms.entries where id = any($1)", [entryIds]);
      console.log(`Entries ocultas do CMS apagadas: ${delEntries.rowCount}`);
    }

    await client.query("commit");
    console.log("Pronto. Agora rode 'Popular dados de exemplo' no plugin Academy em /admin/plugins.");
  }
} catch (error) {
  await client.query("rollback");
  console.error("ROLLBACK —", error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
