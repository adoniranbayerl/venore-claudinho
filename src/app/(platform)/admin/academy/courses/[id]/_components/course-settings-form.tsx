"use client";

import { useActionState } from "react";
import { updateCourseSettingsAction, type CourseActionState } from "../actions";

const initialState: CourseActionState = { error: null };

export function CourseSettingsForm({
  courseId,
  selfEnrollmentEnabled,
  publiclyListed,
}: {
  courseId: string;
  selfEnrollmentEnabled: boolean;
  publiclyListed: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateCourseSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={courseId} />

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="selfEnrollmentEnabled" defaultChecked={selfEnrollmentEnabled} />
        Permitir matrícula automática
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="publiclyListed" defaultChecked={publiclyListed} />
        Listar publicamente
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 disabled:opacity-50"
      >
        Salvar configurações de matrícula
      </button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
