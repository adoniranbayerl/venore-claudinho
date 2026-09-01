import type { OperationResult } from "@/shared/types";
import type { HelpdeskNotificationView } from "../../../contracts/types";

export type ListMyNotificationsResult = OperationResult<{
  notifications: HelpdeskNotificationView[];
  unreadCount: number;
}>;
