import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QUEUE_ICON_OPTIONS } from "@/plugins/helpdesk/shared/queue-icons";
import { TICKET_PRIORITIES } from "@/plugins/helpdesk/contracts/types";
import { TICKET_PRIORITY_LABELS } from "@/plugins/helpdesk/shared/sla-display";

// Campos compartilhados entre criar e editar fila — mesmo nome de input nos dois, só o valor
// padrão muda (padrão de company-metrics/routes/admin/sector-fields.tsx).
export function QueueFields({
  defaultName = "",
  defaultDescription = "",
  defaultIcon = "",
  defaultPriority = "normal",
}: {
  defaultName?: string;
  defaultDescription?: string;
  defaultIcon?: string;
  defaultPriority?: string;
}) {
  return (
    <>
      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Nome da fila
        <Input name="name" defaultValue={defaultName} placeholder="ex.: Manutenção" required maxLength={80} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Descrição (opcional)
        <Textarea name="description" defaultValue={defaultDescription} placeholder="O que esta equipe atende" rows={2} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Ícone
        <Select name="icon" defaultValue={defaultIcon || undefined}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="selecione..." />
          </SelectTrigger>
          <SelectContent>
            {QUEUE_ICON_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Prioridade padrão
        <Select name="defaultPriority" defaultValue={defaultPriority}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TICKET_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {TICKET_PRIORITY_LABELS[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          Herdada pelo chamado que nasce sem categoria (ou cuja categoria não define uma).
        </span>
      </label>
    </>
  );
}
