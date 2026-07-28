import type { SidebarLeftSlotProps } from "@/contexts/themes";
import { MobileNavDrawer } from "./MobileNavDrawer";

// Exclusivo de navegação (main-nav ou admin-nav, conforme navMode) — não é área de widgets. O
// toggle main-nav/admin-nav mora aqui, não no Header (docs/venore-docks.md — "Shell única").
// Gradiente distinto por navMode (--sidebar-bg vs --sidebar-bg-admin) e item com borda de
// destaque no hover, mesma linguagem visual do PlatformSidebar de referência (Venore Pulse) —
// sem estado ativo por rota, que o contrato deste projeto ainda não expõe.
//
// Abaixo de lg vira drawer off-canvas (MobileNavDrawer, client) fechado por padrão; a partir de
// lg volta a ser a coluna fixa de sempre — só a casca de posicionamento é client, este
// componente segue server component.
export function SidebarLeftSlot({ enabled, navMode, navItems, canToggleAdminNav, onToggleNavMode }: SidebarLeftSlotProps) {
  if (!enabled) return null;

  const isAdmin = navMode === "admin";

  return (
    <MobileNavDrawer
      asideClassName={
        "flex h-full w-full flex-col gap-4 p-4 text-text-primary shadow-float lg:h-auto lg:w-56 lg:shrink-0 lg:border-r lg:shadow-none " +
        (isAdmin ? "border-border-strong bg-(image:--sidebar-bg-admin)" : "border-border-subtle bg-(image:--sidebar-bg)")
      }
    >
      <nav data-nav-mode={navMode} className="flex flex-col gap-1">
        {navItems.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={
              "group flex min-h-11 items-center gap-3 border-l-2 border-transparent px-3 py-2 text-sm font-medium text-text-secondary ui-motion-base outline-none focus-visible:ring-2 focus-visible:ring-ring " +
              (isAdmin
                ? "hover:border-border-strong hover:bg-surface-elevated hover:text-text-primary active:border-border-strong active:bg-surface-elevated active:text-text-primary"
                : "hover:border-border-subtle hover:bg-accent-soft hover:text-text-accent active:border-border-subtle active:bg-accent-soft active:text-text-accent")
            }
          >
            {item.label}
          </a>
        ))}
        {navItems.length === 0 && <p className="px-3 text-sm text-text-tertiary">—</p>}
      </nav>

      {canToggleAdminNav && (
        <form action={onToggleNavMode} className="mt-auto">
          <button
            type="submit"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-control border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-semibold uppercase tracking-caps text-text-primary shadow-float ui-motion-base outline-none hover:border-border-strong active:border-border-strong focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isAdmin ? "Sair do admin" : "Área administrativa"}
          </button>
        </form>
      )}
    </MobileNavDrawer>
  );
}
