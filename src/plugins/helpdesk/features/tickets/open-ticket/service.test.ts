import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

vi.mock("../../../shared/notify", () => ({
  notify: vi.fn(),
  notificationSummary: (parts: { queueName: string; reference: string; text: string }) =>
    `${parts.queueName} · ${parts.reference} · ${parts.text}`,
}));

vi.mock("../../../shared/sla-policy-store", () => ({
  // Sem política configurada → o service cai no padrão corrido de shared/sla.ts; aqui devolvemos
  // um número fixo só pra o cálculo de `sla_due_at` não tocar no banco.
  resolveResolutionMinutes: vi.fn(async () => 24 * 60),
}));

const findQueueForOpen = vi.fn();
const findCategoryForOpen = vi.fn();
const createTicketWithSequence = vi.fn();
vi.mock("./store", () => ({
  findQueueForOpen: (...args: unknown[]) => findQueueForOpen(...args),
  findCategoryForOpen: (...args: unknown[]) => findCategoryForOpen(...args),
  createTicketWithSequence: (...args: unknown[]) => createTicketWithSequence(...args),
}));

describe("openTicket", () => {
  beforeEach(() => {
    findQueueForOpen.mockReset();
    findCategoryForOpen.mockReset();
    createTicketWithSequence.mockReset();
    createTicketWithSequence.mockImplementation(async (input: Record<string, unknown>) => ({
      id: "t1",
      seq: 87,
      status: "open",
      priority: "normal",
      ...input,
    }));
  });

  it("creates the ticket and returns the {queueKey}-{seq} reference", async () => {
    findQueueForOpen.mockResolvedValue({ id: "q1", key: "manutencao", archivedAt: null });

    const { openTicket } = await import("./service");
    const result = await openTicket({
      queueId: "q1",
      title: "  Lâmpada queimada  ",
      description: "  sala do Marketing  ",
      location: "  Bloco B  ",
      requesterUserId: "u1",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.reference).toBe("manutencao-87");
    expect(createTicketWithSequence).toHaveBeenCalledWith(
      expect.objectContaining({ queueId: "q1", title: "Lâmpada queimada", description: "sala do Marketing", location: "Bloco B", categoryId: null }),
    );
  });

  it("rejects an archived queue", async () => {
    findQueueForOpen.mockResolvedValue({ id: "q1", key: "ti", archivedAt: new Date() });

    const { openTicket } = await import("./service");
    const result = await openTicket({ queueId: "q1", title: "x", description: "y", requesterUserId: "u1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.open-ticket.queue_archived");
    expect(createTicketWithSequence).not.toHaveBeenCalled();
  });

  it("rejects a category that belongs to another queue", async () => {
    findQueueForOpen.mockResolvedValue({ id: "q1", key: "ti", archivedAt: null });
    findCategoryForOpen.mockResolvedValue({ id: "c1", queueId: "OTHER", archivedAt: null });

    const { openTicket } = await import("./service");
    const result = await openTicket({ queueId: "q1", categoryId: "c1", title: "x", description: "y", requesterUserId: "u1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.open-ticket.category_not_found");
  });

  it("rejects more than 3 attachments", async () => {
    findQueueForOpen.mockResolvedValue({ id: "q1", key: "ti", archivedAt: null });

    const { openTicket } = await import("./service");
    const result = await openTicket({
      queueId: "q1",
      title: "x",
      description: "y",
      attachmentMediaIds: ["a", "b", "c", "d"],
      requesterUserId: "u1",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.open-ticket.too_many_attachments");
  });
});
