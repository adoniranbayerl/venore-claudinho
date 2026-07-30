import { findCmsMediaUsage } from "@/contexts/cms";
import { findAcademyMediaUsage } from "@/plugins/academy";
import { registerPlugins } from "../plugin-engine/register-plugins";
import { findBrandMediaUsage } from "../brand/find-brand-media-usage";
import type { MediaUsageProvider, MediaUsageReference } from "./types";

// Providers de contexts do core: sempre ativos, não têm estado enabled/disabled (mesmo raciocínio
// de admin-navigation-registry.ts pra itens de context vs. de plugin).
const CORE_PROVIDERS: Record<string, MediaUsageProvider> = {
  cms: findCmsMediaUsage,
  brand: findBrandMediaUsage,
};

// Providers de plugin, indexados pela key do manifesto (mesmo padrão de
// platform/page-builder/block-registry.ts — PLUGIN_BLOCK_BARRELS). Só entram na consulta se o
// plugin estiver ativo agora: é a resposta de propósito ao "consumidor que some" (docs do
// pedido) — plugin desabilitado nunca registra provider, então suas referências somem sozinhas
// da checagem de uso e da deleção. Isso é uma escolha deliberada, não um efeito colateral: se o
// plugin for reabilitado depois, os dados dele (coverMediaId etc.) continuam intactos — só a
// checagem de uso volta a enxergá-los. Nunca trava mídia pra sempre por causa de um plugin
// desligado, e nunca finge que a referência não existe de verdade (o dado no banco do plugin não
// muda quando ele é desabilitado).
const PLUGIN_PROVIDERS: Record<string, MediaUsageProvider> = {
  academy: findAcademyMediaUsage,
};

export async function collectMediaUsage(mediaId: string): Promise<MediaUsageReference[]> {
  const pluginReport = await registerPlugins();
  const activePluginKeys = new Set(
    pluginReport.entries.filter((entry) => entry.status === "active").map((entry) => entry.key),
  );

  const providers: MediaUsageProvider[] = [
    ...Object.values(CORE_PROVIDERS),
    ...Object.entries(PLUGIN_PROVIDERS)
      .filter(([key]) => activePluginKeys.has(key))
      .map(([, provider]) => provider),
  ];

  const results = await Promise.all(providers.map((provider) => provider(mediaId)));
  return results.flat();
}
