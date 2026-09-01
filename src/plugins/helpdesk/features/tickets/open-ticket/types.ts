import type { OperationResult } from "@/shared/types";
import type { TicketRecord } from "../../../contracts/types";

export type OpenTicketCommand = {
  queueId: string;
  categoryId?: string | null;
  title: string;
  description: string;
  location?: string | null;
  // mediaIds já enviados via @/contexts/media uploadTicketAttachmentMediaAsset — máx. 3 (§2.2).
  attachmentMediaIds?: string[];
  requesterUserId: string;
};

export type OpenTicketInput = Omit<OpenTicketCommand, "requesterUserId">;

export type OpenTicketResult = OperationResult<{ ticket: TicketRecord; reference: string }>;
