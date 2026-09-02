import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { RetryButton } from "./retry-button";

// Servida pelo service worker (public/sw.js) quando uma navegação falha sem rede. Precisa ser
// autossuficiente — nada de dados de sessão/tema em runtime; o HTML é renderizado e cacheado no
// install do SW. Fora do route group (platform) de propósito: sem shell, sem gate.
export const metadata: Metadata = { title: "Sem conexão" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <span className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <WifiOff className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Você está sem conexão</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Não deu para carregar esta página. As aulas que você já abriu online continuam acessíveis pelo
          histórico do navegador; para o resto, é preciso reconectar.
        </p>
      </div>
      <RetryButton />
    </main>
  );
}
