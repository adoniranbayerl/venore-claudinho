import { describe, expect, it } from "vitest";
import {
  autoCloseCutoff,
  canRequesterReopen,
  canTransition,
  checkStatusTransition,
  reopenDeadline,
  TICKET_REOPEN_WINDOW_DAYS,
  timestampsForTransition,
  type TicketActorCapabilities,
} from "./ticket-state";

const NOBODY: TicketActorCapabilities = {
  hasManagePermission: false,
  isQueueManager: false,
  isAssignee: false,
  isQueueMember: false,
};
const AGENT: TicketActorCapabilities = { ...NOBODY, isQueueMember: true };
const ASSIGNEE: TicketActorCapabilities = { ...AGENT, isAssignee: true };
const QUEUE_MANAGER: TicketActorCapabilities = { ...AGENT, isQueueManager: true };
const ADMIN: TicketActorCapabilities = { ...NOBODY, hasManagePermission: true };

describe("canTransition", () => {
  it("follows the §5 lifecycle map", () => {
    expect(canTransition("open", "in_progress")).toBe(true);
    expect(canTransition("open", "resolved")).toBe(true);
    expect(canTransition("in_progress", "waiting")).toBe(true);
    expect(canTransition("waiting", "in_progress")).toBe(true);
    expect(canTransition("resolved", "closed")).toBe(true);
    expect(canTransition("closed", "in_progress")).toBe(true);
  });

  it("has no way out of cancelled and no open↔closed shortcut", () => {
    expect(canTransition("cancelled", "in_progress")).toBe(false);
    expect(canTransition("open", "closed")).toBe(false);
    expect(canTransition("resolved", "open")).toBe(false);
  });
});

describe("checkStatusTransition — guards", () => {
  it("rejects a transition that is not in the map", () => {
    const result = checkStatusTransition("open", "closed", ADMIN);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("helpdesk.change-status.invalid_transition");
  });

  it("rejects a no-op", () => {
    const result = checkStatusTransition("open", "open", ADMIN);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("helpdesk.change-status.noop");
  });

  it("only assignee / queue manager / helpdesk.manage may resolve", () => {
    expect(checkStatusTransition("in_progress", "resolved", AGENT).ok).toBe(false);
    expect(checkStatusTransition("in_progress", "resolved", ASSIGNEE).ok).toBe(true);
    expect(checkStatusTransition("in_progress", "resolved", QUEUE_MANAGER).ok).toBe(true);
    expect(checkStatusTransition("in_progress", "resolved", ADMIN).ok).toBe(true);

    const denied = checkStatusTransition("in_progress", "resolved", AGENT);
    if (!denied.ok) expect(denied.code).toBe("helpdesk.change-status.resolve_forbidden");
  });

  it("only helpdesk.manage may close", () => {
    expect(checkStatusTransition("resolved", "closed", ASSIGNEE).ok).toBe(false);
    expect(checkStatusTransition("resolved", "closed", QUEUE_MANAGER).ok).toBe(false);
    expect(checkStatusTransition("resolved", "closed", ADMIN).ok).toBe(true);

    const denied = checkStatusTransition("resolved", "closed", QUEUE_MANAGER);
    if (!denied.ok) expect(denied.code).toBe("helpdesk.change-status.close_forbidden");
  });

  it("only helpdesk.manage may cancel", () => {
    expect(checkStatusTransition("open", "cancelled", QUEUE_MANAGER).ok).toBe(false);
    expect(checkStatusTransition("open", "cancelled", ADMIN).ok).toBe(true);
  });

  it("only helpdesk.manage may leave a final state (reopen)", () => {
    expect(checkStatusTransition("closed", "in_progress", QUEUE_MANAGER).ok).toBe(false);
    expect(checkStatusTransition("closed", "in_progress", ADMIN).ok).toBe(true);

    const denied = checkStatusTransition("closed", "in_progress", ASSIGNEE);
    if (!denied.ok) expect(denied.code).toBe("helpdesk.change-status.reopen_forbidden");
  });

  it("requires queue membership for the ordinary transitions", () => {
    expect(checkStatusTransition("open", "in_progress", NOBODY).ok).toBe(false);
    expect(checkStatusTransition("open", "in_progress", AGENT).ok).toBe(true);
    expect(checkStatusTransition("open", "waiting", ADMIN).ok).toBe(true);
  });
});

describe("timestampsForTransition", () => {
  const now = new Date("2026-09-01T12:00:00Z");

  it("stamps resolvedAt / closedAt and clears both on reopen", () => {
    expect(timestampsForTransition("resolved", now)).toEqual({ resolvedAt: now });
    expect(timestampsForTransition("closed", now)).toEqual({ closedAt: now });
    expect(timestampsForTransition("in_progress", now)).toEqual({ resolvedAt: null, closedAt: null });
    expect(timestampsForTransition("waiting", now)).toEqual({});
  });
});

describe("canRequesterReopen — Fase 7 janela de reabertura", () => {
  const resolvedAt = new Date("2026-09-01T12:00:00Z");
  const dayAfter = (days: number) => new Date(resolvedAt.getTime() + days * 24 * 60 * 60 * 1000);

  it("only a resolved ticket with a resolvedAt is reopenable", () => {
    expect(canRequesterReopen("resolved", resolvedAt, dayAfter(1))).toBe(true);
    expect(canRequesterReopen("resolved", null, dayAfter(1))).toBe(false);
    expect(canRequesterReopen("closed", resolvedAt, dayAfter(1))).toBe(false);
    expect(canRequesterReopen("in_progress", resolvedAt, dayAfter(1))).toBe(false);
    expect(canRequesterReopen("cancelled", resolvedAt, dayAfter(1))).toBe(false);
  });

  it("is allowed inside the N-day window and denied after it", () => {
    expect(canRequesterReopen("resolved", resolvedAt, dayAfter(TICKET_REOPEN_WINDOW_DAYS - 1))).toBe(true);
    expect(canRequesterReopen("resolved", resolvedAt, reopenDeadline(resolvedAt))).toBe(true);
    expect(canRequesterReopen("resolved", resolvedAt, dayAfter(TICKET_REOPEN_WINDOW_DAYS + 1))).toBe(false);
  });
});

describe("autoCloseCutoff — Fase 7", () => {
  it("is N days before now", () => {
    const now = new Date("2026-09-20T00:00:00Z");
    expect(autoCloseCutoff(now).toISOString()).toBe(
      new Date(now.getTime() - TICKET_REOPEN_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    );
  });
});
