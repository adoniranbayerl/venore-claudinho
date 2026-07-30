"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { PermissionCheckboxes } from "./permission-checkboxes";
import { updateRolePermissionsAction, type RbacActionState } from "../actions";

const initialState: RbacActionState = { error: null };

export function UpdatePermissionsForm({ roleId, selectedKeys }: { roleId: string; selectedKeys: string[] }) {
  const [state, formAction, pending] = useActionState(updateRolePermissionsAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Permissões atualizadas." });

  return (
    <form action={formAction} className="mt-2 space-y-2">
      <input type="hidden" name="roleId" value={roleId} />
      <PermissionCheckboxes selectedKeys={selectedKeys} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Salvar permissões
      </Button>
    </form>
  );
}
