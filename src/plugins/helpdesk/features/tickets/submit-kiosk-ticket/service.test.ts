import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const notify = vi.fn();
vi.mock("../../../shared/notify", () => ({
  notify: (...args: unknown[]) => notify(...args),
  notificationSummary: (parts: { queueName: string; reference: string; text: string }) =>
    `${parts.queueName} · ${parts.reference} · ${parts.text}`,
}));

vi.mock("../../../shared/sla-policy-store", () => ({
  resolveResolutionMinutes: vi.fn(async () => 24 * 60),
}));

const findActiveQueueForKioskSubmit = vi.fn();
const createKioskTicketWithSequence = vi.fn();
vi.mock("./store", () => ({
  findActiveQueueForKioskSubmit: (...args: unknown[]) => findActiveQueueForKioskSubmit(...args),
  createKioskTicketWithSequence: (...args: unknown[]) => createKioskTicketWithSequence(...args),
}));

describe("submitKioskTicket", () => {
  beforeEach(() => {
    notify.mockReset();
    findActiveQueueForKioskSubmit.mockReset();
    createKioskTicketWithSequence.mockReset();
    createKioskTicketWithSequence.mockImplementation(async (input: Record<string, unknown>) => ({
      id: "t1",
      seq: 12,
      status: "open",
      priority: "normal",
      ...input,
    }));
  });

  it("opens an anonymous ticket with a tracking token and notifies the queue", async () => {
    findActiveQueueForKioskSubmit.mockResolvedValue({ id: "q1", key: "manutencao", name: "Manutenção", defaultPriority: "normal" });

    const { submitKioskTicket } = await import("./service");
    const result = await submitKioskTicket({
      kioskId: "k1",
      queueId: "q1",
      description: "  Totem travado na tela inicial  ",
      location: "Recepção",
      requesterName: "João",
      requesterContact: "ramal 32",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.reference).toBe("manutencao-12");
    expect(result.data.trackingToken).toMatch(/^[0-9a-f]{32}$/);
    expect(result.data.trackingPath).toBe(`/chamados/acompanhar/${result.data.trackingToken}`);

    const passed = createKioskTicketWithSequence.mock.calls[0][0] as Record<string, unknown>;
    expect(passed).toMatchObject({
      queueId: "q1",
      description: "Totem travado na tela inicial",
      requesterName: "João",
      requesterContact: "ramal 32",
      originKioskId: "k1",
      title: "Totem travado na tela inicial",
    });
    expect(passed.trackingToken).toMatch(/^[0-9a-f]{32}$/);

    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ ticketId: "t1", kind: "new_ticket", actorUserId: null, audiences: ["queue"] }),
    );
  });

  it("fails when the queue is unavailable (archived or missing)", async () => {
    findActiveQueueForKioskSubmit.mockResolvedValue(null);

    const { submitKioskTicket } = await import("./service");
    const result = await submitKioskTicket({
      kioskId: "k1",
      queueId: "gone",
      description: "algo",
      location: null,
      requesterName: null,
      requesterContact: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.submit-kiosk-ticket.queue_unavailable");
    expect(createKioskTicketWithSequence).not.toHaveBeenCalled();
  });

  it("derives a clipped title from a long first line of the description", async () => {
    findActiveQueueForKioskSubmit.mockResolvedValue({ id: "q1", key: "ti", name: "TI", defaultPriority: "normal" });
    const long = "x".repeat(200);

    const { submitKioskTicket } = await import("./service");
    await submitKioskTicket({
      kioskId: "k1",
      queueId: "q1",
      description: long,
      location: null,
      requesterName: null,
      requesterContact: null,
    });

    const passed = createKioskTicketWithSequence.mock.calls[0][0] as { title: string };
    expect(passed.title.length).toBeLessThanOrEqual(80);
    expect(passed.title.endsWith("…")).toBe(true);
  });
});
