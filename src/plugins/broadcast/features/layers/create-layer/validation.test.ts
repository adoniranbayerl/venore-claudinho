import { describe, expect, it } from "vitest";
import { validateCreateLayerInput } from "./validation";

describe("validateCreateLayerInput", () => {
  it("accepts a minimal valid layer", () => {
    expect(validateCreateLayerInput({ sceneId: "s1", type: "video", name: "Vídeo principal" })).toBeNull();
  });

  it("rejects a missing sceneId", () => {
    expect(validateCreateLayerInput({ sceneId: "", type: "video", name: "Vídeo" })?.code).toBe(
      "broadcast.create-layer.invalid_scene",
    );
  });

  it("rejects an empty name", () => {
    expect(validateCreateLayerInput({ sceneId: "s1", type: "video", name: "  " })?.code).toBe(
      "broadcast.create-layer.invalid_name",
    );
  });

  it("rejects an unknown layer type", () => {
    expect(
      validateCreateLayerInput({ sceneId: "s1", type: "iframe" as never, name: "X" })?.code,
    ).toBe("broadcast.create-layer.invalid_type");
  });

  it("rejects a non-finite numeric field", () => {
    expect(
      validateCreateLayerInput({ sceneId: "s1", type: "video", name: "X", width: Number.NaN })?.code,
    ).toBe("broadcast.create-layer.invalid_number");
  });
});
