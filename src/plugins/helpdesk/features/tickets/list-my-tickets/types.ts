import type { OperationResult } from "@/shared/types";
import type { TicketListItem } from "../../../contracts/types";

export type ListMyTicketsResult = OperationResult<TicketListItem[]>;
