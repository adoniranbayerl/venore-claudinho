"use client";

import { useEffect, useId, useRef } from "react";
import { Globe2, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Mesmo Switch do shadcn usado no Nightcity/Kazordoon. <label htmlFor={id}> aponta explicitamente
// só pro Switch (não <label> envolvendo ícone+Switch por associação implícita) e `pendingRef`
// ignora uma segunda chamada de `onCheckedChange` antes do servidor confirmar a troca anterior —
// mesma correção de bug já aplicada nos outros dois temas (o Switch do Radix renderiza um <button>
// e um <input type="checkbox"> oculto como irmãos; dois elementos "labelable" na mesma label
// implícita não garante qual dos dois recebe o clique sintetizado).
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
    <form ref={formRef} action={onToggleNavMode} className="w-full px-1">
      <div className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5">
        {isAdmin ? <ShieldCheck className="size-4 shrink-0 text-accent" aria-hidden="true" /> : <Globe2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        <label htmlFor={id} className="flex-1 cursor-pointer truncate text-sm font-medium text-foreground">
          {isAdmin ? "Admin" : "Site"}
        </label>
        <Switch
          id={id}
          checked={isAdmin}
          onCheckedChange={handleChange}
          aria-label={isAdmin ? "Sair do admin" : "Ir para a área administrativa"}
        />
      </div>
    </form>
  );
}
