import Link from "next/link";
import { Menu as MenuIcon } from "lucide-react";
import { getCmsPageData } from "@/platform/admin-shell/get-cms-page-data";

export default async function CmsAdminPage() {
  const gate = await getCmsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar o conteúdo do site.</p>
      </div>
    );
  }

  const { actor } = gate;
  const canManageContentTypes = actor.isSuperadmin || actor.permissions.includes("cms.content-types.manage");
  const canManageCategories = actor.isSuperadmin || actor.permissions.includes("cms.categories.manage");
  const canManageEntries = actor.isSuperadmin || actor.permissions.includes("cms.entries.manage");
  const canManageMenus = actor.isSuperadmin || actor.permissions.includes("cms.menus.manage");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Conteúdo do site</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral das áreas de conteúdo do site — escolha uma para gerenciar.
        </p>
      </div>

      {canManageContentTypes && (
        <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Tipos de conteúdo</h2>
            <Link
              href="/admin/cms/content-types"
              className="rounded-sm text-xs font-medium text-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Gerenciar tipos de conteúdo
            </Link>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Definem quais campos os conteúdos dessa categoria têm — por exemplo, &ldquo;Notícia&rdquo; ou &ldquo;Página&rdquo;.
          </p>
        </section>
      )}

      {canManageCategories && (
        <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Categorias</h2>
            <Link
              href="/admin/cms/categories"
              className="rounded-sm text-xs font-medium text-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Gerenciar categorias
            </Link>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Agrupam conteúdos relacionados sob um mesmo endereço de página.</p>
        </section>
      )}

      {canManageEntries && (
        <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Conteúdos</h2>
            <Link
              href="/admin/cms/entries"
              className="rounded-sm text-xs font-medium text-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ver todos os conteúdos
            </Link>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Conteúdos publicados e em rascunho no site.</p>
        </section>
      )}

      {canManageMenus && (
        <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Menus</h2>
            <Link
              href="/admin/cms/menus"
              className="rounded-sm text-xs font-medium text-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              Gerenciar menu principal
            </Link>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            <MenuIcon className="mr-1 inline size-3.5 align-[-2px]" strokeWidth={1.5} />
            Controla os links exibidos na navegação do site.
          </p>
        </section>
      )}
    </div>
  );
}
