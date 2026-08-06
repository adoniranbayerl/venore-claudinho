import { createInterface } from "node:readline/promises";
import { Client } from "pg";

// Ferramenta operacional (mesmo espírito de scripts/bootstrap-superadmin.ts: ação de alto
// impacto, sem authorizeActor porque roda fora da aplicação, direto no banco — pede confirmação
// interativa em vez de flag "--yes" pra nunca disparar sem alguém olhando os números primeiro).
// Zera só dado de aluno (matrícula, progresso, tentativa de quiz, entrega de atividade,
// conversa) — nunca o conteúdo do curso (courses/lessons/lesson_sections/lesson_activities/
// quiz_questions etc.), que é o que os PRÓXIMOS alunos vão consumir. Não mexe em
// contexts/cms (as entries de texto de cada seção de aula) nem em auth.users/rbac — só o
// schema academy.
const STUDENT_DATA_TABLES = [
  "enrollments",
  "lesson_text_completions",
  "lesson_video_completions",
  "lesson_section_completions",
  "lesson_material_completions",
  "quiz_attempts",
  "lesson_activity_submissions",
  "lesson_message_threads",
  "lesson_messages",
];

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();

  console.log("Linhas de dado de aluno que serão apagadas (schema academy):\n");
  let total = 0;
  for (const table of STUDENT_DATA_TABLES) {
    const { rows } = await client.query(`SELECT count(*)::int AS count FROM academy.${table}`);
    const count = rows[0].count;
    total += count;
    console.log(`  ${table.padEnd(32)} ${count}`);
  }

  if (total === 0) {
    console.log("\nJá está tudo zerado — nada a fazer.");
    await client.end();
    process.exit(0);
  }

  console.log(
    "\nConteúdo do curso (courses/lessons/lesson_activities/quiz_questions/lesson_sections etc.) NÃO é afetado — só as linhas acima.",
  );

  const { rows: mediaRows } = await client.query(
    "SELECT count(*)::int AS count FROM academy.lesson_activity_submissions WHERE media_id IS NOT NULL",
  );
  if (mediaRows[0].count > 0) {
    console.log(
      `\nAviso: ${mediaRows[0].count} entrega(s) tinha(m) arquivo enviado em contexts/media — a linha de` +
        " submission será apagada, mas o arquivo em si fica na biblioteca de mídia (não é apagado por este" +
        " script). Se quiser removê-lo, faça isso manualmente em /admin/media.",
    );
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question('\nDigite "RESETAR" para confirmar (qualquer outra coisa cancela): ');
  rl.close();

  if (answer.trim() !== "RESETAR") {
    console.log("Abortado — nenhuma alteração feita.");
    await client.end();
    process.exit(0);
  }

  await client.query("BEGIN");
  try {
    await client.query(`TRUNCATE academy.${STUDENT_DATA_TABLES.join(", academy.")} CASCADE`);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }

  console.log("\nDado de aluno zerado. Banco pronto para receber novos alunos.");
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
