import { getMenuByLocation } from "@/contexts/cms";
import { getCmsPageData } from "@/platform/admin-shell/get-cms-page-data";
import { AddMenuItemForm } from "./_components/add-menu-item-form";
import { MenuItemRow } from "./_components/menu-item-row";

const MAIN_NAV_LOCATION = "main-nav";

export default async function MenusAdminPage() {
  const gate = await getCmsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Acesso negado</h1>
        <p className="mt-2 text-sm text-gray-600">Você não tem permissão para gerenciar o CMS.</p>
      </div>
    );
  }

  const canManageMenus = gate.actor.isSuperadmin || gate.actor.permissions.includes("cms.menus.manage");
  if (!canManageMenus) {
    return (
      <div className="rounded border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Acesso negado</h1>
        <p className="mt-2 text-sm text-gray-600">Você não tem permissão para gerenciar menus do CMS.</p>
      </div>
    );
  }

  const menuResult = await getMenuByLocation({ location: MAIN_NAV_LOCATION });
  if (!menuResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar o menu: {menuResult.error.message}</p>;
  }

  const items = menuResult.data.items;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Menus</h1>
        <p className="mt-1 text-sm text-gray-600">Gerencie os itens do menu principal (main-nav).</p>
      </div>

      <section className="rounded border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900">Main nav</h2>
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <MenuItemRow
              key={item.id}
              menuItemId={item.id}
              label={item.label}
              href={item.href}
              isFirst={index === 0}
              isLast={index === items.length - 1}
            />
          ))}
          {items.length === 0 && <li className="text-sm text-gray-500">Nenhum item cadastrado.</li>}
        </ul>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <AddMenuItemForm />
        </div>
      </section>
    </div>
  );
}
