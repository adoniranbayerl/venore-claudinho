import { getMediaAssetForTrustedReview } from "@/contexts/media";
import type { TicketAttachmentRecord, TicketAttachmentView } from "../contracts/types";

// Resolve a mídia de cada anexo. Usa o bypass de visibilidade getMediaAssetForTrustedReview (o
// anexo é sempre "private", dono = quem enviou) — o service que chama isto já autorizou o acesso
// ao chamado (get-ticket / list-ticket-attachments). Mesmo padrão de
// list-lesson-activity-submissions-for-activity no academy. Compartilhado por get-ticket e
// list-ticket-attachments: nenhuma das duas é dona natural da resolução.
export async function resolveAttachmentViews(records: TicketAttachmentRecord[]): Promise<TicketAttachmentView[]> {
  return Promise.all(
    records.map(async (record) => {
      const media = await getMediaAssetForTrustedReview({ id: record.mediaId });
      const asset = media.success ? media.data : null;
      return {
        id: record.id,
        eventId: record.eventId,
        mediaId: record.mediaId,
        uploadedByUserId: record.uploadedByUserId,
        createdAt: record.createdAt,
        mediaUrl: asset?.url ?? null,
        mediaFilename: asset?.filename ?? null,
        mediaContentType: asset?.contentType ?? null,
      };
    }),
  );
}
