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

  // Trava o scroll do body enquanto o drawer está aberto, sem salto de posição: em vez de só
  // overflow:hidden (que ainda permite rubber-band scroll no iOS Safari), fixa o body na
  // posição atual e restaura o scroll exato ao fechar.
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const { body } = document;
    const previousPosition = body.style.position;
    const previousTop = body.style.top;
    const previousWidth = body.style.width;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => {
      body.style.position = previousPosition;
      body.style.top = previousTop;
      body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Fechar navegação"
          onClick={closeMobileNav}
          className="fixed inset-0 z-40 bg-popover/80 lg:hidden"
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] ui-motion-emphasis",
          "lg:static lg:z-auto lg:w-auto lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <aside className={cn(asideClassName, "overscroll-contain")}>{children}</aside>
      </div>
    </>
  );
}
