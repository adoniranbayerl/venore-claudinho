import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/contexts/auth";
import { superadminExists } from "@/contexts/rbac";
import { Button } from "@/components/ui/button";
import { bootstrapSuperadminAction } from "../actions";

export default async function SetupPage() {
  const existsResult = await superadminExists();
  if (existsResult.success && existsResult.data) {
    redirect("/post-login");
  }

  const currentUser = await getCurrentUser();
  const user = currentUser.success ? currentUser.data : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-foreground">
      <div className="w-full max-w-sm space-y-6 rounded-panel border border-border bg-card p-8 shadow-panel text-center">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Configuração inicial</h1>
          <p className="text-sm text-muted-foreground">
            Nenhum superadmin foi configurado ainda. {user ? "Torne-se o superadmin inicial abaixo." : "Entre para continuar."}
          </p>
        </div>

        {user ? (
          <form action={bootstrapSuperadminAction}>
            <Button type="submit" className="w-full">
              Tornar-me superadmin
            </Button>
          </form>
        ) : (
          <Button asChild className="w-full">
            <Link href="/login">Entrar</Link>
          </Button>
        )}
      </div>
    </main>
  );
}
