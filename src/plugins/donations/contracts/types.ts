import type { DonationSettingsValues } from "../shared/settings";

export type DonationSettings = DonationSettingsValues;

export type DonationPixCode = {
  payload: string;
  qrSvg: string;
  amount: number | null;
};
