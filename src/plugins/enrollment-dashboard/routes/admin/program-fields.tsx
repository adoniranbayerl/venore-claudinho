import { Input } from "@/components/ui/input";

// Campos compartilhados entre o form de criação e o de edição de turma/curso. programLabel só
// entra como texto de apoio no rótulo do primeiro campo (ex.: "Nome da turma") — o formulário não
// pede pro admin digitar "turma" ou "curso" de novo, isso já é fixo por instituição.
export function ProgramFields({
  programLabel,
  defaultLabel = "",
  defaultGroupLabel = "",
  defaultGoal = 0,
  defaultRenewed = 0,
  defaultNewEnrollments = 0,
}: {
  programLabel: string;
  defaultLabel?: string;
  defaultGroupLabel?: string;
  defaultGoal?: number;
  defaultRenewed?: number;
  defaultNewEnrollments?: number;
}) {
  return (
    <>
      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Nome d{programLabel.toLowerCase().startsWith("a") ? "a" : "o"} {programLabel.toLowerCase()}
        <Input name="label" defaultValue={defaultLabel} placeholder={`ex.: ${programLabel} 1`} required />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Grupo/segmento (opcional)
        <Input name="groupLabel" defaultValue={defaultGroupLabel} placeholder="ex.: Ensino Médio" />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Meta
          <Input name="goal" type="number" min={0} step={1} defaultValue={defaultGoal} required />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Rematrículas
          <Input name="renewed" type="number" min={0} step={1} defaultValue={defaultRenewed} required />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Novas matrículas
          <Input name="newEnrollments" type="number" min={0} step={1} defaultValue={defaultNewEnrollments} required />
        </label>
      </div>
    </>
  );
}
