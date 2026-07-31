import type { BlockRendererComponent } from "@/platform/page-builder/block-renderers";
import { AcademyCourseCardBlock } from "./course-card-block";
import { AcademyCourseListBlock } from "./course-list-block";
import { AcademyEnrollCtaBlock } from "./enroll-cta-block";
import { AcademyCourseProgressBlock } from "./course-progress-block";
import { AcademyLessonTrailBlock } from "./lesson-trail-block";
import { AcademyCourseDashboardChartBlock } from "./course-dashboard-chart-block";

export const blockRenderers: Record<string, BlockRendererComponent> = {
  "academy.course.list": AcademyCourseListBlock,
  "academy.course.card": AcademyCourseCardBlock,
  "academy.enroll.cta": AcademyEnrollCtaBlock,
  "academy.course.progress": AcademyCourseProgressBlock,
  "academy.course.lesson-trail": AcademyLessonTrailBlock,
  "academy.course.dashboard-chart": AcademyCourseDashboardChartBlock,
};
