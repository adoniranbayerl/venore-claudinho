import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/contexts/settings", () => ({ getSetting: vi.fn(async () => ({ success: true, data: { value: "UTC" } })) }));

const findBoardByToken = vi.fn();
const findScreensForBoards = vi.fn();
vi.mock("../shared/store", () => ({
  findBoardByToken: (...a: unknown[]) => findBoardByToken(...a),
  findScreensForBoards: (...a: unknown[]) => findScreensForBoards(...a),
}));

const findTargetById = vi.fn();
const findSectorById = vi.fn();
const findDefinitionUnit = vi.fn();
vi.mock("./store", () => ({
  findTargetById: (...a: unknown[]) => findTargetById(...a),
  findSectorById: (...a: unknown[]) => findSectorById(...a),
  findDefinitionUnit: (...a: unknown[]) => findDefinitionUnit(...a),
}));

const getMetricsOverview = vi.fn();
const getSectorDashboard = vi.fn();
const getTargetRollups = vi.fn();
vi.mock("../../dashboard/get-metrics-overview/service", () => ({ getMetricsOverview: (...a: unknown[]) => getMetricsOverview(...a) }));
vi.mock("../../dashboard/get-sector-dashboard/service", () => ({ getSectorDashboard: (...a: unknown[]) => getSectorDashboard(...a) }));
vi.mock("../../targets/get-target-rollups/service", () => ({ getTargetRollups: (...a: unknown[]) => getTargetRollups(...a) }));

describe("getTvBoard", () => {
  beforeEach(() => {
    findBoardByToken.mockReset();
    findScreensForBoards.mockReset();
    findTargetById.mockReset();
    findSectorById.mockReset();
    findDefinitionUnit.mockReset();
    getMetricsOverview.mockReset();
    getSectorDashboard.mockReset();
    getTargetRollups.mockReset();
  });

  it("fails for an unknown token", async () => {
    findBoardByToken.mockResolvedValue(null);
    const { getTvBoard } = await import("./service");
    const result = await getTvBoard("nope");
    expect(result.success).toBe(false);
  });

  it("skips a target screen whose target was deleted", async () => {
    findBoardByToken.mockResolvedValue({ id: "b1", label: "TV" });
    findScreensForBoards.mockResolvedValue([
      { id: "sc1", kind: "target_board", targetId: "gone", sectorId: null, dwellSeconds: 20 },
    ]);
    findTargetById.mockResolvedValue(null);

    const { getTvBoard } = await import("./service");
    const result = await getTvBoard("tok");

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.screens).toEqual([]);
  });

  it("resolves an overview screen", async () => {
    findBoardByToken.mockResolvedValue({ id: "b1", label: "TV" });
    findScreensForBoards.mockResolvedValue([{ id: "sc1", kind: "overview", targetId: null, sectorId: null, dwellSeconds: 12 }]);
    getMetricsOverview.mockResolvedValue({
      success: true,
      data: { sectors: [{ sector: { name: "Comercial" }, targetCount: 2, statusCounts: { met: 1, on_track: 0, below: 1 }, averageCompletion: 0.6 }] },
    });

    const { getTvBoard } = await import("./service");
    const result = await getTvBoard("tok");

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.screens[0]).toMatchObject({ kind: "overview", dwellSeconds: 12 });
    expect(result.data.screens[0]).toHaveProperty("sectors");
  });
});
