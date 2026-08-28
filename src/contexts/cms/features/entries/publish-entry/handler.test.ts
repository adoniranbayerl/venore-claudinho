import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const publishEntry = vi.fn();
vi.mock("./service", () => ({
  publishEntry: (...args: unknown[]) => publishEntry(...args),
}));

describe("publishEntryHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    publishEntry.mockReset();
  });

  it("fails validation before ever checking authorization when id is empty", async () => {
    const { publishEntryHandler } = await import("./handler");
    const result = await publishEntryHandler({ id: "", resolveDefinition: () => null });

    expect(result).toEqual({ success: false, error: { code: "cms.entries.invalid_id", message: expect.any(String) } });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  // Fase C / D6 (docs/rbac-scoped-roles.md): publicar exige `cms.entries.publish` e NÃO aceita
  // mais `cms.entries.manage` como atalho — um author (só `manage`) não publica.
  it("authorizes strictly against cms.entries.publish (no cms.entries.manage shortcut)", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    publishEntry.mockResolvedValue({ success: true, data: { id: "entry-1" } });

    const { publishEntryHandler } = await import("./handler");
    await publishEntryHandler({ id: "entry-1", resolveDefinition: () => null });

    expect(authorizeActor).toHaveBeenCalledWith("cms.entries.publish");
  });

  it("propagates the authorization error without calling the service", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "..." },
    });

    const { publishEntryHandler } = await import("./handler");
    const result = await publishEntryHandler({ id: "entry-1", resolveDefinition: () => null });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: expect.any(String) },
    });
    expect(publishEntry).not.toHaveBeenCalled();
  });
});
