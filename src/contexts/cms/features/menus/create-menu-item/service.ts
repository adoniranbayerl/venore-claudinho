import { beginOperation, endOperation } from "@/observability";
import { findNextMenuItemOrder, findOrCreateMenuByLocation, insertMenuItem } from "./store";
import type { CreateMenuItemCommand, CreateMenuItemResult } from "./types";

export async function createMenuItem(command: CreateMenuItemCommand): Promise<CreateMenuItemResult> {
  const handle = beginOperation({
    useCase: "cms.create-menu-item",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const menu = await findOrCreateMenuByLocation(command.location);
  const order = await findNextMenuItemOrder(menu.id);
  const item = await insertMenuItem({ menuId: menu.id, label: command.label, href: command.href, order });

  endOperation(handle, { success: true });
  return { success: true, data: item };
}
