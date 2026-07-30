import type { OperationResult } from "@/shared/types";

export type RequestMediaUploadTicketCommand = {
  filename: string;
  contentType: string;
  size: number;
  actorId: string;
};

export type RequestMediaUploadTicketInput = Omit<RequestMediaUploadTicketCommand, "actorId">;

export type MediaUploadTicket = {
  pathname: string;
  contentType: string;
  maxSizeBytes: number;
};

export type RequestMediaUploadTicketResult = OperationResult<MediaUploadTicket>;
