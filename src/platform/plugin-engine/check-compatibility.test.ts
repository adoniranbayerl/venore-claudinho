import { describe, expect, it } from "vitest";
import { isCoreVersionCompatible } from "./check-compatibility";

describe("isCoreVersionCompatible", () => {
  it("returns true when the core version satisfies the declared range", () => {
    expect(isCoreVersionCompatible(">=2.0.0 <3.0.0")).toBe(true);
  });

  it("returns false when the core version is outside the declared range", () => {
    expect(isCoreVersionCompatible(">=3.0.0")).toBe(false);
  });

  it("returns false for a malformed range", () => {
    expect(isCoreVersionCompatible("not-a-range")).toBe(false);
  });
});
