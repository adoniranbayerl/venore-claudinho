import type { OperationResult } from "@/shared/types";
import type { TicketAttachmentView } from "../../../contracts/types";

export type ListTicketAttachmentsResult = OperationResult<TicketAttachmentView[]>;
