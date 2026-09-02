import type { OperationResult } from "@/shared/types";

// Forma serializada de um PushSubscription do navegador (subscription.toJSON()).
export type WebPushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
};

export type WebPushPayload = {
  title: string;
  body: string;
  // URL aberta ao clicar na notificação (mesma origem).
  url?: string;
  tag?: string;
};

export type SaveSubscriptionResult = OperationResult<{ id: string }>;
export type DeleteSubscriptionResult = OperationResult<{ deleted: number }>;
export type SendPushResult = OperationResult<{ sent: number; pruned: number }>;
