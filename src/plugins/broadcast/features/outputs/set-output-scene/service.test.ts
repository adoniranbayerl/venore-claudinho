import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const publishOutputEvent = vi.fn();
vi.mock("../../../runtime/output-bus", () => ({
  publishOutputEvent: (...args: unknown[]) => publishOutputEvent(...args),
}));

const findOutputById = vi.fn();
const findSceneById = vi.fn();
const applyOutputScene = vi.fn();
vi.mock("./store", () => ({
  findOutputById: (...args: unknown[]) => findOutputById(...args),
  findSceneById: (...args: unknown[]) => findSceneById(...args),
  applyOutputScene: (...args: unknown[]) => applyOutputScene(...args),
}));

describe("setOutputScene", () => {
  beforeEach(() => {
    publishOutputEvent.mockReset();
    findOutputById.mockReset();
    findSceneById.mockReset();
    applyOutputScene.mockReset();
  });

  it("fails when the output does not exist", async () => {
    findOutputById.mockResolvedValue(null);

    const { setOutputScene } = await import("./service");
    const result = await setOutputScene({ outputId: "missing", sceneId: "s1", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("broadcast.set-output-scene.not_found");
    expect(publishOutputEvent).not.toHaveBeenCalled();
  });

  it("fails when the target scene does not exist", async () => {
    findOutputById.mockResolvedValue({ id: "o1", token: "tok-1" });
    findSceneById.mockResolvedValue(null);

    const { setOutputScene } = await import("./service");
    const result = await setOutputScene({ outputId: "o1", sceneId: "missing-scene", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("broadcast.set-output-scene.scene_not_found");
    expect(publishOutputEvent).not.toHaveBeenCalled();
  });

  it("updates the output and publishes a scene-changed event keyed by the output's token", async () => {
    findOutputById.mockResolvedValue({ id: "o1", token: "tok-1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Abertura" });
    applyOutputScene.mockResolvedValue({ id: "o1", token: "tok-1", currentSceneId: "s1" });

    const { setOutputScene } = await import("./service");
    const result = await setOutputScene({ outputId: "o1", sceneId: "s1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "o1", token: "tok-1", currentSceneId: "s1" } });
    expect(publishOutputEvent).toHaveBeenCalledWith("tok-1", { type: "scene-changed", sceneId: "s1" });
  });

  it("allows clearing the scene (sceneId null) without validating a scene lookup", async () => {
    findOutputById.mockResolvedValue({ id: "o1", token: "tok-1" });
    applyOutputScene.mockResolvedValue({ id: "o1", token: "tok-1", currentSceneId: null });

    const { setOutputScene } = await import("./service");
    const result = await setOutputScene({ outputId: "o1", sceneId: null, actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(findSceneById).not.toHaveBeenCalled();
    expect(publishOutputEvent).toHaveBeenCalledWith("tok-1", { type: "scene-changed", sceneId: null });
  });
});
