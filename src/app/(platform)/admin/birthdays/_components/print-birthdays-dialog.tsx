"use client";

import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Import direto do módulo folha (não do barrel @/plugins/birthdays) — mesmo motivo de
// birthday-fields.tsx: este componente roda no browser e o barrel reexporta handlers que
// arrastam @/infrastructure/database/client (pg). build-birthday-pdf-html.ts é puro (sem banco),
// então o caminho direto é seguro.
import { MONTH_LABELS } from "@/plugins/birthdays/shared/months";
import type { BirthdayAdminView } from "@/plugins/birthdays/features/list-birthdays/types";
import type { BirthdayAppearanceSettings } from "@/plugins/birthdays/shared/appearance";
import { buildBirthdayPdfHtml, type PrintBrandMode } from "@/plugins/birthdays/features/print-birthdays/build-birthday-pdf-html";

const ALL_LOCALITIES_KEY = "__all__";

export type PrintBirthdaysBrand = {
  mode: PrintBrandMode;
  logoUrl: string;
  name: string;
  color: string;
};

async function resolveAssetAsDataUrl(assetUrl: string) {
  try {
    const response = await fetch(assetUrl, { cache: "force-cache" });
    if (!response.ok) {
      throw new Error(`Asset responded with ${response.status}.`);
    }

    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }
        reject(new Error("Asset conversion returned an invalid payload."));
      };
      reader.onerror = () => reject(reader.error ?? new Error("Asset conversion failed."));
      reader.readAsDataURL(blob);
    });

    return dataUrl;
  } catch {
    return assetUrl;
  }
}

async function waitForPrintFrameAssets(iframe: HTMLIFrameElement, missingMessage: string) {
  const iframeWindow = iframe.contentWindow;
  const iframeDocument = iframe.contentDocument;

  if (!iframeWindow || !iframeDocument) {
    throw new Error(missingMessage);
  }

  if ("fonts" in iframeDocument && iframeDocument.fonts) {
    await iframeDocument.fonts.ready;
  }

  const images = Array.from(iframeDocument.images);
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );

  await new Promise<void>((resolve) => {
    iframeWindow.requestAnimationFrame(() => resolve());
  });
}

export function PrintBirthdaysDialog({
  birthdays,
  appearance,
  brand,
  giftSvgMarkup,
}: {
  birthdays: BirthdayAdminView[];
  appearance: BirthdayAppearanceSettings;
  brand: PrintBirthdaysBrand;
  giftSvgMarkup: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedLocality, setSelectedLocality] = useState<string>(ALL_LOCALITIES_KEY);
  const [isGenerating, setIsGenerating] = useState(false);

  const monthOptions = useMemo(
    () =>
      Object.entries(MONTH_LABELS)
        .map(([month, label]) => ({ month: Number(month), label }))
        .sort((a, b) => a.month - b.month),
    [],
  );

  // Sem catálogo de localidades no venore-claudinho (diferente do fem-colaborador): derivamos as
  // opções direto da lista de aniversariantes já carregada na página, em vez de criar uma feature
  // nova só para isto.
  const localityOptions = useMemo(
    () => Array.from(new Set(birthdays.map((birthday) => birthday.locality).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    ),
    [birthdays],
  );

  const birthdaysForMonth = useMemo(
    () =>
      birthdays.filter(
        (birthday) =>
          birthday.month === selectedMonth &&
          (selectedLocality === ALL_LOCALITIES_KEY || birthday.locality === selectedLocality),
      ),
    [birthdays, selectedMonth, selectedLocality],
  );

  const handlePrintPdf = async () => {
    setIsGenerating(true);
    try {
      const monthLabel = `${MONTH_LABELS[selectedMonth]?.toUpperCase() ?? selectedMonth} - ${new Date().getFullYear()}`;
      const resolvedBrandAssetUrl = new URL(brand.logoUrl || "/brand/brand-logo.svg", window.location.origin).toString();
      const brandAssetDataUrl = await resolveAssetAsDataUrl(resolvedBrandAssetUrl);

      const html = buildBirthdayPdfHtml({
        birthdays: birthdaysForMonth.map((birthday) => ({
          id: birthday.id,
          fullName: birthday.fullName,
          role: birthday.role,
          day: birthday.day,
        })),
        monthLabel,
        appearance,
        brandMode: brand.mode,
        brandAssetUrl: brandAssetDataUrl,
        brandName: brand.name,
        brandColor: brand.color,
        giftSvgMarkup,
      });

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.opacity = "0";
      iframe.style.pointerEvents = "none";
      iframe.style.border = "0";
      let hasStartedPrint = false;

      const cleanup = () => {
        window.setTimeout(() => {
          iframe.remove();
          setIsGenerating(false);
        }, 300);
      };

      iframe.onload = async () => {
        if (hasStartedPrint) {
          return;
        }
        hasStartedPrint = true;

        try {
          const targetWindow = iframe.contentWindow;
          if (!targetWindow) {
            throw new Error("Não foi possível abrir a janela de impressão.");
          }

          await waitForPrintFrameAssets(iframe, "Não foi possível abrir a janela de impressão.");
          targetWindow.onafterprint = cleanup;
          targetWindow.focus();
          window.setTimeout(() => {
            try {
              targetWindow.print();
            } catch (error) {
              console.error("Birthdays PDF print failed during print()", error);
              toast.error("Não foi possível iniciar a impressão.");
              cleanup();
            }
          }, 150);
        } catch (error) {
          console.error("Birthdays PDF print setup failed", error);
          toast.error(error instanceof Error ? error.message : "Falha ao preparar a impressão.");
          cleanup();
        }
      };

      document.body.appendChild(iframe);

      const iframeDocument = iframe.contentDocument;
      if (!iframeDocument) {
        throw new Error("Documento de impressão indisponível.");
      }

      iframeDocument.open();
      iframeDocument.write(html);
      iframeDocument.close();
    } catch (error) {
      console.error("Birthdays PDF generation failed", error);
      toast.error(error instanceof Error ? error.message : "Falha ao gerar o PDF.");
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Printer className="size-4" />
        Imprimir PDF
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Imprimir aniversariantes</DialogTitle>
          <DialogDescription>Selecione o mês e gere o PDF no layout institucional (uma página A4).</DialogDescription>
        </DialogHeader>

        <label className="flex flex-col gap-1 text-sm text-muted-foreground">
          Mês
          <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="selecione..." />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(({ month, label }) => (
                <SelectItem key={month} value={String(month)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {localityOptions.length > 0 && (
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Localidade
            <Select value={selectedLocality} onValueChange={setSelectedLocality}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_LOCALITIES_KEY}>Todas as localidades</SelectItem>
                {localityOptions.map((locality) => (
                  <SelectItem key={locality} value={locality}>
                    {locality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}

        <p className="text-sm text-muted-foreground">
          {birthdaysForMonth.length === 0
            ? "Nenhum aniversariante neste mês."
            : `${birthdaysForMonth.length} aniversariante(s) neste mês.`}
        </p>

        <DialogFooter>
          <Button onClick={handlePrintPdf} disabled={isGenerating}>
            <Printer className="size-4" />
            {isGenerating ? "Gerando..." : "Gerar PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
