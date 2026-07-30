import type { UserRef } from "@/contexts/auth";
import type { BirthdayRecord } from "../../contracts/types";
import type { BirthdayAdminView } from "./types";

// createdByUserId não tem FK pra auth.users (schema/index.ts) — usuário apagado deixa o id
// órfão. `user` vem de um Map resolvido no service; se a chave não bater (id órfão, ou registro
// criado antes de existir usuário), degrada pra null em vez de quebrar a listagem.
export function toBirthdayAdminView(birthday: BirthdayRecord, user: UserRef | undefined): BirthdayAdminView {
  return {
    id: birthday.id,
    fullName: birthday.fullName,
    role: birthday.role,
    locality: birthday.locality,
    month: birthday.month,
    day: birthday.day,
    createdByUserId: birthday.createdByUserId,
    createdByName: user?.name ?? null,
  };
}
