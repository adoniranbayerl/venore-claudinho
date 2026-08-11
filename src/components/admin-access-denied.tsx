// Bloco de "sem permissão" repetido em toda página administrativa (core e plugins) que resolve
// seu próprio gate via um loader de src/platform/admin-shell/get-*-page-data.ts (regra 13 do
// documento de arquitetura) — um componente único em vez de ~30 cópias do mesmo JSX evita a tela
// de acesso negado divergir por engano entre módulos.
export function AdminAccessDenied({ title = "Acesso negado", message }: { title?: string; message: string }) {
  return (
    <div className="rounded-panel border border-border bg-card p-8 text-center">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
