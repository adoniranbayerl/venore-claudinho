import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserRegistrationStatus } from "@/contexts/auth";

export default async function PendingApprovalPage() {
  const statusResult = await getCurrentUserRegistrationStatus();
  const status = statusResult.success ? statusResult.data : null;

  if (status !== "pending") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-panel border border-border-subtle bg-card p-8 text-center shadow-panel">
      <h1 className="text-lg font-semibold text-text-primary">Registro aguardando aprovação</h1>
      <p className="text-sm text-text-secondary">
        Seu cadastro foi recebido e está aguardando aprovação de um administrador. Volte mais tarde para tentar
        entrar novamente.
      </p>
      <div className="flex justify-center gap-4 text-sm">
        <Link href="/" className="text-text-accent underline">
          Voltar ao site
        </Link>
        <Link href="/login" className="text-text-accent underline">
          Tentar entrar novamente
        </Link>
      </div>
    </div>
  );
}
