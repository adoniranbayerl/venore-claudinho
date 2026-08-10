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
  permissions: [
    { key: "broadcast.manage", label: "Gerenciar playlists, saídas e controle ao vivo" },
    // Escopo estreito de propósito — pra um papel "editor de agenda"/"editor de tela" que só cuida
    // do que foi explicitamente atribuído a ele, sem acesso ao restante do Broadcast Studio.
    // Pedido explícito: "adicionar um responsável (role editor pra cima) com acesso e permissão
    // para alterar apenas a agenda atribuída, a mesma coisa para telas". A permission sozinha NÃO
    // basta — só dá acesso de fato às agendas/saídas listadas em
    // set-agenda-editors/set-output-editors (ver shared/scoped-authorization/index.ts); sem
    // nenhuma atribuição, quem só tem esta permission não edita nada. broadcast.manage continua
    // com acesso total, sem precisar de atribuição nenhuma.
    { key: "broadcast.agenda.manage", label: "Editar agendas atribuídas no Broadcast Studio (sem acesso ao restante)" },
    { key: "broadcast.outputs.manage", label: "Editar telas atribuídas no Broadcast Studio (sem acesso ao restante)" },
  ],
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
    // Rota separada e mais enxuta (só a agenda) — pra quem tem SÓ broadcast.agenda.manage, não
    // broadcast.manage; quem já vê o item acima (admin completo) não precisa deste também, a aba
    // "Agenda" do admin completo já cobre o mesmo caso de uso.
    {
      key: "broadcast.agenda-editor",
      label: "Agenda (Broadcast)",
      href: "/admin/broadcast/agenda",
      icon: "calendar-days",
      groupKey: "plugins",
      groupLabel: "Plugins",
      groupOrder: 30,
      order: 31,
      requiredPermission: "broadcast.agenda.manage",
    },
    // Mesmo racional do item acima, pra broadcast.outputs.manage.
    {
      key: "broadcast.outputs-editor",
      label: "Telas (Broadcast)",
      href: "/admin/broadcast/telas",
      icon: "tv",
      groupKey: "plugins",
      groupLabel: "Plugins",
      groupOrder: 30,
      order: 32,
      requiredPermission: "broadcast.outputs.manage",
    },
  ],
};
