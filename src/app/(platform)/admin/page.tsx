import { getAdminPageData } from "@/platform/admin-shell/get-admin-page-data";

export default async function AdminPage() {
  const gate = await getAdminPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Acesso negado</h1>
        <p className="mt-2 text-sm text-gray-600">Você não tem permissão para acessar a área administrativa.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Bem-vindo ao painel administrativo</h1>
      <p className="mt-2 text-sm text-gray-600">Escolha uma área no menu ao lado.</p>
    </div>
  );
}
