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
// Editável por dono OU media.manage (docs do pedido: "editável por quem tem direito") — diferente
// de deleteMedia, que é binário só-media.manage. Ver comentário em
// features/files/update-media-visibility/service.ts.
export { updateMediaVisibilityHandler as updateMediaVisibility } from "./features/files/update-media-visibility/handler";
export { updateMediaCategoryHandler as updateMediaCategory } from "./features/files/update-media-category/handler";

export { listCategoriesHandler as listCategories } from "./features/categories/list-categories/handler";
export { createCategoryHandler as createCategory } from "./features/categories/create-category/handler";
export { updateCategoryHandler as updateCategory } from "./features/categories/update-category/handler";
// Bloqueia se algum arquivo ainda usa a categoria (docs do pedido: "não é apagada sem tratar os
// assets vinculados") — quem chama decide entre desvincular em massa (clearCategoryAssets) ou
// recategorizar cada arquivo antes de tentar de novo.
export { deleteCategoryHandler as deleteCategory } from "./features/categories/delete-category/handler";
export { clearCategoryAssetsHandler as clearCategoryAssets } from "./features/categories/clear-category-assets/handler";

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
export { mediaBreadcrumbSegments, getCachedMedia } from "./breadcrumbs";

export type {
  MediaAsset,
  MediaAssetCategory,
  MediaAllowedTypeRule,
  MediaCategory,
  MediaRecord,
  MediaVisibility,
} from "./contracts/types";
export { MEDIA_ALLOWED_TYPES, AVATAR_MAX_SIZE_BYTES } from "./contracts/types";

export type { UploadMediaInput, UploadMediaResult } from "./features/files/upload-media/types";
export type { UploadAvatarMediaInput, UploadAvatarMediaResult } from "./features/files/upload-avatar-media/types";
export type { ListMediaQuery, ListMediaResult } from "./features/files/list-media/types";
export type { GetMediaQuery, GetMediaResult } from "./features/files/get-media/types";
export type { DeleteMediaInput, DeleteMediaResult } from "./features/files/delete-media/types";
export type { UpdateMediaVisibilityInput, UpdateMediaVisibilityResult } from "./features/files/update-media-visibility/types";
export type { UpdateMediaCategoryInput, UpdateMediaCategoryResult } from "./features/files/update-media-category/types";

export type { ListCategoriesResult } from "./features/categories/list-categories/types";
export type { CreateCategoryResult } from "./features/categories/create-category/types";
export type { CreateCategoryHandlerInput } from "./features/categories/create-category/handler";
export type { UpdateCategoryResult } from "./features/categories/update-category/types";
export type { UpdateCategoryHandlerInput } from "./features/categories/update-category/handler";
export type { DeleteCategoryInput, DeleteCategoryResult } from "./features/categories/delete-category/types";
export type { ClearCategoryAssetsInput, ClearCategoryAssetsResult } from "./features/categories/clear-category-assets/types";

export type { RequestMediaUploadTicketInput, RequestMediaUploadTicketResult, MediaUploadTicket } from "./features/assets/request-media-upload-ticket/types";
export type { RegisterUploadedMediaResult } from "./features/assets/register-uploaded-media/types";
export type { ConfirmMediaUploadInput } from "./features/assets/register-uploaded-media/handler";
export type { DeleteMediaAssetInput, DeleteMediaAssetResult } from "./features/assets/delete-media-asset/types";
