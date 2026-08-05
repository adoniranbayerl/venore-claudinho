import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserRegistrationStatus } from "@/contexts/auth";
import { signOutAction } from "../actions";

export default async function PendingApprovalPage() {
  const statusResult = await getCurrentUserRegistrationStatus();
  const status = statusResult.success ? statusResult.data : null;

  if (status !== "pending") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-panel border border-border bg-card p-8 text-center shadow-panel">
      <h1 className="text-lg font-semibold text-foreground">Registro aguardando aprovação</h1>
      <p className="text-sm text-muted-foreground">
        Seu cadastro foi recebido e está aguardando aprovação de um administrador. Volte mais tarde para tentar
        entrar novamente.
      </p>
      <div className="flex justify-center gap-4 text-sm">
        <Link href="/" className="text-primary underline">
          Voltar ao site
        </Link>
        {/* Troca "Tentar entrar novamente" (Link pra /login) — sem sentido aqui: o usuário
            pending já está autenticado, então só voltaria pra esta mesma tela. Sair é a ação que
            de fato desbloqueia tentar outra conta (pedido desta sessão). */}
        <form action={signOutAction}>
          <button type="submit" className="text-primary underline">
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
