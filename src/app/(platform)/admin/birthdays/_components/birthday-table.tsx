import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BirthdayAdminView } from "@/plugins/birthdays";
import { DeleteBirthdayButton } from "./delete-birthday-button";
import { EditBirthdayDialog } from "./edit-birthday-dialog";

export function BirthdayTable({ birthdays }: { birthdays: BirthdayAdminView[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Dia</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead className="hidden sm:table-cell">Cargo</TableHead>
          <TableHead className="hidden sm:table-cell">Localidade</TableHead>
          <TableHead className="w-24 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {birthdays.map((birthday) => (
          <TableRow key={birthday.id}>
            <TableCell className="font-medium text-foreground">{birthday.day}</TableCell>
            <TableCell>
              {birthday.fullName}
              <p className="text-xs text-muted-foreground sm:hidden">
                {[birthday.role, birthday.locality].filter(Boolean).join(" · ")}
              </p>
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">{birthday.role ?? "—"}</TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">{birthday.locality}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <EditBirthdayDialog birthday={birthday} />
                <DeleteBirthdayButton birthdayId={birthday.id} fullName={birthday.fullName} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
