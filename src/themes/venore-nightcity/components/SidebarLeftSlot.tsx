import { Globe2, ShieldCheck, X } from "lucide-react";
import type { NavGroup, SidebarLeftSlotProps } from "@/contexts/themes";
import { cn } from "@/lib/utils";
import { MobileNavDrawer } from "../../venore-slime/components/MobileNavDrawer";
import { SidebarNavLink } from "../../venore-slime/components/SidebarNavLink";
import { closeMobileNav } from "../../venore-slime/components/mobile-nav-store";
import { FLYOUT_BASE, ICON_BUTTON_BASE, RailNavLink } from "./RailNavLink";

// Estrutura deliberadamente diferente da SidebarLeftSlot do Venore Slime (docs pedido desta
// sessão): lá é uma coluna com texto que colapsa/expande sob demanda (`collapsed`/
// `onToggleCollapsed`, persistido em cookie). Aqui é um rail de ícones fixo — nunca expande, nunca
// colapsa — a largura nunca muda, então este componente simplesmente não usa `collapsed`/
// `onToggleCollapsed` do contrato (o contrato permite: nenhuma prop é obrigatória de *usar*, só de
// aceitar, mesmo precedente já registrado em venore-basic/components/Shell.tsx). Abaixo de `lg`
// reaproveita a mecânica headless do drawer off-canvas do Slime (MobileNavDrawer +
// mobile-nav-store: focus-trap, Escape, scroll-lock) — comportamento de acessibilidade genérico,
// não identidade visual do Slime — só que aqui é uma lista cheia (ícone+texto), não o rail.
export function SidebarLeftSlot({ enabled, navMode, navItems, navGroups, canToggleAdminNav, onToggleNavMode }: SidebarLeftSlotProps) {
  if (!enabled) return null;

  const isAdmin = navMode === "admin";

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen w-(--sidebar-width-rail) shrink-0 flex-col items-center border-r py-4 lg:flex",
          isAdmin ? "border-ring bg-(image:--sidebar-bg-admin)" : "border-border bg-(image:--sidebar-bg)",
        )}
      >
        <nav data-nav-mode={navMode} className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-1">
          {isAdmin
            ? navGroups.map((group, index) => (
                <div key={group.key} className="flex flex-col items-center gap-1">
                  {index > 0 && <span aria-hidden="true" className="my-1.5 h-px w-6 bg-border" />}
                  {group.items.map((item) => (
                    <RailNavLink key={item.key} item={item} />
                  ))}
                </div>
              ))
            : navItems.map((item) => <RailNavLink key={item.key} item={item} />)}

          {isAdmin && navGroups.length === 0 && <p className="text-[10px] text-muted-foreground/56">—</p>}
          {!isAdmin && navItems.length === 0 && <p className="text-[10px] text-muted-foreground/56">—</p>}
        </nav>

        {canToggleAdminNav && (
          <form action={onToggleNavMode} className="mt-2 flex flex-col items-center border-t border-border pt-3">
            <button type="submit" className={cn(ICON_BUTTON_BASE, isAdmin && "text-primary")}>
              {isAdmin ? <Globe2 className="size-5" aria-hidden="true" /> : <ShieldCheck className="size-5" aria-hidden="true" />}
              <span className={cn(FLYOUT_BASE, "whitespace-nowrap px-2.5 py-1.5 text-xs font-medium uppercase tracking-caps")}>
                {isAdmin ? "Sair do admin" : "Área administrativa"}
              </span>
            </button>
          </form>
        )}
      </aside>

      {/* Off-canvas mobile — o próprio MobileNavDrawer some em `lg:` (ver asideClassName abaixo);
          o rail acima é quem assume a partir daí. */}
      <MobileNavDrawer asideClassName="flex h-full w-full flex-col gap-4 bg-card px-5 py-6 text-foreground shadow-float lg:hidden">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-caps text-muted-foreground">Navegação</p>
          <button
            type="button"
            onClick={closeMobileNav}
            aria-label="Fechar navegação"
            className="ui-icon-button-sm ui-motion-base outline-none hover:bg-accent/14 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {canToggleAdminNav && (
          <form action={onToggleNavMode} className="grid grid-cols-2 gap-1 rounded-sm border border-border bg-muted p-1">
            <button
              type="submit"
              disabled={!isAdmin}
              aria-current={!isAdmin ? true : undefined}
              className={cn(
                "flex h-9 items-center justify-center gap-2 rounded-sm text-xs font-semibold uppercase tracking-caps ui-motion-base disabled:cursor-default",
                !isAdmin ? "bg-card text-foreground shadow-float" : "text-muted-foreground",
              )}
            >
              <Globe2 className="size-4" aria-hidden="true" />
              Site
            </button>
            <button
              type="submit"
              disabled={isAdmin}
              aria-current={isAdmin ? true : undefined}
              className={cn(
                "flex h-9 items-center justify-center gap-2 rounded-sm text-xs font-semibold uppercase tracking-caps ui-motion-base disabled:cursor-default",
                isAdmin ? "bg-card text-foreground shadow-float" : "text-muted-foreground",
              )}
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Admin
            </button>
          </form>
        )}

        <nav data-nav-mode={navMode} className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {isAdmin
            ? navGroups.map((group) => <MobileNavGroup key={group.key} group={group} />)
            : navItems.map((item) => <SidebarNavLink key={item.key} item={item} collapsed={false} isAdmin={false} />)}
          {isAdmin && navGroups.length === 0 && <p className="px-3 text-sm text-muted-foreground/56">—</p>}
          {!isAdmin && navItems.length === 0 && <p className="px-3 text-sm text-muted-foreground/56">—</p>}
        </nav>
      </MobileNavDrawer>
    </>
  );
}

function MobileNavGroup({ group }: { group: NavGroup }) {
  return (
    <div className="space-y-1 pb-4">
      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-caps text-muted-foreground/70">{group.label}</p>
      {group.items.map((item) => (
        <SidebarNavLink key={item.key} item={item} collapsed={false} isAdmin />
      ))}
    </div>
  );
}
