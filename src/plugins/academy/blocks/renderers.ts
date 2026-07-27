import type { BlockRendererComponent } from "@/platform/page-builder/block-renderers";
import { AcademyCourseCardBlock } from "./course-card-block";
import { AcademyCourseListBlock } from "./course-list-block";
import { AcademyEnrollCtaBlock } from "./enroll-cta-block";

export const blockRenderers: Record<string, BlockRendererComponent> = {
  "academy.course.list": AcademyCourseListBlock,
  "academy.course.card": AcademyCourseCardBlock,
  "academy.enroll.cta": AcademyEnrollCtaBlock,
};
