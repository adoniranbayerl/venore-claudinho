import type { BlockDefinition } from "@/contexts/cms";
import { courseCardBlockDefinition } from "./course-card";
import { courseListBlockDefinition } from "./course-list";
import { enrollCtaBlockDefinition } from "./enroll-cta";
import { courseProgressBlockDefinition } from "./course-progress";
import { lessonTrailBlockDefinition } from "./lesson-trail";
import { courseDashboardChartBlockDefinition } from "./course-dashboard-chart";
import { notationSheetBlockDefinition } from "./notation-sheet";

export const blockDefinitions: BlockDefinition[] = [
  courseListBlockDefinition,
  courseCardBlockDefinition,
  enrollCtaBlockDefinition,
  courseProgressBlockDefinition,
  lessonTrailBlockDefinition,
  courseDashboardChartBlockDefinition,
  notationSheetBlockDefinition,
];
