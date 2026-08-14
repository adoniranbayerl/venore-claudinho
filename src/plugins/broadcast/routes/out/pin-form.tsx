"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitOutputPinAction, type SubmitOutputPinState } from "./actions";

const initialState: SubmitOutputPinState = { error: null };

// Tela de PIN — mesma estética "canvas preto" da view de saída (ver output-canvas.tsx), cores em
// hex via style (não className) de propósito: esta rota fica fora da shell/tema do site (ver
// comentário em page.tsx), então não usa o vocabulário de cor shadcn — mesmo racional já
// documentado em layer-renderer.tsx (TV_ACCENT_COLOR etc).
export function OutputPinGate({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(submitOutputPinAction, initialState);

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#000000" }}>
      <form
        action={formAction}
        className="flex w-full max-w-xs flex-col gap-4 rounded-lg p-6"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
      >
        <input type="hidden" name="token" value={token} />
        <div className="space-y-1 text-center">
          <p className="text-lg font-semibold" style={{ color: "#FFFFFF" }}>PIN de acesso</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Esta tela está protegida. Digite o PIN pra continuar.</p>
        </div>
        <Input
          name="pin"
          type="password"
          inputMode="numeric"
          autoFocus
          placeholder="PIN"
          className="text-center text-lg tracking-widest"
          style={{ background: "rgba(255,255,255,0.08)", color: "#FFFFFF", borderColor: "rgba(255,255,255,0.2)" }}
        />
        {state.error && (
          <p className="text-center text-sm" style={{ color: "#F87171" }}>
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Verificando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
