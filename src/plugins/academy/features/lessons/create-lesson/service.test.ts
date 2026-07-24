import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const getEntry = vi.fn();

vi.mock("@/contexts/cms", () => ({
  getEntry: (...args: unknown[]) => getEntry(...args),
}));

const findNextPosition = vi.fn();
const insertLesson = vi.fn();

vi.mock("./store", () => ({
  findNextPosition: (...args: unknown[]) => findNextPosition(...args),
  insertLesson: (...args: unknown[]) => insertLesson(...args),
}));

describe("createLesson", () => {
  beforeEach(() => {
    getEntry.mockReset();
    findNextPosition.mockReset();
    insertLesson.mockReset();
  });

  it("fails when the cmsEntryId does not reference an existing published entry", async () => {
    getEntry.mockResolvedValue({ success: true, data: null });

    const { createLesson } = await import("./service");
    const result = await createLesson({ courseId: "course-1", cmsEntryId: "missing-entry", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.invalid_cms_entry", message: expect.any(String) },
    });
    expect(insertLesson).not.toHaveBeenCalled();
  });

  it("creates the lesson at the next available position when the cmsEntryId is valid", async () => {
    getEntry.mockResolvedValue({ success: true, data: { id: "entry-1" } });
    findNextPosition.mockResolvedValue(3);
    insertLesson.mockResolvedValue({
      id: "lesson-1",
      courseId: "course-1",
      cmsEntryId: "entry-1",
      videoUrl: null,
      position: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createLesson } = await import("./service");
    const result = await createLesson({ courseId: "course-1", cmsEntryId: "entry-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(insertLesson).toHaveBeenCalledWith({ courseId: "course-1", cmsEntryId: "entry-1", videoUrl: undefined, position: 3 });
  });
});
