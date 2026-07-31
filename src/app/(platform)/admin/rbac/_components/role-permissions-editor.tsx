"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useActionToast } from "@/hooks/use-action-toast";
import { PermissionPicker } from "./permission-picker";
import type { PermissionGroupView } from "./permission-catalog";
import { updateRolePermissionsAction, type RbacActionState } from "../actions";

const initialState: RbacActionState = { error: null };

export function RolePermissionsEditor({
  roleId,
  roleName,
  groups,
  selectedKeys,
  affectedUserCount,
  searchInputId,
}: {
  roleId: string;
  roleName: string;
  groups: PermissionGroupView[];
  selectedKeys: string[];
  affectedUserCount: number;
  searchInputId?: string;
}) {
  const [state, formAction, pending] = useActionState(updateRolePermissionsAction, initialState);
  const [selected, setSelected] = useState<string[]>(selectedKeys);
  const [confirmOpen, setConfirmOpen] = useState(false);
  useActionToast({
    pending,
    error: state.error,
    successMessage: "Permissões atualizadas.",
    onSuccess: () => setConfirmOpen(false),
  });

  const titleByKey = new Map(
    groups.flatMap((group) => group.permissions.map((permission) => [permission.key, permission.title] as const)),
  );

  const added = selected.filter((key) => !selectedKeys.includes(key));
  const removed = selectedKeys.filter((key) => !selected.includes(key));
  const hasChanges = added.length > 0 || removed.length > 0;

  function toggle(key: string) {
    setSelected((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  }

  const formId = `update-role-permissions-${roleId}`;

  return (
    <div className="space-y-2">
      <form id={formId} action={formAction}>
        <input type="hidden" name="roleId" value={roleId} />
        <PermissionPicker groups={groups} selected={selected} onToggle={toggle} searchInputId={searchInputId} />
      </form>

      <div className="flex justify-end">
        <Button type="button" size="sm" variant="outline" disabled={pending || !hasChanges} onClick={() => setConfirmOpen(true)}>
          Salvar alterações
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar mudanças no papel “{roleName}”?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3">
                {(added.length > 0 || removed.length > 0) && (
                  <ul className="space-y-1">
                    {added.map((key) => (
                      <li key={key} className="text-foreground">
                        <span className="text-primary">+</span> Passa a poder: {titleByKey.get(key) ?? key}
                      </li>
                    ))}
                    {removed.map((key) => (
                      <li key={key} className="text-foreground">
                        <span className="text-destructive">−</span> Deixa de poder: {titleByKey.get(key) ?? key}
                      </li>
                    ))}
                  </ul>
                )}
                <p>
                  {affectedUserCount === 0
                    ? "Ninguém tem este papel ainda, então nenhuma pessoa é afetada agora."
                    : affectedUserCount === 1
                      ? "Isso afeta 1 pessoa que tem esse papel hoje — ela ganha e perde essas capacidades assim que você confirmar."
                      : `Isso afeta ${affectedUserCount} pessoas que têm esse papel hoje — elas ganham e perdem essas capacidades assim que você confirmar.`}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form={formId} disabled={pending}>
              Confirmar mudanças
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
