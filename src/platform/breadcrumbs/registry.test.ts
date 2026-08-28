import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BreadcrumbSegmentDefinition } from "./types";

function seg(key: string, segments: string[]): BreadcrumbSegmentDefinition {
  return { key, segments, resolve: () => null };
}

const getActivePluginKeys = vi.fn<() => Promise<Set<string>>>();
vi.mock("@/platform/plugin-engine/get-active-plugin-keys", () => ({
  getActivePluginKeys: () => getActivePluginKeys(),
}));

// Os barrels de context/plugin reexportam superfície que puxa next-auth neste ambiente — o teste
// só se importa com a agregação/filtro, então cada fonte vira um stub de segmentos.
vi.mock("./platform-static-segments", () => ({ platformBreadcrumbSegments: [seg("platform.admin", ["admin"])] }));
vi.mock("@/contexts/cms", () => ({ cmsBreadcrumbSegments: [seg("cms.entries", ["admin", "cms", "entries"])] }));
vi.mock("@/contexts/rbac", () => ({ rbacBreadcrumbSegments: [] }));
vi.mock("@/contexts/media", () => ({ mediaBreadcrumbSegments: [] }));
vi.mock("@/contexts/settings", () => ({ settingsBreadcrumbSegments: [] }));
vi.mock("@/contexts/themes", () => ({ themesBreadcrumbSegments: [] }));
vi.mock("@/observability", () => ({ observabilityBreadcrumbSegments: [] }));
vi.mock("@/plugins/academy", () => ({ academyBreadcrumbSegments: [seg("academy.public.list", ["academy"])] }));
vi.mock("@/plugins/birthdays", () => ({ birthdaysBreadcrumbSegments: [seg("birthdays.public", ["aniversariantes"])] }));
vi.mock("@/plugins/donations", () => ({ donationsBreadcrumbSegments: [seg("donations.public", ["donations"])] }));

const { collectBreadcrumbSegments } = await import("./registry");

describe("collectBreadcrumbSegments — filtro por plugin ativo", () => {
  beforeEach(() => {
    getActivePluginKeys.mockReset();
  });

  it("inclui só os segmentos dos plugins ativos; core entra sempre", async () => {
    getActivePluginKeys.mockResolvedValue(new Set(["academy"]));

    const keys = (await collectBreadcrumbSegments()).map((s) => s.key);

    expect(keys).toContain("platform.admin"); // core
    expect(keys).toContain("cms.entries"); // core
    expect(keys).toContain("academy.public.list"); // plugin ativo
    expect(keys).not.toContain("birthdays.public");
    expect(keys).not.toContain("donations.public");
  });

  it("nenhum plugin ativo => nenhum segmento de plugin na trilha", async () => {
    getActivePluginKeys.mockResolvedValue(new Set());

    const keys = (await collectBreadcrumbSegments()).map((s) => s.key);

    expect(keys).toEqual(["platform.admin", "cms.entries"]);
  });
});
