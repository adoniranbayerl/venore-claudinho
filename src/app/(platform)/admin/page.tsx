import { getAdminPageData } from "@/platform/admin-shell/get-admin-page-data";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/(auth)/actions";

export default async function AdminPage() {
  const gate = await getAdminPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para acessar a área administrativa.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Bem-vindo ao painel administrativo</h1>
          <p className="mt-2 text-sm text-muted-foreground">Escolha uma área no menu ao lado.</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sair
          </Button>
        </form>
      </div>
    </div>
  );
}
