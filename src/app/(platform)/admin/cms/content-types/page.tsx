import { listContentTypes } from "@/contexts/cms";
import { getCmsContentTypesPageData } from "@/platform/admin-shell/get-cms-content-types-page-data";
import { EmptyState } from "@/components/empty-state";
import { CreateContentTypeForm } from "../_components/create-content-type-form";
import { LayoutList } from "lucide-react";

export default async function CmsContentTypesAdminPage() {
  const gate = await getCmsContentTypesPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar tipos de conteúdo.</p>
      </div>
    );
  }

  const contentTypesResult = await listContentTypes();

  if (!contentTypesResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar os tipos de conteúdo agora. Tente recarregar a página.</p>;
  }

  const contentTypes = contentTypesResult.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Tipos de conteúdo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Definem quais campos os conteúdos dessa categoria têm — por exemplo, &ldquo;Notícia&rdquo; ou &ldquo;Página&rdquo;.
        </p>
      </div>

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        {contentTypes.length === 0 ? (
          <EmptyState
            icon={<LayoutList className="size-8" strokeWidth={1.5} />}
            title="Nenhum tipo de conteúdo ainda"
            description="Crie o primeiro tipo (ex: Notícia, Página) para começar a cadastrar conteúdo."
            action={<CreateContentTypeForm />}
          />
        ) : (
          <>
            <ul className="space-y-1">
              {contentTypes.map((contentType) => (
                <li key={contentType.id} className="text-sm text-muted-foreground">
                  <span className="text-foreground">{contentType.name}</span>
                  {contentType.description && <span className="text-muted-foreground/56"> — {contentType.description}</span>}
                </li>
              ))}
            </ul>
            <CreateContentTypeForm />
          </>
        )}
      </section>
    </div>
  );
}
