import Link from "next/link";
import type { HeaderUserInfo } from "@/contexts/themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColorModeToggle } from "@/components/color-mode-toggle";

function initials(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

type UserMenuProps = {
  user: HeaderUserInfo;
  canAccessAdmin: boolean;
  onSignOut: () => Promise<void>;
  isScrolled: boolean;
  isDark: boolean;
  onToggleColorMode: () => Promise<void>;
};

// Dropdown sem JS extra (<details>/<summary>), mesmo padrão já usado em
// src/app/(auth)/login/page.tsx para as credenciais de desenvolvimento.
export function UserMenu({ user, canAccessAdmin, onSignOut, isScrolled, isDark, onToggleColorMode }: UserMenuProps) {
  const firstName = user.displayName.split(/\s+/)[0];

  return (
    <details className="group relative">
      <summary
        className={
          "flex cursor-pointer list-none items-center gap-2 rounded-control px-1.5 py-1 [&::-webkit-details-marker]:hidden " +
          (isScrolled ? "hover:bg-primary-foreground/10" : "hover:bg-accent-soft")
        }
      >
        <Avatar>
          {user.imageUrl ? <AvatarImage src={user.imageUrl} alt={user.displayName} /> : null}
          <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">{firstName}</span>
      </summary>

      <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-panel border border-border-subtle bg-surface-panel p-3 text-text-primary shadow-float">
        <div className="border-b border-border-subtle pb-3">
          <p className="truncate text-sm font-semibold">{user.displayName}</p>
          {user.email ? <p className="truncate text-xs text-text-muted">{user.email}</p> : null}
        </div>

        <div className="flex flex-col gap-1 py-2">
          <ColorModeToggle
            isDark={isDark}
            onToggleColorMode={onToggleColorMode}
            className="w-full rounded-control px-2 py-1.5 text-left text-sm text-text-secondary transition-colors hover:bg-accent-soft hover:text-text-primary"
          />

          {canAccessAdmin ? (
            <Link
              href="/admin"
              className="rounded-control px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-accent-soft hover:text-text-primary"
            >
              Administração
            </Link>
          ) : null}

          {/* TODO: link para /account quando a rota existir */}
        </div>

        <form action={onSignOut} className="border-t border-border-subtle pt-2">
          <button
            type="submit"
            className="w-full rounded-control px-2 py-1.5 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-accent-soft hover:text-text-primary"
          >
            Sair
          </button>
        </form>
      </div>
    </details>
  );
}
