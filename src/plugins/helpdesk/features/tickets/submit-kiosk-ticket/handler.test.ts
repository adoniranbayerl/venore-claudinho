import { beforeEach, describe, expect, it, vi } from "vitest";

const findKioskByToken = vi.fn();
vi.mock("../../../shared/kiosk-store", () => ({
  findKioskByToken: (...args: unknown[]) => findKioskByToken(...args),
}));

const registerKioskSubmission = vi.fn();
vi.mock("../../../shared/kiosk-throttle", () => ({
  registerKioskSubmission: (...args: unknown[]) => registerKioskSubmission(...args),
}));

const submitKioskTicket = vi.fn();
vi.mock("./service", () => ({
  submitKioskTicket: (...args: unknown[]) => submitKioskTicket(...args),
}));

const TOKEN = "a".repeat(32);

describe("submitKioskTicketHandler", () => {
  beforeEach(() => {
    findKioskByToken.mockReset();
    registerKioskSubmission.mockReset();
    submitKioskTicket.mockReset();
    registerKioskSubmission.mockReturnValue({ allowed: true });
    submitKioskTicket.mockResolvedValue({ success: true, data: { reference: "manutencao-1", trackingToken: TOKEN, trackingPath: "x" } });
  });

  it("rejects a malformed token before touching the store", async () => {
    const { submitKioskTicketHandler } = await import("./handler");
    const result = await submitKioskTicketHandler({ token: "not-a-token", description: "algo" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.submit-kiosk-ticket.kiosk_unavailable");
    expect(findKioskByToken).not.toHaveBeenCalled();
  });

  it("rejects an inactive kiosk", async () => {
    findKioskByToken.mockResolvedValue({ id: "k1", token: TOKEN, active: false, queueId: "q1" });

    const { submitKioskTicketHandler } = await import("./handler");
    const result = await submitKioskTicketHandler({ token: TOKEN, description: "algo" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.submit-kiosk-ticket.kiosk_unavailable");
    expect(submitKioskTicket).not.toHaveBeenCalled();
  });

  it("returns a throttle error and never calls the service when the token is rate limited", async () => {
    findKioskByToken.mockResolvedValue({ id: "k1", token: TOKEN, active: true, queueId: "q1" });
    registerKioskSubmission.mockReturnValue({ allowed: false, retryAfterMs: 12_000 });

    const { submitKioskTicketHandler } = await import("./handler");
    const result = await submitKioskTicketHandler({ token: TOKEN, description: "algo" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.submit-kiosk-ticket.throttled");
    expect(submitKioskTicket).not.toHaveBeenCalled();
  });

  it("uses the kiosk's fixed queue and ignores a queueId sent in the body", async () => {
    findKioskByToken.mockResolvedValue({ id: "k1", token: TOKEN, active: true, queueId: "fixed-q" });

    const { submitKioskTicketHandler } = await import("./handler");
    await submitKioskTicketHandler({ token: TOKEN, description: "algo", queueId: "attacker-choice" });

    expect(submitKioskTicket).toHaveBeenCalledWith(expect.objectContaining({ kioskId: "k1", queueId: "fixed-q" }));
  });

  it("requires a queue choice when the kiosk does not fix one", async () => {
    findKioskByToken.mockResolvedValue({ id: "k1", token: TOKEN, active: true, queueId: null });

    const { submitKioskTicketHandler } = await import("./handler");
    const result = await submitKioskTicketHandler({ token: TOKEN, description: "algo" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.submit-kiosk-ticket.missing_queue");
  });
});
