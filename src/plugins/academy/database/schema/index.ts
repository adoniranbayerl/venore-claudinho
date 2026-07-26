import { sql } from "drizzle-orm";
import { boolean, integer, jsonb, pgSchema, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const academySchema = pgSchema("academy");

// createdBy é texto solto, sem FK pra auth.users: um plugin não pode importar
// contexts/auth/database/schema (regra 7 — "nunca de store, schema, database/client... vale
// tanto pra leitura quanto escrita"). Vale pra toda coluna actorId/createdBy deste schema.
export const courses = academySchema.table(
  "courses",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    // Gerado do título na criação (slugify), editável depois — usado nas rotas públicas de aluno
    // em vez do id (item 2 do pedido da sessão de publish-course/slug/embed).
    slug: text("slug").notNull(),
    // "draft" | "published" — ver contracts/types.ts (CourseStatus).
    status: text("status").notNull().default("draft"),
    createdBy: text("created_by").notNull(),
    // Independentes um do outro (plano da sessão de matrícula): selfEnrollmentEnabled controla se
    // o botão "matricular-se" existe; publiclyListed controla só a listagem
    // (list-courses-for-student) — acesso direto por URL não depende de publiclyListed.
    selfEnrollmentEnabled: boolean("self_enrollment_enabled").notNull().default(true),
    publiclyListed: boolean("publicly_listed").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("courses_slug_idx").on(table.slug)],
);

export const lessons = academySchema.table(
  "lessons",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    // Sem FK pra cms.entries pelo mesmo motivo de createdBy acima — validado via
    // contexts/cms.getEntry() na aplicação (regra 7).
    cmsEntryId: text("cms_entry_id").notNull(),
    videoUrl: text("video_url"),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (lesson) => [uniqueIndex("lessons_course_position_idx").on(lesson.courseId, lesson.position)],
);

// 1:1 com lessons — lessonId é a própria PK, upsert em configure-lesson-requirements.
export const lessonRequirements = academySchema.table("lesson_requirements", {
  lessonId: text("lesson_id")
    .primaryKey()
    .references(() => lessons.id, { onDelete: "cascade" }),
  readTextEnabled: boolean("read_text_enabled").notNull().default(false),
  watchVideoEnabled: boolean("watch_video_enabled").notNull().default(false),
  quizEnabled: boolean("quiz_enabled").notNull().default(false),
  quizPassThresholdPercent: integer("quiz_pass_threshold_percent"),
  quizMaxAttempts: integer("quiz_max_attempts"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quizQuestions = academySchema.table("quiz_questions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctOptionIndex: integer("correct_option_index").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lessonTextCompletions = academySchema.table(
  "lesson_text_completions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lesson_text_completions_lesson_actor_idx").on(table.lessonId, table.actorId)],
);

export const lessonVideoCompletions = academySchema.table(
  "lesson_video_completions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lesson_video_completions_lesson_actor_idx").on(table.lessonId, table.actorId)],
);

export const quizAttempts = academySchema.table(
  "quiz_attempts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    score: integer("score").notNull(),
    passed: boolean("passed").notNull(),
    answers: jsonb("answers").$type<{ questionId: string; selectedOptionIndex: number }[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // Reset de professor invalida em vez de apagar (auditoria — plano da sessão de reset de
    // tentativas). null = tentativa ativa, conta pro limite de quizMaxAttempts.
    invalidatedAt: timestamp("invalidated_at", { withTimezone: true }),
  },
  (table) => [
    // Parcial (só linhas ativas): permite a numeração de tentativa reiniciar em 1 depois de
    // um reset sem colidir com attempt_number de linhas antigas já invalidadas.
    uniqueIndex("quiz_attempts_lesson_actor_attempt_idx")
      .on(table.lessonId, table.actorId, table.attemptNumber)
      .where(sql`${table.invalidatedAt} is null`),
  ],
);

export const enrollments = academySchema.table(
  "enrollments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
    // "self" (enroll-self) ou o actorId de quem matriculou manualmente (enroll-student).
    enrolledBy: text("enrolled_by").notNull(),
  },
  (table) => [uniqueIndex("enrollments_course_actor_idx").on(table.courseId, table.actorId)],
);
