import { notFound } from "next/navigation";
import { resolveAdminPluginRoute } from "@/platform/plugin-routing/resolve-admin-route";

// Único ponto de entrada de rota admin de plugin em app/ — nenhuma pasta nomeada por plugin existe
// mais debaixo de admin/** (era admin/broadcast, admin/donations, admin/birthdays, admin/academy,
// admin/enrollment-dashboard, cada uma com sua própria árvore de sub-rotas). A tabela de rotas de
// cada plugin (src/plugins/<nome>/routes/route-table.ts) decide o resto — instalar uma rota admin
// nova num plugin não toca em app/ nunca mais.
export default async function AdminPluginRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ plugin: string; slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { plugin, slug } = await params;
  const resolved = await resolveAdminPluginRoute(plugin, slug ?? []);
  if (!resolved) {
    notFound();
  }

  const { Component, params: routeParams } = resolved;
  return <Component params={Promise.resolve(routeParams)} searchParams={searchParams} />;
}
