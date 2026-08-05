"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// (platform)/layout.tsx é a única shell (AGENTS.md — Shell única) e o App Router nunca
// re-renderiza um layout persistido em navegação client-side entre rotas que o compartilham —
// só a página filha (docs/proxy.md#L35 — "partial rendering... shared layouts won't
// automatically be refetched on every navigation, only the page segment that changes"). Como
// resolveBreadcrumbs() roda dentro desse layout, breadcrumbs ficava preso na trilha da
// navegação anterior até algo forçar um refresh (ex: toggleNavModeAction, que é Server Action —
// o Next já revalida a rota atual sozinho depois de uma). router.refresh() aqui replica esse
// mesmo mecanismo pra toda navegação client-side comum, sem mexer no contrato de Shell/tema.
export function RouteChangeRefresher() {
  const pathname = usePathname();
  const router = useRouter();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    router.refresh();
  }, [pathname, router]);

  return null;
}
