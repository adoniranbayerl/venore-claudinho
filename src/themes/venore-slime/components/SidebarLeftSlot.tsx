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
        "flex h-full w-full flex-col gap-4 p-4 text-foreground shadow-float lg:h-auto lg:w-56 lg:shrink-0 lg:border-r lg:shadow-none " +
        (isAdmin ? "border-input bg-(image:--sidebar-bg-admin)" : "border-border bg-(image:--sidebar-bg)")
      }
    >
      <nav data-nav-mode={navMode} className="flex flex-col gap-1">
        {navItems.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={
              "group flex min-h-11 items-center gap-3 border-l-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground ui-motion-base outline-none focus-visible:ring-2 focus-visible:ring-ring " +
              (isAdmin
                ? "hover:border-input hover:bg-popover hover:text-foreground active:border-input active:bg-popover active:text-foreground"
                : "hover:border-border hover:bg-accent/14 hover:text-primary active:border-border active:bg-accent/14 active:text-primary")
            }
          >
            {item.label}
          </a>
        ))}
        {navItems.length === 0 && <p className="px-3 text-sm text-muted-foreground/56">—</p>}
      </nav>

      {canToggleAdminNav && (
        <form action={onToggleNavMode} className="mt-auto">
          <button
            type="submit"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-popover px-3 py-2 text-xs font-semibold uppercase tracking-caps text-foreground shadow-float ui-motion-base outline-none hover:border-input active:border-input focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isAdmin ? "Sair do admin" : "Área administrativa"}
          </button>
        </form>
      )}
    </MobileNavDrawer>
  );
}
