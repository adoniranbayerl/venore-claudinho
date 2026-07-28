"use client";

import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleMobileNav, useMobileNavOpen } from "./mobile-nav-store";

// Único pedaço client do Header — o botão em si. Abaixo de lg abre/fecha o drawer da
// SidebarLeft (mobile-nav-store); a partir de lg fica oculto pois a sidebar volta a ser fixa.
export function MobileNavToggleButton({ isScrolled }: { isScrolled: boolean }) {
  const isOpen = useMobileNavOpen();

  return (
    <button
      type="button"
      onClick={toggleMobileNav}
      aria-label={isOpen ? "Fechar navegação" : "Abrir navegação"}
      aria-expanded={isOpen}
      className={cn(
        "ui-icon-button-lg ui-motion-base outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden",
        isScrolled
          ? "hover:bg-primary-foreground/10 active:bg-primary-foreground/10"
          : "hover:bg-accent/14 active:bg-accent/14",
      )}
    >
      {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
    </button>
  );
}
