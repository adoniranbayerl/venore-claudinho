"use client";

import { useActionState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
// Import direto do módulo folha (não do barrel @/plugins/donations) — mesmo motivo de
// birthdays-appearance-form.tsx: client component não pode arrastar código server-only pelos
// handlers reexportados no barrel. Aqui é só tipo (apagado em build), mas mantém o mesmo hábito.
import type { DonationSettings } from "@/plugins/donations/contracts/types";
import { updateDonationSettingsAction, type DonationsSettingsActionState } from "./actions";

const initialState: DonationsSettingsActionState = { error: null };

// Helper só pra não repetir o mesmo <label><Input/></label> ~20 vezes — todo campo de texto de
// donations.settings.ts vira um input aqui (pedido desta sessão: "nenhum texto deve ser
// hardcoded nos widgets"). Campos com necessidade própria (Textarea, maxLength) continuam
// explícitos abaixo, fora deste helper.
function TextField({
  name,
  label,
  defaultValue,
  placeholder,
  hint,
  span2,
  maxLength,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  hint?: ReactNode;
  span2?: boolean;
  maxLength?: number;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm text-muted-foreground", span2 && "sm:col-span-2")}>
      {label}
      <Input name={name} defaultValue={defaultValue} placeholder={placeholder} maxLength={maxLength} />
      {hint && <span className="text-xs text-muted-foreground/56">{hint}</span>}
    </label>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="sm:col-span-2">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function DonationSettingsForm({ settings }: { settings: DonationSettings }) {
  const [state, formAction, pending] = useActionState(updateDonationSettingsAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Configuração de doações salva." });

  return (
    <form action={formAction} className="grid gap-4 rounded-panel border border-border bg-card ui-panel-padding-roomy sm:grid-cols-2">
      <TextField
        name="pixKey"
        label="Chave PIX"
        defaultValue={settings.pixKey}
        placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
        maxLength={77}
        span2
      />
      <TextField name="recipientName" label="Nome do recebedor" defaultValue={settings.recipientName} maxLength={25} />
      <TextField name="recipientCity" label="Cidade do recebedor" defaultValue={settings.recipientCity} maxLength={15} />
      <TextField
        name="suggestedAmounts"
        label="Valores sugeridos (R$, separados por vírgula)"
        defaultValue={settings.suggestedAmounts.join(", ")}
        placeholder="20, 50, 100"
        span2
      />
      <TextField name="title" label="Título da página" defaultValue={settings.title} span2 />

      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:col-span-2">
        Mensagem
        <Textarea name="message" defaultValue={settings.message} rows={3} />
      </label>

      <SectionHeading
        title="Textos no Academy"
        description="Título, texto abaixo do título e botão dos widgets de doação embutidos no catálogo, na página de curso, na barra lateral e no fluxo da aula."
      />

      <TextField name="academyCatalogTitle" label="Título no catálogo" defaultValue={settings.academyCatalogTitle} />
      <TextField name="academyCourseTitle" label="Título na página do curso" defaultValue={settings.academyCourseTitle} />
      <TextField name="academySidebarTitle" label="Título na barra lateral da aula" defaultValue={settings.academySidebarTitle} />
      <TextField name="academyCtaLabel" label="Texto do botão" defaultValue={settings.academyCtaLabel} />
      <TextField
        name="academyTeaserSubtitleWithAmount"
        label="Texto abaixo do título (com valor sugerido)"
        defaultValue={settings.academyTeaserSubtitleWithAmount}
        placeholder="Contribua com a partir de {amount}"
        hint={<>Use {"{amount}"} onde o valor deve aparecer (ex: R$ 5,00).</>}
      />
      <TextField
        name="academyTeaserSubtitleNoAmount"
        label="Texto abaixo do título (sem valor sugerido)"
        defaultValue={settings.academyTeaserSubtitleNoAmount}
      />

      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:col-span-2">
        Texto da etapa de doação na aula
        <Textarea name="academyLessonIntro" defaultValue={settings.academyLessonIntro} rows={2} />
      </label>

      <SectionHeading
        title="Textos do widget"
        description="Botões, placeholder e mensagens de estado do próprio widget de doação — os mesmos em toda superfície onde ele aparece (/donations, block de CMS, Academy)."
      />

      <TextField name="customAmountLabel" label='Botão "valor personalizado"' defaultValue={settings.customAmountLabel} />
      <TextField
        name="customAmountPlaceholder"
        label="Placeholder do campo de valor"
        defaultValue={settings.customAmountPlaceholder}
      />
      <TextField name="customAmountSubmitLabel" label='Botão "gerar código"' defaultValue={settings.customAmountSubmitLabel} />
      <TextField name="customAmountError" label="Erro de valor inválido" defaultValue={settings.customAmountError} span2 />
      <TextField name="qrUpdatedLabel" label="Aviso de QR atualizado" defaultValue={settings.qrUpdatedLabel} span2 />
      <TextField name="freeAmountLabelCompact" label='Rótulo "valor livre" (compacto)' defaultValue={settings.freeAmountLabelCompact} />
      <TextField name="freeAmountLabelFull" label='Rótulo "valor livre" (completo)' defaultValue={settings.freeAmountLabelFull} />
      <TextField name="copiedLabel" label='Botão "copiado"' defaultValue={settings.copiedLabel} />
      <TextField name="copyLabelCompact" label='Botão "copiar" (compacto)' defaultValue={settings.copyLabelCompact} />
      <TextField name="copyLabelFull" label='Botão "copiar" (completo)' defaultValue={settings.copyLabelFull} />
      <TextField name="closeLabel" label='Botão "fechar" (chamada rápida)' defaultValue={settings.closeLabel} />
      <TextField name="loadingLabel" label='Botão "carregando" (chamada rápida)' defaultValue={settings.loadingLabel} />

      <Button type="submit" disabled={pending} className="sm:col-span-2">
        Salvar configuração
      </Button>
    </form>
  );
}
