import { beforeEach, describe, expect, it, vi } from "vitest";

const resolveManageableSectors = vi.fn();
vi.mock("../../../shared/scoped-authorization", () => ({
  resolveManageableSectors: (...args: unknown[]) => resolveManageableSectors(...args),
}));

const listSectors = vi.fn();
vi.mock("./service", () => ({
  listSectors: (...args: unknown[]) => listSectors(...args),
}));

describe("listSectorsHandler", () => {
  beforeEach(() => {
    resolveManageableSectors.mockReset();
    listSectors.mockReset();
    listSectors.mockResolvedValue({ success: true, data: [] });
  });

  it("403s when the actor has no plugin permission", async () => {
    resolveManageableSectors.mockResolvedValue({ scope: "none" });

    const { listSectorsHandler } = await import("./handler");
    const result = await listSectorsHandler();

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.list-sectors.forbidden");
    expect(listSectors).not.toHaveBeenCalled();
  });

  it("does not pass allowedSectorIds for a full manager", async () => {
    resolveManageableSectors.mockResolvedValue({ scope: "all" });

    const { listSectorsHandler } = await import("./handler");
    await listSectorsHandler({ includeArchived: true });

    expect(listSectors).toHaveBeenCalledWith({ includeArchived: true, allowedSectorIds: undefined });
  });

  it("passes the assigned sector ids for a contributor", async () => {
    resolveManageableSectors.mockResolvedValue({ scope: "scoped", sectorIds: ["s1"] });

    const { listSectorsHandler } = await import("./handler");
    await listSectorsHandler();

    expect(listSectors).toHaveBeenCalledWith({ includeArchived: undefined, allowedSectorIds: ["s1"] });
  });
});
