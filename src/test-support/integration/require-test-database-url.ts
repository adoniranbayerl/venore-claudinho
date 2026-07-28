// Guarda única, reaproveitada por global-setup.ts (migrations) e setup-env.ts (troca de
// DATABASE_URL dentro do processo de teste) — os testes de integração nunca reaproveitam
// DATABASE_URL (AGENTS.md, seção "Testes: unitário vs integração").
export function requireTestDatabaseUrl(): string {
  const value = process.env.TEST_DATABASE_URL;
  if (!value) {
    throw new Error(
      "TEST_DATABASE_URL não está definida. npm run test:integration precisa de um Postgres " +
        "descartável próprio e nunca reaproveita DATABASE_URL — defina TEST_DATABASE_URL " +
        "apontando para um banco de teste antes de rodar esta suíte.",
    );
  }
  return value;
}
