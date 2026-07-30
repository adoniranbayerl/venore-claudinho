import { beforeEach, describe, expect, it, vi } from "vitest";
import { staticBreadcrumbSegment, dynamicBreadcrumbSegment } from "./define-segment";
import { BREADCRUMB_PATHNAME_HEADER } from "./pathname-header";
import type { BreadcrumbSegmentDefinition } from "./types";

let mockPathname: string | null = "/admin/cms";
let mockHost = "app.test";

vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve(
      new Headers({
        ...(mockPathname !== null ? { [BREADCRUMB_PATHNAME_HEADER]: mockPathname } : {}),
        host: mockHost,
        "x-forwarded-proto": "https",
      }),
    ),
}));

let testDefinitions: BreadcrumbSegmentDefinition[] = [];
vi.mock("./registry", () => ({
  collectBreadcrumbSegments: () => Promise.resolve(testDefinitions),
}));

const HOME = staticBreadcrumbSegment({ key: "home", segments: [], label: "Início", href: "/" });
const ADMIN = staticBreadcrumbSegment({ key: "admin", segments: ["admin"], label: "Dashboard" });
const ADMIN_CMS = staticBreadcrumbSegment({ key: "admin.cms", segments: ["admin", "cms"], label: "CMS" });

beforeEach(() => {
  mockPathname = "/admin/cms";
  mockHost = "app.test";
  testDefinitions = [];
  vi.restoreAllMocks();
});

describe("resolveBreadcrumbs — rota estática", () => {
  it("resolve rótulo e href pra cada nível sem I/O, e marca só o último como atual", async () => {
    testDefinitions = [HOME, ADMIN, ADMIN_CMS];

    const { resolveBreadcrumbs } = await import("./resolve-breadcrumbs");
    const { items } = await resolveBreadcrumbs();

    expect(items).toEqual([
      { key: "home", label: "Início", href: "/", current: false },
      { key: "admin", label: "Dashboard", href: "/admin", current: false },
      { key: "admin.cms", label: "CMS", href: null, current: true },
    ]);
  });
});

describe("resolveBreadcrumbs — rota com segmento dinâmico", () => {
  it("resolve o rótulo pela função declarada junto do segmento, com o parâmetro certo", async () => {
    mockPathname = "/admin/cms/entries/entry-42";
    const resolveLabel = vi.fn(async (id: string) => `Entry ${id}`);
    testDefinitions = [
      HOME,
      ADMIN,
      ADMIN_CMS,
      staticBreadcrumbSegment({ key: "admin.cms.entries", segments: ["admin", "cms", "entries"], label: "Conteúdos" }),
      dynamicBreadcrumbSegment({
        key: "admin.cms.entry",
        segments: ["admin", "cms", "entries", ":id"],
        paramName: "id",
        resolveLabel,
      }),
    ];

    const { resolveBreadcrumbs } = await import("./resolve-breadcrumbs");
    const { items } = await resolveBreadcrumbs();

    expect(resolveLabel).toHaveBeenCalledWith("entry-42");
    const last = items.at(-1);
    // href vem null porque é o item atual (nunca é link, mesmo tendo página própria) — a URL real
    // que o resolver calculou aparece no JSON-LD, não aqui.
    expect(last).toEqual({ key: "admin.cms.entry", label: "Entry entry-42", href: null, current: true });
  });
});

describe("resolveBreadcrumbs — segmento sem rótulo registrado", () => {
  it("omite o segmento da trilha (não vira texto cru) e não quebra os vizinhos", async () => {
    mockPathname = "/admin/cms/entries/missing-id";
    testDefinitions = [
      HOME,
      ADMIN,
      ADMIN_CMS,
      staticBreadcrumbSegment({ key: "admin.cms.entries", segments: ["admin", "cms", "entries"], label: "Conteúdos" }),
      dynamicBreadcrumbSegment({
        key: "admin.cms.entry",
        segments: ["admin", "cms", "entries", ":id"],
        paramName: "id",
        resolveLabel: async () => null, // entidade não encontrada
      }),
    ];
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { resolveBreadcrumbs } = await import("./resolve-breadcrumbs");
    const { items } = await resolveBreadcrumbs();

    expect(items.map((item) => item.key)).toEqual(["home", "admin", "admin.cms", "admin.cms.entries"]);
    expect(items.some((item) => item.label.includes("missing-id"))).toBe(false);
    // "Conteúdos" vira o item atual (último que resolveu), não o segmento sem rótulo.
    expect(items.at(-1)).toMatchObject({ key: "admin.cms.entries", current: true });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("admin.cms.entry"));
  });

  it("sem nenhum segmento casando (pathname totalmente fora do registro), devolve trilha vazia sem lançar", async () => {
    mockPathname = "/rota-desconhecida";
    testDefinitions = [];

    const { resolveBreadcrumbs } = await import("./resolve-breadcrumbs");
    const { items, jsonLd } = await resolveBreadcrumbs();

    expect(items).toEqual([]);
    expect(jsonLd).toBeNull();
  });
});

describe("resolveBreadcrumbs — eficiência: resolução em lote, nunca em cascata", () => {
  it("dispara os resolvers de TODOS os segmentos dinâmicos antes de esperar qualquer um terminar", async () => {
    mockPathname = "/admin/academy/courses/course-1/lessons/lesson-1";
    const log: string[] = [];
    let releaseA: () => void = () => {};
    let releaseB: () => void = () => {};
    const gateA = new Promise<void>((resolve) => {
      releaseA = resolve;
    });
    const gateB = new Promise<void>((resolve) => {
      releaseB = resolve;
    });

    testDefinitions = [
      HOME,
      staticBreadcrumbSegment({ key: "admin.academy", segments: ["admin", "academy"], label: "Academy" }),
      staticBreadcrumbSegment({ key: "admin.academy.courses", segments: ["admin", "academy", "courses"], label: "Cursos" }),
      dynamicBreadcrumbSegment({
        key: "admin.academy.course",
        segments: ["admin", "academy", "courses", ":courseId"],
        paramName: "courseId",
        resolveLabel: async (id) => {
          log.push("A-start");
          await gateA;
          log.push("A-end");
          return `Curso ${id}`;
        },
      }),
      staticBreadcrumbSegment({
        key: "admin.academy.course.lessons",
        segments: ["admin", "academy", "courses", ":courseId", "lessons"],
        label: "Aulas",
      }),
      dynamicBreadcrumbSegment({
        key: "admin.academy.lesson",
        segments: ["admin", "academy", "courses", ":courseId", "lessons", ":lessonId"],
        paramName: "lessonId",
        resolveLabel: async (id) => {
          log.push("B-start");
          await gateB;
          log.push("B-end");
          return `Aula ${id}`;
        },
      }),
    ];

    const { resolveBreadcrumbs } = await import("./resolve-breadcrumbs");
    const pending = resolveBreadcrumbs();

    // Flush de microtasks/macrotasks sem liberar os "gates" — se a resolução fosse em cascata
    // (um `for` com `await` sequencial em vez de Promise.all), o resolver de B só seria invocado
    // DEPOIS de A terminar, e "B-start" não estaria no log ainda neste ponto.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(log).toEqual(["A-start", "B-start"]);

    releaseA();
    releaseB();
    const { items } = await pending;

    expect(items.map((item) => item.label)).toEqual(["Início", "Academy", "Cursos", "Curso course-1", "Aulas", "Aula lesson-1"]);
  });
});
