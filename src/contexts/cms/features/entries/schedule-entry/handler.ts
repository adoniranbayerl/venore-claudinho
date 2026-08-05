import { authorizeActor } from "@/contexts/rbac";
import { scheduleEntry } from "./service";
import type { ScheduleEntryInput, ScheduleEntryResult } from "./types";

export async function scheduleEntryHandler(input: ScheduleEntryInput): Promise<ScheduleEntryResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "cms.entries.invalid_id", message: "id não pode ser vazio." } };
  }

  if (Number.isNaN(input.scheduledPublishAt.getTime()) || input.scheduledPublishAt.getTime() <= Date.now()) {
    return {
      success: false,
      error: {
        code: "cms.entries.invalid_scheduled_publish_at",
        message: "A data de publicação agendada precisa ser uma data válida no futuro.",
      },
    };
  }

  if (input.scheduledArchiveAt && Number.isNaN(input.scheduledArchiveAt.getTime())) {
    return {
      success: false,
      error: { code: "cms.entries.invalid_scheduled_archive_at", message: "A data de arquivamento agendada é inválida." },
    };
  }

  if (input.scheduledArchiveAt && input.scheduledArchiveAt.getTime() <= input.scheduledPublishAt.getTime()) {
    return {
      success: false,
      error: {
        code: "cms.entries.invalid_scheduled_archive_at",
        message: "O arquivamento agendado precisa ser depois da publicação agendada.",
      },
    };
  }

  // Fase 4/P3: agendar publicação é uma forma de publicar — mesma permission de publish-entry.
  const authz = await authorizeActor(["cms.entries.publish", "cms.entries.manage"]);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return scheduleEntry({ ...input, actorId: authz.actorId });
}
