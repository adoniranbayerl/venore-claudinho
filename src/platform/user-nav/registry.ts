import { getMessageNavLink } from "@/plugins/academy";
import type { NavItem } from "@/contexts/themes";
import { registerPlugins } from "../plugin-engine/register-plugins";

// Itens que os plugins ativos contribuem para o MENU DO USUÁRIO (user-nav), não para o admin-nav.
// Mesmo padrão de platform/notifications/notification-registry.ts: indexado pela key do manifesto,
// só o plugin ativo entra, e platform/theme-rendering consome via este registry (não pode importar
// um plugin diretamente — boundary). Hoje só "academy" (item "Mensagens"), mas outro plugin com
// um destino pessoal (ex.: "Meus favoritos") só precisaria entrar neste mapa.
const PLUGIN_PROVIDERS: Record<string, () => Promise<NavItem[]>> = {
  academy: async () => {
    const link = await getMessageNavLink();
    if (!link.success || !link.data) return [];
    return [{ key: "academy.messages", label: link.data.label, href: link.data.href, icon: "message-circle" }];
  },
};

export async function collectUserNavItems(): Promise<NavItem[]> {
  const pluginReport = await registerPlugins();
  const activePluginKeys = new Set(
    pluginReport.entries.filter((entry) => entry.status === "active").map((entry) => entry.key),
  );

  const items: NavItem[] = [];
  for (const [key, provider] of Object.entries(PLUGIN_PROVIDERS)) {
    if (!activePluginKeys.has(key)) continue;
    items.push(...(await provider()));
  }
  return items;
}
