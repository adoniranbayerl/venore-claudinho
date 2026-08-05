// Extraído de custom-color-palette.ts (sem nenhum import) de propósito: activate-color-palette.ts
// só precisa do id, e activate-color-palette.test.ts mocka @/contexts/themes inteiro mas não
// @/contexts/settings — se activate-color-palette.ts importasse custom-color-palette.ts direto,
// puxaria @/contexts/settings de verdade (sem mock), que sobe até next-auth/next/server (mesmo
// problema documentado em AGENTS.md §5 pro barrel de @/contexts/cms) e quebra o teste unitário.
export const CUSTOM_COLOR_PALETTE_ID = "custom";
