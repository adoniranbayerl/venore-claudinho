import type { BlockDefinition } from "@/contexts/cms";
import { courseCardBlockDefinition } from "./course-card";
import { courseListBlockDefinition } from "./course-list";
import { enrollCtaBlockDefinition } from "./enroll-cta";

export const blockDefinitions: BlockDefinition[] = [
  courseListBlockDefinition,
  courseCardBlockDefinition,
  enrollCtaBlockDefinition,
];
