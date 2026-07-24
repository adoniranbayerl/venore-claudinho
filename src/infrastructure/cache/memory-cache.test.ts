import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("memory-cache", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for a key that was never cached", async () => {
    const { getCache } = await import("./memory-cache");
    expect(getCache("nobody")).toBeNull();
  });

  it("returns the cached value before the TTL expires", async () => {
    const { getCache, setCache } = await import("./memory-cache");

    setCache("key-1", { foo: "bar" }, 60);

    expect(getCache("key-1")).toEqual({ foo: "bar" });
  });

  it("expires the entry after the TTL", async () => {
    const { getCache, setCache } = await import("./memory-cache");
    setCache("key-1", "value", 60);

    vi.advanceTimersByTime(60 * 1000 + 1);

    expect(getCache("key-1")).toBeNull();
  });

  it("removes a specific key on invalidateCache without affecting others", async () => {
    const { getCache, setCache, invalidateCache } = await import("./memory-cache");
    setCache("key-1", "value-1", 60);
    setCache("key-2", "value-2", 60);

    invalidateCache("key-1");

    expect(getCache("key-1")).toBeNull();
    expect(getCache("key-2")).toBe("value-2");
  });

  it("removes all keys matching a prefix on invalidateCacheByPrefix, preserving others", async () => {
    const { getCache, setCache, invalidateCacheByPrefix } = await import("./memory-cache");
    setCache("rbac:catalog:roles", "roles", 60);
    setCache("rbac:catalog:permissions", "permissions", 60);
    setCache("nav:main", "nav", 60);

    invalidateCacheByPrefix("rbac:catalog:");

    expect(getCache("rbac:catalog:roles")).toBeNull();
    expect(getCache("rbac:catalog:permissions")).toBeNull();
    expect(getCache("nav:main")).toBe("nav");
  });

  it("lets different keys expire independently based on their own TTL", async () => {
    const { getCache, setCache } = await import("./memory-cache");
    setCache("short-lived", "value", 10);
    setCache("long-lived", "value", 120);

    vi.advanceTimersByTime(10 * 1000 + 1);

    expect(getCache("short-lived")).toBeNull();
    expect(getCache("long-lived")).toBe("value");
  });
});
