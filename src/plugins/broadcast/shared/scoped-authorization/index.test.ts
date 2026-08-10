import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const isUserAssignedToAgenda = vi.fn();
const isUserAssignedToOutput = vi.fn();
const findAgendaIdByEventId = vi.fn();
vi.mock("./store", () => ({
  isUserAssignedToAgenda: (...args: unknown[]) => isUserAssignedToAgenda(...args),
  isUserAssignedToOutput: (...args: unknown[]) => isUserAssignedToOutput(...args),
  findAgendaIdByEventId: (...args: unknown[]) => findAgendaIdByEventId(...args),
  findAgendaIdsAssignedToUser: vi.fn(),
  findOutputIdsAssignedToUser: vi.fn(),
}));

describe("authorizeAgendaActor", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    isUserAssignedToAgenda.mockReset();
  });

  it("authorizes immediately when the actor has broadcast.manage, without checking assignment", async () => {
    authorizeActor.mockImplementation(async (permission: string) =>
      permission === "broadcast.manage" ? { authorized: true, actorId: "admin-1" } : { authorized: false, error: {} },
    );

    const { authorizeAgendaActor } = await import("./index");
    const result = await authorizeAgendaActor("agenda-1");

    expect(result).toEqual({ authorized: true, actorId: "admin-1" });
    expect(isUserAssignedToAgenda).not.toHaveBeenCalled();
  });

  it("denies a scoped editor who is not assigned to the target agenda, even with broadcast.agenda.manage", async () => {
    authorizeActor.mockImplementation(async (permission: string) =>
      permission === "broadcast.agenda.manage"
        ? { authorized: true, actorId: "editor-1" }
        : { authorized: false, error: { code: "rbac.authorization.forbidden", message: "forbidden" } },
    );
    isUserAssignedToAgenda.mockResolvedValue(false);

    const { authorizeAgendaActor } = await import("./index");
    const result = await authorizeAgendaActor("agenda-1");

    expect(result.authorized).toBe(false);
    if (!result.authorized) expect(result.error.code).toBe("broadcast.agenda.forbidden_resource");
    expect(isUserAssignedToAgenda).toHaveBeenCalledWith("agenda-1", "editor-1");
  });

  it("authorizes a scoped editor who IS assigned to the target agenda", async () => {
    authorizeActor.mockImplementation(async (permission: string) =>
      permission === "broadcast.agenda.manage"
        ? { authorized: true, actorId: "editor-1" }
        : { authorized: false, error: { code: "rbac.authorization.forbidden", message: "forbidden" } },
    );
    isUserAssignedToAgenda.mockResolvedValue(true);

    const { authorizeAgendaActor } = await import("./index");
    const result = await authorizeAgendaActor("agenda-1");

    expect(result).toEqual({ authorized: true, actorId: "editor-1" });
  });

  it("denies an actor with neither permission, without ever querying assignment", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "forbidden" },
    });

    const { authorizeAgendaActor } = await import("./index");
    const result = await authorizeAgendaActor("agenda-1");

    expect(result.authorized).toBe(false);
    expect(isUserAssignedToAgenda).not.toHaveBeenCalled();
  });
});

describe("authorizeAgendaEventActor", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    isUserAssignedToAgenda.mockReset();
    findAgendaIdByEventId.mockReset();
  });

  it("resolves the event's parent agenda before checking assignment", async () => {
    authorizeActor.mockImplementation(async (permission: string) =>
      permission === "broadcast.agenda.manage"
        ? { authorized: true, actorId: "editor-1" }
        : { authorized: false, error: { code: "rbac.authorization.forbidden", message: "forbidden" } },
    );
    findAgendaIdByEventId.mockResolvedValue("agenda-1");
    isUserAssignedToAgenda.mockResolvedValue(true);

    const { authorizeAgendaEventActor } = await import("./index");
    const result = await authorizeAgendaEventActor("event-1");

    expect(findAgendaIdByEventId).toHaveBeenCalledWith("event-1");
    expect(isUserAssignedToAgenda).toHaveBeenCalledWith("agenda-1", "editor-1");
    expect(result).toEqual({ authorized: true, actorId: "editor-1" });
  });

  it("fails when the event does not exist", async () => {
    authorizeActor.mockImplementation(async (permission: string) =>
      permission === "broadcast.agenda.manage"
        ? { authorized: true, actorId: "editor-1" }
        : { authorized: false, error: { code: "rbac.authorization.forbidden", message: "forbidden" } },
    );
    findAgendaIdByEventId.mockResolvedValue(null);

    const { authorizeAgendaEventActor } = await import("./index");
    const result = await authorizeAgendaEventActor("missing-event");

    expect(result.authorized).toBe(false);
    if (!result.authorized) expect(result.error.code).toBe("broadcast.agenda.event_not_found");
  });
});

describe("authorizeOutputActor", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    isUserAssignedToOutput.mockReset();
  });

  it("denies a scoped editor who is not assigned to the target output", async () => {
    authorizeActor.mockImplementation(async (permission: string) =>
      permission === "broadcast.outputs.manage"
        ? { authorized: true, actorId: "editor-2" }
        : { authorized: false, error: { code: "rbac.authorization.forbidden", message: "forbidden" } },
    );
    isUserAssignedToOutput.mockResolvedValue(false);

    const { authorizeOutputActor } = await import("./index");
    const result = await authorizeOutputActor("output-1");

    expect(result.authorized).toBe(false);
    if (!result.authorized) expect(result.error.code).toBe("broadcast.outputs.forbidden_resource");
  });
});
