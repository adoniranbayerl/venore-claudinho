import { describe, expect, it } from "vitest";
import { seedCourse, seedLessons, seedPublishedEntry, seedUser } from "@/test-support/integration/academy-seed";
import { updateLessonService } from "./service";

describe("updateLessonService (integração)", () => {
  it("troca o cmsEntryId por uma entry existente de verdade", async () => {
    const teacher = await seedUser();
    const course = await seedCourse(teacher.id);
    const [lesson] = await seedLessons(course.id, 1, teacher.id);
    const newEntry = await seedPublishedEntry(teacher.id);

    const result = await updateLessonService({ id: lesson.id, cmsEntryId: newEntry.id, actorId: teacher.id });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cmsEntryId).toBe(newEntry.id);
    }
  });

  it("recusa trocar para um cmsEntryId que não existe", async () => {
    const teacher = await seedUser();
    const course = await seedCourse(teacher.id);
    const [lesson] = await seedLessons(course.id, 1, teacher.id);

    const result = await updateLessonService({ id: lesson.id, cmsEntryId: "does-not-exist", actorId: teacher.id });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.invalid_cms_entry", message: expect.any(String) },
    });
  });
});
