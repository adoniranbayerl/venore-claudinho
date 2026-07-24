import type { FooterSlotProps } from "@/contexts/themes";

export function FooterSlot({ brand, sitemapItems, creditsEnabled }: FooterSlotProps) {
  return (
    <footer>
      <span>{brand.name}</span>
      <nav>
        {sitemapItems.map((item) => (
          <a key={item.key} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      {creditsEnabled ? <div data-credits>Venore Docks</div> : null}
    </footer>
  );
}
