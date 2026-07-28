"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { addQuizQuestionAction, type LessonActionState } from "../actions";

const initialState: LessonActionState = { error: null };

export function AddQuizQuestionForm({ lessonId }: { lessonId: string }) {
  const [state, formAction, pending] = useActionState(addQuizQuestionAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Pergunta adicionada." });
  const [optionCount, setOptionCount] = useState(2);

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input type="hidden" name="lessonId" value={lessonId} />

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Pergunta</label>
        <input name="text" required className="mt-1 w-full rounded border border-border px-2 py-1 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">Opções (marque a correta)</label>
        {Array.from({ length: optionCount }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <input type="radio" name="correctOptionIndex" value={index} required />
            <input
              name="options"
              required
              placeholder={`opção ${index + 1}`}
              className="flex-1 rounded border border-border px-2 py-1 text-sm"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOptionCount((count) => count + 1)}
          className="text-xs font-medium text-muted-foreground hover:underline"
        >
          + adicionar opção
        </button>
      </div>

      <Button type="submit" disabled={pending}>
        Adicionar pergunta
      </Button>
    </form>
  );
}
