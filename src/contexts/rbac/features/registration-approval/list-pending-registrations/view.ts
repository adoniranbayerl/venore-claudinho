import type { PendingUserRef } from "@/contexts/auth";
import type { PendingRegistrationView } from "./types";

export function toPendingRegistrationView(pendingUser: PendingUserRef): PendingRegistrationView {
  return {
    userId: pendingUser.id,
    email: pendingUser.email,
    name: pendingUser.name,
    pendingSince: pendingUser.createdAt,
  };
}
