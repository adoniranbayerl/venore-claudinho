import type { DonationSettingsValues } from "../shared/settings";

export type DonationSettings = DonationSettingsValues;

export type DonationPixCode = {
  payload: string;
  qrSvg: string;
  amount: number | null;
};

// Microcopy de DonationWidget/DonationTeaser (botões, placeholder, mensagens de estado) — um
// subconjunto de DonationSettings, então qualquer chamador que já tenha o DonationSettings
// inteiro pode passá-lo direto como `copy` sem construir um objeto novo (TS aceita o supertipo
// estruturalmente).
export type DonationWidgetCopy = Pick<
  DonationSettingsValues,
  | "customAmountLabel"
  | "customAmountPlaceholder"
  | "customAmountSubmitLabel"
  | "customAmountError"
  | "qrUpdatedLabel"
  | "freeAmountLabelCompact"
  | "freeAmountLabelFull"
  | "copiedLabel"
  | "copyLabelCompact"
  | "copyLabelFull"
  | "closeLabel"
  | "loadingLabel"
>;
