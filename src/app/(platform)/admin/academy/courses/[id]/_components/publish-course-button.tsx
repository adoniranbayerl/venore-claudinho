"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { publishCourseAction, type CourseActionState } from "../actions";

const initialState: CourseActionState = { error: null };

export function PublishCourseButton({ courseId }: { courseId: string }) {
  const [state, formAction, pending] = useActionState(publishCourseAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Curso publicado." });

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={courseId} />
      <Button type="submit" variant="outline" disabled={pending}>
        Publicar
      </Button>
    </form>
  );
}
