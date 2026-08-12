import { describe, expect, it } from "vitest";
import { matchPluginRoutes, matchRoutePattern } from "./match-route";

describe("matchRoutePattern", () => {
  it("casa padrão vazio só com segments vazio (raiz do plugin)", () => {
    expect(matchRoutePattern("", [])).toEqual({});
    expect(matchRoutePattern("", ["extra"])).toBeNull();
  });

  it("casa segmentos literais exatamente", () => {
    expect(matchRoutePattern("messages", ["messages"])).toEqual({});
    expect(matchRoutePattern("messages", ["outra-coisa"])).toBeNull();
  });

  it("captura :param e decodifica URI", () => {
    expect(matchRoutePattern("courses/:id", ["courses", "abc-123"])).toEqual({ id: "abc-123" });
    expect(matchRoutePattern("courses/:id", ["courses", "espa%C3%A7o"])).toEqual({ id: "espaço" });
  });

  it("casa múltiplos :param em segmentos aninhados", () => {
    expect(matchRoutePattern("courses/:id/enrolled/:studentActorId", ["courses", "c1", "enrolled", "s1"])).toEqual({
      id: "c1",
      studentActorId: "s1",
    });
  });

  it("rejeita quando o número de segmentos difere", () => {
    expect(matchRoutePattern("courses/:id", ["courses"])).toBeNull();
    expect(matchRoutePattern("courses/:id", ["courses", "c1", "extra"])).toBeNull();
  });
});

describe("matchPluginRoutes", () => {
  const routes = [
    { pattern: "", label: "root" },
    { pattern: "messages", label: "messages" },
    { pattern: "courses/:id", label: "course" },
    { pattern: "courses/:id/enrolled", label: "enrolled" },
  ];

  it("retorna a primeira rota que casa, com os params extraídos", () => {
    expect(matchPluginRoutes(routes, ["courses", "c1"])).toEqual({ route: routes[2], params: { id: "c1" } });
  });

  it("retorna null quando nenhuma rota casa", () => {
    expect(matchPluginRoutes(routes, ["not-a-real-route"])).toBeNull();
  });

  it("casa a rota raiz com segments vazio", () => {
    expect(matchPluginRoutes(routes, [])).toEqual({ route: routes[0], params: {} });
  });
});
