import path from "node:path";

// Resolve uma key de storage (ex: "Imagens/uuid-nome.png") contra a raiz configurada do driver
// filesystem, rejeitando qualquer resultado que escape da raiz (".." , path absoluto disfarçado).
// Defesa em profundidade — a key já é sanitizada na origem (sanitizeFilename em contexts/media),
// mas a rota de servir e o adapter reconferem antes de tocar o disco. Mesmo espírito de
// resolveWithinRoot do plugin broadcast (que serve vídeo de public/broadcast/videos).
export function resolveWithinRoot(root: string, key: string): string | null {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(resolvedRoot, key);
  const isWithinRoot = resolvedTarget === resolvedRoot || resolvedTarget.startsWith(resolvedRoot + path.sep);
  return isWithinRoot ? resolvedTarget : null;
}
