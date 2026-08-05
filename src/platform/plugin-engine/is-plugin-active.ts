import { registerPlugins } from "./register-plugins";

// Ponto único de checagem "este plugin está ativo agora" pra composição em platform/ (docs/
// venore-docks.md — regra 12): mesmo raciocínio que media-usage-registry.ts já aplicava só pra
// uso de mídia, promovido a helper porque gate de página (get-academy-page-data.ts,
// get-birthdays-page-data.ts, get-academy-course-access.ts) e Server Action (app/.../actions.ts)
// precisam da mesma checagem — plugin desabilitado não pode ter superfície viva, nem por URL
// direta nem por Server Action chamada sem passar pela página.
export async function isPluginActive(pluginKey: string): Promise<boolean> {
  const report = await registerPlugins();
  return report.entries.some((entry) => entry.key === pluginKey && entry.status === "active");
}
