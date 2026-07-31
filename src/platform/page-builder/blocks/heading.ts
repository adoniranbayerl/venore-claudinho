import type { BlockDefinition } from "@/contexts/cms";

export const headingBlockDefinition: BlockDefinition = {
  key: "core.content.heading",
  label: "Título",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: {
    level: 2,
    text: "Título",
    align: "start",
    size: "xl",
    fontFamily: "sans",
    tracking: "tight",
    uppercase: false,
  },
  requiredDataFields: ["text"],
  missingConfigMessage: "Sem texto definido",
  editorFields: [
    {
      // Tag semântica (h1-h4, SEO/acessibilidade) — independente do tamanho visual (campo
      // "size" abaixo). Antes os dois eram a mesma coisa (nível controlava tag E tamanho), o que
      // não permitia, por exemplo, um <h2> visualmente grande como título de seção.
      name: "level",
      type: "select",
      label: "Nível (tag semântica)",
      options: [
        { value: "1", label: "H1" },
        { value: "2", label: "H2" },
        { value: "3", label: "H3" },
        { value: "4", label: "H4" },
      ],
    },
    { name: "text", type: "text", label: "Texto" },
    {
      name: "size",
      type: "select",
      label: "Tamanho",
      options: [
        { value: "sm", label: "Pequeno" },
        { value: "md", label: "Médio" },
        { value: "lg", label: "Grande" },
        { value: "xl", label: "Extra grande" },
        { value: "2xl", label: "2X grande" },
        { value: "3xl", label: "3X grande" },
        { value: "4xl", label: "4X grande" },
      ],
    },
    {
      name: "align",
      type: "select",
      label: "Alinhamento",
      options: [
        { value: "start", label: "Esquerda" },
        { value: "center", label: "Centro" },
        { value: "end", label: "Direita" },
      ],
    },
    {
      // Só as duas famílias já carregadas pelo app (layout.tsx: Geist Sans/Geist Mono, mapeadas
      // em --font-sans/--font-mono no tema) — não inventa fonte nova aqui.
      name: "fontFamily",
      type: "select",
      label: "Fonte",
      options: [
        { value: "sans", label: "Padrão (sans-serif)" },
        { value: "mono", label: "Monoespaçada" },
      ],
    },
    {
      // Mapeado pros tokens --ui-tracking-* do tema (theme.css), nunca um valor solto.
      name: "tracking",
      type: "select",
      label: "Espaçamento entre letras",
      options: [
        { value: "normal", label: "Normal" },
        { value: "tight", label: "Compacto (títulos)" },
        { value: "wide", label: "Espaçado (caixa alta)" },
      ],
    },
    { name: "uppercase", type: "boolean", label: "Tudo em maiúsculas" },
  ],
};
