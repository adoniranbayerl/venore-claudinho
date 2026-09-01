import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import type { CategoryRecord } from "@/plugins/helpdesk/contracts/types";
import { ArchiveCategoryButton } from "./archive-category-button";
import { CreateCategoryDialog, EditCategoryDialog } from "./category-dialogs";

type QueueOption = { id: string; name: string };

export function CategoriesView({
  queues,
  categoriesByQueue,
  configurableQueueIds,
}: {
  queues: QueueOption[];
  categoriesByQueue: Map<string, CategoryRecord[]>;
  // Filas em que o ator pode criar/editar/arquivar categoria (manage → todas; senão as que gere).
  configurableQueueIds: Set<string>;
}) {
  if (queues.length === 0) {
    return (
      <EmptyState
        title="Nenhuma fila para configurar"
        description="Crie uma fila na aba Filas antes de cadastrar categorias."
      />
    );
  }

  return (
    <div className="space-y-6">
      {queues.map((queue) => {
        const categories = categoriesByQueue.get(queue.id) ?? [];
        const canConfigure = configurableQueueIds.has(queue.id);
        return (
          <section key={queue.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">{queue.name}</h2>
              {canConfigure && <CreateCategoryDialog queueId={queue.id} queueName={queue.name} />}
            </div>

            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem categorias nesta fila.</p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {categories.map((category) => {
                  const archived = category.archivedAt !== null;
                  return (
                    <li key={category.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-foreground">{category.label}</span>
                          {archived && <Badge variant="outline">Arquivada</Badge>}
                        </div>
                        {category.description && (
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        )}
                      </div>
                      {canConfigure && (
                        <div className="flex items-center gap-1">
                          <EditCategoryDialog category={category} />
                          <ArchiveCategoryButton categoryId={category.id} archived={archived} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
