import { beforeEach, describe, expect, it, vi } from "vitest";

const findLessonRequirements = vi.fn();
const findPreviousLessonByPosition = vi.fn();
const hasPassingQuizAttempt = vi.fn();
const hasTextCompletion = vi.fn();
const hasVideoCompletion = vi.fn();

vi.mock("./lesson-progress-store", () => ({
  findLessonRequirements: (...args: unknown[]) => findLessonRequirements(...args),
  findPreviousLessonByPosition: (...args: unknown[]) => findPreviousLessonByPosition(...args),
  hasPassingQuizAttempt: (...args: unknown[]) => hasPassingQuizAttempt(...args),
  hasTextCompletion: (...args: unknown[]) => hasTextCompletion(...args),
  hasVideoCompletion: (...args: unknown[]) => hasVideoCompletion(...args),
}));

const lesson1 = { id: "lesson-1", courseId: "course-1", position: 1 } as never;
const lesson2 = { id: "lesson-2", courseId: "course-1", position: 2 } as never;
const lesson3 = { id: "lesson-3", courseId: "course-1", position: 3 } as never;

describe("isLessonComplete", () => {
  beforeEach(() => {
    findLessonRequirements.mockReset();
    hasTextCompletion.mockReset();
    hasVideoCompletion.mockReset();
    hasPassingQuizAttempt.mockReset();
  });

  it("is complete when there are no requirements configured", async () => {
    findLessonRequirements.mockResolvedValue(null);

    const { isLessonComplete } = await import("./lesson-progress");
    expect(await isLessonComplete("lesson-1", "actor-1")).toBe(true);
  });

  it("is incomplete when a single enabled requirement is unmet", async () => {
    findLessonRequirements.mockResolvedValue({
      readTextEnabled: true,
      watchVideoEnabled: false,
      quizEnabled: false,
    });
    hasTextCompletion.mockResolvedValue(false);

    const { isLessonComplete } = await import("./lesson-progress");
    expect(await isLessonComplete("lesson-1", "actor-1")).toBe(false);
  });

  it("is complete only when all three enabled requirements are satisfied", async () => {
    findLessonRequirements.mockResolvedValue({
      readTextEnabled: true,
      watchVideoEnabled: true,
      quizEnabled: true,
    });
    hasTextCompletion.mockResolvedValue(true);
    hasVideoCompletion.mockResolvedValue(true);
    hasPassingQuizAttempt.mockResolvedValue(true);

    const { isLessonComplete } = await import("./lesson-progress");
    expect(await isLessonComplete("lesson-1", "actor-1")).toBe(true);
  });

  it("is incomplete when quiz is enabled but has no passing attempt yet", async () => {
    findLessonRequirements.mockResolvedValue({
      readTextEnabled: true,
      watchVideoEnabled: true,
      quizEnabled: true,
    });
    hasTextCompletion.mockResolvedValue(true);
    hasVideoCompletion.mockResolvedValue(true);
    hasPassingQuizAttempt.mockResolvedValue(false);

    const { isLessonComplete } = await import("./lesson-progress");
    expect(await isLessonComplete("lesson-1", "actor-1")).toBe(false);
  });
});

describe("isLessonAccessible", () => {
  beforeEach(() => {
    findLessonRequirements.mockReset();
    findPreviousLessonByPosition.mockReset();
    hasTextCompletion.mockReset();
    hasVideoCompletion.mockReset();
    hasPassingQuizAttempt.mockReset();
  });

  it("is always accessible when there is no previous lesson", async () => {
    findPreviousLessonByPosition.mockResolvedValue(null);

    const { isLessonAccessible } = await import("./lesson-progress");
    expect(await isLessonAccessible(lesson1, "actor-1")).toBe(true);
  });

  it("is blocked when the previous lesson is incomplete", async () => {
    findPreviousLessonByPosition.mockResolvedValue(lesson1);
    findLessonRequirements.mockResolvedValue({ readTextEnabled: true, watchVideoEnabled: false, quizEnabled: false });
    hasTextCompletion.mockResolvedValue(false);

    const { isLessonAccessible } = await import("./lesson-progress");
    expect(await isLessonAccessible(lesson2, "actor-1")).toBe(false);
  });

  it("is accessible when the previous lesson is complete and itself accessible", async () => {
    findPreviousLessonByPosition.mockImplementation(async (_courseId: string, position: number) =>
      position === 2 ? lesson1 : null,
    );
    findLessonRequirements.mockResolvedValue(null);

    const { isLessonAccessible } = await import("./lesson-progress");
    expect(await isLessonAccessible(lesson2, "actor-1")).toBe(true);
  });

  // Bug 2 (reportado em uso manual): lesson-2 sem nenhuma linha de requirements é "completa"
  // trivialmente mesmo estando ela própria bloqueada (lesson-1 incompleta) — checar só o
  // predecessor imediato deixava lesson-3 acessível, pulando o bloqueio de lesson-1 por trás de
  // lesson-2. isLessonAccessible precisa ser transitivo: toda a cadeia até a primeira lesson
  // precisa estar completa, não só o predecessor direto.
  it("stays blocked through a trivially-complete-but-itself-locked middle lesson", async () => {
    findPreviousLessonByPosition.mockImplementation(async (_courseId: string, position: number) => {
      if (position === 3) return lesson2;
      if (position === 2) return lesson1;
      return null;
    });
    findLessonRequirements.mockImplementation(async (lessonId: string) => {
      if (lessonId === "lesson-1") return { readTextEnabled: true, watchVideoEnabled: false, quizEnabled: false };
      // lesson-2 nunca teve requirements configurados — completa trivialmente, mas está
      // bloqueada porque lesson-1 (sua própria predecessora) não foi concluída.
      return null;
    });
    hasTextCompletion.mockResolvedValue(false);

    const { isLessonAccessible } = await import("./lesson-progress");
    expect(await isLessonAccessible(lesson3, "actor-1")).toBe(false);
  });
});
