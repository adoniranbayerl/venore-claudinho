// VIOLAÇÃO DE PROPÓSITO: fixture-plugin "b" alcançando um arquivo interno do fixture-plugin "a".
// A regra plugin -> plugin do boundaries/dependencies (eslint.config.mjs) tem que reportar isto.
import { fixtureCrossASecret } from "@/plugins/_fixture-cross-a/internal/secret";

export const leakedSecret = fixtureCrossASecret;
