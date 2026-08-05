export { donationsBreadcrumbSegments } from "./breadcrumbs";
export { getDonationSettingsHandler as getDonationSettings } from "./features/get-donation-settings/handler";
export { buildDonationPixCodeHandler as buildDonationPixCode } from "./features/build-donation-pix-code/handler";

// Ponto de extensão "blocks" do plugin engine, mesmo padrão do birthdays (src/plugins/birthdays/
// index.ts): platform/page-builder/block-registry.ts importa blockDefinitions (dado, serializável)
// e block-renderers.tsx importa blockRenderers (componente) — dois registries paralelos, nunca
// misturados.
export { blockDefinitions, blockRenderers } from "./blocks";

// DonationTeaser exposto direto (não só via block) porque a página de curso do academy
// (src/app/(platform)/academy/[courseSlug]/page.tsx, pedido desta sessão: "veja onde ele cabe nas
// nossas páginas... pelo menos na página de curso") tem layout fixo em JSX, não composição de CMS
// — não dá pra "soltar o bloco" lá dentro, só reusar o componente React diretamente.
export { DonationTeaser } from "./components/donation-teaser";

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
