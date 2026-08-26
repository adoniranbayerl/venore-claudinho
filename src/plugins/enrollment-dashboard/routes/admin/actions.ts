"use server";

import { revalidatePath } from "next/cache";
import {
  createInstitution,
  createProgram,
  deleteInstitution,
  deleteProgram,
  updateInstitution,
  updateProgram,
} from "@/plugins/enrollment-dashboard";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";

export type EnrollmentDashboardActionState = { error: string | null };

const returnTo = "/admin/enrollment-dashboard";
const PLUGIN_DISABLED_ERROR = "O plugin Dashboard de Matrícula está desabilitado.";

function readCount(formData: FormData, name: string): number {
  return Number(formData.get(name));
}

export async function createInstitutionAction(
  _prevState: EnrollmentDashboardActionState,
  formData: FormData,
): Promise<EnrollmentDashboardActionState> {
  if (!(await isPluginActive("enrollment-dashboard"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const result = await createInstitution({
    name: String(formData.get("name") ?? ""),
    programLabel: String(formData.get("programLabel") ?? ""),
    logoMediaId: String(formData.get("logoMediaId") ?? "") || undefined,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(returnTo);
  return { error: null };
}

export async function updateInstitutionAction(
  _prevState: EnrollmentDashboardActionState,
  formData: FormData,
): Promise<EnrollmentDashboardActionState> {
  if (!(await isPluginActive("enrollment-dashboard"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const result = await updateInstitution({
    institutionId: String(formData.get("institutionId") ?? ""),
    name: String(formData.get("name") ?? ""),
    programLabel: String(formData.get("programLabel") ?? ""),
    logoMediaId: String(formData.get("logoMediaId") ?? "") || undefined,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(returnTo);
  return { error: null };
}

export async function deleteInstitutionAction(
  _prevState: EnrollmentDashboardActionState,
  formData: FormData,
): Promise<EnrollmentDashboardActionState> {
  if (!(await isPluginActive("enrollment-dashboard"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const result = await deleteInstitution({ institutionId: String(formData.get("institutionId") ?? "") });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(returnTo);
  return { error: null };
}

export async function createProgramAction(
  _prevState: EnrollmentDashboardActionState,
  formData: FormData,
): Promise<EnrollmentDashboardActionState> {
  if (!(await isPluginActive("enrollment-dashboard"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const result = await createProgram({
    institutionId: String(formData.get("institutionId") ?? ""),
    label: String(formData.get("label") ?? ""),
    groupLabel: String(formData.get("groupLabel") ?? "") || undefined,
    goal: readCount(formData, "goal"),
    renewed: readCount(formData, "renewed"),
    newEnrollments: readCount(formData, "newEnrollments"),
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(returnTo);
  return { error: null };
}

export async function updateProgramAction(
  _prevState: EnrollmentDashboardActionState,
  formData: FormData,
): Promise<EnrollmentDashboardActionState> {
  if (!(await isPluginActive("enrollment-dashboard"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const result = await updateProgram({
    programId: String(formData.get("programId") ?? ""),
    label: String(formData.get("label") ?? ""),
    groupLabel: String(formData.get("groupLabel") ?? "") || undefined,
    goal: readCount(formData, "goal"),
    renewed: readCount(formData, "renewed"),
    newEnrollments: readCount(formData, "newEnrollments"),
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(returnTo);
  return { error: null };
}

export async function deleteProgramAction(
  _prevState: EnrollmentDashboardActionState,
  formData: FormData,
): Promise<EnrollmentDashboardActionState> {
  if (!(await isPluginActive("enrollment-dashboard"))) {
    return { error: PLUGIN_DISABLED_ERROR };
  }

  const result = await deleteProgram({ programId: String(formData.get("programId") ?? "") });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(returnTo);
  return { error: null };
}
