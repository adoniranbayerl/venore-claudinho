import type { OperationResult } from "@/shared/types";
import type { AuthenticatedUser, UserRegistrationStatus } from "../../../contracts/types";

export type FindUserByEmailQuery = {
  email: string;
};

// Registro de identidade + credencial: inclui `passwordHash` e `status`, que o provider
// Credentials (contexts/auth/providers.ts) precisa pra autenticar e pra barrar usuário pending.
// Reexportado pelo barrel — consumidores administrativos (ex: academy enrollStudentAction, o
// script de bootstrap) só devem ler os campos de identidade e nunca repassar `passwordHash`
// adiante.
export type FoundUser = AuthenticatedUser & {
  passwordHash: string | null;
  status: UserRegistrationStatus;
};

export type FindUserByEmailResult = OperationResult<FoundUser>;
