import Link from "next/link";
import type { HeaderSlotProps } from "@/contexts/themes";
import { UserMenu } from "./UserMenu";
import { MobileNavToggleButton } from "./MobileNavToggleButton";

// Header encolhe e inverte pra bg-primary/text-primary-foreground ao rolar — mesma técnica de
// "header-surface" / "header-surface-scrolled" do repositório de referência (Venore Pulse),
// só com os tokens do contrato deste projeto. Abaixo de lg mostra o hamburger que abre o drawer
// da SidebarLeft (mobile-nav-store); a partir de lg a sidebar já é fixa e o botão some.
export function HeaderSlot({
  brand,
  userbarEnabled,
  headerNavItems,
  scrollState,
  user,
  canAccessAdmin,
  onSignOut,
  isDark,
  onToggleColorMode,
}: HeaderSlotProps) {
  const { isScrolled } = scrollState;

  return (
    <header
      data-scrolled={isScrolled}
      className={
        "sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-4 ui-motion-emphasis sm:px-6 " +
        (isScrolled
          ? "border-primary bg-primary text-primary-foreground shadow-header"
          : "border-header-border-subtle bg-surface-panel text-text-primary md:h-24 lg:h-28")
      }
    >
      <div className="flex items-center gap-2">
        <MobileNavToggleButton isScrolled={isScrolled} />
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
                "rounded-control px-3 py-1.5 text-xs font-medium uppercase tracking-caps ui-motion-base outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                (isScrolled
                  ? "hover:bg-primary-foreground/10 active:bg-primary-foreground/10"
                  : "text-text-secondary hover:bg-accent-soft hover:text-text-primary active:bg-accent-soft active:text-text-primary")
              }
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}

      {userbarEnabled ? (
        user ? (
          <UserMenu
            user={user}
            canAccessAdmin={canAccessAdmin}
            onSignOut={onSignOut}
            isScrolled={isScrolled}
            isDark={isDark}
            onToggleColorMode={onToggleColorMode}
          />
        ) : (
          <Link
            href="/login"
            className={
              "rounded-control px-3 py-1.5 text-xs font-medium uppercase tracking-caps ui-motion-base outline-none focus-visible:ring-2 focus-visible:ring-ring " +
              (isScrolled
                ? "hover:bg-primary-foreground/10 active:bg-primary-foreground/10"
                : "text-text-secondary hover:bg-accent-soft hover:text-text-primary active:bg-accent-soft active:text-text-primary")
            }
          >
            Entrar
          </Link>
        )
      ) : null}
    </header>
  );
}
