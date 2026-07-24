import { beforeEach, describe, expect, it, vi } from "vitest";

const findPublishedCourseById = vi.fn();

vi.mock("./store", () => ({
  findPublishedCourseById: (...args: unknown[]) => findPublishedCourseById(...args),
}));

describe("getCourseForStudent", () => {
  beforeEach(() => {
    findPublishedCourseById.mockReset();
  });

  it("returns the course when it exists and is published", async () => {
    const course = {
      id: "course-1",
      title: "Intro",
      description: null,
      status: "published",
      createdBy: "actor-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    findPublishedCourseById.mockResolvedValue(course);

    const { getCourseForStudent } = await import("./service");
    const result = await getCourseForStudent({ id: "course-1" });

    expect(result).toEqual({ success: true, data: course });
  });

  it("returns null data for a draft or missing course, never leaking it", async () => {
    findPublishedCourseById.mockResolvedValue(null);

    const { getCourseForStudent } = await import("./service");
    const result = await getCourseForStudent({ id: "draft-course" });

    expect(result).toEqual({ success: true, data: null });
  });
});
