import { findAllMenusWithItemCount } from "./store";
import type { ListMenusResult } from "./types";

export async function listMenus(): Promise<ListMenusResult> {
  const items = await findAllMenusWithItemCount();
  return { success: true, data: items };
}
