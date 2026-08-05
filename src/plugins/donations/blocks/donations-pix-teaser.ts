import type { BlockDefinition } from "@/contexts/cms";

// Muito menor que "donations.pix-widget" (mesmo no modo compacto dele) — pensado pra caber em
// qualquer lugar de uma página (fim de artigo, sidebar, rodapé de seção) sem competir com o
// conteúdo ao redor. Não busca o código PIX até a pessoa clicar (ver donation-teaser.tsx), então
// não tem editorField de valores/QR — só a chamada em si.
export const donationsPixTeaserBlockDefinition: BlockDefinition = {
  key: "donations.pix-teaser",
  label: "Doações — Chamada rápida",
  category: "donations",
  structure: "leaf",
  allowedInRoot: true,
  defaultData: {
    title: "Apoie esse projeto",
    ctaLabel: "Doar agora",
  },
  editorFields: [
    { name: "title", type: "text", label: "Título" },
    { name: "ctaLabel", type: "text", label: "Texto do botão" },
  ],
};
