// Dois arquivos separados (não um só) — definitions.ts é dado puro (sem tocar em handler/auth),
// renderers.ts importa os componentes de render (que puxam handler -> @/contexts/auth ->
// next-auth). Testes que só precisam de blockDefinitions importam definitions.ts direto, sem
// arrastar a cadeia de auth pro ambiente de teste (mesmo motivo do mock em block-registry.test.ts).
export { blockDefinitions } from "./definitions";
export { blockRenderers } from "./renderers";
