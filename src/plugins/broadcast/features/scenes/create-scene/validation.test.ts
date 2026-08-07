import { describe, expect, it } from "vitest";
import { validateCreateSceneInput } from "./validation";

describe("validateCreateSceneInput", () => {
  it("accepts a valid kebab-case key and name", () => {
    expect(validateCreateSceneInput({ key: "abertura", name: "Abertura" })).toBeNull();
  });

  it("rejects an empty name", () => {
    expect(validateCreateSceneInput({ key: "abertura", name: "  " })?.code).toBe("broadcast.create-scene.invalid_name");
  });

  it("rejects a key with uppercase letters", () => {
    expect(validateCreateSceneInput({ key: "Abertura", name: "Abertura" })?.code).toBe("broadcast.create-scene.invalid_key");
  });

  it("rejects a key with spaces", () => {
    expect(validateCreateSceneInput({ key: "abertura principal", name: "Abertura" })?.code).toBe(
      "broadcast.create-scene.invalid_key",
    );
  });
});
