import { beforeEach, describe, expect, it, vi } from "vitest";

const findActiveSectors = vi.fn();
vi.mock("./store", () => ({
  findActiveSectors: (...a: unknown[]) => findActiveSectors(...a),
}));

const getTargetRollups = vi.fn();
vi.mock("../../targets/get-target-rollups/service", () => ({
  getTargetRollups: (...a: unknown[]) => getTargetRollups(...a),
}));

function rollup(status: "met" | "on_track" | "below", completion: number) {
  return { rollup: { status, completion }, lines: [], target: {} };
}

describe("getMetricsOverview", () => {
  beforeEach(() => {
    findActiveSectors.mockReset();
    getTargetRollups.mockReset();
  });

  it("summarizes status counts and average completion per sector", async () => {
    findActiveSectors.mockResolvedValue([{ id: "s1", name: "Comercial" }]);
    getTargetRollups.mockResolvedValue({
      success: true,
      data: [rollup("met", 1), rollup("below", 0.5), rollup("below", 0.7)],
    });

    const { getMetricsOverview } = await import("./service");
    const result = await getMetricsOverview({});

    expect(result.success).toBe(true);
    if (!result.success) return;
    const overview = result.data.sectors[0];
    expect(overview.targetCount).toBe(3);
    expect(overview.statusCounts).toEqual({ met: 1, on_track: 0, below: 2 });
    expect(overview.averageCompletion).toBeCloseTo((1 + 0.5 + 0.7) / 3, 5);
  });

  it("reports null average completion for a sector with no targets", async () => {
    findActiveSectors.mockResolvedValue([{ id: "s2", name: "RH" }]);
    getTargetRollups.mockResolvedValue({ success: true, data: [] });

    const { getMetricsOverview } = await import("./service");
    const result = await getMetricsOverview({});

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.sectors[0].averageCompletion).toBeNull();
  });
});
