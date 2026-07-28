import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-panel border border-border bg-card p-8 text-center shadow-panel">
      <h1 className="text-lg font-semibold text-foreground">Acesso não autorizado</h1>
      <p className="text-sm text-muted-foreground">Você não tem permissão para acessar esta página.</p>
      <Link href="/login" className="text-sm text-primary underline">
        Ir para o login
      </Link>
    </div>
  );
}
