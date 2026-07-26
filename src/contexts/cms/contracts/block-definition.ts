export type EditorFieldType = "text" | "textarea" | "richtext" | "number" | "boolean" | "select" | "image" | "url";

export type EditorField = {
  name: string;
  type: EditorFieldType;
  label: string;
  options?: { value: string; label: string }[];
};

export type AreaDefinition = {
  key: string;
  label: string;
  // Regra de posição dentro da area: só blocos com key nesta lista podem entrar aqui.
  allowedBlockKeys: string[];
};

export type BlockStructure = "leaf" | "areas";

// contexts/cms não conhece nenhum bloco concreto — este é só o formato que qualquer bloco
// (definido em plugins) precisa satisfazer para ser validado/renderizado.
export type BlockDefinition = {
  key: string;
  label: string;
  category: string;
  structure: BlockStructure;
  defaultData: Record<string, unknown>;
  editorFields: EditorField[];
  // Regra de posição na raiz: só blocos com allowedInRoot === true podem entrar no nível
  // raiz da composição. Presente sempre (não só quando structure === "areas").
  allowedInRoot: boolean;
  // Só quando structure === "areas".
  areaDefinitions?: AreaDefinition[];
};

export type ResolveBlockDefinition = (key: string) => BlockDefinition | null;
