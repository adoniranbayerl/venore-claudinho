import type { OperationResult } from "@/shared/types";
import type { TicketAttachmentRecord } from "../../../contracts/types";

export type AddTicketAttachmentCommand = {
  ticketId: string;
  // null = preso ao chamado; id de um ticket_event = preso àquele comentário.
  eventId?: string | null;
  // mediaIds já enviados via @/contexts/media uploadTicketAttachmentMediaAsset.
  mediaIds: string[];
  uploadedByUserId: string;
};

export type AddTicketAttachmentInput = Omit<AddTicketAttachmentCommand, "uploadedByUserId">;

export type AddTicketAttachmentResult = OperationResult<TicketAttachmentRecord[]>;
