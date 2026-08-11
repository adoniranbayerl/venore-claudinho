"use server";

import { revalidatePath } from "next/cache";
import {
  createBirthday,
  deleteBirthday,
  importBirthdaysCsv,
  previewBirthdaysCsvImport,
  updateBirthday,
} from "@/plugins/birthdays";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import type { ImportBirthdaysCsvActionState, PreviewBirthdaysCsvImportState } from "./initial-state";

export type BirthdaysActionState = { error: string | null };

const returnTo = "/admin/birthdays";
const PLUGIN_DISABLED_ERROR = "O plugin Aniversariantes está desabilitado.";

function readCsvFile(formData: FormData): File | { error: string } {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo .csv para importar." };
  }
  return file;
}

export async function createBirthdayAction(
  _prevState: BirthdaysActionState,
  formData: FormData,
): Promise<BirthdaysActionState> {
  if (!(await isPluginActive("birthdays"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const result = await createBirthday({
    fullName: String(formData.get("fullName") ?? ""),
    role: String(formData.get("role") ?? "") || undefined,
    locality: String(formData.get("locality") ?? "") || undefined,
    month: Number(formData.get("month")),
    day: Number(formData.get("day")),
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(returnTo);
  return { error: null };
}

export async function updateBirthdayAction(
  _prevState: BirthdaysActionState,
  formData: FormData,
): Promise<BirthdaysActionState> {
  if (!(await isPluginActive("birthdays"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const result = await updateBirthday({
    birthdayId: String(formData.get("birthdayId") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    role: String(formData.get("role") ?? "") || undefined,
    locality: String(formData.get("locality") ?? "") || undefined,
    month: Number(formData.get("month")),
    day: Number(formData.get("day")),
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(returnTo);
  return { error: null };
}

export async function deleteBirthdayAction(
  _prevState: BirthdaysActionState,
  formData: FormData,
): Promise<BirthdaysActionState> {
  if (!(await isPluginActive("birthdays"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const result = await deleteBirthday({ birthdayId: String(formData.get("birthdayId") ?? "") });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(returnTo);
  return { error: null };
}

// Passo 1 do fluxo de importação em lote: só parseia e valida no servidor, nada é gravado ainda.
export async function previewBirthdaysCsvImportAction(
  _prevState: PreviewBirthdaysCsvImportState,
  formData: FormData,
): Promise<PreviewBirthdaysCsvImportState> {
  if (!(await isPluginActive("birthdays"))) {
    return { error: PLUGIN_DISABLED_ERROR, report: null };
  }

  const file = readCsvFile(formData);
  if ("error" in file) {
    return { error: file.error, report: null };
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const result = await previewBirthdaysCsvImport({ fileBuffer });

  if (!result.success) {
    return { error: result.error.message, report: null };
  }

  return { error: null, report: result.data };
}

// Passo 2: grava, em uma transação, só as linhas válidas (e não-duplicadas, a menos que
// includeDuplicates esteja marcado). Reparseia o mesmo arquivo em vez de depender de estado
// guardado entre requests — o CSV nunca é persistido, é só reprocessado.
export async function importBirthdaysCsvAction(
  _prevState: ImportBirthdaysCsvActionState,
  formData: FormData,
): Promise<ImportBirthdaysCsvActionState> {
  if (!(await isPluginActive("birthdays"))) {
    return { error: PLUGIN_DISABLED_ERROR, outcome: null };
  }

  const file = readCsvFile(formData);
  if ("error" in file) {
    return { error: file.error, outcome: null };
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const includeDuplicates = formData.get("includeDuplicates") === "true";

  const result = await importBirthdaysCsv({ fileBuffer, includeDuplicates });

  if (!result.success) {
    return { error: result.error.message, outcome: null };
  }

  revalidatePath(returnTo);
  return { error: null, outcome: result.data };
}
