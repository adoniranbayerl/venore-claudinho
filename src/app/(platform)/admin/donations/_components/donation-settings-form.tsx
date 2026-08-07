"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
// Import direto do módulo folha (não do barrel @/plugins/donations) — mesmo motivo de
// birthdays-appearance-form.tsx: client component não pode arrastar código server-only pelos
// handlers reexportados no barrel. Aqui é só tipo (apagado em build), mas mantém o mesmo hábito.
import type { DonationSettings } from "@/plugins/donations/contracts/types";
import { updateDonationSettingsAction, type DonationsSettingsActionState } from "../actions";

const initialState: DonationsSettingsActionState = { error: null };

export function DonationSettingsForm({ settings }: { settings: DonationSettings }) {
  const [state, formAction, pending] = useActionState(updateDonationSettingsAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Configuração de doações salva." });

  return (
    <form action={formAction} className="grid gap-4 rounded-panel border border-border bg-card ui-panel-padding-roomy sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:col-span-2">
        Chave PIX
        <Input name="pixKey" defaultValue={settings.pixKey} placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória" maxLength={77} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        Nome do recebedor
        <Input name="recipientName" defaultValue={settings.recipientName} maxLength={25} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        Cidade do recebedor
        <Input name="recipientCity" defaultValue={settings.recipientCity} maxLength={15} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:col-span-2">
        Valores sugeridos (R$, separados por vírgula)
        <Input name="suggestedAmounts" defaultValue={settings.suggestedAmounts.join(", ")} placeholder="20, 50, 100" />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:col-span-2">
        Título da página
        <Input name="title" defaultValue={settings.title} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:col-span-2">
        Mensagem
        <Textarea name="message" defaultValue={settings.message} rows={3} />
      </label>

      <div className="sm:col-span-2">
        <h2 className="text-sm font-semibold text-foreground">Textos no Academy</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Título e botão dos widgets de doação embutidos no catálogo, na página de curso, na barra lateral e no
          fluxo da aula.
        </p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        Título no catálogo
        <Input name="academyCatalogTitle" defaultValue={settings.academyCatalogTitle} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        Título na página do curso
        <Input name="academyCourseTitle" defaultValue={settings.academyCourseTitle} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        Título na barra lateral da aula
        <Input name="academySidebarTitle" defaultValue={settings.academySidebarTitle} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        Texto do botão
        <Input name="academyCtaLabel" defaultValue={settings.academyCtaLabel} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:col-span-2">
        Texto da etapa de doação na aula
        <Textarea name="academyLessonIntro" defaultValue={settings.academyLessonIntro} rows={2} />
      </label>

      <Button type="submit" disabled={pending} className="sm:col-span-2">
        Salvar configuração
      </Button>
    </form>
  );
}
