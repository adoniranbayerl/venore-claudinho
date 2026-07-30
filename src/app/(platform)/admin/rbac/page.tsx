import { Users2 } from "lucide-react";
import { listUsers } from "@/contexts/auth";
import { listRoles, listUsersByRole } from "@/contexts/rbac";
import { getRbacPageData } from "@/platform/admin-shell/get-rbac-page-data";
import { EmptyState } from "@/components/empty-state";
import { CreateRoleForm } from "./_components/create-role-form";
import { UpdatePermissionsForm } from "./_components/update-permissions-form";
import { AssignRoleForm } from "./_components/assign-role-form";
import { RemoveRoleButton } from "./_components/remove-role-button";

export default async function RbacAdminPage() {
  const gate = await getRbacPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar papéis e permissões.</p>
      </div>
    );
  }

  const [rolesResult, usersResult] = await Promise.all([listRoles(), listUsers()]);

  if (!rolesResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar os papéis agora. Tente recarregar a página.</p>;
  }
  if (!usersResult.success) {
    return <p className="text-sm text-destructive">Não foi possível carregar os usuários agora. Tente recarregar a página.</p>;
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
        <h1 className="text-xl font-semibold text-foreground">Papéis e permissões</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie papéis personalizados, ajuste as permissões de cada um e atribua ou remova papéis de usuários.
        </p>
      </div>

      <section className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <h2 className="text-sm font-semibold text-foreground">Criar papel personalizado</h2>
        <CreateRoleForm />
      </section>

      <section className="space-y-4">
        {roles.map((role) => {
          const roleUsers = usersByRoleId.get(role.id) ?? [];
          const isSuperadmin = role.key === "superadmin";
          const assignableUsers = allUsers.filter((user) => !roleUsers.some((roleUser) => roleUser.id === user.id));

          return (
            <div key={role.id} className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-foreground">{role.name}</h3>
                {role.isSystem && <span className="text-xs text-muted-foreground/56">papel de sistema</span>}
              </div>

              <div className="mt-3">
                <h4 className="text-xs font-medium text-muted-foreground">Permissões</h4>
                {isSuperadmin ? (
                  <p className="mt-1 text-xs text-muted-foreground/56">
                    Acesso irrestrito por definição — as permissões do superadmin não podem ser editadas.
                  </p>
                ) : (
                  <UpdatePermissionsForm roleId={role.id} selectedKeys={role.permissionKeys} />
                )}
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-medium text-muted-foreground">Usuários com este papel</h4>
                {roleUsers.length === 0 ? (
                  <EmptyState
                    className="mt-2"
                    icon={<Users2 className="size-6" strokeWidth={1.5} />}
                    title="Ninguém tem este papel ainda"
                    description={assignableUsers.length > 0 ? "Atribua para o primeiro usuário logo abaixo." : undefined}
                  />
                ) : (
                  <ul className="mt-2 space-y-1">
                    {roleUsers.map((user) => (
                      <li key={user.id} className="flex items-start justify-between text-sm text-muted-foreground">
                        <span>
                          {user.name ?? "(sem nome)"} — {user.email}
                        </span>
                        <RemoveRoleButton roleId={role.id} userId={user.id} />
                      </li>
                    ))}
                  </ul>
                )}

                {assignableUsers.length > 0 && <AssignRoleForm roleId={role.id} assignableUsers={assignableUsers} />}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
