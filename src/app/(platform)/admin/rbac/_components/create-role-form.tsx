"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AutoSlugField } from "@/components/auto-slug-field";
import { useActionToast } from "@/hooks/use-action-toast";
import { PermissionCheckboxes } from "./permission-checkboxes";
import { createRoleAction, type RbacActionState } from "../actions";

const initialState: RbacActionState = { error: null };

export function CreateRoleForm() {
  const [state, formAction, pending] = useActionState(createRoleAction, initialState);
  const [name, setName] = useState("");
  useActionToast({ pending, error: state.error, successMessage: "Papel criado." });

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground">Nome de exibição</label>
          <Input
            name="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1"
            placeholder="ex: Editor restrito"
          />
        </div>
        <div className="flex-1">
          <AutoSlugField name="key" sourceValue={name} label="Identificador" />
        </div>
      </div>
      <PermissionCheckboxes />
      <Button type="submit" disabled={pending}>
        Criar papel
      </Button>
    </form>
  );
}
