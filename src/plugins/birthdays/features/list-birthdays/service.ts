import { listUsers } from "@/contexts/auth";
import { findAllBirthdays } from "./store";
import { toBirthdayAdminView } from "./view";
import type { ListBirthdaysResult } from "./types";

export async function listBirthdays(): Promise<ListBirthdaysResult> {
  const [records, usersResult] = await Promise.all([findAllBirthdays(), listUsers()]);
  const usersById = new Map((usersResult.success ? usersResult.data : []).map((user) => [user.id, user]));

  return {
    success: true,
    data: records.map((record) =>
      toBirthdayAdminView(record, record.createdByUserId ? usersById.get(record.createdByUserId) : undefined),
    ),
  };
}
