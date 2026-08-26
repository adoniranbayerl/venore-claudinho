import { MediaPickerField } from "@/components/media-picker-field";
import type { PickableMedia } from "@/components/media-picker-field.actions";
import { Input } from "@/components/ui/input";

// Campos compartilhados entre o form de criação e o de edição de instituição — mesmo nome de
// input nos dois, só o valor padrão muda (mesmo padrão de birthdays/routes/admin/birthday-fields.tsx).
export function InstitutionFields({
  defaultName = "",
  defaultProgramLabel = "",
  initialLogo = null,
}: {
  defaultName?: string;
  defaultProgramLabel?: string;
  initialLogo?: PickableMedia | null;
}) {
  return (
    <>
      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Nome da instituição
        <Input name="name" defaultValue={defaultName} placeholder="ex.: Colégio Erasto Gaertner" required />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Como chamar cada turma/curso
        <Input name="programLabel" defaultValue={defaultProgramLabel} placeholder="ex.: Turma, Curso" required />
      </label>

      <MediaPickerField name="logoMediaId" label="Logo (opcional)" initialMedia={initialLogo} />
    </>
  );
}
