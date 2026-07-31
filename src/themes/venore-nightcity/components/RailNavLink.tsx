"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MainNavItem } from "@/contexts/themes";
import { cn } from "@/lib/utils";
import { NavIcon } from "@/platform/nav-icons/NavIcon";

// Item de navegação do rail — ícone + legenda minúscula sempre visíveis (não mais um tooltip só
// no hover/foco). Simplificação desta sessão: a primeira versão exigia hover pra descobrir o que
// cada ícone significava, e agregadores abriam um segundo nível de flyout dentro do flyout — peso
// de descoberta alto demais pra navegação básica. Agregadores nem chegam aqui: SidebarLeftSlot
// achata a árvore antes de renderizar (flattenNavItems), então este componente só lida com folha
// (item.href sempre string).
export const ICON_BUTTON_BASE =
  "group relative flex w-full flex-col items-center gap-1 rounded-sm px-1 py-2 text-center text-muted-foreground ui-motion-base outline-none hover:bg-accent/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring";

export const RAIL_LABEL_CLASSES = "line-clamp-2 w-full break-words text-[9px] font-medium uppercase leading-tight tracking-caps";

const ACTIVE_BAR = "absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]";

export function RailNavLink({ item }: { item: Extract<MainNavItem, { href: string }> }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link href={item.href} aria-current={isActive ? "page" : undefined} title={item.label} className={cn(ICON_BUTTON_BASE, isActive && "text-primary")}>
      {isActive && <span aria-hidden="true" className={ACTIVE_BAR} />}
      <NavIcon iconKey={item.icon} className="size-5 shrink-0" />
      <span className={RAIL_LABEL_CLASSES}>{item.label}</span>
    </Link>
  );
}

// Agregador (item.href === null) não navega e não tem espaço pra um segundo nível dentro de um
// rail de ícones — em vez de um submenu (flyout aninhado, removido nesta sessão), os filhos entram
// direto na lista do rail, como se fossem itens de primeiro nível. O rótulo do agregador em si
// (que não tem destino próprio) é descartado; só folhas navegam.
export function flattenNavItems(items: MainNavItem[]): Extract<MainNavItem, { href: string }>[] {
  return items.flatMap((item) => (item.href === null ? flattenNavItems(item.children) : [item]));
}
