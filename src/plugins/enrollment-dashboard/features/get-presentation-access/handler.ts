import { getPresentationAccess } from "./service";
import type { GetPresentationAccessResult } from "./types";

// Sem authorizeActor de propósito — o token é lido tanto pela tela admin (pra montar o link
// copiável) quanto pela view pública de apresentação, que não tem sessão (pedido explícito: link
// direto, sem login, pra abrir num telão/projetor). Mesmo espírito de birthdays/features/
// get-birthday-appearance/handler.ts e do getOutputStateHandler do broadcast.
export async function getPresentationAccessHandler(): Promise<GetPresentationAccessResult> {
  return getPresentationAccess();
}
