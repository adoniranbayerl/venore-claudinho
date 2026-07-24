import { beforeEach, describe, expect, it, vi } from "vitest";

const findPublishedCourses = vi.fn();

vi.mock("./store", () => ({
  findPublishedCourses: (...args: unknown[]) => findPublishedCourses(...args),
}));

describe("listCoursesForStudent", () => {
  beforeEach(() => {
    findPublishedCourses.mockReset();
  });

  it("returns only what the store resolves as published", async () => {
    const courses = [
      {
        id: "course-1",
        title: "Intro",
        description: null,
        status: "published",
        createdBy: "actor-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    findPublishedCourses.mockResolvedValue(courses);

    const { listCoursesForStudent } = await import("./service");
    const result = await listCoursesForStudent();

    expect(result).toEqual({ success: true, data: courses });
  });
});
