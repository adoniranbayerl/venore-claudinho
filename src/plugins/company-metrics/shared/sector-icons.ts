// Lista fixa de ícones lucide oferecidos ao admin na criação/edição de setor. Módulo folha
// (sem dependência de banco) — pode ser importado por client component com segurança, diferente
// do barrel do plugin. O valor guardado em sectors.icon é a chave; a resolução para o componente
// de ícone fica na camada de UI (routes/admin/sector-icon.tsx).
export const SECTOR_ICON_OPTIONS = [
  { value: "briefcase", label: "Maleta" },
  { value: "trending-up", label: "Crescimento" },
  { value: "wallet", label: "Carteira" },
  { value: "megaphone", label: "Megafone" },
  { value: "users", label: "Pessoas" },
  { value: "graduation-cap", label: "Formatura" },
  { value: "package", label: "Caixa" },
  { value: "clipboard-list", label: "Checklist" },
  { value: "building-2", label: "Prédio" },
  { value: "target", label: "Alvo" },
] as const;

export type SectorIconValue = (typeof SECTOR_ICON_OPTIONS)[number]["value"];

export const DEFAULT_SECTOR_ICON: SectorIconValue = "briefcase";
