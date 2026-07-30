import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCachedMenuTree } from "@/contexts/cms";
import { getCmsPageData } from "@/platform/admin-shell/get-cms-page-data";
import { Button } from "@/components/ui/button";
import { AddMenuItemDialog } from "../_components/add-menu-item-dialog";
import { MenuTree } from "../_components/menu-tree";

export default async function MenuBuilderPage({ params }: { params: Promise<{ menuId: string }> }) {
  const { menuId } = await params;
  const gate = await getCmsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar o conteúdo do site.</p>
      </div>
    );
  }

  const canManageMenus = gate.actor.isSuperadmin || gate.actor.permissions.includes("cms.menus.manage");
  if (!canManageMenus) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar menus.</p>
      </div>
    );
  }

  const treeResult = await getCachedMenuTree(menuId);
  if (!treeResult.success) {
    return <p className="text-sm text-destructive">Menu não encontrado.</p>;
  }

  const { menu, items } = treeResult.data;

  return (
    <div className="space-y-4">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin/cms/menus">
            <ArrowLeft /> Menus
          </Link>
        </Button>
        <h1 className="mt-1 text-xl font-semibold text-foreground">{menu.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Arraste um item sobre outro pra reordenar (topo/base) ou aninhar (centro). Um item só aparece publicamente
          quando o conteúdo apontado está publicado — o que está aqui é o que aparece na navegação, não o inverso.
        </p>
      </div>

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Itens</h2>
          <AddMenuItemDialog
            menuId={menu.id}
            parentId={null}
            trigger={<Button variant="outline">Adicionar item</Button>}
          />
        </div>

        <MenuTree menuId={menu.id} items={items} />
      </section>
    </div>
  );
}
