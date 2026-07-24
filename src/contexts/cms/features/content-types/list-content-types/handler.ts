// Leitura pública: catálogo de content types, sem authorizeActor (docs/venore-docks.md — CMS).
import { listContentTypes } from "./service";
import type { ListContentTypesResult } from "./types";

export async function listContentTypesHandler(): Promise<ListContentTypesResult> {
  return listContentTypes();
}
