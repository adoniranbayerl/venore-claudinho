import { beforeEach, describe, expect, it, vi } from "vitest";

const findSectorTargets = vi.fn();
const findInputsForTargets = vi.fn();
const findDefinitionsByIds = vi.fn();
const findValuesForDefinitionsInRange = vi.fn();
vi.mock("./store", () => ({
  findSectorTargets: (...a: unknown[]) => findSectorTargets(...a),
  findInputsForTargets: (...a: unknown[]) => findInputsForTargets(...a),
  findDefinitionsByIds: (...a: unknown[]) => findDefinitionsByIds(...a),
  findValuesForDefinitionsInRange: (...a: unknown[]) => findValuesForDefinitionsInRange(...a),
}));

describe("getTargetRollups", () => {
  beforeEach(() => {
    findSectorTargets.mockReset();
    findInputsForTargets.mockReset();
    findDefinitionsByIds.mockReset();
    findValuesForDefinitionsInRange.mockReset();
  });

  it("returns an empty list when the sector has no targets", async () => {
    findSectorTargets.mockResolvedValue([]);
    const { getTargetRollups } = await import("./service");
    const result = await getTargetRollups("s1");
    expect(result).toEqual({ success: true, data: [] });
  });

  it("aggregates values per definition inside the target period and rolls up", async () => {
    findSectorTargets.mockResolvedValue([
      { id: "t1", targetValue: 300, onTrackThreshold: 0.85, periodStart: "2026-02-01", periodEnd: "2026-07-31" },
    ]);
    findInputsForTargets.mockResolvedValue([
      { targetId: "t1", definitionId: "d1", weight: 1, classification: "realized", position: 0 },
      { targetId: "t1", definitionId: "d2", weight: 1, classification: "at_risk", position: 1 },
    ]);
    findDefinitionsByIds.mockResolvedValue([
      { id: "d1", label: "Matriculados", aggregation: "sum" },
      { id: "d2", label: "Pendentes", aggregation: "last" },
    ]);
    findValuesForDefinitionsInRange.mockResolvedValue([
      // d1 sums across months -> 100 + 110 = 210
      { definitionId: "d1", periodStart: "2026-03-01", value: 100 },
      { definitionId: "d1", periodStart: "2026-04-01", value: 110 },
      // d1 value outside the period is ignored
      { definitionId: "d1", periodStart: "2026-09-01", value: 999 },
      // d2 takes the last -> 90
      { definitionId: "d2", periodStart: "2026-06-01", value: 120 },
      { definitionId: "d2", periodStart: "2026-07-01", value: 90 },
    ]);

    const { getTargetRollups } = await import("./service");
    const result = await getTargetRollups("s1");

    expect(result.success).toBe(true);
    if (!result.success) return;
    const view = result.data[0];
    expect(view.lines.map((line) => line.resolvedValue)).toEqual([210, 90]);
    expect(view.rollup.headline).toBe(210);
    expect(view.rollup.atRisk).toBe(90);
    expect(view.rollup.optimistic).toBe(300);
    expect(view.rollup.status).toBe("below");
  });
});
