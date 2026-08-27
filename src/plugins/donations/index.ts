export { donationsBreadcrumbSegments } from "./breadcrumbs";
export { getDonationSettingsHandler as getDonationSettings } from "./features/get-donation-settings/handler";
export { buildDonationPixCodeHandler as buildDonationPixCode } from "./features/build-donation-pix-code/handler";

// Ponto de extensão "blocks" do plugin engine, mesmo padrão do birthdays (src/plugins/birthdays/
// index.ts): platform/page-builder/block-registry.ts importa blockDefinitions (dado, serializável)
// e block-renderers.tsx importa blockRenderers (componente) — dois registries paralelos, nunca
// misturados.
export { blockDefinitions, blockRenderers } from "./blocks";

// DonationTeaser / DonationWidget expostos direto (não só via block) porque páginas de layout
// fixo em JSX (src/app/(platform)/academy/[courseSlug]/page.tsx e a etapa de doação da aula em
// src/plugins/academy/routes/lesson/page.tsx) não têm composição de CMS pra "soltar o bloco" —
// só dá pra reusar o componente React. O academy consome estes pelo barrel (nunca por
// "@/plugins/donations/components/*") e declara `dependencies: [{ pluginKey: "donations",
// type: "optional" }]` no manifesto; cada página checa isPluginActive("donations") em runtime.
export { DonationTeaser } from "./components/donation-teaser";
export { DonationWidget } from "./components/donation-widget";

export { DONATIONS_SETTINGS, DEFAULT_DONATION_SETTINGS } from "./shared/settings";
export type { DonationSettingsValues } from "./shared/settings";
export {
  validateDonationSettingsInput,
  type DonationSettingsFormInput,
  type ParsedDonationSettingsInput,
} from "./shared/validate-donation-settings-input";

export type { DonationSettings, DonationPixCode } from "./contracts/types";
export type { GetDonationSettingsResult } from "./features/get-donation-settings/types";
export type { BuildDonationPixCodeInput, BuildDonationPixCodeResult } from "./features/build-donation-pix-code/types";
