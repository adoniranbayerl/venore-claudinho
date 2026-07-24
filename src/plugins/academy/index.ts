export { createCourseHandler as createCourse } from "./features/courses/create-course/handler";
export { listCoursesHandler as listCourses } from "./features/courses/list-courses/handler";
export { getCourseHandler as getCourse } from "./features/courses/get-course/handler";
export { publishCourseHandler as publishCourse } from "./features/courses/publish-course/handler";
export {
  updateCourseSettingsHandler as updateCourseSettings,
} from "./features/courses/update-course-settings/handler";
export {
  listCoursesForStudentHandler as listCoursesForStudent,
} from "./features/courses/list-courses-for-student/handler";
export {
  getCourseForStudentHandler as getCourseForStudent,
} from "./features/courses/get-course-for-student/handler";
export { createLessonHandler as createLesson } from "./features/lessons/create-lesson/handler";
export { listLessonsByCourseHandler as listLessonsByCourse } from "./features/lessons/list-lessons-by-course/handler";
export { getLessonHandler as getLesson } from "./features/lessons/get-lesson/handler";
export { configureLessonRequirementsHandler as configureLessonRequirements } from "./features/lessons/configure-lesson-requirements/handler";
export { getLessonRequirementsHandler as getLessonRequirements } from "./features/lessons/get-lesson-requirements/handler";
export { addQuizQuestionHandler as addQuizQuestion } from "./features/lessons/add-quiz-question/handler";
export {
  listQuizQuestionsByLessonHandler as listQuizQuestionsByLesson,
} from "./features/lessons/list-quiz-questions-by-lesson/handler";
export {
  listQuizQuestionsForStudentHandler as listQuizQuestionsForStudent,
} from "./features/lessons/list-quiz-questions-for-student/handler";
export { markTextReadHandler as markTextRead } from "./features/progress/mark-text-read/handler";
export { markVideoWatchedHandler as markVideoWatched } from "./features/progress/mark-video-watched/handler";
export { submitQuizAttemptHandler as submitQuizAttempt } from "./features/progress/submit-quiz-attempt/handler";
export { getCourseProgressHandler as getCourseProgress } from "./features/progress/get-course-progress/handler";
export { resetQuizAttemptsHandler as resetQuizAttempts } from "./features/progress/reset-quiz-attempts/handler";
export {
  listQuizProgressForCourseHandler as listQuizProgressForCourse,
} from "./features/progress/list-quiz-progress-for-course/handler";

export { enrollSelfHandler as enrollSelf } from "./features/enrollments/enroll-self/handler";
export { enrollStudentHandler as enrollStudent } from "./features/enrollments/enroll-student/handler";
export {
  listEnrollmentsForCourseHandler as listEnrollmentsForCourse,
} from "./features/enrollments/list-enrollments-for-course/handler";
export { isEnrolledHandler as isEnrolled } from "./features/enrollments/is-enrolled/handler";

export type {
  CourseRecord,
  CourseStatus,
  LessonRecord,
  LessonRequirementsRecord,
  QuizAnswer,
  QuizQuestionRecord,
  StudentQuizQuestionRecord,
  QuizAttemptRecord,
  EnrollmentRecord,
} from "./contracts/types";

export type { CreateCourseInput, CreateCourseResult } from "./features/courses/create-course/types";
export type { ListCoursesResult } from "./features/courses/list-courses/types";
export type { GetCourseQuery, GetCourseResult } from "./features/courses/get-course/types";
export type { PublishCourseInput, PublishCourseResult } from "./features/courses/publish-course/types";
export type {
  UpdateCourseSettingsInput,
  UpdateCourseSettingsResult,
} from "./features/courses/update-course-settings/types";
export type {
  ListCoursesForStudentQuery,
  CourseForStudentView,
  ListCoursesForStudentResult,
} from "./features/courses/list-courses-for-student/types";
export type {
  GetCourseForStudentQuery,
  GetCourseForStudentResult,
} from "./features/courses/get-course-for-student/types";
export type { CreateLessonInput, CreateLessonResult } from "./features/lessons/create-lesson/types";
export type {
  ListLessonsByCourseQuery,
  ListLessonsByCourseResult,
} from "./features/lessons/list-lessons-by-course/types";
export type { GetLessonQuery, GetLessonResult } from "./features/lessons/get-lesson/types";
export type {
  ConfigureLessonRequirementsInput,
  ConfigureLessonRequirementsResult,
} from "./features/lessons/configure-lesson-requirements/types";
export type {
  GetLessonRequirementsQuery,
  GetLessonRequirementsResult,
} from "./features/lessons/get-lesson-requirements/types";
export type { AddQuizQuestionInput, AddQuizQuestionResult } from "./features/lessons/add-quiz-question/types";
export type {
  ListQuizQuestionsByLessonQuery,
  ListQuizQuestionsByLessonResult,
} from "./features/lessons/list-quiz-questions-by-lesson/types";
export type {
  ListQuizQuestionsForStudentQuery,
  ListQuizQuestionsForStudentResult,
} from "./features/lessons/list-quiz-questions-for-student/types";
export type { MarkTextReadInput, MarkTextReadResult } from "./features/progress/mark-text-read/types";
export type { MarkVideoWatchedInput, MarkVideoWatchedResult } from "./features/progress/mark-video-watched/types";
export type { SubmitQuizAttemptInput, SubmitQuizAttemptResult } from "./features/progress/submit-quiz-attempt/types";
export type {
  GetCourseProgressInput,
  GetCourseProgressResult,
  CourseProgressView,
  LessonProgressView,
} from "./features/progress/get-course-progress/types";
export type {
  ResetQuizAttemptsInput,
  ResetQuizAttemptsResult,
} from "./features/progress/reset-quiz-attempts/types";
export type {
  ListQuizProgressForCourseQuery,
  QuizProgressEntryView,
  ListQuizProgressForCourseResult,
} from "./features/progress/list-quiz-progress-for-course/types";

export type { EnrollSelfInput, EnrollSelfResult } from "./features/enrollments/enroll-self/types";
export type { EnrollStudentInput, EnrollStudentResult } from "./features/enrollments/enroll-student/types";
export type {
  ListEnrollmentsForCourseQuery,
  EnrollmentView,
  ListEnrollmentsForCourseResult,
} from "./features/enrollments/list-enrollments-for-course/types";
export type { IsEnrolledInput, IsEnrolledResult } from "./features/enrollments/is-enrolled/types";
