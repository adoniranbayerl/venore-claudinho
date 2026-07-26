"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import { enrollStudentAction, type CourseActionState } from "../actions";

const initialState: CourseActionState = { error: null };

export function EnrollStudentForm({ courseId }: { courseId: string }) {
  const [state, formAction, pending] = useActionState(enrollStudentAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Aluno matriculado." });

  return (
    <form action={formAction} className="mt-3 flex items-end gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <div className="flex-1">
        <label className="block text-xs font-medium text-text-secondary">Email do aluno</label>
        <Input name="email" type="email" required placeholder="aluno@example.com" className="mt-1" />
      </div>
      <Button type="submit" disabled={pending}>
        Matricular
      </Button>
    </form>
  );
}
