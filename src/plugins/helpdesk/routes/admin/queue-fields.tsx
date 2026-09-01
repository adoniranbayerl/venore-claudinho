import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QUEUE_ICON_OPTIONS } from "@/plugins/helpdesk/shared/queue-icons";

// Campos compartilhados entre criar e editar fila — mesmo nome de input nos dois, só o valor
// padrão muda (padrão de company-metrics/routes/admin/sector-fields.tsx).
export function QueueFields({
  defaultName = "",
  defaultDescription = "",
  defaultIcon = "",
}: {
  defaultName?: string;
  defaultDescription?: string;
  defaultIcon?: string;
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
    </>
  );
}
