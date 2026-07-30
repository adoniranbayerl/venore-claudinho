export type CourseStatus = "draft" | "published";

export type CourseRecord = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: CourseStatus;
  createdBy: string;
  selfEnrollmentEnabled: boolean;
  publiclyListed: boolean;
  coverMediaId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LessonRecord = {
  id: string;
  courseId: string;
  cmsEntryId: string;
  videoUrl: string | null;
  position: number;
  coverMediaId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LessonSectionRecord = {
  id: string;
  lessonId: string;
  position: number;
  title: string;
  cmsEntryId: string | null;
  videoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LessonRequirementsRecord = {
  lessonId: string;
  readTextEnabled: boolean;
  watchVideoEnabled: boolean;
  quizEnabled: boolean;
  quizPassThresholdPercent: number | null;
  quizMaxAttempts: number | null;
  updatedAt: Date;
};

export type QuizQuestionRecord = {
  id: string;
  lessonId: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  createdAt: Date;
};

// Mesma forma de QuizQuestionRecord, sem correctOptionIndex — leitura de aluno respondendo o
// quiz, que não pode saber a resposta certa antes de responder (ver
// list-quiz-questions-for-student/service.ts).
export type StudentQuizQuestionRecord = Omit<QuizQuestionRecord, "correctOptionIndex">;

export type QuizAnswer = { questionId: string; selectedOptionIndex: number };

export type QuizAttemptRecord = {
  id: string;
  lessonId: string;
  actorId: string;
  attemptNumber: number;
  score: number;
  passed: boolean;
  answers: QuizAnswer[];
  createdAt: Date;
  invalidatedAt: Date | null;
};

export type EnrollmentRecord = {
  id: string;
  courseId: string;
  actorId: string;
  enrolledAt: Date;
  // "self" ou o actorId de quem matriculou manualmente.
  enrolledBy: string;
};
