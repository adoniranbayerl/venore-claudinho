import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const findDefinitionById = vi.fn();
const upsertMetricValue = vi.fn();
const deleteMetricValue = vi.fn();
vi.mock("./store", () => ({
  findDefinitionById: (...args: unknown[]) => findDefinitionById(...args),
  upsertMetricValue: (...args: unknown[]) => upsertMetricValue(...args),
  deleteMetricValue: (...args: unknown[]) => deleteMetricValue(...args),
}));

const monthlyDef = { id: "d1", granularity: "monthly", archivedAt: null };

describe("upsertMetricValueForPeriod", () => {
  beforeEach(() => {
    findDefinitionById.mockReset();
    upsertMetricValue.mockReset();
    deleteMetricValue.mockReset();
    findDefinitionById.mockResolvedValue(monthlyDef);
    upsertMetricValue.mockImplementation(async (input: Record<string, unknown>) => ({ id: "v1", ...input }));
  });

  it("normalizes the period to the definition's bucket before writing", async () => {
    const { upsertMetricValueForPeriod } = await import("./service");
    const result = await upsertMetricValueForPeriod({ definitionId: "d1", periodDate: "2026-08-19", value: 210, actorId: "u1" });

    expect(result.success).toBe(true);
    expect(upsertMetricValue).toHaveBeenCalledWith({
      definitionId: "d1",
      periodStart: "2026-08-01",
      value: 210,
      note: null,
      enteredByUserId: "u1",
    });
  });

  it("deletes the value when value is null", async () => {
    const { upsertMetricValueForPeriod } = await import("./service");
    const result = await upsertMetricValueForPeriod({ definitionId: "d1", periodDate: "2026-08-19", value: null, actorId: "u1" });

    expect(result.success).toBe(true);
    expect(deleteMetricValue).toHaveBeenCalledWith("d1", "2026-08-01");
    expect(upsertMetricValue).not.toHaveBeenCalled();
  });

  it("rejects an unknown definition", async () => {
    findDefinitionById.mockResolvedValue(null);
    const { upsertMetricValueForPeriod } = await import("./service");
    const result = await upsertMetricValueForPeriod({ definitionId: "x", periodDate: "2026-08-19", value: 1, actorId: "u1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.upsert-metric-value.definition_not_found");
  });

  it("rejects an archived definition", async () => {
    findDefinitionById.mockResolvedValue({ ...monthlyDef, archivedAt: new Date() });
    const { upsertMetricValueForPeriod } = await import("./service");
    const result = await upsertMetricValueForPeriod({ definitionId: "d1", periodDate: "2026-08-19", value: 1, actorId: "u1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.upsert-metric-value.definition_archived");
  });

  it("rejects an invalid period date", async () => {
    const { upsertMetricValueForPeriod } = await import("./service");
    const result = await upsertMetricValueForPeriod({ definitionId: "d1", periodDate: "2026-02-30", value: 1, actorId: "u1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.upsert-metric-value.invalid_period");
  });

  it("rejects a non-finite value", async () => {
    const { upsertMetricValueForPeriod } = await import("./service");
    const result = await upsertMetricValueForPeriod({ definitionId: "d1", periodDate: "2026-08-01", value: Number.NaN, actorId: "u1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("company-metrics.upsert-metric-value.invalid_value");
  });
});
