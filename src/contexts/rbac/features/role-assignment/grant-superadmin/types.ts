import type { OperationResult } from "@/shared/types";

export type GrantSuperadminInput = {
  userId: string;
  // P1 — escalada de privilégio: por padrão o handler recusa conceder superadmin quando já existe
  // um. Só o script one-shot scripts/bootstrap-superadmin.ts passa isto, porque ele já faz a
  // própria checagem de existência + confirmação interativa antes de chamar.
  bypassExistsCheck?: true;
};

export type GrantSuperadminResult = OperationResult<void>;
