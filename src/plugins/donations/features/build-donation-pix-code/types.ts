import type { OperationResult } from "@/shared/types";
import type { DonationPixCode } from "../../contracts/types";

export type BuildDonationPixCodeInput = { amount?: number | null };
export type BuildDonationPixCodeResult = OperationResult<DonationPixCode>;
