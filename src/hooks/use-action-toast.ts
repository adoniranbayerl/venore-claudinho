"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

// Deriva sucesso/erro da transição pending=true -> pending=false de useActionState, em vez de
// exigir que toda action.ts troque sua forma de retorno por um status explícito — mantém o
// contrato { error: string | null } já usado em todas as actions da Academy intacto (esta sessão
// é só camada de apresentação, docs/venore-docks.md).
export function useActionToast({
  pending,
  error,
  successMessage,
  onSuccess,
}: {
  pending: boolean;
  error: string | null;
  successMessage?: string | null;
  onSuccess?: () => void;
}) {
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (error) {
        toast.error(error);
      } else {
        if (successMessage) toast.success(successMessage);
        onSuccess?.();
      }
    }
    wasPending.current = pending;
  }, [pending, error, successMessage, onSuccess]);
}
