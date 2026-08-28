import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SECTOR_ICON_OPTIONS } from "@/plugins/company-metrics/shared/sector-icons";

// Campos compartilhados entre criar e editar setor — mesmo nome de input nos dois, só o valor
// padrão muda (padrão de birthdays/routes/admin/birthday-fields.tsx).
export function SectorFields({
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
        Nome do setor
        <Input name="name" defaultValue={defaultName} placeholder="ex.: Comercial" required maxLength={80} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Descrição (opcional)
        <Textarea name="description" defaultValue={defaultDescription} placeholder="O que este setor acompanha" rows={2} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Ícone
        <Select name="icon" defaultValue={defaultIcon || undefined}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="selecione..." />
          </SelectTrigger>
          <SelectContent>
            {SECTOR_ICON_OPTIONS.map((option) => (
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
