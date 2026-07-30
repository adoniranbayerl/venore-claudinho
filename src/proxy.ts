import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BREADCRUMB_PATHNAME_HEADER } from "@/platform/breadcrumbs/pathname-header";

// `middleware.ts` foi renomeado para `proxy.ts` no Next.js 16 (node_modules/next/dist/docs/01-app/
// 03-api-reference/03-file-conventions/proxy.md — "Migration to Proxy"); mesmo arquivo, mesmo
// contrato, nome novo.
//
// Único propósito: expor a rota atual pra árvore de Server Components via header (contexts/themes
// não tem pathname — nenhum layout/page abaixo daqui precisa saber disso: só platform/breadcrumbs
// lê este header, num único ponto, resolve-breadcrumbs.ts). Sem isso, o layout único de
// (platform)/layout.tsx (Shell única, AGENTS.md) não tem como saber qual página está sendo
// renderizada sem middleware — usePathname() só existe em Client Component.
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(BREADCRUMB_PATHNAME_HEADER, request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Exclui assets estáticos e rotas de API — breadcrumb só existe pra página renderizada
  // (docs/proxy.md — "Negative matching"), e rodar em cima de _next/api seria custo sem uso.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
