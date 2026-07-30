import type { MediaUsageReference } from "@/platform/media-usage/types";

export type FindMediaUsageQuery = { mediaId: string };
export type FindMediaUsageResult = MediaUsageReference[];
