import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Import direto do módulo folha (não do barrel @/plugins/birthdays): este componente é
// renderizado em árvore de client component, e o barrel reexporta handlers que arrastam
// @/infrastructure/database/client (pg) — inaceitável no bundle do browser. MONTH_LABELS é
// constante pura, sem dependência de banco, então o caminho direto é seguro.
import { MONTH_LABELS } from "@/plugins/birthdays/shared/months";

// Campos compartilhados entre o form de criação e o de edição — mesmo nome de input nos dois,
// só o valor padrão muda.
export function BirthdayFields({
  defaultFullName = "",
  defaultRole = "",
  defaultLocality = "",
  defaultMonth,
  defaultDay = "",
}: {
  defaultFullName?: string;
  defaultRole?: string;
  defaultLocality?: string;
  defaultMonth?: number;
  defaultDay?: number | string;
}) {
  return (
    <>
      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Nome completo
        <Input name="fullName" defaultValue={defaultFullName} placeholder="nome completo" required />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Cargo (opcional)
        <Input name="role" defaultValue={defaultRole} placeholder="cargo" />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Localidade
        <Input name="locality" defaultValue={defaultLocality} placeholder="Matriz" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Mês
          <Select name="month" defaultValue={defaultMonth ? String(defaultMonth) : undefined} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="selecione..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MONTH_LABELS).map(([month, label]) => (
                <SelectItem key={month} value={month}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Dia
          <Input name="day" type="number" min={1} max={31} defaultValue={defaultDay} required />
        </label>
      </div>
    </>
  );
}
