// Dois arquivos separados (não um só) — mesmo motivo do birthdays (src/plugins/birthdays/blocks/
// index.ts): definitions.ts é dado puro (sem tocar em handler/settings), renderers.ts importa o
// componente de render (que puxa handler -> contexts/settings -> qrcode). Testes que só precisam
// do schema importam definitions.ts direto, sem arrastar essa cadeia pro ambiente de teste.
export { blockDefinitions } from "./definitions";
export { blockRenderers } from "./renderers";
