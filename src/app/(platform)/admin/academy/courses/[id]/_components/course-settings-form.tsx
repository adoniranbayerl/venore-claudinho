"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import { updateCourseSettingsAction, type CourseActionState } from "../actions";

const initialState: CourseActionState = { error: null };

export function CourseSettingsForm({
  courseId,
  slug,
  selfEnrollmentEnabled,
  publiclyListed,
}: {
  courseId: string;
  slug: string;
  selfEnrollmentEnabled: boolean;
  publiclyListed: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateCourseSettingsAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Configurações de matrícula salvas." });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={courseId} />

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Slug (URL pública)
        <Input name="slug" defaultValue={slug} required />
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="selfEnrollmentEnabled" defaultChecked={selfEnrollmentEnabled} />
        Permitir matrícula automática
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="publiclyListed" defaultChecked={publiclyListed} />
        Listar publicamente
      </label>

      <Button type="submit" variant="outline" disabled={pending}>
        Salvar configurações de matrícula
      </Button>
    </form>
  );
}
