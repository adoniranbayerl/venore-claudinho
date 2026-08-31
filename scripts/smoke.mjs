// Smoke test: bate em algumas rotas do app RODANDO e falha se alguma responder 5xx (ou não
// responder). Não substitui teste de unidade — pega a classe de bug que só aparece com o servidor
// de pé (ex: `ERR_REQUIRE_ESM` do jsdom, que passou no build e quebrou em runtime).
//
// Uso:
//   BASE_URL=http://localhost:3000 node scripts/smoke.mjs
//   node scripts/smoke.mjs https://seu-dominio.com

const base = (process.argv[2] || process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

// Rotas que funcionam sem sessão e sem dados semeados. Redirect (3xx) conta como OK — ex.:
// /academy manda o anônimo pro login.
const ROUTES = ["/", "/cursos", "/login", "/setup", "/academy", "/api/auth/providers"];

let failed = 0;

for (const path of ROUTES) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, { redirect: "manual", headers: { "user-agent": "smoke-test" } });
    const ok = res.status < 500;
    console.log(`${ok ? "OK  " : "FAIL"} ${res.status}  ${path}`);
    if (!ok) failed += 1;
  } catch (error) {
    console.log(`FAIL  ERR   ${path}  — ${error.message}`);
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`\n${failed} rota(s) com falha.`);
  process.exit(1);
}
console.log(`\n${ROUTES.length} rotas OK.`);
