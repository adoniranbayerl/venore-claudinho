export type BroadcastSceneRecord = {
  id: string;
  key: string;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

// Lista simplificada a pedido do usuário ("simplifica tudo, não preciso de tantas opções"):
// "clock" virou "info" (relógio + clima, mesmo tipo, mais informação, zero campo extra); "lower-
// third"/"custom-html" foram removidos (redundantes com "text" + um preset de posição). "news" e
// "agenda" são novos, também sem nenhum campo manual — resolvidos a partir de broadcast.region e
// da agenda interna do plugin. Migration 0001 remapeia layers existentes (clock→info, lower-
// third/custom-html→text) — nenhuma linha antiga fica com um type inválido. "alert" (2ª rodada)
// reintroduz o conceito de "lower third", mas com semântica diferente: normalmente invisível, só
// aparece quando há um aviso ativo (broadcast_alerts), e quando aparece ignora a geometria
// configurada — sempre sobrepõe tudo (ver layer-renderer.tsx).
export const BROADCAST_LAYER_TYPES = ["video", "text", "image", "info", "news", "agenda", "alert"] as const;
export type BroadcastLayerType = (typeof BROADCAST_LAYER_TYPES)[number];

// x/y/width/height em percentual (0-100), não pixel — a TV alvo pode ter resolução diferente
// (1080p/4K), então a posição precisa ser relativa ao viewport da view de saída.
export type BroadcastLayerRecord = {
  id: string;
  sceneId: string;
  type: BroadcastLayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  config: Record<string, unknown>;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type BroadcastPlaylistRecord = {
  id: string;
  name: string;
  // Pasta (relativa à raiz configurada em broadcast.rootFolder) varrida pelo scan — null quando a
  // playlist só tem itens do tipo "media-asset"/"webpage".
  folderPath: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// "webpage" é o terceiro tipo de origem: o conteúdo é uma URL (item.url), não um arquivo — não
// tem relativePath nem mediaAssetId (CHECK no schema garante a forma certa por sourceType). "news"
// é um marcador de posição no rodízio (nenhum de relativePath/mediaAssetId/url preenchido) — os
// artigos em si vêm de runtime/region-news.ts, resolvidos uma vez por saída, não por item.
export const BROADCAST_PLAYLIST_ITEM_SOURCE_TYPES = ["local", "media-asset", "webpage", "news"] as const;
export type BroadcastPlaylistItemSourceType = (typeof BROADCAST_PLAYLIST_ITEM_SOURCE_TYPES)[number];

// Item de playlist com origem tripla: "local" aponta pra um arquivo sob broadcast.rootFolder
// (servido pela rota de streaming com Range request); "media-asset" referencia media.assets por
// id (nunca acessa o storage/contexts/media diretamente — resolve via @/contexts/media);
// "webpage" guarda uma URL exibida em iframe. Exatamente um de relativePath/mediaAssetId/url é
// preenchido, de acordo com sourceType (CHECK no schema). "kind" (vídeo/imagem/site) não é uma
// coluna — é derivado em get-output-state a partir da extensão/contentType (local/media-asset) ou
// é sempre "webpage" quando sourceType = "webpage". hidden esconde o item da reprodução sem
// apagar (útil pra "pausar" um vídeo/imagem sem perder o cadastro).
export type BroadcastPlaylistItemRecord = {
  id: string;
  playlistId: string;
  order: number;
  title: string | null;
  sourceType: BroadcastPlaylistItemSourceType;
  relativePath: string | null;
  mediaAssetId: string | null;
  url: string | null;
  durationSeconds: number | null;
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Agenda interna do plugin (não é um calendário genérico reaproveitável por outro context/plugin
// — pedido explícito do usuário, "nossa própria agenda interna"). Uma instalação pode ter várias
// agendas nomeadas (semanal, mensal, faculdade, colégio...) — a layer "agenda" alterna entre elas,
// cada uma ficando `displaySeconds` na tela.
export type BroadcastAgendaRecord = {
  id: string;
  name: string;
  displaySeconds: number;
  order: number;
  // Hex (#rrggbb) escolhido pelo operador — null usa o fundo padrão do painel (ver layer-renderer.tsx).
  backgroundColor: string | null;
  // Logo própria da agenda (id cru — resolução de URL só em get-output-state, via getMediaAsset).
  // null cai na logo padrão da plataforma (brandLogoUrl).
  logoMediaAssetId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BroadcastAgendaEventRecord = {
  id: string;
  agendaId: string;
  title: string;
  description: string | null;
  startAt: Date;
  // "Toda semana" — quando true, startAt é a ÂNCORA do padrão (dia da semana + horário), não a
  // data real do próximo evento (ver shared/weekly-recurrence.ts).
  recurring: boolean;
  // Imagem de capa opcional (id cru) — sem ela, o card do evento renderiza igual a antes.
  coverMediaAssetId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Aviso rápido (lower third / alerta) — no máximo um ativo por vez, expira sozinho (ver schema).
export type BroadcastAlertRecord = {
  id: string;
  message: string;
  expiresAt: Date;
  createdAt: Date;
};

// Evento com a URL de capa já resolvida (coverMediaAssetId -> coverUrl, via getMediaAsset) —
// mesmo racional de PlaylistItemSummary: client component de view de saída não resolve mídia
// sozinho, só recebe a URL pronta.
export type AgendaRotationEvent = BroadcastAgendaEventRecord & { coverUrl: string | null };

// Um "canal" de agenda com seus próximos eventos e logo já resolvidos — deliberadamente aqui em
// contracts/, não em features/outputs/get-output-state/types.ts, mesmo racional de
// PlaylistItemSummary abaixo (client component de view de saída não pode tocar o barrel inteiro).
export type AgendaRotationEntry = { agenda: BroadcastAgendaRecord; events: AgendaRotationEvent[]; logoUrl: string | null };

// Uma "saída" = uma URL de exibição (a que abre na TV). token é o único mecanismo de acesso —
// a view de saída não passa por sessão/RBAC (regra do plano: TV não faz login interativo).
export type BroadcastOutputRecord = {
  id: string;
  name: string;
  token: string;
  currentSceneId: string | null;
  currentPlaylistItemId: string | null;
  drawerOpen: boolean;
  // Mesmo mecanismo de drawerOpen (agenda), mas pra BrandFooterBar (logo+relógio+data+temperatura)
  // — alternável por saída, pedido explícito: "além de fechar a agenda, deve ser possível fechar o
  // footer".
  footerOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Forma resolvida de um item de playlist exposta pra renderização client-side (view de saída) —
// deliberadamente aqui em contracts/, não em features/outputs/get-output-state/types.ts, pra que
// um client component possa importar o tipo sem tocar o barrel inteiro do plugin (que arrasta
// handlers server-only pro bundle do browser — bug real encontrado no `next build`).
// "kind" já vem classificado (não é o sourceType cru) — o client só decide <video>/<img>/<iframe>/
// bloco de notícias. "news" é 1:1 com sourceType "news" (nada a derivar, diferente de vídeo/imagem).
export type PlaylistItemKind = "video" | "image" | "webpage" | "news";
export type PlaylistItemSummary = {
  id: string;
  order: number;
  kind: PlaylistItemKind;
  // Só relevante pra "image"/"webpage"/"news" — vídeo usa a duração natural do arquivo (onEnded).
  // Pra "news" é o teto do bloco inteiro (todas as manchetes rodando), não por manchete.
  durationSeconds: number | null;
  // Só preenchido pra "webpage".
  url: string | null;
};

// Clima resolvido pra região configurada (broadcast.region) — null quando a região não está
// configurada ou a resolução falhou (layer "info" degrada mostrando só o relógio).
export type RegionWeather = {
  temperatureC: number;
  weatherCode: number;
  conditionLabel: string;
  emoji: string;
};

// Notícia resolvida pra região configurada — imageUrl/description podem ser null (nem toda notícia
// tem foto ou resumo).
export type RegionNewsArticle = {
  title: string;
  description: string | null;
  link: string;
  imageUrl: string | null;
  sourceName: string | null;
};

// Evento empurrado do painel de controle pra view de saída via SSE (runtime/output-bus.ts).
// Deliberadamente não carrega item de playlist — sequenciar qual vídeo toca dentro de uma
// playlist é decisão client-side da view de saída (onEnded → próximo item), não algo que o
// servidor sincroniza por evento; só "qual cena" e "drawer aberto/fechado" são estado de
// controle real.
export type BroadcastOutputEvent =
  | { type: "scene-changed"; sceneId: string | null }
  | { type: "drawer-changed"; drawerOpen: boolean }
  | { type: "footer-changed"; footerOpen: boolean };
