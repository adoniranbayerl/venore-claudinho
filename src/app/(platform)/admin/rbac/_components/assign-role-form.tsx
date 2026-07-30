"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { assignRoleAction, type RbacActionState } from "../actions";

const initialState: RbacActionState = { error: null };

export function AssignRoleForm({
  roleId,
  assignableUsers,
}: {
  roleId: string;
  assignableUsers: { id: string; name: string | null; email: string }[];
}) {
  const [state, formAction, pending] = useActionState(assignRoleAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Papel atribuído." });

  return (
    <form action={formAction} className="mt-3 flex items-center gap-2">
      <input type="hidden" name="roleId" value={roleId} />
      <Select name="userId" required>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="selecione um usuário..." />
        </SelectTrigger>
        <SelectContent>
          {assignableUsers.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name ?? user.email} ({user.email})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Atribuir
      </Button>
    </form>
  );
}
