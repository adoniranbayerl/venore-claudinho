import type { FooterSlotProps } from "@/contexts/themes";

// Brand num painel accent-soft + grid de sitemap, mesma composição do PlatformFooter de
// referência (Venore Pulse) — sem o agrupamento por categoria, que o contrato deste projeto
// ainda não expõe (sitemapItems é uma lista plana).
export function FooterSlot({ brand, sitemapItems, creditsEnabled }: FooterSlotProps) {
  return (
    <footer className="mt-auto grid gap-8 border-t border-border-subtle px-6 py-10 text-text-secondary lg:grid-cols-[max-content_minmax(0,1fr)]">
      <div className="w-fit max-w-full justify-self-start rounded-panel bg-accent-soft px-5 py-6">
        <span className="text-lg font-semibold text-text-primary">{brand.name}</span>
      </div>

      {sitemapItems.length > 0 && (
        <div className="pt-1">
          <p className="text-[11px] font-semibold uppercase tracking-caps text-text-muted">Sitemap</p>
          <nav className="mt-3 grid gap-x-10 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {sitemapItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="block rounded-control text-sm text-text-secondary ui-motion-base outline-none hover:text-text-accent active:text-text-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}

      {creditsEnabled ? (
        <div data-credits className="col-span-full border-t border-border-subtle pt-4 text-xs text-text-muted">
          Venore Docks
        </div>
      ) : null}
    </footer>
  );
}
