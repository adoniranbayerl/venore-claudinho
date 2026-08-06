import { describe, expect, it } from "vitest";
import { matchSegments } from "./match-segments";
import { staticBreadcrumbSegment, dynamicBreadcrumbSegment } from "./define-segment";

const definitions = [
  staticBreadcrumbSegment({ key: "home", segments: [], label: "Início", href: "/" }),
  staticBreadcrumbSegment({ key: "admin", segments: ["admin"], label: "Dashboard" }),
  staticBreadcrumbSegment({ key: "admin.cms", segments: ["admin", "cms"], label: "CMS" }),
  dynamicBreadcrumbSegment({
    key: "admin.cms.entry",
    segments: ["admin", "cms", "entries", ":id"],
    paramName: "id",
    resolveLabel: async (id) => `Entry ${id}`,
  }),
  // "admin/plugins" propositalmente NÃO registrado — usado pra provar que um nível sem dono não
  // interrompe o casamento dos níveis seguintes.
];

describe("matchSegments", () => {
  it("casa uma rota estática nível a nível, sempre prefixado pela raiz", () => {
    const matches = matchSegments(["admin", "cms"], definitions);

    expect(matches.map((m) => m.definition.key)).toEqual(["home", "admin", "admin.cms"]);
  });

  it("casa um segmento dinâmico e extrai o parâmetro pelo nome declarado", () => {
    const matches = matchSegments(["admin", "cms", "entries", "abc-123"], definitions);

    const entryMatch = matches.find((m) => m.definition.key === "admin.cms.entry");
    expect(entryMatch).toBeDefined();
    expect(entryMatch?.params).toEqual({ id: "abc-123" });
  });

  it("pula nível sem registro sem quebrar o casamento dos níveis seguintes", () => {
    // "admin/plugins/foo" não existe no registro nenhum nível, mas "admin" (nível 1) e "admin/cms"
    // não deveriam ser afetados por isso — aqui simulamos um nível 2 ausente ("plugins") seguido
    // de nada mais: só "home" e "admin" devem casar, sem lançar nem incluir algo pra "plugins".
    const matches = matchSegments(["admin", "plugins"], definitions);

    expect(matches.map((m) => m.definition.key)).toEqual(["home", "admin"]);
  });

  it("raiz sempre entra primeiro, mesmo em rota profunda", () => {
    const matches = matchSegments(["admin", "cms", "entries", "abc-123"], definitions);
    expect(matches[0]?.definition.key).toBe("home");
  });

  it("sem entrada de raiz registrada, não inventa uma", () => {
    const withoutRoot = definitions.filter((d) => d.key !== "home");
    const matches = matchSegments(["admin"], withoutRoot);
    expect(matches.map((m) => m.definition.key)).toEqual(["admin"]);
  });

  // Bug real: um wildcard de rota pública (ex: cms ":slug") registrado ANTES de rotas literais
  // (ex: "academy", "birthdays") no array concatenado (registry.ts) não pode "roubar" o nível —
  // literal sempre ganha, não importa a ordem de registro.
  it("prefere um segmento literal a um wildcard no mesmo nível, mesmo quando o wildcard vem primeiro no array", () => {
    const withWildcardFirst = [
      dynamicBreadcrumbSegment({ key: "cms.public.slug", segments: [":slug"], paramName: "slug", resolveLabel: async () => "Página" }),
      staticBreadcrumbSegment({ key: "academy.public.list", segments: ["academy"], label: "Academy" }),
    ];

    const matches = matchSegments(["academy"], withWildcardFirst);

    expect(matches.map((m) => m.definition.key)).toEqual(["academy.public.list"]);
  });
});
