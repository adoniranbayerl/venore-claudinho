import { sql } from "drizzle-orm";
import { beforeEach } from "vitest";
import { requireTestDatabaseUrl } from "./require-test-database-url";

// Precisa rodar ANTES de qualquer import estático de @/infrastructure/database/client (que abre
// o Pool no top-level do módulo, lendo DATABASE_URL na hora do import) — setupFiles do Vitest
// terminam de executar antes do arquivo de teste ser importado, então esta atribuição sempre
// vence a corrida. Ver AGENTS.md, seção "Testes de integração".
process.env.DATABASE_URL = requireTestDatabaseUrl();

// Tabelas tocadas pelos seed helpers (academy-seed.ts) e pelos use cases sob teste. TRUNCATE ...
// CASCADE em vez de transação com rollback: vários stores (ex: reorder-lessons, delete-lesson)
// abrem sua própria db.transaction() pegando uma conexão nova do pool de app — uma transação
// externa não commitada não seria visível pra essas conexões internas. TRUNCATE não tem esse
// problema e não exige nenhuma mudança em client.ts.
const INTEGRATION_TEST_TABLES = [
  "academy.quiz_attempts",
  "academy.lesson_video_completions",
  "academy.lesson_text_completions",
  "academy.quiz_questions",
  "academy.lesson_requirements",
  "academy.enrollments",
  "academy.lessons",
  "academy.courses",
  "birthdays.birthdays",
  "cms.entries",
  "cms.content_types",
  "auth.users",
];

beforeEach(async () => {
  // Import dinâmico de propósito: um import estático seria hoisted e avaliado antes da
  // atribuição de DATABASE_URL acima, no mesmo módulo.
  const { db } = await import("@/infrastructure/database/client");
  await db.execute(sql.raw(`TRUNCATE TABLE ${INTEGRATION_TEST_TABLES.join(", ")} CASCADE`));
});
