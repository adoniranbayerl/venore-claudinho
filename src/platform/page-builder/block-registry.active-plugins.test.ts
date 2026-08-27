import { describe, expect, it, vi } from "vitest";
import { blockDefinitions as academyBlockDefinitions } from "@/plugins/academy/blocks/definitions";
import { blockDefinitions as birthdaysBlockDefinitions } from "@/plugins/birthdays/blocks/definitions";
import { blockDefinitions as donationsBlockDefinitions } from "@/plugins/donations/blocks/definitions";

// Mesmo motivo de block-registry.test.ts: o barrel público de cada plugin reexporta handlers que
// puxam next-auth (não resolve neste ambiente). Mocka só a superfície usada (blockDefinitions).
vi.mock("@/plugins/academy", () => ({ blockDefinitions: academyBlockDefinitions }));
vi.mock("@/plugins/birthdays", () => ({ blockDefinitions: birthdaysBlockDefinitions }));
vi.mock("@/plugins/donations", () => ({ blockDefinitions: donationsBlockDefinitions }));

const { listBlockDefinitions, pluginKeyForBlockKey } = await import("./block-registry");

const DONATIONS_BLOCK_KEYS = ["donations.pix-widget", "donations.pix-teaser"];

function allAllowedBlockKeys(definitions: { areaDefinitions?: { allowedBlockKeys: string[] }[] }[]): string[] {
  return definitions.flatMap((definition) => definition.areaDefinitions?.flatMap((area) => area.allowedBlockKeys) ?? []);
}

describe("listBlockDefinitions — filtro por plugin ativo", () => {
  it("sem activePluginKeys devolve todo bloco instalado (paridade com o comportamento antigo)", () => {
    const keys = listBlockDefinitions().map((definition) => definition.key);
    for (const donationsKey of DONATIONS_BLOCK_KEYS) {
      expect(keys).toContain(donationsKey);
    }
  });

  it("um plugin fora do set não contribui bloco — nem no palette, nem como opção de área aninhada", () => {
    const active = new Set(["academy", "birthdays"]); // donations desativado

    const definitions = listBlockDefinitions(active);
    const keys = definitions.map((definition) => definition.key);

    for (const donationsKey of DONATIONS_BLOCK_KEYS) {
      expect(keys).not.toContain(donationsKey);
    }
    // academy/birthdays seguem contribuindo
    expect(keys).toContain("birthdays.month.list");
    expect(keys.some((key) => key.startsWith("academy."))).toBe(true);

    // nenhuma área aninhada (row/section/accordion-item/tabs-item) ainda oferece um bloco de
    // donations como destino de drop
    expect(allAllowedBlockKeys(definitions).filter((key) => key.startsWith("donations."))).toEqual([]);
  });

  it("com todos os plugins ativos o resultado é igual ao sem filtro", () => {
    const active = new Set(["academy", "birthdays", "donations"]);
    expect(listBlockDefinitions(active).map((d) => d.key).sort()).toEqual(
      listBlockDefinitions().map((d) => d.key).sort(),
    );
  });
});

describe("pluginKeyForBlockKey", () => {
  it("resolve a plugin key dona de uma block key contribuída por plugin", () => {
    expect(pluginKeyForBlockKey("donations.pix-widget")).toBe("donations");
    expect(pluginKeyForBlockKey("birthdays.month.list")).toBe("birthdays");
  });

  it("devolve null pra bloco de core", () => {
    expect(pluginKeyForBlockKey("core.content.heading")).toBeNull();
    expect(pluginKeyForBlockKey("core.layout.row")).toBeNull();
  });
});
