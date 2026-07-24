import { beforeEach, describe, expect, it, vi } from "vitest";

const findLessonRequirements = vi.fn();
const isLessonComplete = vi.fn();

vi.mock("../../../shared/lesson-progress", () => ({
  findLessonRequirements: (...args: unknown[]) => findLessonRequirements(...args),
  isLessonComplete: (...args: unknown[]) => isLessonComplete(...args),
}));

const findCourseById = vi.fn();
const findLessonsByCourse = vi.fn();
const hasTextCompletion = vi.fn();
const hasVideoCompletion = vi.fn();
const findQuizAttempts = vi.fn();

vi.mock("./store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
  findLessonsByCourse: (...args: unknown[]) => findLessonsByCourse(...args),
  hasTextCompletion: (...args: unknown[]) => hasTextCompletion(...args),
  hasVideoCompletion: (...args: unknown[]) => hasVideoCompletion(...args),
  findQuizAttempts: (...args: unknown[]) => findQuizAttempts(...args),
}));

const course = { id: "course-1", title: "Course", description: null, createdBy: "prof-1", createdAt: new Date(), updatedAt: new Date() };
const lesson1 = { id: "lesson-1", courseId: "course-1", cmsEntryId: "entry-1", videoUrl: null, position: 1, createdAt: new Date(), updatedAt: new Date() };
const lesson2 = { id: "lesson-2", courseId: "course-1", cmsEntryId: "entry-2", videoUrl: null, position: 2, createdAt: new Date(), updatedAt: new Date() };

describe("getCourseProgress", () => {
  beforeEach(() => {
    findCourseById.mockReset();
    findLessonsByCourse.mockReset();
    hasTextCompletion.mockReset();
    hasVideoCompletion.mockReset();
    findQuizAttempts.mockReset();
    findLessonRequirements.mockReset();
    isLessonComplete.mockReset();

    findCourseById.mockResolvedValue(course);
    hasTextCompletion.mockResolvedValue(false);
    hasVideoCompletion.mockResolvedValue(false);
    findQuizAttempts.mockResolvedValue([]);
    findLessonRequirements.mockResolvedValue(null);
  });

  it("fails when the course does not exist", async () => {
    findCourseById.mockResolvedValue(null);

    const { getCourseProgress } = await import("./service");
    const result = await getCourseProgress({ courseId: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.courses.not_found", message: expect.any(String) } });
  });

  it("marks the first lesson unlocked and locks the second when the first is incomplete", async () => {
    findLessonsByCourse.mockResolvedValue([lesson1, lesson2]);
    isLessonComplete.mockImplementation(async (lessonId: string) => lessonId === "lesson-2");

    const { getCourseProgress } = await import("./service");
    const result = await getCourseProgress({ courseId: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.lessons[0]).toMatchObject({ lessonId: "lesson-1", locked: false, completed: false });
    expect(result.data.lessons[1]).toMatchObject({ lessonId: "lesson-2", locked: true, completed: true });
    expect(result.data.completedLessons).toBe(1);
    expect(result.data.courseCompleted).toBe(false);
  });

  it("unlocks the second lesson once the first is complete", async () => {
    findLessonsByCourse.mockResolvedValue([lesson1, lesson2]);
    isLessonComplete.mockResolvedValue(true);

    const { getCourseProgress } = await import("./service");
    const result = await getCourseProgress({ courseId: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.lessons[1]).toMatchObject({ locked: false, completed: true });
    expect(result.data.courseCompleted).toBe(true);
  });
});
