"use client";

import { useActionState, useMemo, useState } from "react";
import { Trash2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import type { SectorMemberRole } from "@/plugins/company-metrics/contracts/types";
import { setSectorMembersAction, type CompanyMetricsActionState } from "./actions";

type UserOption = { id: string; name: string | null; email: string };
type Member = { userId: string; role: SectorMemberRole };

const initialState: CompanyMetricsActionState = { error: null };

const ROLE_LABELS: Record<SectorMemberRole, string> = {
  admin: "Administrador do setor",
  editor: "Editor (lança dados)",
  viewer: "Consulta",
};

function roleOptions(canManageAdmins: boolean): SectorMemberRole[] {
  return canManageAdmins ? ["admin", "editor", "viewer"] : ["editor", "viewer"];
}

export function SectorMembersDialog({
  sectorId,
  sectorName,
  allUsers,
  members: initialMembers,
  canManageAdmins,
}: {
  sectorId: string;
  sectorName: string;
  allUsers: UserOption[];
  members: Member[];
  canManageAdmins: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState<SectorMemberRole>("editor");
  const [state, formAction, pending] = useActionState(setSectorMembersAction, initialState);

  useActionToast({
    pending,
    error: state.error,
    successMessage: "Responsáveis atualizados.",
    onSuccess: () => setOpen(false),
  });

  const userById = useMemo(() => new Map(allUsers.map((user) => [user.id, user])), [allUsers]);
  const available = allUsers.filter((user) => !members.some((member) => member.userId === user.id));

  function label(user: UserOption): string {
    return user.name && user.name.trim().length > 0 ? `${user.name} · ${user.email}` : user.email;
  }

  function canEditRow(role: SectorMemberRole): boolean {
    return canManageAdmins || role !== "admin";
  }

  function addMember() {
    if (!addUserId) return;
    setMembers((current) => [...current, { userId: addUserId, role: addRole }]);
    setAddUserId("");
    setAddRole("editor");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCog className="size-4" />
          Responsáveis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Responsáveis de {sectorName}</DialogTitle>
          <DialogDescription>
            {canManageAdmins
              ? "Administradores configuram o setor e delegam editores. Editores lançam dados. Consulta só visualiza."
              : "Você pode delegar editores e consulta. Só um administrador de Métricas Internas altera os administradores do setor."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="sectorId" value={sectorId} />
          <input type="hidden" name="membersJson" value={JSON.stringify(members)} />

          <ul className="divide-y divide-border rounded-lg border border-border">
            {members.length === 0 && (
              <li className="px-3 py-4 text-sm text-muted-foreground">Nenhum responsável atribuído ainda.</li>
            )}
            {members.map((member, index) => {
              const user = userById.get(member.userId);
              const editable = canEditRow(member.role);
              return (
                <li key={member.userId} className="flex flex-wrap items-center gap-2 px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {user ? label(user) : member.userId}
                  </span>
                  <Select
                    value={member.role}
                    onValueChange={(value) =>
                      setMembers((current) =>
                        current.map((entry, i) => (i === index ? { ...entry, role: value as SectorMemberRole } : entry)),
                      )
                    }
                    disabled={!editable}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions(canManageAdmins || member.role === "admin").map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={!editable}
                    onClick={() => setMembers((current) => current.filter((_, i) => i !== index))}
                    aria-label="Remover responsável"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              );
            })}
          </ul>

          {available.length > 0 && (
            <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3">
              <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
                Pessoa
                <Select value={addUserId} onValueChange={setAddUserId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {available.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {label(user)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Papel
                <Select value={addRole} onValueChange={(value) => setAddRole(value as SectorMemberRole)}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions(canManageAdmins).map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <Button type="button" variant="secondary" onClick={addMember} disabled={!addUserId}>
                Adicionar
              </Button>
            </div>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            Salvar responsáveis
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
