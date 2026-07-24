import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findLessonRequirements = vi.fn();
const isLessonAccessible = vi.fn();

vi.mock("../../../shared/lesson-progress", () => ({
  findLessonRequirements: (...args: unknown[]) => findLessonRequirements(...args),
  isLessonAccessible: (...args: unknown[]) => isLessonAccessible(...args),
}));

const findLessonById = vi.fn();
const insertVideoCompletionIfMissing = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  insertVideoCompletionIfMissing: (...args: unknown[]) => insertVideoCompletionIfMissing(...args),
}));

const lesson = { id: "lesson-1", courseId: "course-1", position: 1 };

describe("markVideoWatched", () => {
  beforeEach(() => {
    findLessonById.mockReset();
    isLessonAccessible.mockReset();
    findLessonRequirements.mockReset();
    insertVideoCompletionIfMissing.mockReset();

    findLessonById.mockResolvedValue(lesson);
    isLessonAccessible.mockResolvedValue(true);
  });

  it("fails when watchVideoEnabled is not set on the lesson", async () => {
    findLessonRequirements.mockResolvedValue({ readTextEnabled: false, watchVideoEnabled: false, quizEnabled: false });

    const { markVideoWatched } = await import("./service");
    const result = await markVideoWatched({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.progress.requirement_not_enabled", message: expect.any(String) },
    });
    expect(insertVideoCompletionIfMissing).not.toHaveBeenCalled();
  });

  it("fails when the lesson is locked", async () => {
    isLessonAccessible.mockResolvedValue(false);

    const { markVideoWatched } = await import("./service");
    const result = await markVideoWatched({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.progress.lesson_locked", message: expect.any(String) } });
  });

  it("is idempotent — marking twice succeeds both times without duplicating", async () => {
    findLessonRequirements.mockResolvedValue({ readTextEnabled: false, watchVideoEnabled: true, quizEnabled: false });

    const { markVideoWatched } = await import("./service");
    const first = await markVideoWatched({ lessonId: "lesson-1", actorId: "actor-1" });
    const second = await markVideoWatched({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(first).toEqual({ success: true, data: { lessonId: "lesson-1", completed: true } });
    expect(second).toEqual({ success: true, data: { lessonId: "lesson-1", completed: true } });
    expect(insertVideoCompletionIfMissing).toHaveBeenCalledTimes(2);
  });
});
