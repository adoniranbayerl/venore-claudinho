"use client";

import { useActionState } from "react";
import { enrollStudentAction, type CourseActionState } from "../actions";

const initialState: CourseActionState = { error: null };

export function EnrollStudentForm({ courseId }: { courseId: string }) {
  const [state, formAction, pending] = useActionState(enrollStudentAction, initialState);

  return (
    <form action={formAction} className="mt-3 flex items-end gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-700">Email do aluno</label>
        <input
          name="email"
          type="email"
          required
          placeholder="aluno@example.com"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Matricular
      </button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
