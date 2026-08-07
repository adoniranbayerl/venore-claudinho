import type { PluginManifest } from "@/platform/plugin-engine/manifest-schema";
import { BROADCAST_SETTINGS } from "./shared/settings";

// Faixa escrita à mão, não importada de platform/plugin-engine/core-version.ts — mesmo motivo do
// birthdaysManifest (src/plugins/birthdays/manifest.ts): importar o CORE_VERSION corrente
// tornaria a checagem de compatibilidade sempre trivialmente satisfeita.
export const broadcastManifest: PluginManifest = {
  manifestVersion: "1.0.0",
  key: "broadcast",
  name: "Broadcast Studio",
  version: "1.0.0",
  description:
    "Composição de cenas em camadas (vídeo de playlist + overlays HTML5) com saída para exibição em TV, tipo um switcher OBS simplificado.",
  compatibility: { coreVersion: ">=2.0.0 <3.0.0" },
  // Configurar broadcast.rootFolder passa por setSetting (@/contexts/settings), gateado por
  // settings.manage — mesmo padrão de birthdays' BIRTHDAY_APPEARANCE_SETTINGS (appearance/
  // actions.ts): nenhuma permission própria de "gerenciar settings do plugin" existe hoje, o
  // catálogo central já cobre isso, então declarar "broadcast.settings" aqui seria uma permission
  // nunca de fato enforced.
  permissions: [{ key: "broadcast.manage", label: "Gerenciar cenas, playlists e controle ao vivo" }],
  settings: Object.values(BROADCAST_SETTINGS).map(({ key, defaultValue }) => ({ key, defaultValue })),
  navigation: [
    {
      key: "broadcast.admin",
      label: "Broadcast Studio",
      href: "/admin/broadcast",
      icon: "video",
      groupKey: "plugins",
      groupLabel: "Plugins",
      groupOrder: 30,
      order: 30,
      requiredPermission: "broadcast.manage",
    },
  ],
};
