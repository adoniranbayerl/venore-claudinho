import {
  BOARD_LAYOUTS,
  BOARD_REFRESH_SECONDS_MAX,
  BOARD_REFRESH_SECONDS_MIN,
} from "../../../contracts/types";
import type { HelpdeskValidationError } from "../../../shared/validation-error";
import type { UpdateBoardInput } from "./types";

export function validateUpdateBoardInput(input: UpdateBoardInput): HelpdeskValidationError | null {
  if (!input.boardId || input.boardId.trim().length === 0) {
    return { code: "helpdesk.update-board.missing_board", message: "Painel não informado." };
  }
  if (input.label.trim().length === 0) {
    return { code: "helpdesk.update-board.invalid_label", message: "O nome do painel não pode ser vazio." };
  }
  if (input.label.trim().length > 80) {
    return { code: "helpdesk.update-board.label_too_long", message: "O nome do painel deve ter no máximo 80 caracteres." };
  }
  if (!BOARD_LAYOUTS.includes(input.layout)) {
    return { code: "helpdesk.update-board.invalid_layout", message: "Escolha um layout de painel válido." };
  }
  if (
    !Number.isInteger(input.refreshSeconds) ||
    input.refreshSeconds < BOARD_REFRESH_SECONDS_MIN ||
    input.refreshSeconds > BOARD_REFRESH_SECONDS_MAX
  ) {
    return {
      code: "helpdesk.update-board.invalid_refresh",
      message: `O intervalo de atualização deve ficar entre ${BOARD_REFRESH_SECONDS_MIN} e ${BOARD_REFRESH_SECONDS_MAX} segundos.`,
    };
  }
  return null;
}
