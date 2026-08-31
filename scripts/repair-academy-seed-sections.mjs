// One-off: conserta as seções dos cursos-seed da Academy que ficaram com a composição no formato
// errado. O seed antigo gravava `cms.entries.data` como um ARRAY de blocos; o correto (o que
// `getEntryComposition` lê, contracts/entry-body.ts) é `{ "blocks": [...] }`, e blocos de leaf
// (richtext) precisam de um contêiner `core.layout.section` na raiz.
//
// Idempotente: só toca entries com internal_owner='academy' cujo `data` é um array. Depois de
// rodar, elas viram `object` e uma segunda execução não faz nada.
//
// Uso (a URL do banco a consertar, NÃO o .env de dev):
//   DATABASE_URL='postgresql://...' node scripts/repair-academy-seed-sections.mjs

import { randomUUID } from "node:crypto";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Defina DATABASE_URL com o banco a consertar.");
  process.exit(1);
}

const SECTION_DATA = {
  background: "none",
  maxWidth: "full",
  paddingY: "none",
  paddingX: "none",
  title: "",
  icon: "",
  titleAlign: "start",
};

const pool = new pg.Pool({ connectionString: url });
const client = await pool.connect();
try {
  const [{ current_database: db }] = (await client.query("select current_database()")).rows;
  console.log(`Banco: ${db}`);

  await client.query("begin");
  const rows = (
    await client.query(
      "select id, data from cms.entries where internal_owner = 'academy' and jsonb_typeof(data) = 'array' for update",
    )
  ).rows;
  console.log(`Entries da Academy com data em array (formato errado): ${rows.length}`);

  let fixed = 0;
  for (const row of rows) {
    const children = row.data;
    if (!Array.isArray(children) || children.length === 0) {
      console.log(`  ignorando ${row.id} (array vazio)`);
      continue;
    }
    const wrapper = {
      id: randomUUID(),
      key: "core.layout.section",
      slot: "",
      data: SECTION_DATA,
      areas: [{ key: "content", blocks: children }],
    };
    await client.query("update cms.entries set data = $1, updated_at = now() where id = $2", [
      JSON.stringify({ blocks: [wrapper] }),
      row.id,
    ]);
    fixed += 1;
  }

  await client.query("commit");
  console.log(`Consertadas: ${fixed}`);

  const after = (
    await client.query(
      "select jsonb_typeof(data) as t, count(*)::int as n from cms.entries where internal_owner = 'academy' group by 1",
    )
  ).rows;
  console.log("Distribuição agora:", JSON.stringify(after));
} catch (error) {
  await client.query("rollback");
  console.error("ROLLBACK —", error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
