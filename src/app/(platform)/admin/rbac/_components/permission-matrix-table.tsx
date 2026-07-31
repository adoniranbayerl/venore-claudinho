"use client";

import { Fragment, useMemo, useState } from "react";
import { CheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PermissionGroupView } from "./permission-catalog";

export type MatrixRole = { id: string; name: string };

export function PermissionMatrixTable({
  roles,
  groups,
  permissionKeysByRoleId,
}: {
  roles: MatrixRole[];
  groups: PermissionGroupView[];
  permissionKeysByRoleId: Map<string, string[]>;
}) {
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groups;
    return groups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (permission) =>
            permission.title.toLowerCase().includes(term) || permission.description.toLowerCase().includes(term),
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [groups, search]);

  return (
    <div className="rounded-panel border border-border">
      <div className="border-b border-border p-2">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome da permissão..."
          className="h-8 max-w-sm"
        />
      </div>
      <div className="max-h-128 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead className="min-w-56">Permissão</TableHead>
              {roles.map((role) => (
                <TableHead key={role.id} className="text-center">
                  {role.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.map((group) => (
              <Fragment key={group.id}>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableCell colSpan={roles.length + 1} className="text-xs font-semibold text-foreground">
                    {group.label}
                  </TableCell>
                </TableRow>
                {group.permissions.map((permission) => (
                  <TableRow key={permission.key}>
                    <TableCell>
                      <div className="flex flex-col whitespace-normal">
                        <span className="text-sm text-foreground">{permission.title}</span>
                        <span className="text-xs text-muted-foreground">{permission.description}</span>
                      </div>
                    </TableCell>
                    {roles.map((role) => (
                      <TableCell key={role.id} className="text-center">
                        {permissionKeysByRoleId.get(role.id)?.includes(permission.key) ? (
                          <CheckIcon className="mx-auto size-4 text-primary" strokeWidth={2.5} />
                        ) : (
                          <span className="text-muted-foreground/56">—</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
