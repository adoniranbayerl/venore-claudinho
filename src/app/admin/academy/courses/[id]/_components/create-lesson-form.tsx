"use client";

import { useActionState } from "react";
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
        <input name="videoUrl" className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm" />
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
