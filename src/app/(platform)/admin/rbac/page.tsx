import { listUsers } from "@/contexts/auth";
import { listRoles, listUsersByRole, RBAC_PERMISSIONS } from "@/contexts/rbac";
import { getRbacPageData } from "@/platform/admin-shell/get-rbac-page-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RemoveRoleButton } from "./_components/remove-role-button";
import { assignRoleAction, createRoleAction, updateRolePermissionsAction } from "./actions";

export default async function RbacAdminPage() {
  const gate = await getRbacPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar papéis e permissions.</p>
      </div>
    );
  }

  const [rolesResult, usersResult] = await Promise.all([listRoles(), listUsers()]);

  if (!rolesResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar papéis: {rolesResult.error.message}</p>;
  }
  if (!usersResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar usuários: {usersResult.error.message}</p>;
  }

  const roles = rolesResult.data;
  const allUsers = usersResult.data;

  const usersByRole = await Promise.all(
    roles.map(async (role) => {
      const result = await listUsersByRole({ roleId: role.id });
      return { roleId: role.id, users: result.success ? result.data : [] };
    }),
  );
  const usersByRoleId = new Map(usersByRole.map((entry) => [entry.roleId, entry.users]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Papéis e permissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie papéis customizados, ajuste as permissions de cada um e atribua ou remova papéis de usuários.
        </p>
      </div>

      <section className="rounded border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Criar papel customizado</h2>
        <form action={createRoleAction} className="mt-3 space-y-3">
          <div className="flex gap-3">
            <input
              name="key"
              placeholder="chave (kebab-case, ex: editor-restrito)"
              required
              className="flex-1 rounded border border-border px-2 py-1 text-sm"
            />
            <input
              name="name"
              placeholder="nome de exibição"
              required
              className="flex-1 rounded border border-border px-2 py-1 text-sm"
            />
          </div>
          <PermissionCheckboxes />
          <button type="submit" className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
            Criar papel
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {roles.map((role) => {
          const roleUsers = usersByRoleId.get(role.id) ?? [];
          const isSuperadmin = role.key === "superadmin";
          const assignableUsers = allUsers.filter((user) => !roleUsers.some((roleUser) => roleUser.id === user.id));

          return (
            <div key={role.id} className="rounded border border-border bg-card p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {role.name} <span className="font-normal text-muted-foreground/56">({role.key})</span>
                </h3>
                {role.isSystem && <span className="text-xs text-muted-foreground/56">papel de sistema</span>}
              </div>

              <div className="mt-3">
                <h4 className="text-xs font-medium text-muted-foreground">Permissions</h4>
                {isSuperadmin ? (
                  <p className="mt-1 text-xs text-muted-foreground/56">
                    Acesso irrestrito por definição — as permissions do superadmin não podem ser editadas.
                  </p>
                ) : (
                  <form action={updateRolePermissionsAction} className="mt-2 space-y-2">
                    <input type="hidden" name="roleId" value={role.id} />
                    <PermissionCheckboxes selectedKeys={role.permissionKeys} />
                    <button type="submit" className="rounded border border-border px-2 py-1 text-xs font-medium text-foreground">
                      Salvar permissions
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-medium text-muted-foreground">Usuários com este papel</h4>
                <ul className="mt-2 space-y-1">
                  {roleUsers.map((user) => (
                    <li key={user.id} className="flex items-start justify-between text-sm text-muted-foreground">
                      <span>
                        {user.name ?? "(sem nome)"} — {user.email}
                      </span>
                      <RemoveRoleButton roleId={role.id} userId={user.id} />
                    </li>
                  ))}
                  {roleUsers.length === 0 && <li className="text-sm text-muted-foreground/56">Nenhum usuário com este papel.</li>}
                </ul>

                {assignableUsers.length > 0 && (
                  <form action={assignRoleAction} className="mt-3 flex items-center gap-2">
                    <input type="hidden" name="roleId" value={role.id} />
                    <Select name="userId" required>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name ?? user.email} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button type="submit" className="rounded border border-border px-2 py-1 text-xs font-medium text-foreground">
                      Atribuir
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function PermissionCheckboxes({ selectedKeys = [] as string[] }: { selectedKeys?: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {RBAC_PERMISSIONS.map((permission) => (
        <label key={permission.key} className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            name="permissionKeys"
            value={permission.key}
            defaultChecked={selectedKeys.includes(permission.key)}
          />
          {permission.label}
        </label>
      ))}
    </div>
  );
}
