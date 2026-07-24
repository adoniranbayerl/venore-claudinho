"use client";

import { useActionState, useState } from "react";
import { createLessonAction, type CourseActionState } from "../actions";

const initialState: CourseActionState = { error: null };

export function CreateLessonForm({
  courseId,
  entries,
}: {
  courseId: string;
  entries: { id: string; title: string; slug: string }[];
}) {
  const [state, formAction, pending] = useActionState(createLessonAction, initialState);
  const [videoUrl, setVideoUrl] = useState("");
  const [quizEnabled, setQuizEnabled] = useState(false);

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input type="hidden" name="courseId" value={courseId} />

      <div>
        <label className="block text-xs font-medium text-gray-700">Entry do CMS</label>
        <select name="cmsEntryId" required className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm">
          <option value="">selecione...</option>
          {entries.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.title} ({entry.slug})
            </option>
          ))}
        </select>
        {entries.length === 0 && (
          <p className="mt-1 text-xs text-gray-500">Nenhuma entry publicada no CMS ainda.</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">URL do vídeo (opcional)</label>
        <input
          name="videoUrl"
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </div>

      <div className="space-y-2 border-t border-gray-200 pt-3">
        <p className="text-xs font-medium text-gray-700">Requisitos de conclusão (opcional, dá pra ajustar depois)</p>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="readTextEnabled" />
          Exigir leitura do texto
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="watchVideoEnabled" disabled={videoUrl.trim().length === 0} />
          Exigir assistir o vídeo
          {videoUrl.trim().length === 0 && <span className="text-xs text-gray-500">(preencha a URL do vídeo)</span>}
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
                defaultValue={70}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Tentativas máximas</label>
              <input
                type="number"
                name="quizMaxAttempts"
                min={1}
                defaultValue={3}
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <p className="text-xs text-gray-500">
              As perguntas do quiz são cadastradas na página da aula depois de criá-la.
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Criar aula
      </button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
