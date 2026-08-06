// Único jeito confiável de saber se a rota atual tem conteúdo contextual de verdade. O prop
// `sidebarContextual` que (platform)/layout.tsx recebe do slot paralelo @sidebarContextual NUNCA
// é o `null` literal do JS, mesmo quando o page.tsx/default.tsx que casou devolve null — é sempre
// uma referência de elemento React (confirmado: /admin, sem nenhuma rota própria dentro de
// @sidebarContextual, ainda chegava com `sidebarContextual !== null`) — comparar contra null
// nunca funciona. E mesmo se funcionasse pra carga inicial, o slot é vulnerável ao mesmo problema
// que motivou RouteChangeRefresher (breadcrumbs/route-change-refresher.tsx): App Router não
// re-renderiza um layout persistido em navegação client-side entre rotas que o compartilham, só a
// página filha — o slot contextual pode ficar preso no conteúdo da rota anterior (ex: trilha de
// aula vazando pra qualquer outra página) até algo forçar um refresh.
//
// A saída: decidir por padrão de rota, a partir do pathname (mesmo header que resolve-
// breadcrumbs.ts já lê, atualizado a cada navegação pelo mesmo RouteChangeRefresher) — nunca
// pelo valor do prop em si. Cada padrão aqui corresponde 1:1 a uma pasta com page.tsx dentro de
// app/(platform)/@sidebarContextual/ — ao adicionar uma rota de contextual nova, registrar o
// padrão aqui também.
const SIDEBAR_CONTEXTUAL_ROUTE_PATTERNS: RegExp[] = [
  // app/(platform)/@sidebarContextual/academy/[courseSlug]/[lessonId]/page.tsx — único slot real
  // hoje. Contagem de segmentos já exclui /academy/[courseSlug] (2) e /academy/messages (2) sem
  // precisar de caso especial pra "messages".
  /^\/academy\/[^/]+\/[^/]+$/,
];

// Gap conhecido: a página real (LessonTrailSlot) ainda pode devolver null mesmo quando o pathname
// bate aqui — ex. amostra grátis (aluno não matriculado vendo uma aula pública avulsa), onde não
// existe trilha pra mostrar. Nesse caso o aside reserva espaço vazio por uma aula específica; é um
// gap bem mais raro e contido que o bug que isso substitui (reserva em TODA página do site), então
// aceito por ora — resolver de verdade exigiria duplicar a checagem de acesso
// (getAcademyCourseAccess) aqui só pra decidir layout, o que não vale o custo/risco de divergência.
export function hasSidebarContextualContent(pathname: string | null): boolean {
  if (!pathname) return false;
  return SIDEBAR_CONTEXTUAL_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}
