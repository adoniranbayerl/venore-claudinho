import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-panel border border-border-subtle bg-card p-8 text-center shadow-panel">
      <h1 className="text-lg font-semibold text-text-primary">Acesso não autorizado</h1>
      <p className="text-sm text-text-secondary">Você não tem permissão para acessar esta página.</p>
      <Link href="/login" className="text-sm text-text-accent underline">
        Ir para o login
      </Link>
    </div>
  );
}
