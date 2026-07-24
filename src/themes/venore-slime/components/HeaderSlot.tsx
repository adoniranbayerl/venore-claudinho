import type { HeaderSlotProps } from "@/contexts/themes";

// Header encolhe e inverte pra bg-primary/text-primary-foreground ao rolar — mesma técnica de
// "header-surface" / "header-surface-scrolled" do repositório de referência (Venore Pulse),
// só com os tokens do contrato deste projeto.
export function HeaderSlot({ brand, userbarEnabled, headerNavItems, scrollState }: HeaderSlotProps) {
  const { isScrolled } = scrollState;

  return (
    <header
      data-scrolled={isScrolled}
      className={
        "sticky top-0 z-40 flex items-center justify-between gap-4 border-b px-6 transition-[height,background-color,color,border-color,box-shadow] duration-300 " +
        (isScrolled
          ? "h-16 border-primary bg-primary text-primary-foreground shadow-header"
          : "h-24 border-header-border-subtle bg-surface-panel text-text-primary md:h-28")
      }
    >
      <div className="flex items-center gap-2">
        <span
          className={
            "flex h-9 w-9 items-center justify-center rounded-panel text-sm font-semibold " +
            (isScrolled ? "bg-primary-foreground/15 text-primary-foreground" : "bg-header-avatar-bg text-text-accent")
          }
        >
          {brand.name.charAt(0)}
        </span>
        <span className="font-medium">{brand.name}</span>
      </div>

      {headerNavItems.length > 0 && (
        <nav className="flex flex-1 items-center justify-center gap-1">
          {headerNavItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={
                "rounded-control px-3 py-1.5 text-xs font-medium uppercase tracking-caps transition-colors " +
                (isScrolled ? "hover:bg-primary-foreground/10" : "text-text-secondary hover:bg-accent-soft hover:text-text-primary")
              }
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}

      {userbarEnabled ? (
        <div
          data-userbar
          className={
            "h-9 w-9 rounded-full " + (isScrolled ? "bg-primary-foreground/15" : "bg-header-avatar-bg")
          }
        />
      ) : null}
    </header>
  );
}
