"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import type { CmsCategoryOption } from "@/platform/admin-shell/get-rbac-scope-options";
import { setRoleAssignmentScopesAction, type RbacActionState } from "../actions";
import { CategoryScopePicker } from "./category-scope-picker";

const initialState: RbacActionState = { error: null };

// Edita as categorias de uma atribuição já existente. `currentCategoryIds` são as linhas de
// escopo atuais dessa (userId × roleId); vazio = a pessoa hoje enxerga todas as categorias.
export function RoleAssignmentScopeEditor({
  roleId,
  userId,
  categories,
  currentCategoryIds,
}: {
  roleId: string;
  userId: string;
  categories: CmsCategoryOption[];
  currentCategoryIds: string[];
}) {
  const [state, formAction, pending] = useActionState(setRoleAssignmentScopesAction, initialState);
  const [selected, setSelected] = useState<string[]>(currentCategoryIds);
  useActionToast({ pending, error: state.error, successMessage: "Categorias do papel atualizadas." });

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  const isGlobal = currentCategoryIds.length === 0;

  return (
    <form action={formAction} className="mt-1.5 space-y-1.5 rounded-md border border-border bg-muted/40 p-2">
      <input type="hidden" name="roleId" value={roleId} />
      <input type="hidden" name="userId" value={userId} />
      {currentCategoryIds.map((id) => (
        <input key={id} type="hidden" name="currentCategoryIds" value={id} />
      ))}

      <p className="text-xs text-muted-foreground">
        {isGlobal
          ? "Hoje esta pessoa enxerga todas as categorias com este papel. Marque abaixo para limitar."
          : "Categorias que esta pessoa pode gerenciar com este papel."}
      </p>
      <CategoryScopePicker categories={categories} selected={selected} onToggle={toggle} />
      {selected.length === 0 && !isGlobal && (
        <p className="text-xs text-warning">Salvar sem nenhuma categoria devolve o acesso a todo o conteúdo.</p>
      )}
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Salvar categorias
      </Button>
    </form>
  );
}
