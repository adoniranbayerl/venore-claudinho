"use client";

import { useActionState } from "react";
import { enrollSelfAction, type EnrollSelfActionState } from "../actions";

const initialState: EnrollSelfActionState = { error: null };

export function EnrollSelfButton({ courseId }: { courseId: string }) {
  const [state, formAction, pending] = useActionState(enrollSelfAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <input type="hidden" name="courseId" value={courseId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Matricular-se
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
