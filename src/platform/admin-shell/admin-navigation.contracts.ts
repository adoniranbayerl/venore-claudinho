// Contrato de item de navegação admin (docs/venore-docks.md — "Shell única" / registro de
// navegação): cada context/plugin declara os próprios itens com este formato; nada além disso é
// enumerado à mão em platform/admin-shell. groupKey/groupOrder decidem o agrupamento e a ordem
// das seções renderizadas; order decide a ordem dentro do grupo. requiredPermission array =
// satisfeito se o ator tiver QUALQUER UMA das permissions (ex: seção com várias sub-áreas, cada
// uma com sua própria permission).
export type AdminNavItemDefinition = {
  key: string;
  label: string;
  icon: string;
  href: string;
  groupKey: string;
  groupLabel: string;
  groupOrder: number;
  order: number;
  requiredPermission?: string | string[];
};
