"use client";

import { useActionState } from "react";
import { submitQuizAction, type QuizActionState } from "../actions";
import type { StudentQuizQuestionRecord } from "@/plugins/academy";

const initialState: QuizActionState = { error: null, result: null };

export function QuizForm({
  courseId,
  lessonId,
  questions,
  attemptsExhausted,
}: {
  courseId: string;
  lessonId: string;
  questions: StudentQuizQuestionRecord[];
  attemptsExhausted: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitQuizAction, initialState);

  const exhaustedNow = attemptsExhausted || (state.result !== null && !state.result.passed && state.result.attemptsRemaining <= 0);

  if (exhaustedNow) {
    return (
      <div className="rounded border border-gray-200 p-4">
        <p className="text-sm text-gray-700">Você esgotou suas tentativas para este quiz.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded border border-gray-200 p-4">
      <input type="hidden" name="courseId" value={courseId} />
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

      <button
        type="submit"
        disabled={pending}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium disabled:opacity-50"
      >
        Enviar respostas
      </button>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.result && (
        <p className="text-sm">
          {state.result.passed
            ? `Você passou! Nota: ${state.result.score}.`
            : `Você não passou. Nota: ${state.result.score}. Tentativas restantes: ${state.result.attemptsRemaining}.`}
        </p>
      )}
    </form>
  );
}
