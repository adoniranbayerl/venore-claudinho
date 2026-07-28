"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import { createCourseAction, type AcademyActionState } from "../actions";

const initialState: AcademyActionState = { error: null };

export function CreateCourseForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(createCourseAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Curso criado.", onSuccess });

  return (
    <form action={formAction} className="space-y-3">
      <Input name="title" placeholder="título do curso" required />
      <Input name="description" placeholder="descrição (opcional)" />
      <Input name="slug" placeholder="slug (opcional — gerado do título se vazio)" />
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="selfEnrollmentEnabled" defaultChecked />
        Permitir matrícula automática
      </label>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="publiclyListed" defaultChecked />
        Listar publicamente
      </label>
      <Button type="submit" disabled={pending} className="w-full">
        Criar curso
      </Button>
    </form>
  );
}
