"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MainNavItem } from "@/contexts/themes";
import { cn } from "@/lib/utils";
import { NavIcon } from "@/platform/nav-icons/NavIcon";

// Item de navegação do rail — ícone-só sempre, nunca alterna pra rótulo visível (diferença
// deliberada do SidebarNavLink do Venore Slime, que é texto+ícone com estado colapsado opcional).
// Rótulo só existe no flyout (hover/focus), CSS-only via group-hover/group-focus-within — mesma
// filosofia "tooltip sem JS" que sidebar-collapse-tooltip.ts já usava no Slime, mas aqui é o único
// modo de exibição, não um estado condicional.
function isDescendantActive(item: MainNavItem, pathname: string | null): boolean {
  if (item.href === null) return item.children.some((child) => isDescendantActive(child, pathname));
  return item.href === pathname;
}

export const ICON_BUTTON_BASE =
  "group/rail-item relative flex size-11 items-center justify-center rounded-sm text-muted-foreground ui-motion-base outline-none hover:bg-accent/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring";

export const FLYOUT_BASE =
  "pointer-events-none invisible absolute left-full top-1/2 z-50 ml-2 -translate-x-1 -translate-y-1/2 rounded-sm border border-border bg-popover text-popover-foreground opacity-0 shadow-float ui-motion-base group-hover/rail-item:visible group-hover/rail-item:pointer-events-auto group-hover/rail-item:translate-x-0 group-hover/rail-item:opacity-100 group-focus-within/rail-item:visible group-focus-within/rail-item:pointer-events-auto group-focus-within/rail-item:translate-x-0 group-focus-within/rail-item:opacity-100";

const ACTIVE_BAR = "absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]";

export function RailNavLink({ item }: { item: MainNavItem }) {
  const pathname = usePathname();

  if (item.href === null) {
    const isActiveAncestor = isDescendantActive(item, pathname);

    return (
      <div className="relative">
        <button
          type="button"
          aria-label={item.label}
          className={cn(ICON_BUTTON_BASE, isActiveAncestor && "text-primary")}
        >
          {isActiveAncestor && <span aria-hidden="true" className={ACTIVE_BAR} />}
          <NavIcon iconKey={item.icon} className="size-5" />
        </button>
        <div className={cn(FLYOUT_BASE, "w-48 p-1.5")}>
          <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-caps text-muted-foreground">{item.label}</p>
          <div className="flex flex-col gap-0.5">
            {item.children.map((child) =>
              child.href === null ? (
                <p key={child.key} className="px-2 py-1 text-xs text-muted-foreground">
                  {child.label}
                </p>
              ) : (
                <Link
                  key={child.key}
                  href={child.href}
                  className="rounded-sm px-2 py-1.5 text-sm ui-motion-base outline-none hover:bg-accent/14 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {child.label}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    );
  }

  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      aria-label={item.label}
      className={cn(ICON_BUTTON_BASE, isActive && "text-primary")}
    >
      {isActive && <span aria-hidden="true" className={ACTIVE_BAR} />}
      <NavIcon iconKey={item.icon} className="size-5" />
      <span className={cn(FLYOUT_BASE, "whitespace-nowrap px-2.5 py-1.5 text-xs font-medium uppercase tracking-caps")}>
        {item.label}
      </span>
    </Link>
  );
}
