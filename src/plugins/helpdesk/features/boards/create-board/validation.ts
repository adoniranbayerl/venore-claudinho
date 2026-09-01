import {
  BOARD_LAYOUTS,
  BOARD_REFRESH_SECONDS_MAX,
  BOARD_REFRESH_SECONDS_MIN,
} from "../../../contracts/types";
import type { HelpdeskValidationError } from "../../../shared/validation-error";
import type { CreateBoardInput } from "./types";

export function validateCreateBoardInput(input: CreateBoardInput): HelpdeskValidationError | null {
  if (input.label.trim().length === 0) {
    return { code: "helpdesk.create-board.invalid_label", message: "Dê um nome ao painel (ex.: TV da Manutenção)." };
  }
  if (input.label.trim().length > 80) {
    return { code: "helpdesk.create-board.label_too_long", message: "O nome do painel deve ter no máximo 80 caracteres." };
  }
  if (!BOARD_LAYOUTS.includes(input.layout)) {
    return { code: "helpdesk.create-board.invalid_layout", message: "Escolha um layout de painel válido." };
  }
  if (
    !Number.isInteger(input.refreshSeconds) ||
    input.refreshSeconds < BOARD_REFRESH_SECONDS_MIN ||
    input.refreshSeconds > BOARD_REFRESH_SECONDS_MAX
  ) {
    return {
      code: "helpdesk.create-board.invalid_refresh",
      message: `O intervalo de atualização deve ficar entre ${BOARD_REFRESH_SECONDS_MIN} e ${BOARD_REFRESH_SECONDS_MAX} segundos.`,
    };
  }
  return null;
}
