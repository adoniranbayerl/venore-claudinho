import Link from "next/link";
import type { Block } from "@/contexts/cms";
import { getCourseForStudentHandler as getCourseForStudent } from "../features/courses/get-course-for-student/handler";
import { getCourseProgressHandler as getCourseProgress } from "../features/progress/get-course-progress/handler";
import { isEnrolledHandler as isEnrolled } from "../features/enrollments/is-enrolled/handler";
import { Progress } from "@/components/ui/progress";
import type { BlockRendererProps } from "@/platform/page-builder/block-renderers";

function readSlug(data: Block["data"]): string {
  const value = data.slug;
  return typeof value === "string" ? value.trim() : "";
}

export async function AcademyCourseCardBlock({ block }: BlockRendererProps) {
  const slug = readSlug(block.data);
  if (!slug) {
    return null;
  }

  const courseResult = await getCourseForStudent({ slug });
  if (!courseResult.success || !courseResult.data) {
    return null;
  }
  const course = courseResult.data;

  const enrolledResult = await isEnrolled({ courseId: course.id });
  const enrolled = enrolledResult.success && enrolledResult.data;

  let percent: number | null = null;
  if (enrolled) {
    const progress = await getCourseProgress({ courseId: course.id });
    if (progress.success && progress.data.totalLessons > 0) {
      percent = Math.round((progress.data.completedLessons / progress.data.totalLessons) * 100);
    }
  }

  return (
    <Link
      href={`/academy/${course.slug}`}
      className="block rounded-panel border border-border-subtle bg-surface-panel p-4 transition-colors hover:border-border-strong"
    >
      <h3 className="font-semibold text-text-primary">{course.title}</h3>
      {course.description && <p className="mt-1 text-sm text-text-secondary">{course.description}</p>}
      {percent !== null && (
        <div className="mt-3 space-y-1">
          <Progress value={percent} />
          <p className="text-xs text-text-tertiary">{percent}% concluído</p>
        </div>
      )}
    </Link>
  );
}
