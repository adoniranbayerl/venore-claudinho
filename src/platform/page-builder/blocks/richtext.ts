import type { BlockDefinition } from "@/contexts/cms";

// data.content guarda o JSON do Tiptap (ProseMirror doc), não mais markdown — troca de formato
// desta sessão (editor WYSIWYG via Tiptap). RichtextBlock (block-renderers.tsx) mantém
// compatibilidade com entries antigas que ainda tenham `data.markdown` como string.
export const richtextBlockDefinition: BlockDefinition = {
  key: "core.content.richtext",
  label: "Rich Text",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { content: null },
  requiredDataFields: ["content"],
  missingConfigMessage: "Sem conteúdo definido",
  editorFields: [{ name: "content", type: "richtext", label: "Conteúdo" }],
};
