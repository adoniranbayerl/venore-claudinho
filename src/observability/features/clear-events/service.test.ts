import { beforeEach, describe, expect, it, vi } from "vitest";

const countAllEvents = vi.fn();
const deleteAllEvents = vi.fn();
const recordAuditEvent = vi.fn().mockResolvedValue(undefined);

vi.mock("./store", () => ({
  countAllEvents: (...args: unknown[]) => countAllEvents(...args),
  deleteAllEvents: (...args: unknown[]) => deleteAllEvents(...args),
}));

vi.mock("../../audit-log", () => ({
  recordAuditEvent: (...args: unknown[]) => recordAuditEvent(...args),
}));

describe("clearEvents", () => {
  beforeEach(() => {
    countAllEvents.mockReset();
    deleteAllEvents.mockReset();
    recordAuditEvent.mockClear();
  });

  it("without confirmation, returns the count and does not delete anything", async () => {
    countAllEvents.mockResolvedValue(42);
    const { clearEvents } = await import("./service");

    const result = await clearEvents({ actor: { id: "u1", type: "user" } });

    expect(result).toEqual({
      success: false,
      error: {
        code: "observability.events.clear.confirmation_required",
        message: "42 registros de log operacional serão removidos. Confirme para prosseguir.",
      },
    });
    expect(deleteAllEvents).not.toHaveBeenCalled();
    expect(recordAuditEvent).not.toHaveBeenCalled();
  });

  it("with confirmation, deletes every operational event and records a surviving audit event", async () => {
    countAllEvents.mockResolvedValue(3);
    deleteAllEvents.mockResolvedValue(3);
    const { clearEvents } = await import("./service");

    const result = await clearEvents({ actor: { id: "u1", type: "user" }, confirmed: true });

    expect(result).toEqual({ success: true, data: { cleared: 3 } });
    expect(deleteAllEvents).toHaveBeenCalledTimes(1);
    expect(recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "observability.events.clear",
        actor: { id: "u1", type: "user" },
        outcome: "success",
        detail: { cleared: 3 },
      }),
    );
  });

  it("phrases the confirmation message correctly for a single record", async () => {
    countAllEvents.mockResolvedValue(1);
    const { clearEvents } = await import("./service");

    const result = await clearEvents({ actor: { id: "u1", type: "user" } });

    expect(result).toMatchObject({
      success: false,
      error: { message: "1 registro de log operacional será removido. Confirme para prosseguir." },
    });
  });
});
