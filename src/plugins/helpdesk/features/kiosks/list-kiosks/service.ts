import { listActiveQueueOptions, listKiosks } from "../../../shared/kiosk-store";
import type { ListKiosksResult } from "./types";

export async function listKiosksForAdmin(): Promise<ListKiosksResult> {
  const [kiosks, queueOptions] = await Promise.all([listKiosks(), listActiveQueueOptions()]);
  const queueNameById = new Map(queueOptions.map((queue) => [queue.id, queue.name]));

  return {
    success: true,
    data: {
      kiosks: kiosks.map((kiosk) => ({
        ...kiosk,
        queueName: kiosk.queueId ? queueNameById.get(kiosk.queueId) ?? null : null,
      })),
      queueOptions,
    },
  };
}
