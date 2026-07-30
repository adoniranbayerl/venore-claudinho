import { authorizeActor } from "@/contexts/rbac";
import { requestMediaUploadTicket } from "./service";
import type { RequestMediaUploadTicketInput, RequestMediaUploadTicketResult } from "./types";

export async function requestMediaUploadTicketHandler(
  input: RequestMediaUploadTicketInput,
): Promise<RequestMediaUploadTicketResult> {
  if (input.filename.trim().length === 0) {
    return { success: false, error: { code: "media.upload.invalid_filename", message: "O nome do arquivo não pode ser vazio." } };
  }
  if (input.contentType.trim().length === 0) {
    return { success: false, error: { code: "media.upload.invalid_mime_type", message: "O contentType do arquivo não pode ser vazio." } };
  }

  // Um usuário sem permissão não recebe token — authorizeActor já responde com uma mensagem
  // genérica, igual para "não autenticado" e "sem permissão", sem vazar detalhes (blob-spec
  // seção 6/9).
  const authz = await authorizeActor("media.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return requestMediaUploadTicket({ ...input, actorId: authz.actorId });
}
