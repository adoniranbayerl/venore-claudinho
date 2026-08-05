"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { renameRoleAction, type RbacActionState } from "../actions";

const initialState: RbacActionState = { error: null };

export function RenameRoleForm({ roleId, name }: { roleId: string; name: string }) {
  const [state, formAction, pending] = useActionState(renameRoleAction, initialState);
  const [value, setValue] = useState(name);
  const [editing, setEditing] = useState(false);
  useActionToast({
    pending,
    error: state.error,
    successMessage: "Nome de exibição atualizado.",
    onSuccess: () => setEditing(false),
  });

  if (!editing) {
    return (
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto gap-1 p-0 text-xs"
        onClick={() => {
          setValue(name);
          setEditing(true);
        }}
      >
        <Pencil className="size-3" strokeWidth={1.5} />
        Editar nome de exibição
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input type="hidden" name="roleId" value={roleId} />
      <Input
        name="name"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="sm:max-w-xs"
        required
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending || value.trim().length === 0}>
          Salvar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => {
            setValue(name);
            setEditing(false);
          }}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
