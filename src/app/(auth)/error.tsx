"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center text-text-primary">
      <div className="w-full max-w-sm space-y-4 rounded-panel border border-border-subtle bg-card p-8 shadow-panel">
        <h1 className="text-lg font-semibold">Algo deu errado ao autenticar</h1>
        <p className="text-sm text-text-secondary">{error.message || "Tente novamente em instantes."}</p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={reset}>
            Tentar novamente
          </Button>
          <Button asChild>
            <Link href="/login">Voltar ao login</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
