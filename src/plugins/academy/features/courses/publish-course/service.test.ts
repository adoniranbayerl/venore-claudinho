import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findCourseById = vi.fn();
const markCoursePublished = vi.fn();

vi.mock("./store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
  markCoursePublished: (...args: unknown[]) => markCoursePublished(...args),
}));

describe("publishCourse", () => {
  beforeEach(() => {
    findCourseById.mockReset();
    markCoursePublished.mockReset();
  });

  it("publishes an existing course", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "draft" });
    markCoursePublished.mockResolvedValue({ id: "course-1", status: "published" });

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "course-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "course-1", status: "published" } });
  });

  it("fails when the course does not exist", async () => {
    findCourseById.mockResolvedValue(null);

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.courses.not_found", message: expect.any(String) },
    });
    expect(markCoursePublished).not.toHaveBeenCalled();
  });
});
