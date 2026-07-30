import { authorizeActor } from "@/contexts/rbac";
import { clearCategoryAssets } from "./service";
import type { ClearCategoryAssetsInput, ClearCategoryAssetsResult } from "./types";

export async function clearCategoryAssetsHandler(input: ClearCategoryAssetsInput): Promise<ClearCategoryAssetsResult> {
  const authz = await authorizeActor("media.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return clearCategoryAssets(input);
}
