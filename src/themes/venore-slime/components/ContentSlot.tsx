import type { ContentSlotProps } from "@/contexts/themes";

export function ContentSlot({ children, sidebarContextualEnabled }: ContentSlotProps) {
  return (
    <div
      data-sidebar-contextual={sidebarContextualEnabled}
      className="min-h-screen bg-(image:--app-background)"
    >
      <main className="mx-auto max-w-6xl px-6 py-8 text-text-primary">{children}</main>
    </div>
  );
}
