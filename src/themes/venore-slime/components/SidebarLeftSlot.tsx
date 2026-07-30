import { ChevronLeft, ChevronRight, Globe2, ShieldCheck } from "lucide-react";
import type { SidebarLeftSlotProps } from "@/contexts/themes";
import { cn } from "@/lib/utils";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { SidebarNavLink } from "./SidebarNavLink";
import { SIDEBAR_COLLAPSE_TOOLTIP_COLLAPSED_CLASSES } from "./sidebar-collapse-tooltip";

// Exclusivo de navegação (main-nav ou admin-nav, conforme navMode) — não é área de widgets. O
// toggle main-nav/admin-nav mora aqui, não no Header (docs/venore-docks.md — "Shell única"),
// ANTES da navegação (não depois — pedido desta sessão, e é onde o protótipo de referência
// coloca o SidebarSurfaceSwitch: platform-sidebar.tsx, dentro de um bloco com border-b no topo).
//
// Abaixo de lg vira drawer off-canvas (MobileNavDrawer, client) fechado por padrão; a partir de
// lg volta a ser a coluna fixa de sempre — só a casca de posicionamento é client, este
// componente segue server component. Colapso (docs/ui/shell-spec.md §3.1-3.2) é exclusivo do
// desktop: `collapsed` já vem resolvido do cookie no servidor (get-sidebar-collapsed.ts), então a
// largura certa está presente no primeiro HTML — sem flash de layout pós-hidratação. O botão de
// colapso só existe em `lg:` (não faz sentido no off-canvas), mas sempre com alvo de toque de
// 44px (`size-11`), independente do breakpoint em que apareça.
//
// `<nav>` precisa do próprio `flex-1 min-h-0 overflow-y-auto`: o `<aside>` já preenche a altura
// inteira (h-full, sem override lg:h-auto — bug desta sessão), mas sem isso o elemento de
// navegação em si parava do tamanho do conteúdo, deixando espaço vazio abaixo em vez de esticar
// (e rolar por conta própria se a lista crescer além da viewport).
export function SidebarLeftSlot({
  enabled,
  navMode,
  navItems,
  navGroups,
  canToggleAdminNav,
  onToggleNavMode,
  collapsed,
  onToggleCollapsed,
}: SidebarLeftSlotProps) {
  if (!enabled) return null;

  const isAdmin = navMode === "admin";

  return (
    <MobileNavDrawer
      asideClassName={cn(
        // px-5 é o padrão em qualquer breakpoint (inclusive off-canvas mobile, que ignora
        // collapsed) — só em lg: com collapsed=true é que o padding aperta pra px-3.
        "relative flex h-full w-full flex-col px-5 py-6 text-foreground shadow-float lg:w-(--sidebar-width-expanded) lg:shrink-0 lg:border-r lg:shadow-none ui-motion-emphasis",
        isAdmin ? "border-ring bg-(image:--sidebar-bg-admin)" : "border-border bg-(image:--sidebar-bg)",
        collapsed && "lg:w-(--sidebar-width-collapsed) lg:px-3",
      )}
    >
      <form action={onToggleCollapsed} className="absolute top-4 right-0 z-10 hidden translate-x-1/2 lg:block">
        <button
          type="submit"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-float ui-motion-base outline-none hover:border-ring active:border-ring focus-visible:ring-2 focus-visible:ring-ring"
        >
          {collapsed ? (
            <ChevronRight className="size-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="size-4" aria-hidden="true" />
          )}
        </button>
      </form>

      {canToggleAdminNav && (
        // pt-8: espaço reservado pro botão flutuante de colapso (top-4, size-11), que fica
        // sobreposto ao canto superior direito do frame — mesma folga em expandido/colapsado pra
        // não depender de cálculo fino de onde a coluna direita do pill termina.
        <div className="shrink-0 border-b border-border pt-8 pb-4">
          <SidebarSurfaceSwitch isAdmin={isAdmin} collapsed={collapsed} onToggleNavMode={onToggleNavMode} />
        </div>
      )}

      <nav
        data-nav-mode={navMode}
        className={cn(
          "min-h-0 flex-1 space-y-1 overflow-y-auto",
          // Sem o switch acima (usuário sem permissão admin), o <nav> é o primeiro filho — precisa
          // da mesma folga pro botão flutuante de colapso que o bloco do switch reserva.
          canToggleAdminNav ? "pt-2" : "pt-8",
        )}
      >
        {isAdmin
          ? navGroups.map((group) => (
              <div key={group.key} className="space-y-1 pb-4">
                {/* Título da seção é o padrão em qualquer breakpoint (off-canvas mobile ignora
                    collapsed); só em lg: com collapsed=true ele vira um divisor fino. */}
                <p
                  className={cn(
                    "px-3 pb-1 text-[11px] font-semibold uppercase tracking-caps text-muted-foreground/70",
                    collapsed && "lg:hidden",
                  )}
                >
                  {group.label}
                </p>
                <div className={cn("mx-2 hidden h-px bg-border", collapsed && "lg:block")} aria-hidden="true" />
                {group.items.map((item) => (
                  <SidebarNavLink key={item.key} item={item} collapsed={collapsed} isAdmin={isAdmin} />
                ))}
              </div>
            ))
          : navItems.map((item) => <SidebarNavLink key={item.key} item={item} collapsed={collapsed} isAdmin={isAdmin} />)}

        {isAdmin && navGroups.length === 0 && (
          <p className="px-3 text-sm text-muted-foreground/56">—</p>
        )}
        {!isAdmin && navItems.length === 0 && <p className="px-3 text-sm text-muted-foreground/56">—</p>}
      </nav>
    </MobileNavDrawer>
  );
}

function SidebarSurfaceSwitch({
  isAdmin,
  collapsed,
  onToggleNavMode,
}: {
  isAdmin: boolean;
  collapsed: boolean;
  onToggleNavMode: () => Promise<void>;
}) {
  const label = isAdmin ? "Sair do admin" : "Área administrativa";

  return (
    <>
      {/* Ícone único — colapso é conceito exclusivo de desktop (docs/ui/shell-spec.md §3.1): o
          off-canvas mobile ignora o cookie e sempre mostra o pill completo abaixo, mesmo com
          collapsed=true, por isso este bloco só aparece via `lg:flex` quando de fato colapsada,
          nunca por padrão (mobile-first). */}
      <form action={onToggleNavMode} className={cn("hidden justify-center", collapsed && "lg:flex")}>
        <button
          type="submit"
          aria-label={label}
          className="group/sidebar-collapse-target relative flex size-11 items-center justify-center rounded-xl border border-border bg-muted text-foreground shadow-float ui-motion-base outline-none hover:border-ring active:border-ring focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isAdmin ? <ShieldCheck className="size-4" aria-hidden="true" /> : <Globe2 className="size-4" aria-hidden="true" />}
          <span className={cn("max-w-0 overflow-hidden whitespace-nowrap opacity-0", SIDEBAR_COLLAPSE_TOOLTIP_COLLAPSED_CLASSES)}>
            {label}
          </span>
        </button>
      </form>

      {/* Pill de dois segmentos — versão padrão (mobile e desktop expandido); some só em
          `lg:` quando colapsada, pra não duplicar o controle acima. Um único form (o toggle é
          sempre "inverte o modo atual", não "vá pro modo X"): o segmento já ativo fica disabled —
          visualmente marcado, mas sem submeter de novo — só o inativo dispara onToggleNavMode. */}
      <form
        action={onToggleNavMode}
        className={cn("relative grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted p-1", collapsed && "lg:hidden")}
      >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-1 z-0 w-[calc(50%-0.125rem)] rounded-lg border border-ring bg-card shadow-float ui-motion-base",
          isAdmin ? "left-[calc(50%+0.125rem)]" : "left-1",
        )}
      />
      <button
        type="submit"
        disabled={!isAdmin}
        aria-current={!isAdmin ? true : undefined}
        className={cn(
          "relative z-10 flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-semibold uppercase tracking-caps ui-motion-base outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default",
          !isAdmin ? "text-foreground" : "text-muted-foreground hover:text-foreground",
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
          "relative z-10 flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-semibold uppercase tracking-caps ui-motion-base outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default",
          isAdmin ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ShieldCheck className="size-4" aria-hidden="true" />
        Admin
      </button>
      </form>
    </>
  );
}
