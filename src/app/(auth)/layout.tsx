// Grupo (auth) — login/setup não usam a shell cheia (docs/venore-docks.md — "Shell única"),
// então este layout não monta Header/Content/SidebarLeft/Footer do tema, só repassa children.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
