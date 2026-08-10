import { db } from "@/infrastructure/database/client";
import { broadcastOutputEditors } from "../../../database/schema";

export async function findAllOutputEditorLinks(): Promise<{ outputId: string; userId: string }[]> {
  return db.select({ outputId: broadcastOutputEditors.outputId, userId: broadcastOutputEditors.userId }).from(broadcastOutputEditors);
}
