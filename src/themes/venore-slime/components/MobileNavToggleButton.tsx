"use client";

import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleMobileNav, useMobileNavOpen } from "./mobile-nav-store";

// Único pedaço client do Header além de HeaderScrollSentinel — o botão em si (precisa de estado
// de aberto/fechado do drawer). Abaixo de lg abre/fecha o drawer da SidebarLeft (mobile-nav-
// store); a partir de lg fica oculto pois a sidebar volta a ser fixa. Cor no estado "scrolled" via
// `group-data-[scrolled=true]/header:`, não via prop — não precisa de `useIsScrolled` nenhum,
// mesmo sendo client, porque isso é puramente CSS reagindo ao atributo do <header> ancestral.
export function MobileNavToggleButton() {
  const isOpen = useMobileNavOpen();

  return (
    <button
      type="button"
      onClick={toggleMobileNav}
      aria-label={isOpen ? "Fechar navegação" : "Abrir navegação"}
      aria-expanded={isOpen}
      className={cn(
        "ui-icon-button-lg ui-motion-base outline-none hover:bg-accent/14 active:bg-accent/14 focus-visible:ring-2 focus-visible:ring-ring lg:hidden",
        "group-data-[scrolled=true]/header:hover:bg-primary-foreground/10 group-data-[scrolled=true]/header:active:bg-primary-foreground/10",
      )}
    >
      {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
    </button>
  );
}
