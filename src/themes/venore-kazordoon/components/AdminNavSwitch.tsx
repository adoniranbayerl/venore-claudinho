"use client";

import { useEffect, useId, useRef } from "react";
import { Globe2, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Mesmo Switch do shadcn usado no Nightcity (componente compartilhado em components/ui/), mas
// sem variante collapsed — a barra horizontal deste tema não tem estado colapsado, então é só uma
// label + Switch. Continua uma server action por trás (`onToggleNavMode`), então precisa de um
// form + requestSubmit via ref (Switch não tem type="submit" próprio).
//
// <label htmlFor={id}> aponta explicitamente só pro Switch (id={id}), não <label> envolvendo
// ícone+Switch por associação implícita — o Switch do Radix renderiza um <button> E um
// <input type="checkbox"> oculto (bubble input, pra compatibilidade com <form> nativo) como
// irmãos, e dois elementos "labelable" dentro do mesmo <label> implícito é undefined behavior o
// suficiente pra não confiar em qual dos dois recebe o clique sintetizado (bug corrigido nesta
// sessão: clicar pra ir pro admin "voltava" pro main — a troca disparava duas vezes e se
// cancelava). `pendingRef` é o cinto e suspensório: ignora uma segunda chamada de
// `onCheckedChange` antes do servidor confirmar a troca anterior.
export function AdminNavSwitch({ isAdmin, onToggleNavMode }: { isAdmin: boolean; onToggleNavMode: () => Promise<void> }) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const pendingRef = useRef(false);

  useEffect(() => {
    pendingRef.current = false;
  }, [isAdmin]);

  function handleChange() {
    if (pendingRef.current) return;
    pendingRef.current = true;
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={onToggleNavMode} className="shrink-0 py-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {isAdmin ? <ShieldCheck className="size-3.5 shrink-0 text-accent" aria-hidden="true" /> : <Globe2 className="size-3.5 shrink-0" aria-hidden="true" />}
        <label htmlFor={id} className="hidden cursor-pointer sm:inline">
          {isAdmin ? "Admin" : "Site"}
        </label>
        <Switch id={id} size="sm" checked={isAdmin} onCheckedChange={handleChange} aria-label={isAdmin ? "Sair do admin" : "Ir para a área administrativa"} />
      </div>
    </form>
  );
}
