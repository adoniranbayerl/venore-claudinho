import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { lessonMaterials } from "../../../database/schema";
import type { LessonMaterialRecord } from "../../../contracts/types";

export async function findLessonMaterialById(id: string): Promise<LessonMaterialRecord | null> {
  const [row] = await db.select().from(lessonMaterials).where(eq(lessonMaterials.id, id)).limit(1);
  return (row as LessonMaterialRecord) ?? null;
}

export async function deleteLessonMaterial(id: string): Promise<void> {
  await db.delete(lessonMaterials).where(eq(lessonMaterials.id, id));
}
