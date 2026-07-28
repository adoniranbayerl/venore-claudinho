"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { submitQuizAction, type QuizActionState } from "../actions";
import type { StudentQuizQuestionRecord } from "@/plugins/academy";

const initialState: QuizActionState = { error: null, result: null };

export function QuizForm({
  courseSlug,
  lessonId,
  questions,
  attemptsExhausted,
}: {
  courseSlug: string;
  lessonId: string;
  questions: StudentQuizQuestionRecord[];
  attemptsExhausted: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitQuizAction, initialState);
  useActionToast({
    pending,
    error: state.error,
    successMessage: state.result ? (state.result.passed ? "Você passou no quiz!" : "Respostas enviadas.") : null,
  });

  const exhaustedNow = attemptsExhausted || (state.result !== null && !state.result.passed && state.result.attemptsRemaining <= 0);

  if (exhaustedNow) {
    return (
      <div className="rounded border border-border-subtle p-4">
        <p className="text-sm text-text-secondary">Você esgotou suas tentativas para este quiz.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded border border-border-subtle p-4">
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <input type="hidden" name="lessonId" value={lessonId} />

      {questions.map((question) => (
        <fieldset key={question.id} className="space-y-2">
          <input type="hidden" name="questionId" value={question.id} />
          <legend className="text-sm font-medium">{question.text}</legend>
          {question.options.map((option, index) => (
            <label key={index} className="flex items-center gap-2 text-sm">
              <input type="radio" name={`answer-${question.id}`} value={index} required />
              {option}
            </label>
          ))}
        </fieldset>
      ))}

      <Button type="submit" variant="outline" disabled={pending}>
        Enviar respostas
      </Button>

      {state.result && (
        <div className="space-y-0.5">
          <p className="text-base font-semibold">Nota: {state.result.grade.toFixed(1)}</p>
          <p className="text-xs text-text-tertiary">{state.result.score}% de acerto</p>
          <p className="text-sm">
            {state.result.passed
              ? "Você passou!"
              : `Você não passou. Tentativas restantes: ${state.result.attemptsRemaining}.`}
          </p>
        </div>
      )}
    </form>
  );
}
