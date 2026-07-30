"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteMediaAction, getMediaUsageSummaryAction, type MediaActionState } from "../actions";

const initialState: MediaActionState = { error: null };

// Aviso + confirmação (docs do pedido: "a deleção avisa quantos locais serão afetados e exige
// confirmação"): antes de deixar o form submeter de verdade, busca o resumo de uso e monta a
// mensagem de confirmação com a contagem — só depois disso o form é reenviado de propósito
// (bypassRef), já com `confirmed=true`. deleteMediaSafely ainda recusa apagar mídia em uso sem
// esse flag (defesa em profundidade — não confia só nesta checagem do client).
export function DeleteMediaButton({
  id,
  className,
  size = "sm",
  label = "Excluir",
  redirectTo,
}: {
  id: string;
  className?: string;
  size?: "sm" | "icon";
  label?: string;
  // Página de detalhe passa "/admin/media": o asset excluído deixa de existir, não faz sentido
  // continuar nela. A grade não passa nada — revalidatePath já tira o item da lista no lugar.
  redirectTo?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(deleteMediaAction, initialState);
  useActionToast({
    pending,
    error: state.error,
    successMessage: "Arquivo excluído.",
    onSuccess: redirectTo ? () => router.push(redirectTo) : undefined,
  });

  const bypassConfirmRef = useRef(false);
  const confirmedInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (bypassConfirmRef.current) {
      bypassConfirmRef.current = false;
      return;
    }

    event.preventDefault();
    const usage = await getMediaUsageSummaryAction(id);

    const message =
      usage.length > 0
        ? `Este arquivo está em uso em ${usage.length} ${usage.length === 1 ? "local" : "locais"}: ${usage
            .map((reference) => reference.label)
            .join(", ")}. Excluir mesmo assim?`
        : "Excluir este arquivo?";

    if (!window.confirm(message)) {
      return;
    }

    if (confirmedInputRef.current) {
      confirmedInputRef.current.value = "true";
    }
    bypassConfirmRef.current = true;
    event.currentTarget.requestSubmit();
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <input ref={confirmedInputRef} type="hidden" name="confirmed" value="false" />
      <Button type="submit" variant="outline" size={size} disabled={pending} className={className ?? "text-destructive"}>
        {label}
      </Button>
    </form>
  );
}
