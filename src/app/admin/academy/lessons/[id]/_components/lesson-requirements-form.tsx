"use client";

import { useActionState, useState } from "react";
import { configureLessonRequirementsAction, type LessonActionState } from "../actions";

const initialState: LessonActionState = { error: null };

export function LessonRequirementsForm({
  lessonId,
  hasVideoUrl,
  requirements,
}: {
  lessonId: string;
  hasVideoUrl: boolean;
  requirements: {
    readTextEnabled: boolean;
    watchVideoEnabled: boolean;
    quizEnabled: boolean;
    quizPassThresholdPercent: number | null;
    quizMaxAttempts: number | null;
  } | null;
}) {
  const [state, formAction, pending] = useActionState(configureLessonRequirementsAction, initialState);
  const [quizEnabled, setQuizEnabled] = useState(requirements?.quizEnabled ?? false);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="lessonId" value={lessonId} />

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="readTextEnabled" defaultChecked={requirements?.readTextEnabled ?? false} />
        Exigir leitura do texto
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="watchVideoEnabled"
          defaultChecked={requirements?.watchVideoEnabled ?? false}
          disabled={!hasVideoUrl}
        />
        Exigir assistir o vídeo
        {!hasVideoUrl && <span className="text-xs text-gray-500">(a aula não tem videoUrl)</span>}
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="quizEnabled"
          checked={quizEnabled}
          onChange={(event) => setQuizEnabled(event.target.checked)}
        />
        Exigir quiz
      </label>

      {quizEnabled && (
        <div className="ml-6 space-y-3 border-l border-gray-200 pl-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">Nota mínima para aprovação (%)</label>
            <input
              type="number"
              name="quizPassThresholdPercent"
              min={1}
              max={100}
              defaultValue={requirements?.quizPassThresholdPercent ?? 70}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Tentativas máximas</label>
            <input
              type="number"
              name="quizMaxAttempts"
              min={1}
              defaultValue={requirements?.quizMaxAttempts ?? 3}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Salvar requisitos
      </button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
