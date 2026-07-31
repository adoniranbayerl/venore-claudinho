import Link from "next/link";
import type { HeaderSlotProps } from "@/contexts/themes";
import { MobileNavToggleButton } from "../../venore-slime/components/MobileNavToggleButton";
import { PlatformBrand } from "../../venore-slime/components/PlatformBrand";
import { UserMenu } from "../../venore-slime/components/UserMenu";

// Faixa fina e estática (h-14) — sem a mecânica de encolher/inverter cor ao rolar do Venore Slime
// (HeaderScrollSentinel não é usado aqui). A identidade estrutural deste tema é a Sidebar (rail de
// ícones) ocupando a altura inteira da viewport ao lado de tudo (Shell.tsx); o Header só cobre a
// coluna de conteúdo, não a tela inteira, então não precisa da mesma dramaticidade de scroll que o
// Slime usa pra compensar ocupar a largura inteira. Server component puro — nada aqui rastreia
// estado de scroll.
export function HeaderSlot({ brand, userbarEnabled, headerNavItems, user, canAccessAdmin, onSignOut }: HeaderSlotProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-(--header-border-subtle) bg-card px-4 text-foreground shadow-[0_1px_0_var(--header-border-strong)] sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNavToggleButton />
        <Link href="/" aria-label={brand.name} className="inline-flex min-w-0 items-center">
          <PlatformBrand {...brand} isScrolled={false} />
        </Link>
      </div>

      {headerNavItems.length > 0 && (
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {headerNavItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="rounded-sm px-3 py-1.5 text-xs font-medium uppercase tracking-caps text-muted-foreground ui-motion-base outline-none hover:bg-accent/14 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}

      {userbarEnabled ? (
        user ? (
          <UserMenu user={user} canAccessAdmin={canAccessAdmin} onSignOut={onSignOut} />
        ) : (
          <Link
            href="/login"
            className="rounded-sm px-3 py-1.5 text-xs font-medium uppercase tracking-caps text-muted-foreground ui-motion-base outline-none hover:bg-accent/14 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            Entrar
          </Link>
        )
      ) : null}
    </header>
  );
}
