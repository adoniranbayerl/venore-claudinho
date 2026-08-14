import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findOutputById = vi.fn();
const applyOutputPin = vi.fn();
vi.mock("./store", () => ({
  findOutputById: (...args: unknown[]) => findOutputById(...args),
  applyOutputPin: (...args: unknown[]) => applyOutputPin(...args),
}));

describe("setOutputPin", () => {
  beforeEach(() => {
    findOutputById.mockReset();
    applyOutputPin.mockReset();
  });

  it("fails when the output does not exist", async () => {
    findOutputById.mockResolvedValue(null);

    const { setOutputPin } = await import("./service");
    const result = await setOutputPin({ outputId: "missing", pin: "1234", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("broadcast.set-output-pin.not_found");
  });

  it("sets a new pin", async () => {
    findOutputById.mockResolvedValue({ id: "o1", token: "recepcao" });
    applyOutputPin.mockResolvedValue({ id: "o1", pin: "1234" });

    const { setOutputPin } = await import("./service");
    const result = await setOutputPin({ outputId: "o1", pin: "1234", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(applyOutputPin).toHaveBeenCalledWith({ id: "o1", pin: "1234" });
  });

  it("clears the pin when null is passed", async () => {
    findOutputById.mockResolvedValue({ id: "o1", token: "recepcao" });
    applyOutputPin.mockResolvedValue({ id: "o1", pin: null });

    const { setOutputPin } = await import("./service");
    const result = await setOutputPin({ outputId: "o1", pin: null, actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(applyOutputPin).toHaveBeenCalledWith({ id: "o1", pin: null });
  });
});
