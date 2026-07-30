"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { updateMediaCategoryAction, type MediaActionState } from "../../actions";

const initialState: MediaActionState = { error: null };

export function CategorySelect({
  id,
  categoryId,
  categories,
}: {
  id: string;
  categoryId: string | null;
  categories: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(updateMediaCategoryAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Categoria atualizada." });

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="categoryId"
        defaultValue={categoryId ?? ""}
        className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Sem categoria</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Salvar
      </Button>
    </form>
  );
}
