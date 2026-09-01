import type { OperationResult } from "@/shared/types";

export type SubmitKioskTicketCommand = {
  // Já resolvido e validado (ativo) pelo handler a partir do token da URL.
  kioskId: string;
  // Fila fixada pelo quiosque, OU a escolhida pelo solicitante quando o quiosque não fixa nenhuma.
  queueId: string;
  description: string;
  location: string | null;
  requesterName: string | null;
  requesterContact: string | null;
};

export type SubmitKioskTicketInput = {
  token: string;
  description: string;
  location?: string | null;
  contact?: string | null;
  requesterName?: string | null;
  // Obrigatória só quando o quiosque não fixa fila.
  queueId?: string | null;
};

export type SubmitKioskTicketResult = OperationResult<{
  reference: string;
  trackingToken: string;
  // Caminho relativo do acompanhamento — o cliente monta a URL absoluta.
  trackingPath: string;
}>;
