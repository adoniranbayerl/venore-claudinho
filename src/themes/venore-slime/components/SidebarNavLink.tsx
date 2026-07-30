"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/contexts/themes";
import { cn } from "@/lib/utils";
import { NavIcon } from "./sidebar-nav-icons";
import { SIDEBAR_COLLAPSE_TOOLTIP_COLLAPSED_CLASSES, SIDEBAR_COLLAPSE_TOOLTIP_LABEL_CLASSES } from "./sidebar-collapse-tooltip";

// Único pedaço client do item de nav: aria-current depende da rota atual, que um server component
// de layout não tem como ler sem middleware escrevendo um header dedicado (não existe um hoje, e
// criar um só pra isso seria maior que o problema). usePathname() é o jeito direto do App Router.
//
// 180px de max-width pro rótulo (não um número solto — é o que sobra dentro de
// --sidebar-width-expanded=280px depois do padding do frame (px-5=20px×2), do padding do item
// (px-3=12px×2) e do ícone+gap (20px+12px), replicando a matemática do protótipo de referência
// pixel a pixel: 280 − 40 − 24 − 32 = 184 ≈ 180). Cortar o texto era o bug desta sessão; a barra
// de marcação (border-l) só existe via `hover:`/`active:` — nunca fixa pro item corrente, também
// por pedido desta sessão.
export function SidebarNavLink({ item, collapsed, isAdmin }: { item: NavItem; collapsed: boolean; isAdmin: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group/sidebar-collapse-target relative flex items-center gap-3 border-l-2 border-transparent px-3 py-3 text-sm font-medium ui-motion-base outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive ? "bg-accent/14 text-primary" : "text-muted-foreground",
        isAdmin
          ? "hover:border-ring hover:bg-muted hover:text-foreground active:border-ring active:bg-muted active:text-foreground"
          : "hover:border-border hover:bg-accent/14 hover:text-primary active:border-border active:bg-accent/14 active:text-primary",
      )}
    >
      <span aria-hidden="true" className="inline-flex size-5 shrink-0 items-center justify-center">
        <NavIcon iconKey={item.icon} className="size-4 shrink-0" />
      </span>
      <span className={cn(SIDEBAR_COLLAPSE_TOOLTIP_LABEL_CLASSES, collapsed && SIDEBAR_COLLAPSE_TOOLTIP_COLLAPSED_CLASSES)}>
        {item.label}
      </span>
    </Link>
  );
}
