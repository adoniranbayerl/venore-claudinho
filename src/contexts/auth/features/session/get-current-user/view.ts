import type { Session } from "next-auth";
import type { AuthenticatedUser } from "../../../contracts/types";

export function toAuthenticatedUser(user: Session["user"]): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
    image: user.image ?? null,
  };
}
