import type { SidebarRightSlotProps } from "@/contexts/themes";

export function SidebarRightSlot({ enabled, blocks }: SidebarRightSlotProps) {
  if (!enabled) return null;

  return (
    <aside>
      {blocks.map((block) => (
        <div key={block.key} data-block-type={block.type} />
      ))}
    </aside>
  );
}
