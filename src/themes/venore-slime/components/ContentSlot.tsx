import type { ContentSlotProps } from "@/contexts/themes";

export function ContentSlot({ children, sidebarContextualEnabled, sidebarContextual }: ContentSlotProps) {
  const showSidebar = sidebarContextualEnabled && sidebarContextual != null;

  return (
    <div data-sidebar-contextual={showSidebar} className="flex-1 min-w-0 bg-(image:--app-background)">
      <div className={`mx-auto flex max-w-6xl gap-8 px-6 py-8 ${showSidebar ? "flex-col lg:flex-row" : ""}`}>
        <main className="min-w-0 flex-1 text-text-primary">{children}</main>
        {showSidebar && <aside className="w-full shrink-0 text-text-primary lg:w-72">{sidebarContextual}</aside>}
      </div>
    </div>
  );
}
