// Nunca variou na prática (sempre a mesma pasta do projeto) e virou um segundo campo pra configurar
// à toa — feedback direto: "Item Pasta raiz de vídeos no servidor também é desnecessário, porque
// sempre vai ser public/broadcast". Virou constante fixa (não mais uma entrada de
// contexts/settings/tela admin); relativo, não absoluto — resolveWithinRoot faz
// path.resolve(BROADCAST_ROOT_FOLDER), que usa process.cwd() como base quando o valor não é
// absoluto, e process.cwd() é a raiz do projeto tanto em `next dev` quanto em `next start`.
// Aponta pra public/broadcast/{videos,playlists} (ver public/broadcast/*/.gitkeep).
export const BROADCAST_ROOT_FOLDER = "public/broadcast";

// Mesmo racional de BROADCAST_ROOT_FOLDER acima — toda playlist local aponta pra esta MESMA
// subpasta compartilhada (public/broadcast/videos); o operador escolhe, por playlist, quais
// arquivos dessa pasta única entram (ver scan-playlist-folder/add-scanned-playlist-items), não
// mais uma subpasta própria por playlist. Feedback direto: "Item Pasta de vídeos... é
// desnecessário, a pasta sempre vai ser public/broadcast/videos".
export const BROADCAST_VIDEOS_FOLDER_PATH = "videos";

// Chave/default de contexts/settings pro plugin — única fonte de verdade, usada tanto por
// manifest.ts (registro do default via registerDefaultSetting, ver register-plugins.ts) quanto
// pela tela admin de configuração. Mesmo padrão de shared/appearance.ts do birthdays.
export const BROADCAST_SETTINGS = {
  // Cidade usada pelas layers "info" (clima) e "news" (notícias) — texto livre em formato de
  // busca de geocoding ("Curitiba" ou "Curitiba, PR, Brasil"), não um código IBGE/ISO.
  region: {
    key: "broadcast.region",
    defaultValue: "",
    label: "Região (cidade) pra clima e notícias",
  },
  // Cor de fundo da barra inferior da view principal (camada "video") — logo + relógio +
  // temperatura ficam nela, hex escolhido pelo operador via <input type="color">.
  brandColor: {
    key: "broadcast.brandColor",
    defaultValue: "#0f0f0f",
    label: "Cor da barra de marca (view principal)",
  },
  // Lista de palavras separadas por vírgula — qualquer manchete cujo título contenha uma delas
  // (case-insensitive) é descartada antes de chegar na TV. Curadoria simples pedida direto:
  // "precisamos de mais opções para notícias (como escolher quais são mostradas)" — sem precisar
  // de uma tela de aprovar/rejeitar manchete por manchete, que exigiria guardar estado por artigo
  // (a API não dá um id estável entre chamadas) — bloqueio por palavra-chave é o que dá pra fazer
  // sem esse estado extra.
  newsExcludeKeywords: {
    key: "broadcast.newsExcludeKeywords",
    defaultValue: "",
    label: "Palavras-chave pra excluir das notícias (separadas por vírgula)",
  },
} as const;

export type BroadcastSettingField = keyof typeof BROADCAST_SETTINGS;
