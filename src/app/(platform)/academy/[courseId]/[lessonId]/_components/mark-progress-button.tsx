"use client";

import { useActionState } from "react";
import { markTextReadAction, markVideoWatchedAction, type LessonActionState } from "../actions";

const initialState: LessonActionState = { error: null };

export function MarkProgressButton({
  courseId,
  lessonId,
  kind,
  label,
}: {
  courseId: string;
  lessonId: string;
  kind: "text" | "video";
  label: string;
}) {
  const action = kind === "text" ? markTextReadAction : markVideoWatchedAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium disabled:opacity-50"
      >
        {label}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
