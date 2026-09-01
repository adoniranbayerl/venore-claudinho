import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const countAttachmentsInScope = vi.fn();
const eventBelongsToTicket = vi.fn();
const insertAttachments = vi.fn();
vi.mock("./store", () => ({
  countAttachmentsInScope: (...args: unknown[]) => countAttachmentsInScope(...args),
  eventBelongsToTicket: (...args: unknown[]) => eventBelongsToTicket(...args),
  insertAttachments: (...args: unknown[]) => insertAttachments(...args),
}));

describe("addTicketAttachment", () => {
  beforeEach(() => {
    countAttachmentsInScope.mockReset();
    eventBelongsToTicket.mockReset();
    insertAttachments.mockReset();
    insertAttachments.mockResolvedValue([{ id: "att-1" }]);
  });

  it("inserts attachments scoped to the ticket when under the limit", async () => {
    countAttachmentsInScope.mockResolvedValue(1);

    const { addTicketAttachment } = await import("./service");
    const result = await addTicketAttachment({
      ticketId: "t1",
      mediaIds: ["m1", "m2"],
      uploadedByUserId: "u1",
    });

    expect(result.success).toBe(true);
    expect(insertAttachments).toHaveBeenCalledWith(
      expect.objectContaining({ ticketId: "t1", eventId: null, mediaIds: ["m1", "m2"], uploadedByUserId: "u1" }),
    );
  });

  it("rejects a batch of more than 3", async () => {
    const { addTicketAttachment } = await import("./service");
    const result = await addTicketAttachment({
      ticketId: "t1",
      mediaIds: ["m1", "m2", "m3", "m4"],
      uploadedByUserId: "u1",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.add-ticket-attachment.too_many");
    expect(insertAttachments).not.toHaveBeenCalled();
  });

  it("rejects when the existing count plus the new batch would exceed 3", async () => {
    countAttachmentsInScope.mockResolvedValue(2);

    const { addTicketAttachment } = await import("./service");
    const result = await addTicketAttachment({
      ticketId: "t1",
      mediaIds: ["m1", "m2"],
      uploadedByUserId: "u1",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.add-ticket-attachment.limit_reached");
  });

  it("rejects an eventId that belongs to another ticket", async () => {
    eventBelongsToTicket.mockResolvedValue(false);

    const { addTicketAttachment } = await import("./service");
    const result = await addTicketAttachment({
      ticketId: "t1",
      eventId: "ev-x",
      mediaIds: ["m1"],
      uploadedByUserId: "u1",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.add-ticket-attachment.event_mismatch");
  });
});
