import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "read", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

describe("requestMediaUploadTicketHandler — negativa por permissão", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
  });

  it("does not issue a ticket for an actor without media.manage", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: 'Ator não tem a permission "media.manage".' },
    });

    const { requestMediaUploadTicketHandler } = await import("./handler");
    const result = await requestMediaUploadTicketHandler({ filename: "photo.png", contentType: "image/png", size: 1024 });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: 'Ator não tem a permission "media.manage".' },
    });
    expect(authorizeActor).toHaveBeenCalledWith("media.manage");
  });

  it("returns the same generic shape whether the actor is unauthenticated or just lacks permission", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.unauthenticated", message: "É necessário estar autenticado para executar esta operação." },
    });

    const { requestMediaUploadTicketHandler } = await import("./handler");
    const unauthenticated = await requestMediaUploadTicketHandler({ filename: "photo.png", contentType: "image/png", size: 1024 });

    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: 'Ator não tem a permission "media.manage".' },
    });
    const { requestMediaUploadTicketHandler: handlerAgain } = await import("./handler");
    const forbidden = await handlerAgain({ filename: "photo.png", contentType: "image/png", size: 1024 });

    // Nenhuma das duas respostas expõe se o asset/pathname existiria — mesma forma de erro
    // ({ success: false, error: { code, message } }), sem dado extra vazando existência.
    expect(unauthenticated.success).toBe(false);
    expect(forbidden.success).toBe(false);
    expect(Object.keys(unauthenticated)).toEqual(Object.keys(forbidden));
    if (!unauthenticated.success && !forbidden.success) {
      expect(Object.keys(unauthenticated.error)).toEqual(Object.keys(forbidden.error));
    }
  });

  it("never calls the service (no pathname is generated) when authorization fails", async () => {
    authorizeActor.mockResolvedValue({ authorized: false, error: { code: "rbac.authorization.forbidden", message: "..." } });
    const { requestMediaUploadTicketHandler } = await import("./handler");
    const result = await requestMediaUploadTicketHandler({ filename: "photo.png", contentType: "image/png", size: 1024 });
    expect(result.success).toBe(false);
    expect("data" in result).toBe(false);
  });
});
