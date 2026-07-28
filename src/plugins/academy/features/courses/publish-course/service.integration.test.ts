import { describe, expect, it } from "vitest";
import {
  seedCourse,
  seedLessonRequirements,
  seedLessons,
  seedLessonWithDraftEntry,
  seedUser,
} from "@/test-support/integration/academy-seed";
import { publishCourse } from "./service";

describe("publishCourse (integração)", () => {
  it("recusa um curso sem nenhuma aula", async () => {
    const teacher = await seedUser();
    const course = await seedCourse(teacher.id);

    const result = await publishCourse({ id: course.id, actorId: teacher.id });

    expect(result).toEqual({
      success: false,
      error: {
        code: "academy.courses.publish_validation_failed",
        message: "O curso precisa de pelo menos uma aula.",
      },
    });
  });

  it("acumula os dois problemas de uma vez quando há aula com entry em rascunho e aula com quiz sem pergunta", async () => {
    const teacher = await seedUser();
    const course = await seedCourse(teacher.id);

    // Aula 1: entry publicada de verdade, mas quiz habilitado sem nenhuma pergunta cadastrada —
    // isolado do problema de entry em rascunho, que fica só na aula 2.
    const [lessonWithEmptyQuiz] = await seedLessons(course.id, 1, teacher.id);
    await seedLessonRequirements(lessonWithEmptyQuiz.id, teacher.id, {
      quizEnabled: true,
      quizPassThresholdPercent: 50,
      quizMaxAttempts: 3,
    });

    // Aula 2: entry ainda em rascunho.
    await seedLessonWithDraftEntry(course.id, teacher.id);

    const result = await publishCourse({ id: course.id, actorId: teacher.id });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("academy.courses.publish_validation_failed");
      expect(result.error.message).toContain("quiz habilitado sem nenhuma pergunta cadastrada");
      expect(result.error.message).toContain("o conteúdo vinculado não está publicado");
    }
  });
});
