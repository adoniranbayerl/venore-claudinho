// Shim de reexport — a página de TV de Métricas Internas vive fora da shell do (platform)
// (sem header/nav/footer), acesso só por token. Toda a lógica está no plugin; aqui só o
// posicionamento físico que o Next.js exige. Route segment config precisa ser export direto
// neste arquivo (não vem por reexport).
export const dynamic = "force-dynamic";
export { default } from "@/plugins/company-metrics/routes/tv/page";
