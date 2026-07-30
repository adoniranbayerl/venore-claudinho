import {
  Activity,
  Cake,
  FileText,
  Files,
  FolderTree,
  GraduationCap,
  Home,
  Image as ImageIcon,
  LayoutList,
  LayoutTemplate,
  Link2,
  type LucideIcon,
  Palette,
  Puzzle,
  Settings,
  Users,
} from "lucide-react";

// Registro chave -> componente lucide, indexado por NavItem.icon (string, nunca o componente em
// si — ver comentário em contexts/themes/contracts/types.ts sobre por que não passamos a função
// como prop de Server pra Client Component). Chaves de admin-nav vêm do registro agregado em
// platform/admin-shell/admin-navigation-registry.ts (cada context/plugin declara a própria);
// "home" cobre o mock/fallback de main-nav. CMS ainda não tem coluna de ícone (Known Gap,
// AGENTS.md §7) — itens de main-nav sem `icon` caem no fallback genérico (Link2), não quebram
// nem ficam sem ícone.
const NAV_ICON_BY_KEY: Record<string, LucideIcon> = {
  home: Home,
  users: Users,
  "file-text": FileText,
  "graduation-cap": GraduationCap,
  image: ImageIcon,
  settings: Settings,
  palette: Palette,
  "layout-template": LayoutTemplate,
  "layout-list": LayoutList,
  "folder-tree": FolderTree,
  files: Files,
  activity: Activity,
  puzzle: Puzzle,
  cake: Cake,
};

// Componente de verdade (não uma função que devolve um componente escolhido em render) — regra
// react-hooks/static-components do projeto rejeita atribuir um valor "PascalCase" resolvido
// dinamicamente a uma variável dentro do corpo de outro componente.
export function NavIcon({ iconKey, className }: { iconKey: string | undefined; className?: string }) {
  const Icon = (iconKey && NAV_ICON_BY_KEY[iconKey]) || Link2;
  return <Icon className={className} />;
}
