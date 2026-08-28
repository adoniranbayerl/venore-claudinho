import { getSetting } from "@/contexts/settings";
import { authorizeSectorViewActor } from "../../../shared/scoped-authorization";
import { normalizeTimeZone } from "../../../shared/settings";
import { getSectorDashboard } from "./service";
import type { GetSectorDashboardResult } from "./types";

export async function getSectorDashboardHandler(options: {
  sectorId: string;
  windowMonths?: number;
}): Promise<GetSectorDashboardResult> {
  if (!options.sectorId || options.sectorId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.get-sector-dashboard.missing_sector", message: "Setor não informado." } };
  }

  const authz = await authorizeSectorViewActor(options.sectorId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  const tzSetting = await getSetting({ key: "company-metrics.timezone" });
  const timeZone = normalizeTimeZone(tzSetting.success ? tzSetting.data?.value : undefined);

  return getSectorDashboard({ sectorId: options.sectorId, windowMonths: options.windowMonths, timeZone });
}
