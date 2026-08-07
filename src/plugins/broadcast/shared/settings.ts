// Chave/default de contexts/settings pro plugin — única fonte de verdade, usada tanto por
// manifest.ts (registro do default via registerDefaultSetting, ver register-plugins.ts) quanto
// pela tela admin de configuração. Mesmo padrão de shared/appearance.ts do birthdays.
export const BROADCAST_SETTINGS = {
  rootFolder: {
    key: "broadcast.rootFolder",
    // Relativo, não absoluto: resolveWithinRoot faz path.resolve(rootFolder), que usa
    // process.cwd() como base quando o valor não é absoluto — e process.cwd() é a raiz do
    // projeto tanto em `next dev` quanto em `next start`. "public/broadcast" aponta pra
    // public/broadcast/{videos,playlists} (ver public/broadcast/*/.gitkeep).
    defaultValue: "public/broadcast",
    label: "Pasta raiz de vídeos no servidor",
  },
  // Cidade usada pelas layers "info" (clima) e "news" (notícias) — texto livre em formato de
  // busca de geocoding ("Curitiba" ou "Curitiba, PR, Brasil"), não um código IBGE/ISO.
  region: {
    key: "broadcast.region",
    defaultValue: "",
    label: "Região (cidade) pra clima e notícias",
  },
} as const;

export type BroadcastSettingField = keyof typeof BROADCAST_SETTINGS;
