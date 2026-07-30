"use server";

import { revalidatePath } from "next/cache";
import { createBirthday, deleteBirthday, updateBirthday } from "@/plugins/birthdays";

export type BirthdaysActionState = { error: string | null };

const returnTo = "/admin/birthdays";

export async function createBirthdayAction(
  _prevState: BirthdaysActionState,
  formData: FormData,
): Promise<BirthdaysActionState> {
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
  const result = await deleteBirthday({ birthdayId: String(formData.get("birthdayId") ?? "") });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(returnTo);
  return { error: null };
}
