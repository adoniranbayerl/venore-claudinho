import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findCourseById = vi.fn();
const markCoursePublished = vi.fn();
const findLessonsWithQuizFlagByCourse = vi.fn();
const countQuizQuestionsByLessonIds = vi.fn();
const getEntry = vi.fn();

vi.mock("./store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
  markCoursePublished: (...args: unknown[]) => markCoursePublished(...args),
  findLessonsWithQuizFlagByCourse: (...args: unknown[]) => findLessonsWithQuizFlagByCourse(...args),
  countQuizQuestionsByLessonIds: (...args: unknown[]) => countQuizQuestionsByLessonIds(...args),
}));

vi.mock("@/contexts/cms", () => ({
  getEntry: (...args: unknown[]) => getEntry(...args),
}));

const publishedLesson = (overrides: Partial<{ id: string; cmsEntryId: string; position: number; quizEnabled: boolean }> = {}) => ({
  id: "lesson-1",
  cmsEntryId: "entry-1",
  position: 1,
  quizEnabled: false,
  ...overrides,
});

describe("publishCourse", () => {
  beforeEach(() => {
    findCourseById.mockReset();
    markCoursePublished.mockReset();
    findLessonsWithQuizFlagByCourse.mockReset();
    countQuizQuestionsByLessonIds.mockReset();
    getEntry.mockReset();

    countQuizQuestionsByLessonIds.mockResolvedValue(new Map());
  });

  it("publishes a course with a published lesson", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "draft" });
    findLessonsWithQuizFlagByCourse.mockResolvedValue([publishedLesson()]);
    getEntry.mockResolvedValue({ success: true, data: { id: "entry-1", status: "published" } });
    markCoursePublished.mockResolvedValue({ id: "course-1", status: "published" });

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "course-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "course-1", status: "published" } });
    expect(markCoursePublished).toHaveBeenCalledWith("course-1");
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

  it("fails when the course has no lessons", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "draft" });
    findLessonsWithQuizFlagByCourse.mockResolvedValue([]);

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("academy.courses.publish_validation_failed");
      expect(result.error.message).toContain("pelo menos uma aula");
    }
    expect(markCoursePublished).not.toHaveBeenCalled();
  });

  it("fails when a lesson's cms entry is not published", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "draft" });
    findLessonsWithQuizFlagByCourse.mockResolvedValue([publishedLesson({ position: 2 })]);
    getEntry.mockResolvedValue({ success: true, data: { id: "entry-1", status: "draft" } });

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Aula 2");
      expect(result.error.message).toContain("não está publicado");
    }
    expect(markCoursePublished).not.toHaveBeenCalled();
  });

  it("fails when a lesson's cms entry no longer exists", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "draft" });
    findLessonsWithQuizFlagByCourse.mockResolvedValue([publishedLesson()]);
    getEntry.mockResolvedValue({ success: true, data: null });

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(false);
    expect(markCoursePublished).not.toHaveBeenCalled();
  });

  it("fails when a quiz-enabled lesson has no questions", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "draft" });
    findLessonsWithQuizFlagByCourse.mockResolvedValue([publishedLesson({ quizEnabled: true })]);
    getEntry.mockResolvedValue({ success: true, data: { id: "entry-1", status: "published" } });
    countQuizQuestionsByLessonIds.mockResolvedValue(new Map());

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("quiz habilitado sem nenhuma pergunta");
    }
    expect(markCoursePublished).not.toHaveBeenCalled();
  });

  it("reports every problem found, not just the first", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "draft" });
    findLessonsWithQuizFlagByCourse.mockResolvedValue([
      publishedLesson({ id: "lesson-1", cmsEntryId: "entry-1", position: 1, quizEnabled: true }),
      publishedLesson({ id: "lesson-2", cmsEntryId: "entry-2", position: 2, quizEnabled: false }),
    ]);
    getEntry.mockImplementation(({ id }: { id: string }) =>
      id === "entry-1"
        ? Promise.resolve({ success: true, data: { id, status: "draft" } })
        : Promise.resolve({ success: true, data: { id, status: "draft" } }),
    );
    countQuizQuestionsByLessonIds.mockResolvedValue(new Map());

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Aula 1");
      expect(result.error.message).toContain("Aula 2");
      expect(result.error.message).toContain("quiz habilitado sem nenhuma pergunta");
    }
    expect(markCoursePublished).not.toHaveBeenCalled();
  });
});
