import type { HeaderSlotProps } from "@/contexts/themes";

export function HeaderSlot({ brand, userbarEnabled, navItems, scrollState }: HeaderSlotProps) {
  return (
    <header data-scrolled={scrollState.isScrolled}>
      <span>{brand.name}</span>
      <nav>
        {navItems.map((item) => (
          <a key={item.key} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      {userbarEnabled ? <div data-userbar /> : null}
    </header>
  );
}
