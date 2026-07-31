import { beforeEach, describe, expect, it, vi } from "vitest";

const insertValues = vi.fn().mockResolvedValue(undefined);
const insert = vi.fn(() => ({ values: insertValues }));

vi.mock("@/infrastructure/database/client", () => ({
  db: { insert },
}));

describe("recordAuditEvent", () => {
  beforeEach(() => {
    insert.mockClear();
    insertValues.mockClear();
  });

  it("writes directly to the audit table (no buffering) and redacts summary/detail", async () => {
    const { recordAuditEvent } = await import("./audit-log");

    await recordAuditEvent({
      action: "rbac.grant-superadmin",
      actor: { id: "u1", type: "user" },
      outcome: "success",
      summary: "Concedeu superadmin para joao@example.com",
      detail: { password: "hunter2", targetUserId: "u2" },
    });

    expect(insert).toHaveBeenCalledTimes(1);
    const row = insertValues.mock.calls[0][0];
    expect(row.summary).toBe("Concedeu superadmin para [REDACTED_EMAIL]");
    expect(row.detail).toEqual({ password: "[REDACTED]", targetUserId: "u2" });
    expect(row.action).toBe("rbac.grant-superadmin");
    expect(row.outcome).toBe("success");
  });

  it("accepts a null actor for system-originated events", async () => {
    const { recordAuditEvent } = await import("./audit-log");

    await recordAuditEvent({ action: "system.retention-sweep", actor: null, outcome: "success", summary: "ok" });

    const row = insertValues.mock.calls[0][0];
    expect(row.actorId).toBeNull();
    expect(row.actorType).toBeNull();
  });
});
