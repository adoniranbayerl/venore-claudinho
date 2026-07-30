import { NAV_ICON_BY_KEY, NAV_ICON_FALLBACK } from "./registry";

// Componente de verdade (não uma função que devolve um componente escolhido em render) — atribuir
// um valor "PascalCase" resolvido dinamicamente a uma variável dentro do corpo de outro componente
// cria uma identidade de componente nova a cada render (remonta a subárvore, perde estado). Um
// único NavIcon é compartilhado entre o tema (main-nav) e o preview de ícone no editor de menu do
// CMS (admin/cms/menus) — os dois resolvem a mesma chave (platform/nav-icons/registry.ts).
export function NavIcon({ iconKey, className }: { iconKey: string | undefined; className?: string }) {
  const Icon = (iconKey && NAV_ICON_BY_KEY[iconKey]) || NAV_ICON_FALLBACK;
  return <Icon className={className} aria-hidden="true" />;
}
