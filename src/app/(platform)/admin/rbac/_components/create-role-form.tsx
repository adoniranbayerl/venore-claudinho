"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AutoSlugField } from "@/components/auto-slug-field";
import { useActionToast } from "@/hooks/use-action-toast";
import { PermissionPicker } from "./permission-picker";
import type { PermissionGroupView } from "./permission-catalog";
import { createRoleAction, type RbacActionState } from "../actions";

const initialState: RbacActionState = { error: null };

export function CreateRoleForm({ groups }: { groups: PermissionGroupView[] }) {
  const [state, formAction, pending] = useActionState(createRoleAction, initialState);
  const [name, setName] = useState("");
  const [permissionKeys, setPermissionKeys] = useState<string[]>([]);
  useActionToast({
    pending,
    error: state.error,
    successMessage: "Papel criado.",
    onSuccess: () => {
      setName("");
      setPermissionKeys([]);
    },
  });

  function toggle(key: string) {
    setPermissionKeys((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  }

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
      <PermissionPicker groups={groups} selected={permissionKeys} onToggle={toggle} />
      <p className="text-xs text-muted-foreground">
        Pode criar sem marcar nenhuma permissão agora e adicionar depois.
      </p>
      <Button type="submit" disabled={pending}>
        Criar papel
      </Button>
    </form>
  );
}
