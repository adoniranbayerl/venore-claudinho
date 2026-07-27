import { describe, expect, it, vi } from "vitest";
import { blockDefinitions as academyBlockDefinitions } from "@/plugins/academy/blocks/definitions";
import { blockRenderers as academyBlockRenderers } from "@/plugins/academy/blocks/renderers";

// vitest resolve sem a condition "react-server" do Next — sem isso, o guard de server-only.ts
// lança ao ser importado. Mock vazio só neste arquivo, sem mexer na condition global do vitest.
vi.mock("server-only", () => ({}));

// renderers.ts importa os componentes de bloco academy, que importam handler -> @/contexts/auth
// -> next-auth (não resolve neste ambiente de teste, mesmo motivo do mock de "@/plugins/academy"
// em block-registry.test.ts). getCurrentUser nunca chega a ser chamado aqui — só o import
// precisa resolver pra montar o Record de renderers.
vi.mock("@/contexts/auth", () => ({
  getCurrentUser: async () => ({ success: false, error: { code: "test.unauthenticated", message: "mock" } }),
}));

// Mocka só a superfície do barrel usada por block-registry.ts/block-renderers.tsx, reaproveitando
// as definitions/renderers reais do plugin (não os handlers com next-auth do barrel completo).
vi.mock("@/plugins/academy", () => ({
  blockDefinitions: academyBlockDefinitions,
  blockRenderers: academyBlockRenderers,
}));

const { listBlockDefinitions } = await import("./block-registry");
const { listBlockRendererKeys, resolveBlockRenderer } = await import("./block-renderers");

// Guarda de regressão: "adicionei bloco e esqueci o render" (ou vice-versa) vira falha de teste
// em vez de bug só visível em runtime.
describe("paridade entre block-registry e block-renderers", () => {
  it("toda key com definition tem um renderer resolvível", () => {
    for (const definition of listBlockDefinitions()) {
      expect(resolveBlockRenderer(definition.key), `sem renderer pra key "${definition.key}"`).not.toBeNull();
    }
  });

  it("toda key com renderer registrado tem uma definition correspondente", () => {
    const definitionKeys = new Set(listBlockDefinitions().map((definition) => definition.key));
    for (const key of listBlockRendererKeys()) {
      expect(definitionKeys.has(key), `sem definition pra renderer "${key}"`).toBe(true);
    }
  });
});
