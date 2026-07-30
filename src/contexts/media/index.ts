export { uploadMediaHandler as uploadMedia } from "./features/files/upload-media/handler";
// Aberto a qualquer ator autenticado (sem media.manage) — só pra imagem de avatar do próprio
// perfil, sempre privada, sempre < AVATAR_MAX_SIZE_BYTES. Não usar pra biblioteca geral.
export { uploadAvatarMediaHandler as uploadAvatarMedia } from "./features/files/upload-avatar-media/handler";
export { listMediaHandler as listMedia } from "./features/files/list-media/handler";
export { getMediaHandler as getMedia } from "./features/files/get-media/handler";
// Não checa se o arquivo está em uso por uma entry de cms — media não pode depender de cms
// (fecharia ciclo com a validação de mediaId em create-entry/update-entry, regra 11). Quem
// precisa dessa garantia deve chamar platform/media-lifecycle/delete-media-safely.ts, não este
// export direto (regra 14 — segunda ocorrência do padrão, primeira foi o registro de usuário).
export { deleteMediaHandler as deleteMedia } from "./features/files/delete-media/handler";

// Fluxo novo de client-upload direto ao Blob (docs/media/blob-spec.md). `confirmMediaUpload` é
// a entrada pública para a confirmação feita pelo browser depois que upload() resolve — o
// handler de baixo nível usado pelo webhook onUploadCompleted (que confia num actorId já
// resolvido via tokenPayload) não é exportado aqui de propósito, só a rota o importa direto.
export { requestMediaUploadTicketHandler as requestMediaUploadTicket } from "./features/assets/request-media-upload-ticket/handler";
// Exposta pro route handler revalidar allowlist/limite dentro de onBeforeGenerateToken sem
// duplicar a regra (blob-spec seção 5, "checado duas vezes").
export { validateMediaUploadCandidate } from "./features/assets/request-media-upload-ticket/service";
export { confirmMediaUploadHandler as confirmMediaUpload } from "./features/assets/register-uploaded-media/handler";
export { deleteMediaAssetHandler as deleteMediaAsset } from "./features/assets/delete-media-asset/handler";

export { mediaAdminNavigationItems } from "./admin-navigation";
export { mediaBreadcrumbSegments } from "./breadcrumbs";

export type { MediaAsset, MediaAssetCategory, MediaAllowedTypeRule, MediaRecord, MediaVisibility } from "./contracts/types";
export { MEDIA_ALLOWED_TYPES, AVATAR_MAX_SIZE_BYTES } from "./contracts/types";

export type { UploadMediaInput, UploadMediaResult } from "./features/files/upload-media/types";
export type { UploadAvatarMediaInput, UploadAvatarMediaResult } from "./features/files/upload-avatar-media/types";
export type { ListMediaResult } from "./features/files/list-media/types";
export type { GetMediaQuery, GetMediaResult } from "./features/files/get-media/types";
export type { DeleteMediaInput, DeleteMediaResult } from "./features/files/delete-media/types";

export type { RequestMediaUploadTicketInput, RequestMediaUploadTicketResult, MediaUploadTicket } from "./features/assets/request-media-upload-ticket/types";
export type { RegisterUploadedMediaResult } from "./features/assets/register-uploaded-media/types";
export type { ConfirmMediaUploadInput } from "./features/assets/register-uploaded-media/handler";
export type { DeleteMediaAssetInput, DeleteMediaAssetResult } from "./features/assets/delete-media-asset/types";
