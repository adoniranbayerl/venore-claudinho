import { beforeEach, describe, expect, it, vi } from "vitest";

const resolveScopeForActor = vi.fn();
vi.mock("@/contexts/rbac", () => ({
  resolveScopeForActor: (...args: unknown[]) => resolveScopeForActor(...args),
}));

describe("assertCmsCategoryScope", () => {
  beforeEach(() => {
    resolveScopeForActor.mockReset();
  });

  it("allows when the actor holds the permission globally for cms.category", async () => {
    resolveScopeForActor.mockResolvedValue({ kind: "global" });

    const { assertCmsCategoryScope } = await import("./index");
    expect(await assertCmsCategoryScope("actor-1", ["cms.entries.manage"], "cat-a")).toEqual({
      success: true,
      data: undefined,
    });
    expect(resolveScopeForActor).toHaveBeenCalledWith("actor-1", "cms.entries.manage", "cms.category");
  });

  it("allows when the target category is inside the scoped list", async () => {
    resolveScopeForActor.mockResolvedValue({ kind: "scoped", resourceIds: ["cat-a", "cat-b"] });

    const { assertCmsCategoryScope } = await import("./index");
    expect(await assertCmsCategoryScope("actor-1", ["cms.entries.manage"], "cat-b")).toEqual({
      success: true,
      data: undefined,
    });
  });

  it("denies with forbidden_scope when the target category is outside the scoped list", async () => {
    resolveScopeForActor.mockResolvedValue({ kind: "scoped", resourceIds: ["cat-a"] });

    const { assertCmsCategoryScope } = await import("./index");
    const result = await assertCmsCategoryScope("actor-1", ["cms.entries.manage"], "cat-z");

    expect(result).toEqual({
      success: false,
      error: { code: "cms.entries.forbidden_scope", message: expect.any(String) },
    });
  });

  it("denies a scoped actor when categoryId is null (entry/category without a category needs global)", async () => {
    resolveScopeForActor.mockResolvedValue({ kind: "scoped", resourceIds: ["cat-a"] });

    const { assertCmsCategoryScope } = await import("./index");
    const result = await assertCmsCategoryScope("actor-1", ["cms.entries.manage"], null);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("cms.entries.forbidden_scope");
  });

  it("allows a global actor when categoryId is null", async () => {
    resolveScopeForActor.mockResolvedValue({ kind: "global" });

    const { assertCmsCategoryScope } = await import("./index");
    expect(await assertCmsCategoryScope("actor-1", ["cms.categories.manage"], null)).toEqual({
      success: true,
      data: undefined,
    });
  });

  it("returns plain forbidden (not forbidden_scope) when the actor holds none of the keys", async () => {
    resolveScopeForActor.mockResolvedValue({ kind: "none" });

    const { assertCmsCategoryScope } = await import("./index");
    const result = await assertCmsCategoryScope("actor-1", ["cms.entries.publish"], "cat-a");

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: expect.any(String) },
    });
  });

  it("passes when any one key in the list reaches the category (OR)", async () => {
    resolveScopeForActor
      .mockResolvedValueOnce({ kind: "none" })
      .mockResolvedValueOnce({ kind: "scoped", resourceIds: ["cat-a"] });

    const { assertCmsCategoryScope } = await import("./index");
    expect(
      await assertCmsCategoryScope("actor-1", ["cms.entries.publish", "cms.entries.manage"], "cat-a"),
    ).toEqual({ success: true, data: undefined });
  });

  it("derives the error area from the first permission key", async () => {
    resolveScopeForActor.mockResolvedValue({ kind: "scoped", resourceIds: [] });

    const { assertCmsCategoryScope } = await import("./index");
    const result = await assertCmsCategoryScope("actor-1", ["cms.categories.manage"], "cat-a");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("cms.categories.forbidden_scope");
  });
});
