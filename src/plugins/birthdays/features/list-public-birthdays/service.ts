import { findAllBirthdays } from "./store";
import { toPublicBirthdayView } from "./view";
import type { ListPublicBirthdaysResult } from "./types";

export async function listPublicBirthdays(): Promise<ListPublicBirthdaysResult> {
  const records = await findAllBirthdays();
  return { success: true, data: records.map(toPublicBirthdayView) };
}
