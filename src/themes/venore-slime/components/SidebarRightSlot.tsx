import type { SidebarRightSlotProps } from "@/contexts/themes";

// Exclusivo de navegação (main-nav ou admin-nav, conforme navMode) — não é área de widgets. O
// toggle main-nav/admin-nav mora aqui, não no Header (docs/venore-docks.md — "Shell única").
// Gradiente distinto por navMode (--sidebar-bg vs --sidebar-bg-admin) e item com borda de
// destaque no hover, mesma linguagem visual do PlatformSidebar de referência (Venore Pulse) —
// sem estado ativo por rota, que o contrato deste projeto ainda não expõe.
export function SidebarRightSlot({ enabled, navMode, navItems, canToggleAdminNav, onToggleNavMode }: SidebarRightSlotProps) {
  if (!enabled) return null;

  const isAdmin = navMode === "admin";

  return (
    <aside
      data-nav-mode={navMode}
      className={
        "flex w-56 shrink-0 flex-col gap-4 border-l p-4 text-text-primary " +
        (isAdmin ? "border-border-strong bg-(image:--sidebar-bg-admin)" : "border-border-subtle bg-(image:--sidebar-bg)")
      }
    >
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={
              "group flex items-center gap-3 border-l-2 border-transparent px-3 py-2 text-sm font-medium text-text-secondary transition-colors " +
              (isAdmin
                ? "hover:border-border-strong hover:bg-surface-elevated hover:text-text-primary"
                : "hover:border-border-subtle hover:bg-accent-soft hover:text-text-accent")
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
            className="flex w-full items-center justify-center gap-2 rounded-control border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-semibold uppercase tracking-caps text-text-primary shadow-float transition-colors hover:border-border-strong"
          >
            {isAdmin ? "Sair do admin" : "Área administrativa"}
          </button>
        </form>
      )}
    </aside>
  );
}
