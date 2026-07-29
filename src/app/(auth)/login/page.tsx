import { listAvailableAuthProviders } from "@/contexts/auth";
import { superadminExists } from "@/contexts/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithDevCredentialsAction, signInWithProviderAction } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const providers = listAvailableAuthProviders();
  const oauthProviders = providers.filter((provider) => provider.kind === "oauth" && provider.enabled);
  const devCredentials = providers.find((provider) => provider.kind === "development" && provider.enabled);

  const superadminExistsResult = await superadminExists();
  const showBootstrapNotice = superadminExistsResult.success && !superadminExistsResult.data;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-foreground">
      <div className="w-full max-w-sm space-y-6 rounded-panel border border-border bg-card p-8 shadow-panel">
        <div className="space-y-1 text-center">
          <h1 className="text-lg font-semibold">Entrar</h1>
          <p className="text-sm text-muted-foreground">Acesse com uma das opções abaixo.</p>
        </div>

        {showBootstrapNotice ? (
          <p className="rounded-control border border-border bg-accent/14 px-3 py-2 text-xs text-foreground">
            Nenhum superadmin foi configurado ainda. O próximo login se torna o superadmin inicial.
          </p>
        ) : null}

        {error === "invalid-credentials" ? (
          <p className="rounded-control border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Usuário ou senha inválidos.
          </p>
        ) : null}

        <div className="space-y-2">
          {oauthProviders.map((provider) => (
            <form key={provider.key} action={signInWithProviderAction}>
              <input type="hidden" name="provider" value={provider.key} />
              <Button type="submit" variant="outline" className="w-full gap-2">
                {provider.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={provider.iconUrl} alt="" aria-hidden="true" className="h-4 w-4" />
                ) : null}
                Entrar com {provider.label}
              </Button>
            </form>
          ))}
        </div>

        {devCredentials ? (
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground">Credenciais de desenvolvimento</summary>
            <form action={signInWithDevCredentialsAction} className="mt-3 space-y-2">
              <Input name="username" placeholder="Usuário" required />
              <Input name="password" type="password" placeholder="Senha" required />
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
          </details>
        ) : null}
      </div>
    </main>
  );
}
