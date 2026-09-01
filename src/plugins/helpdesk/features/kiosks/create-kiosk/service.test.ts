import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const insertKiosk = vi.fn();
const isQueueActive = vi.fn();
vi.mock("../../../shared/kiosk-store", () => ({
  insertKiosk: (...args: unknown[]) => insertKiosk(...args),
  isQueueActive: (...args: unknown[]) => isQueueActive(...args),
}));

describe("createKiosk", () => {
  beforeEach(() => {
    insertKiosk.mockReset();
    isQueueActive.mockReset();
    insertKiosk.mockImplementation(async (input: Record<string, unknown>) => ({ id: "k1", ...input }));
  });

  it("creates a kiosk with a fresh 32-hex token, trimmed label and no fixed queue", async () => {
    const { createKiosk } = await import("./service");
    const result = await createKiosk({ label: "  Recepção Bloco A  ", queueId: null, actorId: "mgr" });

    expect(result.success).toBe(true);
    const passed = insertKiosk.mock.calls[0][0] as { token: string; label: string; queueId: string | null; active: boolean };
    expect(passed.label).toBe("Recepção Bloco A");
    expect(passed.queueId).toBeNull();
    expect(passed.active).toBe(true);
    expect(passed.token).toMatch(/^[0-9a-f]{32}$/);
    expect(isQueueActive).not.toHaveBeenCalled();
  });

  it("rejects a fixed queue that does not exist or is archived", async () => {
    isQueueActive.mockResolvedValue(false);

    const { createKiosk } = await import("./service");
    const result = await createKiosk({ label: "Portaria", queueId: "gone", actorId: "mgr" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.create-kiosk.queue_not_found");
    expect(insertKiosk).not.toHaveBeenCalled();
  });

  it("accepts a valid fixed queue", async () => {
    isQueueActive.mockResolvedValue(true);

    const { createKiosk } = await import("./service");
    const result = await createKiosk({ label: "Portaria", queueId: "q1", actorId: "mgr" });

    expect(result.success).toBe(true);
    expect(insertKiosk).toHaveBeenCalledWith(expect.objectContaining({ queueId: "q1" }));
  });
});
