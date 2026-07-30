// Dois arquivos separados (não um só) — mesmo motivo do academy (src/plugins/academy/blocks/
// index.ts): definitions.ts é dado puro (sem tocar em handler/query), renderers.ts importa o
// componente de render (que puxa o handler -> query -> @/infrastructure/database/client). Testes
// que só precisam do schema importam definitions.ts direto, sem arrastar banco pro ambiente de
// teste.
export { blockDefinitions } from "./definitions";
export { blockRenderers } from "./renderers";
