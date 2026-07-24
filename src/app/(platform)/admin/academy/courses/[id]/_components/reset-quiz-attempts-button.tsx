"use client";

import { useActionState } from "react";
import { resetQuizAttemptsAction, type CourseActionState } from "../actions";

const initialState: CourseActionState = { error: null };

export function ResetQuizAttemptsButton({
  courseId,
  lessonId,
  studentActorId,
  studentLabel,
}: {
  courseId: string;
  lessonId: string;
  studentActorId: string;
  studentLabel: string;
}) {
  const [state, formAction, pending] = useActionState(resetQuizAttemptsAction, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col items-start gap-1"
      onSubmit={(event) => {
        if (!window.confirm(`Resetar tentativas de quiz de ${studentLabel} nesta aula?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="studentActorId" value={studentActorId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-900 disabled:opacity-50"
      >
        Resetar tentativas
      </button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
