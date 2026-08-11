import type { ReactNode } from "react";

// Cabeçalho padrão de página administrativa — título + descrição opcional à esquerda, ações
// (botões/dialogs) à direita. `text-xl font-semibold` é o tamanho já dominante em toda
// src/app/(platform)/admin/** (ver rbac, cms, media, settings, diagnostics, plugins); alguns
// plugins tinham nascido com text-3xl próprio, esta é a padronização pra esse título único que
// todo admin (core ou plugin) deveria adotar.
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
