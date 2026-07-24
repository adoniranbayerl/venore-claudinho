import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findCourseById = vi.fn();
const applyCourseSettings = vi.fn();

vi.mock("./store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
  applyCourseSettings: (...args: unknown[]) => applyCourseSettings(...args),
}));

describe("updateCourseSettings", () => {
  beforeEach(() => {
    findCourseById.mockReset();
    applyCourseSettings.mockReset();
  });

  it("updates the course flags when the course exists", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", selfEnrollmentEnabled: true, publiclyListed: true });
    applyCourseSettings.mockResolvedValue({ id: "course-1", selfEnrollmentEnabled: false, publiclyListed: false });

    const { updateCourseSettings } = await import("./service");
    const result = await updateCourseSettings({
      id: "course-1",
      selfEnrollmentEnabled: false,
      publiclyListed: false,
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: true, data: { id: "course-1", selfEnrollmentEnabled: false, publiclyListed: false } });
    expect(applyCourseSettings).toHaveBeenCalledWith({ id: "course-1", selfEnrollmentEnabled: false, publiclyListed: false });
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
});
