import { listUsers } from "@/contexts/auth";
import { listRoles, listUsersByRole, RBAC_PERMISSIONS } from "@/contexts/rbac";
import { getRbacPageData } from "@/platform/admin-shell/get-rbac-page-data";
import { RemoveRoleButton } from "./_components/remove-role-button";
import { assignRoleAction, createRoleAction, updateRolePermissionsAction } from "./actions";

export default async function RbacAdminPage() {
  const gate = await getRbacPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Acesso negado</h1>
        <p className="mt-2 text-sm text-gray-600">Você não tem permissão para gerenciar papéis e permissions.</p>
      </div>
    );
  }

  const [rolesResult, usersResult] = await Promise.all([listRoles(), listUsers()]);

  if (!rolesResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar papéis: {rolesResult.error.message}</p>;
  }
  if (!usersResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar usuários: {usersResult.error.message}</p>;
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
        <h1 className="text-xl font-semibold text-gray-900">Papéis e permissions</h1>
        <p className="mt-1 text-sm text-gray-600">
          Crie papéis customizados, ajuste as permissions de cada um e atribua ou remova papéis de usuários.
        </p>
      </div>

      <section className="rounded border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900">Criar papel customizado</h2>
        <form action={createRoleAction} className="mt-3 space-y-3">
          <div className="flex gap-3">
            <input
              name="key"
              placeholder="chave (kebab-case, ex: editor-restrito)"
              required
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            />
            <input
              name="name"
              placeholder="nome de exibição"
              required
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
          <PermissionCheckboxes />
          <button type="submit" className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white">
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
            <div key={role.id} className="rounded border border-gray-200 bg-white p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  {role.name} <span className="font-normal text-gray-500">({role.key})</span>
                </h3>
                {role.isSystem && <span className="text-xs text-gray-500">papel de sistema</span>}
              </div>

              <div className="mt-3">
                <h4 className="text-xs font-medium text-gray-700">Permissions</h4>
                {isSuperadmin ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Acesso irrestrito por definição — as permissions do superadmin não podem ser editadas.
                  </p>
                ) : (
                  <form action={updateRolePermissionsAction} className="mt-2 space-y-2">
                    <input type="hidden" name="roleId" value={role.id} />
                    <PermissionCheckboxes selectedKeys={role.permissionKeys} />
                    <button type="submit" className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-900">
                      Salvar permissions
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-700">Usuários com este papel</h4>
                <ul className="mt-2 space-y-1">
                  {roleUsers.map((user) => (
                    <li key={user.id} className="flex items-start justify-between text-sm text-gray-700">
                      <span>
                        {user.name ?? "(sem nome)"} — {user.email}
                      </span>
                      <RemoveRoleButton roleId={role.id} userId={user.id} />
                    </li>
                  ))}
                  {roleUsers.length === 0 && <li className="text-sm text-gray-500">Nenhum usuário com este papel.</li>}
                </ul>

                {assignableUsers.length > 0 && (
                  <form action={assignRoleAction} className="mt-3 flex items-center gap-2">
                    <input type="hidden" name="roleId" value={role.id} />
                    <select name="userId" required className="rounded border border-gray-300 px-2 py-1 text-sm">
                      {assignableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name ?? user.email} ({user.email})
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-900">
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
        <label key={permission.key} className="flex items-center gap-2 text-xs text-gray-700">
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
