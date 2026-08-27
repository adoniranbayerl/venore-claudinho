import { seedEnrollmentDashboardExample } from "@/plugins/enrollment-dashboard/seeds/example";

// Wrapper fino (mesmo espírito de scripts/bootstrap-superadmin.ts) em cima do seed do plugin —
// o conteúdo agora vive em src/plugins/enrollment-dashboard/seeds/example.ts, que também é
// disparado por /admin/plugins (platform/plugin-engine/plugin-seed-registry.ts). Idempotente:
// depois da primeira execução, os dados reais são editados via /admin/enrollment-dashboard.
async function main() {
  const result = await seedEnrollmentDashboardExample();
  if (!result.success) {
    console.error(`Falha ao popular o dashboard de matrícula: ${result.error.message}`);
    process.exit(1);
  }
  console.log("Dashboard de matrícula populado (ou já estava populado).");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
