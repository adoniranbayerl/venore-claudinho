import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeMetricValueContributionActor = vi.fn();
vi.mock("../../../shared/scoped-authorization", () => ({
  authorizeMetricValueContributionActor: (...args: unknown[]) => authorizeMetricValueContributionActor(...args),
}));

const upsertMetricValueForPeriod = vi.fn();
vi.mock("./service", () => ({
  upsertMetricValueForPeriod: (...args: unknown[]) => upsertMetricValueForPeriod(...args),
}));

const FORBIDDEN = { authorized: false as const, error: { code: "company-metrics.sector.forbidden_resource", message: "no" } };

describe("upsertMetricValueHandler", () => {
  beforeEach(() => {
    authorizeMetricValueContributionActor.mockReset();
    upsertMetricValueForPeriod.mockReset();
    upsertMetricValueForPeriod.mockResolvedValue({ success: true, data: {} });
  });

  it("rejects a blank definitionId before authorization", async () => {
    const { upsertMetricValueHandler } = await import("./handler");
    const result = await upsertMetricValueHandler({ definitionId: "  ", periodDate: "2026-08-01", value: 1 });

    expect(result.success).toBe(false);
    expect(authorizeMetricValueContributionActor).not.toHaveBeenCalled();
  });

  it("rejects a contributor without editor access to the sector", async () => {
    authorizeMetricValueContributionActor.mockResolvedValue(FORBIDDEN);

    const { upsertMetricValueHandler } = await import("./handler");
    const result = await upsertMetricValueHandler({ definitionId: "d1", periodDate: "2026-08-01", value: 1 });

    expect(result).toEqual({ success: false, error: FORBIDDEN.error });
    expect(upsertMetricValueForPeriod).not.toHaveBeenCalled();
  });

  it("forwards the resolved actorId to the service", async () => {
    authorizeMetricValueContributionActor.mockResolvedValue({ authorized: true, actorId: "editor-1" });

    const { upsertMetricValueHandler } = await import("./handler");
    await upsertMetricValueHandler({ definitionId: "d1", periodDate: "2026-08-01", value: 5, note: "x" });

    expect(upsertMetricValueForPeriod).toHaveBeenCalledWith({
      definitionId: "d1",
      periodDate: "2026-08-01",
      value: 5,
      note: "x",
      actorId: "editor-1",
    });
  });
});
