import type { ThemeManifest } from "@/contexts/themes";

export const aprendaMusicaManifest: ThemeManifest = {
  key: "aprenda-musica",
  name: "Aprenda Música",
  version: "0.1.0",
  themeContractVersion: "6.0.0",
  // mode "svg": logo em .svg é a arte que o próprio site vai fornecer via /admin/settings/brand
  // (getBrandConfig) — este manifesto só decide estética de moldura (tamanho/posição), nunca o
  // arquivo em si. size/scrolledSize/position seguem o mesmo default dos outros temas (nenhum
  // pedido desta sessão pra mudar a moldura); color é o único campo customizado aqui — acompanha
  // o laranja de --primary deste tema (theme.css) em vez do teal herdado do Venore Slime, porque
  // é o tom que aparece no PDF de impressão (plugin birthdays) e no traço de acento do footer.
  brandAesthetics: { mode: "svg", size: 100, scrolledSize: 80, position: "left", color: "#d9662f" },
};
