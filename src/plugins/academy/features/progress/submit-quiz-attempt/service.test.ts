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
const findQuestionsByLesson = vi.fn();
const countAttempts = vi.fn();
const insertAttempt = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findQuestionsByLesson: (...args: unknown[]) => findQuestionsByLesson(...args),
  countAttempts: (...args: unknown[]) => countAttempts(...args),
  insertAttempt: (...args: unknown[]) => insertAttempt(...args),
}));

const lesson = { id: "lesson-1", courseId: "course-1", position: 1 };
const requirements = {
  lessonId: "lesson-1",
  readTextEnabled: false,
  watchVideoEnabled: false,
  quizEnabled: true,
  quizPassThresholdPercent: 70,
  quizMaxAttempts: 2,
  updatedAt: new Date(),
};
const questions = [
  { id: "q1", lessonId: "lesson-1", text: "1+1", options: ["1", "2"], correctOptionIndex: 1, createdAt: new Date() },
  { id: "q2", lessonId: "lesson-1", text: "2+2", options: ["3", "4"], correctOptionIndex: 1, createdAt: new Date() },
];

describe("submitQuizAttempt", () => {
  beforeEach(() => {
    findLessonById.mockReset();
    isLessonAccessible.mockReset();
    findLessonRequirements.mockReset();
    findQuestionsByLesson.mockReset();
    countAttempts.mockReset();
    insertAttempt.mockReset();

    findLessonById.mockResolvedValue(lesson);
    isLessonAccessible.mockResolvedValue(true);
    findLessonRequirements.mockResolvedValue(requirements);
    findQuestionsByLesson.mockResolvedValue(questions);
    countAttempts.mockResolvedValue(0);
    insertAttempt.mockResolvedValue({});
  });

  it("grades automatically and computes the percentage score", async () => {
    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [
        { questionId: "q1", selectedOptionIndex: 1 },
        { questionId: "q2", selectedOptionIndex: 0 },
      ],
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: true, data: { attemptNumber: 1, score: 50, passed: false, attemptsRemaining: 1 } });
  });

  it("passes exactly at the configured threshold", async () => {
    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [
        { questionId: "q1", selectedOptionIndex: 1 },
        { questionId: "q2", selectedOptionIndex: 1 },
      ],
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: true, data: { attemptNumber: 1, score: 100, passed: true, attemptsRemaining: 1 } });
  });

  it("blocks a new attempt once quizMaxAttempts is exhausted, without inserting", async () => {
    countAttempts.mockResolvedValue(2);

    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [
        { questionId: "q1", selectedOptionIndex: 1 },
        { questionId: "q2", selectedOptionIndex: 1 },
      ],
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.attempts_exhausted", message: expect.any(String) },
    });
    expect(insertAttempt).not.toHaveBeenCalled();
  });

  it("fails when there are no quiz questions configured for the lesson", async () => {
    findQuestionsByLesson.mockResolvedValue([]);

    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [{ questionId: "q1", selectedOptionIndex: 1 }],
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: false, error: { code: "academy.quiz.no_questions", message: expect.any(String) } });
    expect(insertAttempt).not.toHaveBeenCalled();
  });

  it("fails when the answers do not cover every question", async () => {
    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [{ questionId: "q1", selectedOptionIndex: 1 }],
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.incomplete_answers", message: expect.any(String) },
    });
    expect(insertAttempt).not.toHaveBeenCalled();
  });

  it("fails when quiz is not enabled for the lesson", async () => {
    findLessonRequirements.mockResolvedValue({ ...requirements, quizEnabled: false });

    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [{ questionId: "q1", selectedOptionIndex: 1 }],
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: false, error: { code: "academy.quiz.not_enabled", message: expect.any(String) } });
  });

  it("fails when the lesson is locked (previous lesson incomplete)", async () => {
    isLessonAccessible.mockResolvedValue(false);

    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [{ questionId: "q1", selectedOptionIndex: 1 }],
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: false, error: { code: "academy.progress.lesson_locked", message: expect.any(String) } });
  });
});
