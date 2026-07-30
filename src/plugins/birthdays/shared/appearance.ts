// Chaves e defaults de contexts/settings pra aparência do plugin — única fonte de verdade,
// usada tanto por manifest.ts (registro do default via registerDefaultSetting, ver
// register-plugins.ts) quanto pela tela admin de aparência e pelo quadro público.
export const BIRTHDAY_APPEARANCE_SETTINGS = {
  pageBackground: { key: "birthdays.appearance.pageBackground", defaultValue: "#FFFFFF", label: "Fundo da página" },
  titleColor: { key: "birthdays.appearance.titleColor", defaultValue: "#0F8CA6", label: "Cor do título" },
  monthColor: { key: "birthdays.appearance.monthColor", defaultValue: "#F4B000", label: "Cor do mês" },
  cardDarkColor: { key: "birthdays.appearance.cardDarkColor", defaultValue: "#082F45", label: "Cor escura do card" },
  cardTealColor: { key: "birthdays.appearance.cardTealColor", defaultValue: "#2A8AA3", label: "Cor teal do card" },
  cardAccentColor: {
    key: "birthdays.appearance.cardAccentColor",
    defaultValue: "#F4B000",
    label: "Cor de destaque do card",
  },
  cardTextColor: { key: "birthdays.appearance.cardTextColor", defaultValue: "#F2F2EE", label: "Cor do texto do card" },
  dayTextColor: { key: "birthdays.appearance.dayTextColor", defaultValue: "#F2F2EE", label: "Cor do número do dia" },
  roleTextColor: { key: "birthdays.appearance.roleTextColor", defaultValue: "#0F8CA6", label: "Cor do cargo" },
} as const;

export type BirthdayAppearanceField = keyof typeof BIRTHDAY_APPEARANCE_SETTINGS;

export type BirthdayAppearanceSettings = Record<BirthdayAppearanceField, string>;

export const DEFAULT_BIRTHDAY_APPEARANCE: BirthdayAppearanceSettings = Object.fromEntries(
  Object.entries(BIRTHDAY_APPEARANCE_SETTINGS).map(([field, { defaultValue }]) => [field, defaultValue]),
) as BirthdayAppearanceSettings;
