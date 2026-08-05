import { authorizeActor } from "@/contexts/rbac";
import { listDeletedMediaAssets } from "./service";
import type { ListDeletedMediaAssetsResult } from "./types";

// Atrás de media.purge, não media.manage — só quem pode apagar de vez tem motivo pra ver a
// lixeira (blob-spec seção 6: media.purge é a permission "irreversível", restrita a superadmin).
export async function listDeletedMediaAssetsHandler(): Promise<ListDeletedMediaAssetsResult> {
  const authz = await authorizeActor("media.purge");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listDeletedMediaAssets();
}
