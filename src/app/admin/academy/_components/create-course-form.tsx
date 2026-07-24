"use client";

import { useActionState } from "react";
import { createCourseAction, type AcademyActionState } from "../actions";

const initialState: AcademyActionState = { error: null };

export function CreateCourseForm() {
  const [state, formAction, pending] = useActionState(createCourseAction, initialState);

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input
        name="title"
        placeholder="título do curso"
        required
        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
      />
      <input
        name="description"
        placeholder="descrição (opcional)"
        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Criar curso
      </button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
