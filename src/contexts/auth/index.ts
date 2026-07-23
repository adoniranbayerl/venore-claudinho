export { handlers, signIn, signOut } from "./auth.config";
export { getCurrentUserHandler as getCurrentUser } from "./features/session/get-current-user/handler";
export type { AuthenticatedUser } from "./contracts/types";
export type { GetCurrentUserResult } from "./features/session/get-current-user/types";
