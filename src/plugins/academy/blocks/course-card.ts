import type { BlockDefinition } from "@/contexts/cms";

export const courseCardBlockDefinition: BlockDefinition = {
  key: "academy.course.card",
  label: "Academy — Curso",
  category: "academy",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { slug: "" },
  editorFields: [{ name: "slug", type: "text", label: "Slug do curso" }],
};
