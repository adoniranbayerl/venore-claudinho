import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import type { OperationResult } from "@/shared/types";

// jsdom window criado uma única vez por processo — DOMPurify precisa de um DOM real pra rodar
// fora do browser, e recriar a cada chamada seria custo sem ganho (não guardamos estado entre
// sanitizações).
const purify = DOMPurify(new JSDOM("").window);

// Neutraliza href/xlink:href/src que não apontem pra dentro do próprio arquivo (âncora "#id") —
// bloqueia SVG puxando conteúdo de fora (ex: <a href="http://evil...">, <image href="http://...">).
// Hook em vez de `ALLOWED_URI_REGEXP` global: essa opção do DOMPurify, nesta versão rodando sob
// jsdom, acabou derrubando atributos de apresentação sem relação nenhuma com URI (fill/cx/cy/r) —
// o hook mexe só nos atributos que efetivamente carregam URI, sem esse efeito colateral.
const EXTERNAL_URI_ATTRS = new Set(["href", "xlink:href", "src"]);
purify.addHook("uponSanitizeAttribute", (_node, data) => {
  if (EXTERNAL_URI_ATTRS.has(data.attrName.toLowerCase()) && !data.attrValue.startsWith("#")) {
    data.keepAttr = false;
  }
});

// `image/svg+xml` só entra em MEDIA_ALLOWED_TYPES (contracts/types.ts) porque todo upload passa
// por aqui antes de storagePort.store — SVG pode carregar <script>/onload/onclick embutido
// (blob-spec seção 5), então nunca é gravado como recebido. FORBID_TAGS cobre <script> (executa
// direto) e <foreignObject> (permite embutir HTML/script arbitrário dentro do SVG).
export function sanitizeSvgBuffer(data: Buffer): OperationResult<Buffer> {
  const raw = data.toString("utf8");
  const clean = purify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["script", "foreignObject"],
  });

  if (!/<svg[\s>]/i.test(clean)) {
    return {
      success: false,
      error: {
        code: "media.upload.invalid_svg",
        message: "O arquivo SVG enviado é inválido ou ficou vazio após a sanitização.",
      },
    };
  }

  return { success: true, data: Buffer.from(clean, "utf8") };
}
