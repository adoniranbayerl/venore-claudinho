"use server";

import { confirmMediaUpload, requestMediaUploadTicket } from "@/contexts/media";
import type { RequestMediaUploadTicketResult } from "@/contexts/media";

export async function requestUploadTicketAction(input: {
  filename: string;
  contentType: string;
  size: number;
}): Promise<RequestMediaUploadTicketResult> {
  return requestMediaUploadTicket(input);
}

export async function confirmUploadAction(input: {
  filename: string;
  pathname: string;
  url: string;
  contentType: string;
  size: number;
  checksum: string;
}) {
  return confirmMediaUpload(input);
}
