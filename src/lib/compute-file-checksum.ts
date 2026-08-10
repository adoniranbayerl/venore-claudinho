// SHA-256 do conteúdo, calculado no client antes do upload (blob-spec seção 5/9) — o servidor
// nunca recalcula a partir do arquivo inteiro no fluxo de upload direto ao Blob, só compara o que
// o client já mandou.
export async function computeFileChecksum(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
