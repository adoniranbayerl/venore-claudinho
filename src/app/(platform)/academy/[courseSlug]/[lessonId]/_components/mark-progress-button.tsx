"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { markTextReadAction, markVideoWatchedAction, type LessonActionState } from "../actions";

const initialState: LessonActionState = { error: null };

export function MarkProgressButton({
  courseSlug,
  lessonId,
  kind,
  label,
}: {
  courseSlug: string;
  lessonId: string;
  kind: "text" | "video";
  label: string;
}) {
  const action = kind === "text" ? markTextReadAction : markVideoWatchedAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Progresso salvo." });

  return (
    <form action={formAction}>
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <Button type="submit" variant="outline" disabled={pending}>
        {label}
      </Button>
    </form>
  );
}
