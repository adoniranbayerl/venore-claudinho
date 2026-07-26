import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const getEntry = vi.fn();

vi.mock("@/contexts/cms", () => ({
  getEntry: (...args: unknown[]) => getEntry(...args),
}));

const findLessonById = vi.fn();
const updateLesson = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  updateLesson: (...args: unknown[]) => updateLesson(...args),
}));

const existingLesson = {
  id: "lesson-1",
  courseId: "course-1",
  cmsEntryId: "entry-1",
  videoUrl: null,
  position: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("updateLessonService", () => {
  beforeEach(() => {
    getEntry.mockReset();
    findLessonById.mockReset();
    updateLesson.mockReset();
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { updateLessonService } = await import("./service");
    const result = await updateLessonService({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.not_found", message: expect.any(String) },
    });
    expect(updateLesson).not.toHaveBeenCalled();
  });

  it("fails when the new cmsEntryId does not reference an existing entry", async () => {
    findLessonById.mockResolvedValue(existingLesson);
    getEntry.mockResolvedValue({ success: true, data: null });

    const { updateLessonService } = await import("./service");
    const result = await updateLessonService({ id: "lesson-1", cmsEntryId: "missing-entry", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.invalid_cms_entry", message: expect.any(String) },
    });
    expect(updateLesson).not.toHaveBeenCalled();
  });

  it("updates the lesson when the new cmsEntryId is valid", async () => {
    findLessonById.mockResolvedValue(existingLesson);
    getEntry.mockResolvedValue({ success: true, data: { id: "entry-2" } });
    updateLesson.mockResolvedValue({ ...existingLesson, cmsEntryId: "entry-2", videoUrl: "https://video" });

    const { updateLessonService } = await import("./service");
    const result = await updateLessonService({
      id: "lesson-1",
      cmsEntryId: "entry-2",
      videoUrl: "https://video",
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(updateLesson).toHaveBeenCalledWith("lesson-1", { cmsEntryId: "entry-2", videoUrl: "https://video" });
  });

  it("updates videoUrl without revalidating the cmsEntryId when it is unchanged", async () => {
    findLessonById.mockResolvedValue(existingLesson);
    updateLesson.mockResolvedValue({ ...existingLesson, videoUrl: "https://video" });

    const { updateLessonService } = await import("./service");
    const result = await updateLessonService({ id: "lesson-1", videoUrl: "https://video", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(getEntry).not.toHaveBeenCalled();
  });
});
