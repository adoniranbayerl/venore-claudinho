// Mesmo padrão do toggle de nav-mode (SidebarLeftSlot): form com Server Action, sem estado
// client nem localStorage — isDark já vem resolvido do cookie via platform/ui-preferences.
export function ColorModeToggle({
  isDark,
  onToggleColorMode,
  className,
}: {
  isDark: boolean;
  onToggleColorMode: () => Promise<void>;
  className?: string;
}) {
  return (
    <form action={onToggleColorMode}>
      <button type="submit" className={className}>
        {isDark ? "Modo claro" : "Modo escuro"}
      </button>
    </form>
  );
}
