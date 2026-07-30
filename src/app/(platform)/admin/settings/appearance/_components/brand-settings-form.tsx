"use client";

import { useActionState, useState } from "react";
import { MediaPickerField } from "@/components/media-picker-field";
import { PlatformBrand } from "@/themes/venore-slime/components/PlatformBrand";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import type { HeaderBrandMode, HeaderBrandPosition } from "@/contexts/themes";
import type { BrandConfig } from "@/platform/brand/get-brand-config";
import type { BrandMediaSelections } from "@/platform/brand/get-brand-media-selections";
import { updateBrandSettingsAction, type BrandSettingsActionState } from "../actions";

const initialState: BrandSettingsActionState = { error: null };

const BRAND_MODE_LABEL: Record<HeaderBrandMode, string> = {
  text: "Somente texto",
  svg: "Imagem vetorial (SVG)",
  png: "Imagem (PNG)",
};

export function BrandSettingsForm({ brand, media }: { brand: BrandConfig; media: BrandMediaSelections }) {
  const [state, formAction, pending] = useActionState(updateBrandSettingsAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Aparência salva." });

  // Estado local só pra alimentar o preview ao vivo — o valor de verdade que é salvo continua
  // vindo do FormData no submit (inputs não controlados, exceto pelo espelho abaixo).
  const [siteName, setSiteName] = useState(brand.siteName);
  const [mode, setMode] = useState<HeaderBrandMode>(brand.mode);
  const [position, setPosition] = useState<HeaderBrandPosition>(brand.position);
  const [size, setSize] = useState(brand.size);
  const [scrolledSize, setScrolledSize] = useState(brand.scrolledSize);
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl);
  const [scrolledLogoUrl, setScrolledLogoUrl] = useState(brand.scrolledLogoUrl);

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <div className="space-y-4 rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <div>
          <label className="block text-xs font-medium text-muted-foreground">Nome do site</label>
          <Input
            name="siteName"
            defaultValue={brand.siteName}
            onChange={(event) => setSiteName(event.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <span className="block text-xs font-medium text-muted-foreground">Como exibir a marca</span>
          <div className="mt-1 flex gap-4">
            {(["text", "svg", "png"] as const).map((option) => (
              <label key={option} className="flex items-center gap-1.5 text-sm text-foreground">
                <input
                  type="radio"
                  name="headerMode"
                  value={option}
                  defaultChecked={brand.mode === option}
                  onChange={() => setMode(option)}
                  className="outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
                />
                {BRAND_MODE_LABEL[option]}
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium text-muted-foreground">Posição</span>
          <div className="mt-1 flex gap-4">
            {(["left", "center"] as const).map((option) => (
              <label key={option} className="flex items-center gap-1.5 text-sm text-foreground">
                <input
                  type="radio"
                  name="position"
                  value={option}
                  defaultChecked={brand.position === option}
                  onChange={() => setPosition(option)}
                  className="outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
                />
                {option === "left" ? "Esquerda" : "Centro"}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Tamanho (%)</label>
            <Input
              type="number"
              name="size"
              min={50}
              max={200}
              step={5}
              defaultValue={brand.size}
              onChange={(event) => setSize(Number(event.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Tamanho ao rolar (%)</label>
            <Input
              type="number"
              name="scrolledSize"
              min={50}
              max={200}
              step={5}
              defaultValue={brand.scrolledSize}
              onChange={(event) => setScrolledSize(Number(event.target.value))}
              className="mt-1"
            />
          </div>
        </div>

        <MediaPickerField
          name="logoMediaId"
          label="Logo"
          initialMedia={media.logo}
          onSelect={(selected) => setLogoUrl(selected?.url ?? brand.logoUrl)}
        />
        <MediaPickerField
          name="logoScrolledMediaId"
          label="Logo (quando a página está rolada)"
          initialMedia={media.logoScrolled}
          onSelect={(selected) => setScrolledLogoUrl(selected?.url ?? brand.scrolledLogoUrl)}
        />
        <MediaPickerField name="faviconMediaId" label="Favicon" initialMedia={media.favicon} />

        <Button type="submit" disabled={pending}>
          Salvar
        </Button>
      </div>

      <div className="space-y-4 rounded-panel border border-border bg-card ui-panel-padding-roomy">
        <p className="text-xs font-medium uppercase tracking-caps text-muted-foreground">Pré-visualização do cabeçalho</p>
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="mb-2 text-[11px] text-muted-foreground">Normal</p>
            <PlatformBrand
              name={siteName}
              mode={mode}
              size={size}
              scrolledSize={scrolledSize}
              position={position}
              isScrolled={false}
              logoUrl={logoUrl}
              scrolledLogoUrl={scrolledLogoUrl}
            />
          </div>
          <div className="rounded-lg border border-border bg-primary p-4 text-primary-foreground">
            <p className="mb-2 text-[11px] text-primary-foreground/80">Ao rolar a página</p>
            <PlatformBrand
              name={siteName}
              mode={mode}
              size={size}
              scrolledSize={scrolledSize}
              position={position}
              isScrolled
              logoUrl={logoUrl}
              scrolledLogoUrl={scrolledLogoUrl}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
