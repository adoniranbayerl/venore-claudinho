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
      <div className="rounded-panel border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Você esgotou suas tentativas para este quiz.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <input type="hidden" name="lessonId" value={lessonId} />

      {questions.map((question) => (
        <fieldset key={question.id} className="space-y-2.5">
          <input type="hidden" name="questionId" value={question.id} />
          <legend className="text-sm font-medium text-foreground">{question.text}</legend>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label
                key={index}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-card px-3.5 py-2.5 text-sm ui-motion-base has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-2 has-focus-visible:ring-ring hover:border-ring"
              >
                <input type="radio" name={`answer-${question.id}`} value={index} required className="peer sr-only" />
                <span className="size-4 shrink-0 rounded-full border border-border peer-checked:border-primary peer-checked:bg-primary" />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <Button type="submit" disabled={pending}>
        Enviar respostas
      </Button>

      {state.result && (
        <div
          className={`space-y-0.5 rounded-md border px-3.5 py-3 text-sm ${
            state.result.passed ? "border-success-border bg-success-soft" : "border-warning-border bg-warning-soft"
          }`}
        >
          <p className="text-base font-semibold tabular-nums">Nota: {state.result.grade.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground/56 tabular-nums">{state.result.score}% de acerto</p>
          <p className={state.result.passed ? "text-success" : "text-warning"}>
            {state.result.passed
              ? "Você passou!"
              : `Você não passou. Tentativas restantes: ${state.result.attemptsRemaining}.`}
          </p>
        </div>
      )}
    </form>
  );
}
