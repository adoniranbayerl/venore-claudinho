"use server";

import { revalidatePath } from "next/cache";
import { createMenuItem, getMenuByLocation, removeMenuItem, reorderMenuItems } from "@/contexts/cms";

const MAIN_NAV_LOCATION = "main-nav";

export type MenuActionState = { error: string | null };

// Mesmo padrão de removeRoleAction (/admin/rbac/actions.ts): erro do handler é devolvido de
// verdade via useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function addMenuItemAction(
  _prevState: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  const result = await createMenuItem({
    location: MAIN_NAV_LOCATION,
    label: String(formData.get("label") ?? ""),
    href: String(formData.get("href") ?? ""),
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/cms/menus");
  return { error: null };
}

export async function removeMenuItemAction(
  _prevState: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  const menuItemId = String(formData.get("menuItemId") ?? "");
  const result = await removeMenuItem({ menuItemId });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/cms/menus");
  return { error: null };
}

async function moveMenuItem(menuItemId: string, direction: "up" | "down"): Promise<MenuActionState> {
  const menu = await getMenuByLocation({ location: MAIN_NAV_LOCATION });
  if (!menu.success) {
    return { error: menu.error.message };
  }

  const items = menu.data.items;
  const index = items.findIndex((item) => item.id === menuItemId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= items.length) {
    return { error: null };
  }

  const orderedIds = items.map((item) => item.id);
  [orderedIds[index], orderedIds[swapWith]] = [orderedIds[swapWith], orderedIds[index]];

  const result = await reorderMenuItems({ menuId: items[0].menuId, menuItemIds: orderedIds });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/cms/menus");
  return { error: null };
}

export async function moveMenuItemUpAction(
  _prevState: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  return moveMenuItem(String(formData.get("menuItemId") ?? ""), "up");
}

export async function moveMenuItemDownAction(
  _prevState: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  return moveMenuItem(String(formData.get("menuItemId") ?? ""), "down");
}
