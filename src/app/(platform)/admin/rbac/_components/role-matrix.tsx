"use client";

import { useState } from "react";
import { Users2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EmptyState } from "@/components/empty-state";
import { AssignRoleForm } from "./assign-role-form";
import { RemoveRoleButton } from "./remove-role-button";
import { RolePermissionsEditor } from "./role-permissions-editor";
import { PermissionMatrixTable } from "./permission-matrix-table";
import type { PermissionGroupView } from "./permission-catalog";

export type RoleMatrixUser = { id: string; name: string | null; email: string };

export type RoleMatrixRole = {
  id: string;
  key: string;
  name: string;
  isSystem: boolean;
  isSuperadmin: boolean;
  permissionKeys: string[];
  users: RoleMatrixUser[];
  assignableUsers: RoleMatrixUser[];
};

export function RoleMatrix({ roles, groups }: { roles: RoleMatrixRole[]; groups: PermissionGroupView[] }) {
  const [view, setView] = useState<"single" | "matrix">("single");

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() => setView((current) => (current === "single" ? "matrix" : "single"))}
        >
          {view === "single" ? "Ver todos os papéis lado a lado" : "Voltar a ver um papel de cada vez"}
        </Button>
      </div>

      {view === "matrix" ? (
        <PermissionMatrixTable
          roles={roles}
          groups={groups}
          permissionKeysByRoleId={new Map(roles.map((role) => [role.id, role.permissionKeys]))}
        />
      ) : (
        <Accordion type="single" collapsible defaultValue={roles[0]?.id} className="rounded-panel border border-border bg-card px-4 py-1">
          {roles.map((role) => {
            const permissionCount = role.permissionKeys.length;
            const userCount = role.users.length;
            const subtitle = role.isSuperadmin
              ? "Acesso total, sem restrição"
              : `${permissionCount} ${permissionCount === 1 ? "permissão" : "permissões"} · ${userCount} ${userCount === 1 ? "pessoa" : "pessoas"}`;

            return (
              <AccordionItem key={role.id} value={role.id}>
                <AccordionTrigger className="-mx-2 items-center gap-2 rounded-lg px-2 hover:bg-muted hover:no-underline ui-motion-base">
                  <span className="flex flex-1 flex-col gap-0.5 text-left">
                    <span className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">{role.name}</span>
                      {role.isSystem && (
                        <Badge variant="outline" className="h-4 px-1 text-[0.65rem] font-normal">
                          sistema
                        </Badge>
                      )}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">{subtitle}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <RolePanel role={role} groups={groups} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}

function RolePanel({ role, groups }: { role: RoleMatrixRole; groups: PermissionGroupView[] }) {
  const hasNoPermissions = !role.isSuperadmin && role.permissionKeys.length === 0;
  const searchInputId = `permission-search-${role.id}`;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-muted-foreground">Permissões</h4>
        {role.isSuperadmin ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Este papel não pode ser alterado. Ele existe para garantir que sempre haja alguém com acesso total à
            organização, mesmo que outros papéis sejam configurados incorretamente. Por isso, suas permissões são
            fixas e não podem ser removidas ou reduzidas.
          </p>
        ) : (
          <>
            {hasNoPermissions && (
              <EmptyState
                className="mt-2 mb-3"
                title="Este papel ainda não libera nada"
                description="Pessoas com ele não conseguem fazer nenhuma ação além do acesso básico de login."
                action={
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => document.getElementById(searchInputId)?.focus()}
                  >
                    Adicionar permissões a este papel
                  </Button>
                }
              />
            )}
            <div className="mt-1">
              <RolePermissionsEditor
                roleId={role.id}
                roleName={role.name}
                groups={groups}
                selectedKeys={role.permissionKeys}
                affectedUserCount={role.users.length}
                searchInputId={searchInputId}
              />
            </div>
          </>
        )}
      </div>

      <div>
        <h4 className="text-xs font-medium text-muted-foreground">Pessoas com este papel</h4>
        {role.users.length === 0 ? (
          <EmptyState
            className="mt-2"
            icon={<Users2 className="size-6" strokeWidth={1.5} />}
            title="Ninguém tem este papel ainda"
            description={role.assignableUsers.length > 0 ? "Atribua para a primeira pessoa logo abaixo." : undefined}
          />
        ) : (
          <ul className="mt-2 space-y-1">
            {role.users.map((user) => (
              <li key={user.id} className="flex items-start justify-between text-sm text-muted-foreground">
                <span>
                  {user.name ?? "(sem nome)"} — {user.email}
                </span>
                <RemoveRoleButton roleId={role.id} userId={user.id} />
              </li>
            ))}
          </ul>
        )}
        {role.assignableUsers.length > 0 && <AssignRoleForm roleId={role.id} assignableUsers={role.assignableUsers} />}
      </div>
    </div>
  );
}
