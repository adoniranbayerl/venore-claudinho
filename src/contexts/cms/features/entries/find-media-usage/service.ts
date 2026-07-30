import { findEntriesByMediaId } from "./store";
import type { FindMediaUsageQuery, FindMediaUsageResult } from "./types";

export async function findMediaUsage(query: FindMediaUsageQuery): Promise<FindMediaUsageResult> {
  const rows = await findEntriesByMediaId(query.mediaId);

  return rows.map((row) => ({
    consumerKey: "cms",
    consumerLabel: "CMS",
    label: `Entry: ${row.title}`,
    href: `/admin/cms/entries/${row.id}`,
  }));
}
