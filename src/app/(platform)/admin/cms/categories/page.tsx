import { listCategoriesForAdmin } from "@/contexts/cms";
import { getCmsPageData } from "@/platform/admin-shell/get-cms-page-data";
import { EmptyState } from "@/components/empty-state";
import { CreateCategoryForm } from "../_components/create-category-form";
import { CategoriesTable } from "../_components/categories-table";
import { FolderTree } from "lucide-react";

export default async function CmsCategoriesAdminPage() {
  const gate = await getCmsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar o conteúdo do site.</p>
      </div>
    );
  }

  const canManageCategories = gate.actor.isSuperadmin || gate.actor.permissions.includes("cms.categories.manage");
  if (!canManageCategories) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar categorias.</p>
      </div>
    );
  }

  const categoriesResult = await listCategoriesForAdmin();

  if (!categoriesResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar as categorias agora. Tente recarregar a página.</p>;
  }

  const categories = categoriesResult.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Categorias</h1>
          <p className="mt-1 text-sm text-muted-foreground">Agrupam conteúdos relacionados sob um mesmo endereço de página.</p>
        </div>
        {categories.length > 0 && <CreateCategoryForm />}
      </div>

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        {categories.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="size-8" strokeWidth={1.5} />}
            title="Nenhuma categoria ainda"
            description="Crie a primeira categoria (ex: Eventos, Notícias) para organizar o conteúdo."
            action={<CreateCategoryForm />}
          />
        ) : (
          <CategoriesTable categories={categories} />
        )}
      </section>
    </div>
  );
}
