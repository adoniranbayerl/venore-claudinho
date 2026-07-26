import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findCourseById = vi.fn();
const findCourseBySlug = vi.fn();
const applyCourseSettings = vi.fn();

vi.mock("./store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
  findCourseBySlug: (...args: unknown[]) => findCourseBySlug(...args),
  applyCourseSettings: (...args: unknown[]) => applyCourseSettings(...args),
}));

describe("updateCourseSettings", () => {
  beforeEach(() => {
    findCourseById.mockReset();
    findCourseBySlug.mockReset();
    applyCourseSettings.mockReset();
  });

  it("updates the course flags when the course exists", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", slug: "curso-1", selfEnrollmentEnabled: true, publiclyListed: true });
    applyCourseSettings.mockResolvedValue({ id: "course-1", selfEnrollmentEnabled: false, publiclyListed: false });

    const { updateCourseSettings } = await import("./service");
    const result = await updateCourseSettings({
      id: "course-1",
      selfEnrollmentEnabled: false,
      publiclyListed: false,
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: true, data: { id: "course-1", selfEnrollmentEnabled: false, publiclyListed: false } });
    expect(applyCourseSettings).toHaveBeenCalledWith({
      id: "course-1",
      slug: undefined,
      selfEnrollmentEnabled: false,
      publiclyListed: false,
    });
    expect(findCourseBySlug).not.toHaveBeenCalled();
  });

  it("fails when the course does not exist", async () => {
    findCourseById.mockResolvedValue(null);

    const { updateCourseSettings } = await import("./service");
    const result = await updateCourseSettings({
      id: "missing",
      selfEnrollmentEnabled: false,
      publiclyListed: false,
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.courses.not_found", message: expect.any(String) },
    });
    expect(applyCourseSettings).not.toHaveBeenCalled();
  });

  it("rejects a slug already used by another course", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", slug: "curso-1", selfEnrollmentEnabled: true, publiclyListed: true });
    findCourseBySlug.mockResolvedValue({ id: "course-2", slug: "curso-2" });

    const { updateCourseSettings } = await import("./service");
    const result = await updateCourseSettings({
      id: "course-1",
      slug: "curso-2",
      selfEnrollmentEnabled: true,
      publiclyListed: true,
      actorId: "actor-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("academy.courses.slug_taken");
    expect(applyCourseSettings).not.toHaveBeenCalled();
  });

  it("rejects an empty/invalid slug", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", slug: "curso-1", selfEnrollmentEnabled: true, publiclyListed: true });

    const { updateCourseSettings } = await import("./service");
    const result = await updateCourseSettings({
      id: "course-1",
      slug: "   ",
      selfEnrollmentEnabled: true,
      publiclyListed: true,
      actorId: "actor-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("academy.courses.invalid_slug");
    expect(applyCourseSettings).not.toHaveBeenCalled();
  });

  it("allows keeping the same slug the course already has", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", slug: "curso-1", selfEnrollmentEnabled: true, publiclyListed: true });
    applyCourseSettings.mockResolvedValue({ id: "course-1", slug: "curso-1" });

    const { updateCourseSettings } = await import("./service");
    const result = await updateCourseSettings({
      id: "course-1",
      slug: "curso-1",
      selfEnrollmentEnabled: true,
      publiclyListed: true,
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(findCourseBySlug).not.toHaveBeenCalled();
  });
});
