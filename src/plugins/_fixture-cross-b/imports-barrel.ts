// OK: fixture-plugin "b" consumindo o barrel público do fixture-plugin "a". A regra plugin ->
// plugin NÃO deve reportar isto (index.ts é categoria plugin-public).
import { fixtureCrossAPublic } from "@/plugins/_fixture-cross-a";

export const usesPublicSurface = fixtureCrossAPublic;
