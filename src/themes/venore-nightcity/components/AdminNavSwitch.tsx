"use client";

import { useEffect, useId, useRef } from "react";
import { Globe2, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Switch do shadcn (radix-ui) em vez do pill de dois botões / botão único usado antes — troca
// site/admin continua sendo uma server action (`onToggleNavMode`, sem estado de "modo X" a
// escolher, só inverte o atual), então o Switch precisa de um form em volta: ele não tem
// type="submit" próprio, então `onCheckedChange` dispara `requestSubmit()` no form via ref assim
// que o usuário arrasta/clica. `checked` reflete `isAdmin` (controlado — o servidor é a fonte de
// verdade do modo atual, mesmo padrão de `collapsed` no rail).
//
// Duas correções desta sessão (bug: clicar pra ir pro admin "voltava" pro main — a troca
// acontecia duas vezes e se cancelava):
// 1. <label htmlFor={id}> aponta explicitamente só pro Switch (id={id}), em vez de <label>
//    envolvendo ícone+Switch por associação implícita. O Switch do Radix renderiza um <button> E
//    um <input type="checkbox"> oculto (bubble input, pra compatibilidade com <form> nativo) como
//    IRMÃOS — dois elementos "labelable" dentro do mesmo <label> implícito é undefined behavior
//    o suficiente pra não confiar em qual dos dois recebe o clique sintetizado.
// 2. `pendingRef` ignora uma segunda chamada de `onCheckedChange` antes do servidor confirmar a
//    troca anterior (reset só quando `isAdmin` muda, ou seja, quando o toggle anterior realmente
//    resolveu) — belt-and-suspenders contra qualquer disparo duplicado, venha de onde vier.
export function AdminNavSwitch({
  isAdmin,
  collapsed,
  onToggleNavMode,
}: {
  isAdmin: boolean;
  collapsed: boolean;
  onToggleNavMode: () => Promise<void>;
}) {
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

  const ariaLabel = isAdmin ? "Sair do admin" : "Ir para a área administrativa";
  const icon = isAdmin ? (
    <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
  ) : (
    <Globe2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
  );

  if (collapsed) {
    return (
      <form ref={formRef} action={onToggleNavMode} className="w-full px-2">
        <div className="flex w-full flex-col items-center gap-1.5 rounded-sm border border-border bg-muted/50 py-2">
          <label htmlFor={id} className="cursor-pointer">
            {icon}
          </label>
          <Switch id={id} size="sm" checked={isAdmin} onCheckedChange={handleChange} aria-label={ariaLabel} />
        </div>
      </form>
    );
  }

  return (
    <form ref={formRef} action={onToggleNavMode} className="w-full px-2">
      <div className="flex w-full items-center gap-2.5 rounded-sm border border-border bg-muted/50 px-3 py-2">
        <label htmlFor={id} className="flex flex-1 cursor-pointer items-center gap-2.5">
          {icon}
          <span className="flex-1 truncate text-xs font-medium uppercase tracking-caps text-foreground">{isAdmin ? "Admin" : "Site"}</span>
        </label>
        <Switch id={id} checked={isAdmin} onCheckedChange={handleChange} aria-label={ariaLabel} />
      </div>
    </form>
  );
}
