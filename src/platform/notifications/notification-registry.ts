import { getActivityReviewAlert, getMessageAlert } from "@/plugins/academy";
import { registerPlugins } from "../plugin-engine/register-plugins";
import type { NotificationAlert } from "./types";

// Providers de plugin, indexados pela key do manifesto — mesmo padrão de
// platform/media-usage/media-usage-registry.ts (PLUGIN_PROVIDERS). Só entram na consulta se o
// plugin estiver ativo agora: plugin desabilitado nunca deveria acender um alerta pra uma página
// que também está desabilitada. Dentro do provider academy, atividade avaliada vence mensagem não-
// lida quando as duas existem (mesma regra de "primeiro não-nulo vence" do laço abaixo, só que
// aplicada às duas fontes de alerta do próprio plugin) — pedido desta sessão: nota/comentário
// precisa acender o mesmo badge que já existia pra mensagem.
const PLUGIN_PROVIDERS: Record<string, () => Promise<NotificationAlert>> = {
  academy: async () => {
    const activityAlert = await getActivityReviewAlert();
    if (activityAlert.success && activityAlert.data) return activityAlert.data;
    const messageAlert = await getMessageAlert();
    return messageAlert.success ? messageAlert.data : null;
  },
};

// Badge no user-nav (pedido desta sessão) — hoje só um provider (academy), mas resolvido como
// registry (não uma chamada direta) pelo mesmo motivo de collectMediaUsage: platform/theme-
// rendering não pode importar um plugin diretamente (boundary), e um segundo provider (ex: outro
// plugin com mensagens próprias) só precisaria entrar neste mapa. Primeiro alerta não-nulo vence —
// não soma contagens de plugins diferentes, cada um tem seu próprio destino (href).
export async function collectNotificationAlert(): Promise<NotificationAlert> {
  const pluginReport = await registerPlugins();
  const activePluginKeys = new Set(
    pluginReport.entries.filter((entry) => entry.status === "active").map((entry) => entry.key),
  );

  for (const [key, provider] of Object.entries(PLUGIN_PROVIDERS)) {
    if (!activePluginKeys.has(key)) continue;
    const alert = await provider();
    if (alert) return alert;
  }

  return null;
}
