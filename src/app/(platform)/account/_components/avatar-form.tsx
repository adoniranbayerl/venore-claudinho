"use client";

import { useActionState } from "react";
import { MediaPickerField } from "@/components/media-picker-field";
import type { PickableMedia } from "@/components/media-picker-field.actions";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { updateOwnAvatarAction, type AccountActionState } from "../actions";

const initialState: AccountActionState = { error: null };

export function AvatarForm({ avatarMedia }: { avatarMedia: PickableMedia | null }) {
  const [state, formAction, pending] = useActionState(updateOwnAvatarAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Avatar salvo." });

  return (
    <form action={formAction} className="space-y-3">
      <MediaPickerField name="avatarMediaId" label="Avatar" initialMedia={avatarMedia} />
      <Button type="submit" disabled={pending}>
        Salvar
      </Button>
    </form>
  );
}
