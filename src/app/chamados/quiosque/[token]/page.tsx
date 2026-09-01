// Shim de reexport (§4 de docs/chamados-plugin.md, exceção do AGENTS.md §1.1 — mesmo padrão de
// src/app/broadcast/out/[token]). A página do quiosque precisa escapar da shell do (platform)
// (sem header/nav/footer); `src/app/chamados/` é um NAMESPACE de URL, não o nome do plugin
// (helpdesk ≠ chamados). Toda a lógica mora no plugin.
//
// `dynamic` é declarado aqui direto (não reexportado) porque route segment config só é lido de
// export direto no arquivo de rota dentro de app/ (AGENTS.md §1.1).
export const dynamic = "force-dynamic";
export { default } from "@/plugins/helpdesk/routes/kiosk/page";
