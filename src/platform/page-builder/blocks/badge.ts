import type { BlockDefinition } from "@/contexts/cms";

export const badgeBlockDefinition: BlockDefinition = {
  key: "core.content.badge",
  label: "Badge",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { text: "Novo", variant: "default", uppercase: false },
  requiredDataFields: ["text"],
  missingConfigMessage: "Sem texto definido",
  editorFields: [
    { name: "text", type: "text", label: "Texto" },
    {
      name: "variant",
      type: "select",
      label: "Variante",
      options: [
        { value: "default", label: "Padrão" },
        { value: "secondary", label: "Secundária" },
        { value: "outline", label: "Contorno" },
        { value: "destructive", label: "Destrutiva" },
      ],
    },
    // Liga uppercase + tracking-caps juntos — mesmo idioma "eyebrow" já usado no resto do app
    // (ex: LessonTrail, Breadcrumbs, StudentCourseCard: "uppercase tracking-caps"). Útil pra usar
    // este bloco como eyebrow acima de um Título.
    { name: "uppercase", type: "boolean", label: "Tudo em maiúsculas (estilo eyebrow)" },
  ],
};
