import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const findBoardById = vi.fn();
vi.mock("../shared/store", () => ({
  findBoardById: (...a: unknown[]) => findBoardById(...a),
}));

const existingSectorIds = vi.fn();
const existingTargetIds = vi.fn();
const replaceScreens = vi.fn();
vi.mock("./store", () => ({
  existingSectorIds: (...a: unknown[]) => existingSectorIds(...a),
  existingTargetIds: (...a: unknown[]) => existingTargetIds(...a),
  replaceScreens: (...a: unknown[]) => replaceScreens(...a),
}));

describe("setTvScreens", () => {
  beforeEach(() => {
    findBoardById.mockReset().mockResolvedValue({ id: "b1", label: "TV" });
    existingSectorIds.mockReset().mockResolvedValue(new Set(["s1"]));
    existingTargetIds.mockReset().mockResolvedValue(new Set(["t1"]));
    replaceScreens.mockReset();
  });

  it("fails for an unknown board", async () => {
    findBoardById.mockResolvedValue(null);
    const { setTvScreens } = await import("./service");
    const result = await setTvScreens({ boardId: "x", screens: [], actorId: "a1" });
    expect(result.success).toBe(false);
  });

  it("rejects a sector_kpis screen without a sector", async () => {
    const { setTvScreens } = await import("./service");
    const result = await setTvScreens({
      boardId: "b1",
      screens: [{ kind: "sector_kpis", dwellSeconds: 20, sectorId: null, targetId: null }],
      actorId: "a1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.set-tv-screens.missing_sector");
  });

  it("rejects a dwell outside 3..600", async () => {
    const { setTvScreens } = await import("./service");
    const result = await setTvScreens({
      boardId: "b1",
      screens: [{ kind: "overview", dwellSeconds: 1, sectorId: null, targetId: null }],
      actorId: "a1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.set-tv-screens.invalid_dwell");
  });

  it("rejects a target screen pointing at a missing target", async () => {
    existingTargetIds.mockResolvedValue(new Set());
    const { setTvScreens } = await import("./service");
    const result = await setTvScreens({
      boardId: "b1",
      screens: [{ kind: "target_board", dwellSeconds: 20, sectorId: null, targetId: "gone" }],
      actorId: "a1",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.set-tv-screens.target_not_found");
  });

  it("saves a valid mixed set", async () => {
    const { setTvScreens } = await import("./service");
    const screens = [
      { kind: "overview" as const, dwellSeconds: 15, sectorId: null, targetId: null },
      { kind: "sector_kpis" as const, dwellSeconds: 20, sectorId: "s1", targetId: null },
      { kind: "target_board" as const, dwellSeconds: 25, sectorId: null, targetId: "t1" },
    ];
    const result = await setTvScreens({ boardId: "b1", screens, actorId: "a1" });

    expect(result.success).toBe(true);
    expect(replaceScreens).toHaveBeenCalledWith("b1", screens);
  });
});
