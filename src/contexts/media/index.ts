export { uploadMediaHandler as uploadMedia } from "./features/files/upload-media/handler";
export { listMediaHandler as listMedia } from "./features/files/list-media/handler";
export { getMediaHandler as getMedia } from "./features/files/get-media/handler";
// Não checa se o arquivo está em uso por uma entry de cms — media não pode depender de cms
// (fecharia ciclo com a validação de mediaId em create-entry/update-entry, regra 11). Quem
// precisa dessa garantia deve chamar platform/media-lifecycle/delete-media-safely.ts, não este
// export direto (regra 14 — segunda ocorrência do padrão, primeira foi o registro de usuário).
export { deleteMediaHandler as deleteMedia } from "./features/files/delete-media/handler";

export type { MediaRecord } from "./contracts/types";

export type { UploadMediaInput, UploadMediaResult } from "./features/files/upload-media/types";
export type { ListMediaResult } from "./features/files/list-media/types";
export type { GetMediaQuery, GetMediaResult } from "./features/files/get-media/types";
export type { DeleteMediaInput, DeleteMediaResult } from "./features/files/delete-media/types";
