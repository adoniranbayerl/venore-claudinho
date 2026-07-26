"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { closeMobileNav, useMobileNavOpen } from "./mobile-nav-store";

// Envolve o conteúdo (nav + toggle admin) já montado pelo SidebarLeftSlot (server component) —
// só a casca que decide overlay/posição/Escape é client. Abaixo de lg vira off-canvas fechado
// por padrão; a partir de lg os estilos de drawer são neutralizados e ela volta a ser a coluna
// fixa (classes lg: do próprio SidebarLeftSlot cuidam disso).
export function MobileNavDrawer({ children, asideClassName }: { children: ReactNode; asideClassName: string }) {
  const isOpen = useMobileNavOpen();

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMobileNav();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Fechar navegação"
          onClick={closeMobileNav}
          className="fixed inset-0 z-40 bg-surface-overlay/80 lg:hidden"
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] transition-transform duration-200 ease-out",
          "lg:static lg:z-auto lg:w-auto lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <aside className={asideClassName}>{children}</aside>
      </div>
    </>
  );
}
