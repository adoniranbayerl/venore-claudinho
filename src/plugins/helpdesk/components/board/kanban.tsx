import type { BoardFeedColumn } from "@/plugins/helpdesk";
import { KanbanColumn } from "./kanban-column";

// Grade de colunas por status (§2.6). Mobile-first: empilha em 1 coluna, 2 no `sm`, e abre nas 4
// colunas no `lg` (a largura de uma TV). Cada coluna rola sozinha.
export function Kanban({
  columns,
  showAssignee,
  showQueue,
}: {
  columns: BoardFeedColumn[];
  showAssignee: boolean;
  showQueue: boolean;
}) {
  return (
    <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {columns.map((column) => (
        <KanbanColumn key={column.key} column={column} showAssignee={showAssignee} showQueue={showQueue} />
      ))}
    </div>
  );
}
