export type CourseRecord = {
  id: string;
  title: string;
  description: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LessonRecord = {
  id: string;
  courseId: string;
  cmsEntryId: string;
  videoUrl: string | null;
  position: number;
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
};
