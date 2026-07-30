"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  clearCategoryAssetsAction,
  createCategoryAction,
  deleteCategoryAction,
  renameCategoryAction,
  type MediaActionState,
} from "../actions";

const initialState: MediaActionState = { error: null };

function AddCategoryForm() {
  const [state, formAction, pending] = useActionState(createCategoryAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Categoria criada." });

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        type="text"
        name="name"
        placeholder="Nova categoria"
        required
        className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Adicionar
      </Button>
    </form>
  );
}

// Categoria em uso não apaga (docs do pedido: "não é apagada sem tratar os assets vinculados") —
// o erro devolvido tem essa mensagem com a contagem; a resposta é o botão "Remover categoria de N
// arquivos" (clearCategoryAssetsAction), um passo deliberado antes de deixar tentar apagar de
// novo, nunca uma cascata automática.
function CategoryRow({ id, name }: { id: string; name: string }) {
  const [renameState, renameAction, renamePending] = useActionState(renameCategoryAction, initialState);
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteCategoryAction, initialState);
  const [clearState, clearFormAction, clearPending] = useActionState(clearCategoryAssetsAction, initialState);

  useActionToast({ pending: renamePending, error: renameState.error, successMessage: "Categoria renomeada." });
  useActionToast({ pending: deletePending, error: deleteState.error, successMessage: "Categoria excluída." });
  useActionToast({ pending: clearPending, error: clearState.error, successMessage: "Categoria removida dos arquivos." });

  const blockedByUse = deleteState.error?.includes("em uso") ?? false;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
      <form action={renameAction} className="flex flex-1 items-center gap-2">
        <input type="hidden" name="id" value={id} />
        <input
          type="text"
          name="name"
          defaultValue={name}
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" variant="ghost" size="sm" disabled={renamePending}>
          Salvar
        </Button>
      </form>

      {blockedByUse && (
        <form action={clearFormAction}>
          <input type="hidden" name="categoryId" value={id} />
          <Button type="submit" variant="outline" size="sm" disabled={clearPending}>
            Remover categoria dos arquivos
          </Button>
        </form>
      )}

      <form action={deleteFormAction}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" variant="ghost" size="icon" disabled={deletePending} aria-label={`Excluir categoria ${name}`}>
          <Trash2 className="size-4" />
        </Button>
      </form>
    </div>
  );
}

export function ManageCategories({ categories }: { categories: { id: string; name: string }[] }) {
  return (
    <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
      <h2 className="text-sm font-semibold text-foreground">Categorias</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Organize a biblioteca em categorias. Um arquivo pertence a no máximo uma categoria.
      </p>

      <div className="mt-3 space-y-2">
        {categories.map((category) => (
          <CategoryRow key={category.id} id={category.id} name={category.name} />
        ))}
      </div>

      <div className="mt-3">
        <AddCategoryForm />
      </div>
    </section>
  );
}
