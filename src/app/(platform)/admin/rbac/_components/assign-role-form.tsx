"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import type { CmsCategoryOption } from "@/platform/admin-shell/get-rbac-scope-options";
import { assignRoleAction, type RbacActionState } from "../actions";
import { CategoryScopePicker } from "./category-scope-picker";

const initialState: RbacActionState = { error: null };

export function AssignRoleForm({
  roleId,
  assignableUsers,
  // Vazio quando o papel não tem nenhuma permission escopável — nesse caso o picker não aparece
  // e a atribuição é sempre global.
  scopableCategories = [],
}: {
  roleId: string;
  assignableUsers: { id: string; name: string | null; email: string }[];
  scopableCategories?: CmsCategoryOption[];
}) {
  const [state, formAction, pending] = useActionState(assignRoleAction, initialState);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  useActionToast({
    pending,
    error: state.error,
    successMessage: "Papel atribuído.",
    onSuccess: () => setCategoryIds([]),
  });

  const isScopable = scopableCategories.length > 0;

  function toggle(id: string) {
    setCategoryIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="roleId" value={roleId} />
      <div className="flex items-center gap-2">
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
      </div>

      {isScopable && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Limitar a quais categorias?</p>
          <CategoryScopePicker categories={scopableCategories} selected={categoryIds} onToggle={toggle} />
          {categoryIds.length === 0 && (
            <p className="text-xs text-warning">
              Sem nenhuma categoria marcada, esta pessoa terá acesso a <strong>todo</strong> o conteúdo com este papel.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
