import { beforeEach, describe, expect, it, vi } from "vitest";

const findSectorById = vi.fn();
const findActiveDefinitions = vi.fn();
const findValuesSince = vi.fn();
vi.mock("./store", () => ({
  findSectorById: (...a: unknown[]) => findSectorById(...a),
  findActiveDefinitions: (...a: unknown[]) => findActiveDefinitions(...a),
  findValuesSince: (...a: unknown[]) => findValuesSince(...a),
  findLastValueUpdate: async () => null,
}));

const getTargetRollups = vi.fn();
vi.mock("../../targets/get-target-rollups/service", () => ({
  getTargetRollups: (...a: unknown[]) => getTargetRollups(...a),
}));

describe("getSectorDashboard", () => {
  beforeEach(() => {
    findSectorById.mockReset().mockResolvedValue({ id: "s1", name: "Comercial" });
    findActiveDefinitions.mockReset().mockResolvedValue([
      { id: "d1", label: "Leads", unit: "count", direction: "up_good", granularity: "monthly" },
    ]);
    findValuesSince.mockReset().mockResolvedValue([
      { definitionId: "d1", periodStart: "2026-06-01", value: 10 },
      { definitionId: "d1", periodStart: "2026-07-01", value: 14 },
    ]);
    getTargetRollups.mockReset().mockResolvedValue({ success: true, data: [] });
  });

  it("fails for an unknown sector", async () => {
    findSectorById.mockResolvedValue(null);
    const { getSectorDashboard } = await import("./service");
    const result = await getSectorDashboard({ sectorId: "x" });
    expect(result.success).toBe(false);
  });

  it("clamps windowMonths to an allowed value and queries values since the right date", async () => {
    const { getSectorDashboard } = await import("./service");
    const result = await getSectorDashboard({
      sectorId: "s1",
      windowMonths: 99,
      timeZone: "UTC",
      now: new Date("2026-08-15T12:00:00Z"),
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.windowMonths).toBe(6);
    // 6 months before 2026-08-15 -> 2026-02-15
    expect(findValuesSince).toHaveBeenCalledWith(["d1"], "2026-02-15");
  });

  it("groups value points per definition", async () => {
    const { getSectorDashboard } = await import("./service");
    const result = await getSectorDashboard({ sectorId: "s1", windowMonths: 6, timeZone: "UTC", now: new Date("2026-08-15T12:00:00Z") });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.metrics[0].points).toEqual([
      { periodStart: "2026-06-01", value: 10 },
      { periodStart: "2026-07-01", value: 14 },
    ]);
  });
});
