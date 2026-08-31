import type { OperationResult } from "@/shared/types";
import type { CourseStatus } from "../../../contracts/types";

export type AcademyOverviewCourse = {
  id: string;
  title: string;
  slug: string;
  status: CourseStatus;
  lessonCount: number;
  enrollmentCount: number;
  // 0–100: aulas "feitas" (leitura, vídeo ou quiz passado) / (matrículas × aulas). Sinal de
  // engajamento, não a régua de conclusão do lock-chain — bom o bastante pro painel.
  engagementPercent: number;
  avgQuizGrade: number | null; // 0–10
  pendingReviews: number;
};

export type AcademyOverviewSubmission = {
  submissionId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
  activityTitle: string;
  submittedAt: Date;
};

export type AcademyOverview = {
  totals: {
    courses: number;
    publishedCourses: number;
    lessons: number;
    enrollments: number;
    activeStudents: number;
    pendingReviews: number;
  };
  courses: AcademyOverviewCourse[];
  pendingSubmissions: AcademyOverviewSubmission[];
};

export type GetAcademyOverviewResult = OperationResult<AcademyOverview>;
