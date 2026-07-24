export { createCourseHandler as createCourse } from "./features/courses/create-course/handler";
export { createLessonHandler as createLesson } from "./features/lessons/create-lesson/handler";
export { configureLessonRequirementsHandler as configureLessonRequirements } from "./features/lessons/configure-lesson-requirements/handler";
export { addQuizQuestionHandler as addQuizQuestion } from "./features/lessons/add-quiz-question/handler";
export { markTextReadHandler as markTextRead } from "./features/progress/mark-text-read/handler";
export { markVideoWatchedHandler as markVideoWatched } from "./features/progress/mark-video-watched/handler";
export { submitQuizAttemptHandler as submitQuizAttempt } from "./features/progress/submit-quiz-attempt/handler";
export { getCourseProgressHandler as getCourseProgress } from "./features/progress/get-course-progress/handler";

export type { CourseRecord, LessonRecord, LessonRequirementsRecord, QuizAnswer, QuizQuestionRecord, QuizAttemptRecord } from "./contracts/types";

export type { CreateCourseInput, CreateCourseResult } from "./features/courses/create-course/types";
export type { CreateLessonInput, CreateLessonResult } from "./features/lessons/create-lesson/types";
export type {
  ConfigureLessonRequirementsInput,
  ConfigureLessonRequirementsResult,
} from "./features/lessons/configure-lesson-requirements/types";
export type { AddQuizQuestionInput, AddQuizQuestionResult } from "./features/lessons/add-quiz-question/types";
export type { MarkTextReadInput, MarkTextReadResult } from "./features/progress/mark-text-read/types";
export type { MarkVideoWatchedInput, MarkVideoWatchedResult } from "./features/progress/mark-video-watched/types";
export type { SubmitQuizAttemptInput, SubmitQuizAttemptResult } from "./features/progress/submit-quiz-attempt/types";
export type {
  GetCourseProgressInput,
  GetCourseProgressResult,
  CourseProgressView,
  LessonProgressView,
} from "./features/progress/get-course-progress/types";
