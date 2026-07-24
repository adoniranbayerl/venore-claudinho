import { redirect } from "next/navigation";
import { getAdminPageData } from "@/platform/admin-shell/get-admin-page-data";
import { getVisibleAdminNavGroups } from "@/platform/admin-shell/admin-nav-groups";
import { AdminNavigation } from "./_components/admin-navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const gate = await getAdminPageData();

  if (!gate.granted && gate.reason === "unauthenticated") {
    redirect("/api/auth/signin");
  }

  if (!gate.granted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-gray-900">Acesso negado</h1>
          <p className="mt-2 text-sm text-gray-600">
            Você não tem permissão para acessar a área administrativa.
          </p>
        </div>
      </div>
    );
  }

  const navGroups = getVisibleAdminNavGroups(gate.actor);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-3">
        <span className="text-sm font-semibold text-gray-900">Admin</span>
      </header>
      <div className="flex flex-1">
        <AdminNavigation groups={navGroups} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
