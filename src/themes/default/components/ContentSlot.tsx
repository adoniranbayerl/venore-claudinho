import type { ContentSlotProps } from "@/contexts/themes";

export function ContentSlot({ children, sidebarContextualEnabled }: ContentSlotProps) {
  return (
    <div data-sidebar-contextual={sidebarContextualEnabled}>
      <main>{children}</main>
    </div>
  );
}
