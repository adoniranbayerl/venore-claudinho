import { describe, expect, it, vi } from "vitest";
import { blockDefinitions as academyBlockDefinitions } from "@/plugins/academy/blocks/definitions";
import { blockDefinitions as birthdaysBlockDefinitions } from "@/plugins/birthdays/blocks/definitions";
import { blockDefinitions as donationsBlockDefinitions } from "@/plugins/donations/blocks/definitions";

// block-registry.ts importa o barrel público de academy/birthdays/donations pra somar os blocos de
// cada plugin; esses barrels reexportam handlers que puxam next-auth (não resolve nesse ambiente
// de teste). Mocka só a superfície usada aqui (blockDefinitions), reaproveitando as definitions
// reais de cada plugin — pure data, sem tocar em handler/store.
vi.mock("@/plugins/academy", () => ({ blockDefinitions: academyBlockDefinitions }));
vi.mock("@/plugins/birthdays", () => ({ blockDefinitions: birthdaysBlockDefinitions }));
vi.mock("@/plugins/donations", () => ({ blockDefinitions: donationsBlockDefinitions }));

const { listBlockDefinitions } = await import("./block-registry");

// Guarda de regressão: BlockDefinition atravessa o boundary RSC como prop de client component
// (builder), então precisa ser dado puro e serializável — nenhuma função, Date, Map, Set ou
// componente escondido dentro. Isso transforma esse tipo de erro (só visível em runtime, no
// builder) em falha de teste.
describe("listBlockDefinitions", () => {
  it("returns only JSON-serializable definitions", () => {
    for (const definition of listBlockDefinitions()) {
      const roundTripped = JSON.parse(JSON.stringify(definition));
      expect(roundTripped).toEqual(definition);
    }
  });
});
