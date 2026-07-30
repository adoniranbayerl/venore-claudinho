export type CsvEncoding = "utf-8" | "iso-8859-1";

export type DecodedCsv = { text: string; encoding: CsvEncoding };

// Excel em português exporta CSV em UTF-8 (com BOM) ou em ISO-8859-1, dependendo da versão e do
// "salvar como". Se um arquivo ISO-8859-1 for decodificado como UTF-8 sem checagem, bytes de
// acentuação (ex.: 0xE9 de "é") viram sequências UTF-8 inválidas na maioria dos casos — decodificar
// em modo estrito (fatal: true) detecta isso de forma confiável e permite cair pra ISO-8859-1, que
// sempre decodifica sem erro (mapeamento 1:1 byte→code point). O BOM UTF-8, quando presente, é
// removido automaticamente pelo TextDecoder (comportamento padrão da spec, ignoreBOM: false).
export function decodeCsvBytes(bytes: Buffer): DecodedCsv {
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { text, encoding: "utf-8" };
  } catch {
    const text = new TextDecoder("iso-8859-1").decode(bytes);
    return { text, encoding: "iso-8859-1" };
  }
}
