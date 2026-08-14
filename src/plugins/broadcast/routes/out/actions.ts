"use server";

import { verifyOutputPin } from "@/plugins/broadcast";
import { setOutputPinCookie } from "@/plugins/broadcast/shared/output-pin-cookie";

export type SubmitOutputPinState = { error: string | null };

// Sem revalidatePath — depois de um Server Action ligado a <form action={...}>, o Next já
// reexecuta os Server Components da rota atual sozinho (mesma página, mesmo token), então o
// próximo render de routes/out/page.tsx já lê o cookie recém-gravado e segue o fluxo normal.
export async function submitOutputPinAction(_prevState: SubmitOutputPinState, formData: FormData): Promise<SubmitOutputPinState> {
  const token = String(formData.get("token") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();
  if (!token || !pin) {
    return { error: "Informe o PIN." };
  }

  const result = await verifyOutputPin({ token, candidate: pin });
  if (!result.success || !result.data.valid) {
    return { error: "PIN incorreto." };
  }

  await setOutputPinCookie(token, pin);
  return { error: null };
}
