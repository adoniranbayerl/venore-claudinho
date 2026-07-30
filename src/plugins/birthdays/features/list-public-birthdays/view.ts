import type { BirthdayRecord } from "../../contracts/types";
import type { PublicBirthdayView } from "./types";

// View pública: sem createdByUserId, locality, timestamps — nenhum campo técnico exposto pra
// quem só visualiza o quadro do mês.
export function toPublicBirthdayView(birthday: BirthdayRecord): PublicBirthdayView {
  return {
    id: birthday.id,
    fullName: birthday.fullName,
    role: birthday.role,
    month: birthday.month,
    day: birthday.day,
  };
}
