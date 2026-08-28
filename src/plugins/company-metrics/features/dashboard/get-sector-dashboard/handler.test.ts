import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeSectorViewActor = vi.fn();
vi.mock("../../../shared/scoped-authorization", () => ({
  authorizeSectorViewActor: (...a: unknown[]) => authorizeSectorViewActor(...a),
}));

vi.mock("@/contexts/settings", () => ({
  getSetting: vi.fn(async () => ({ success: true, data: { value: "UTC" } })),
}));

const getSectorDashboard = vi.fn();
vi.mock("./service", () => ({
  getSectorDashboard: (...a: unknown[]) => getSectorDashboard(...a),
}));

describe("getSectorDashboardHandler", () => {
  beforeEach(() => {
    authorizeSectorViewActor.mockReset();
    getSectorDashboard.mockReset().mockResolvedValue({ success: true, data: {} });
  });

  it("rejects when the actor cannot view the sector", async () => {
    authorizeSectorViewActor.mockResolvedValue({ authorized: false, error: { code: "company-metrics.sector.forbidden_resource", message: "no" } });

    const { getSectorDashboardHandler } = await import("./handler");
    const result = await getSectorDashboardHandler({ sectorId: "s1" });

    expect(result.success).toBe(false);
    expect(getSectorDashboard).not.toHaveBeenCalled();
  });

  it("passes the resolved time zone to the service", async () => {
    authorizeSectorViewActor.mockResolvedValue({ authorized: true, actorId: "u1" });

    const { getSectorDashboardHandler } = await import("./handler");
    await getSectorDashboardHandler({ sectorId: "s1", windowMonths: 3 });

    expect(getSectorDashboard).toHaveBeenCalledWith({ sectorId: "s1", windowMonths: 3, timeZone: "UTC" });
  });
});
