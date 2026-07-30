import { getMedia } from "@/contexts/media";
import { getSetting, registerDefaultSetting } from "@/contexts/settings";

export type HeaderBrandMode = "text" | "svg" | "png";
export type BrandPosition = "left" | "center";

export type BrandConfig = {
  siteName: string;
  mode: HeaderBrandMode;
  size: number;
  scrolledSize: number;
  position: BrandPosition;
  logoUrl: string;
  scrolledLogoUrl: string;
  faviconUrl: string;
  color: string;
};

const KEYS = {
  siteName: "brand.siteName",
  headerMode: "brand.headerMode",
  logoMediaId: "brand.logoMediaId",
  logoScrolledMediaId: "brand.logoScrolledMediaId",
  faviconMediaId: "brand.faviconMediaId",
  size: "brand.size",
  scrolledSize: "brand.scrolledSize",
  position: "brand.position",
  // Cor usada quando a marca é renderizada como máscara SVG (mode "svg") — hoje só consumida
  // pela impressão de PDF do plugin birthdays; o Header do tema ainda não pinta a marca por cor.
  color: "brand.color",
} as const;

const DEFAULTS = {
  siteName: "Venore Docks",
  headerMode: "svg" as HeaderBrandMode,
  logoMediaId: "",
  logoScrolledMediaId: "",
  faviconMediaId: "",
  size: 100,
  scrolledSize: 80,
  position: "left" as BrandPosition,
  color: "#143b52",
};

const FALLBACK_LOGO_SVG = "/brand/brand-logo.svg";
const FALLBACK_LOGO_PNG = "/brand/brand-logo.png";
const FALLBACK_LOGO_SCROLLED_PNG = "/brand/brand-logo-scrolled.png";
const FALLBACK_FAVICON = "/brand/favicon.ico";

// registerDefaultSetting faz onConflictDoNothing por chave (contexts/settings/features/
// register-default-setting/store.ts) — chamar a cada leitura é seguro e barato (upsert
// indexado que só grava na primeira vez). Não existe hoje um bootstrap real de app onde
// registrar isso uma única vez (register-plugins.ts nunca é invocado em produção), então esta
// é a única chamada que garante o default persistido sem inventar infra nova.
async function readStringSetting(key: string, defaultValue: string): Promise<string> {
  await registerDefaultSetting({ key, value: defaultValue });
  const result = await getSetting({ key });
  if (!result.success) return defaultValue;
  const record = result.data;
  if (!record || typeof record.value !== "string") return defaultValue;
  return record.value;
}

async function readNumberSetting(key: string, defaultValue: number): Promise<number> {
  await registerDefaultSetting({ key, value: defaultValue });
  const result = await getSetting({ key });
  if (!result.success) return defaultValue;
  const record = result.data;
  if (!record || typeof record.value !== "number") return defaultValue;
  return record.value;
}

function resolveMode(value: string): HeaderBrandMode {
  return value === "text" || value === "svg" || value === "png" ? value : DEFAULTS.headerMode;
}

function resolvePosition(value: string): BrandPosition {
  return value === "center" ? "center" : "left";
}

function resolveSize(value: number, fallback: number): number {
  return Number.isFinite(value) && value >= 50 && value <= 200 ? value : fallback;
}

async function resolveMediaUrl(mediaId: string, fallback: string): Promise<string> {
  if (!mediaId) return fallback;
  const result = await getMedia({ id: mediaId });
  if (!result.success || !result.data) return fallback;
  return result.data.url;
}

export async function getBrandConfig(): Promise<BrandConfig> {
  const [
    rawMode,
    rawPosition,
    rawSize,
    rawScrolledSize,
    siteName,
    logoMediaId,
    logoScrolledMediaId,
    faviconMediaId,
    color,
  ] = await Promise.all([
    readStringSetting(KEYS.headerMode, DEFAULTS.headerMode),
    readStringSetting(KEYS.position, DEFAULTS.position),
    readNumberSetting(KEYS.size, DEFAULTS.size),
    readNumberSetting(KEYS.scrolledSize, DEFAULTS.scrolledSize),
    readStringSetting(KEYS.siteName, DEFAULTS.siteName),
    readStringSetting(KEYS.logoMediaId, DEFAULTS.logoMediaId),
    readStringSetting(KEYS.logoScrolledMediaId, DEFAULTS.logoScrolledMediaId),
    readStringSetting(KEYS.faviconMediaId, DEFAULTS.faviconMediaId),
    readStringSetting(KEYS.color, DEFAULTS.color),
  ]);

  const mode = resolveMode(rawMode);
  const fallbackLogo = mode === "png" ? FALLBACK_LOGO_PNG : FALLBACK_LOGO_SVG;

  const [logoUrl, scrolledLogoUrl, faviconUrl] = await Promise.all([
    resolveMediaUrl(logoMediaId, fallbackLogo),
    resolveMediaUrl(logoScrolledMediaId, FALLBACK_LOGO_SCROLLED_PNG),
    resolveMediaUrl(faviconMediaId, FALLBACK_FAVICON),
  ]);

  return {
    siteName,
    mode,
    size: resolveSize(rawSize, DEFAULTS.size),
    scrolledSize: resolveSize(rawScrolledSize, DEFAULTS.scrolledSize),
    position: resolvePosition(rawPosition),
    logoUrl,
    scrolledLogoUrl,
    faviconUrl,
    color: color.trim() || DEFAULTS.color,
  };
}

export { KEYS as BRAND_SETTING_KEYS };
