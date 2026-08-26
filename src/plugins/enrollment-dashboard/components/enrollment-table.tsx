import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import type { EnrollmentProgramMetrics } from "../contracts/types";
import { goalCompletionRatio, goalStatus, totalEnrollments } from "../shared/enrollment-metrics";
import { GoalStatusBadge } from "./goal-status-badge";

// renderActions é opcional (mesmo componente serve a leitura pura e o admin com CRUD) — só quando
// passado a coluna "Ações" aparece, pra não ter célula vazia em nenhum outro consumidor futuro.
export function EnrollmentTable({
  programs,
  programLabel,
  renderActions,
}: {
  programs: EnrollmentProgramMetrics[];
  programLabel: string;
  renderActions?: (program: EnrollmentProgramMetrics) => ReactNode;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{programLabel}</TableHead>
          <TableHead className="text-right">Meta</TableHead>
          <TableHead className="text-right">Rematriculados</TableHead>
          <TableHead className="text-right">Novas matrículas</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="min-w-40">% da meta</TableHead>
          <TableHead>Status</TableHead>
          {renderActions && <TableHead className="text-right">Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {programs.map((program) => {
          const total = totalEnrollments(program);
          const ratio = goalCompletionRatio(program);
          const status = goalStatus(program);

          return (
            <TableRow key={program.id}>
              <TableCell className="font-medium text-foreground">{program.label}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{program.goal.toLocaleString("pt-BR")}</TableCell>
              <TableCell className="text-right tabular-nums">{program.renewed.toLocaleString("pt-BR")}</TableCell>
              <TableCell className="text-right tabular-nums">{program.newEnrollments.toLocaleString("pt-BR")}</TableCell>
              <TableCell className="text-right font-semibold tabular-nums text-foreground">{total.toLocaleString("pt-BR")}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={Math.min(ratio, 1) * 100} className="w-24" />
                  <span className="w-10 shrink-0 text-xs tabular-nums text-muted-foreground">{Math.round(ratio * 100)}%</span>
                </div>
              </TableCell>
              <TableCell>
                <GoalStatusBadge status={status} />
              </TableCell>
              {renderActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">{renderActions(program)}</div>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
