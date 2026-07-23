import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRbacContext } from "./contracts/types";

function makeContext(overrides: Partial<UserRbacContext> = {}): UserRbacContext {
  return {
    userId: "user-1",
    roles: [],
    permissions: [],
    isSuperadmin: false,
    ...overrides,
  };
}

describe("user-context-cache", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for a userId that was never cached", async () => {
    const { getCachedUserContext } = await import("./user-context-cache");
    expect(getCachedUserContext("nobody")).toBeNull();
  });

  it("returns the cached value before the TTL expires", async () => {
    const { getCachedUserContext, setCachedUserContext } = await import("./user-context-cache");
    const context = makeContext();

    setCachedUserContext("user-1", context);

    expect(getCachedUserContext("user-1")).toEqual(context);
  });

  it("expires the entry after the TTL", async () => {
    const { getCachedUserContext, setCachedUserContext } = await import("./user-context-cache");
    setCachedUserContext("user-1", makeContext());

    vi.advanceTimersByTime(5 * 60 * 1000 + 1);

    expect(getCachedUserContext("user-1")).toBeNull();
  });

  it("removes the entry when invalidated", async () => {
    const { getCachedUserContext, setCachedUserContext, invalidateUserContext } = await import("./user-context-cache");
    setCachedUserContext("user-1", makeContext());

    invalidateUserContext("user-1");

    expect(getCachedUserContext("user-1")).toBeNull();
  });
});
