import { listUsers } from "@/contexts/auth";
import {
  avgQuizScoreByCourse,
  countActiveStudents,
  countDoneLessonPairsByCourse,
  countEnrollmentsByCourse,
  countPendingReviewsByCourse,
  findCoursesWithLessonCount,
  findRecentPendingSubmissions,
} from "./store";
import type { AcademyOverview, AcademyOverviewCourse, GetAcademyOverviewResult } from "./types";

const RECENT_SUBMISSIONS_LIMIT = 8;

function toMap(rows: { courseId: string; value: number }[]): Map<string, number> {
  return new Map(rows.map((row) => [row.courseId, row.value]));
}

export async function getAcademyOverview(): Promise<GetAcademyOverviewResult> {
  const [courses, enrollmentCounts, doneCounts, avgScores, pendingCounts, activeStudents, recent, usersResult] =
    await Promise.all([
      findCoursesWithLessonCount(),
      countEnrollmentsByCourse(),
      countDoneLessonPairsByCourse(),
      avgQuizScoreByCourse(),
      countPendingReviewsByCourse(),
      countActiveStudents(),
      findRecentPendingSubmissions(RECENT_SUBMISSIONS_LIMIT),
      listUsers(),
    ]);

  const enrollmentByCourse = toMap(enrollmentCounts);
  const doneByCourse = toMap(doneCounts);
  const pendingByCourse = toMap(pendingCounts);
  const avgByCourse = new Map(avgScores.map((row) => [row.courseId, row.avg]));

  const courseViews: AcademyOverviewCourse[] = courses.map((course) => {
    const enrollmentCount = enrollmentByCourse.get(course.id) ?? 0;
    const done = doneByCourse.get(course.id) ?? 0;
    const denom = enrollmentCount * course.lessonCount;
    const avgScore = avgByCourse.get(course.id) ?? null;
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      status: course.status,
      lessonCount: course.lessonCount,
      enrollmentCount,
      engagementPercent: denom > 0 ? Math.round((done / denom) * 100) : 0,
      avgQuizGrade: avgScore === null ? null : Math.round((avgScore / 10) * 10) / 10,
      pendingReviews: pendingByCourse.get(course.id) ?? 0,
    };
  });

  const usersById = new Map((usersResult.success ? usersResult.data : []).map((user) => [user.id, user]));

  const overview: AcademyOverview = {
    totals: {
      courses: courses.length,
      publishedCourses: courses.filter((course) => course.status !== "draft").length,
      lessons: courses.reduce((sum, course) => sum + course.lessonCount, 0),
      enrollments: courseViews.reduce((sum, course) => sum + course.enrollmentCount, 0),
      activeStudents,
      pendingReviews: courseViews.reduce((sum, course) => sum + course.pendingReviews, 0),
    },
    courses: courseViews,
    pendingSubmissions: recent.map((row) => {
      const user = usersById.get(row.actorId);
      return {
        submissionId: row.submissionId,
        studentName: user?.name || user?.email || "Aluno",
        courseId: row.courseId,
        courseTitle: row.courseTitle,
        lessonTitle: row.lessonTitle,
        activityTitle: row.activityTitle,
        submittedAt: row.submittedAt,
      };
    }),
  };

  return { success: true, data: overview };
}
