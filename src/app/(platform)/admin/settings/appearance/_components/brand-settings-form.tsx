"use client";

import { useActionState, useState } from "react";
import { MediaPickerField } from "@/components/media-picker-field";
import { PlatformBrand } from "@/themes/venore-slime/components/PlatformBrand";
import type { HeaderBrandMode, HeaderBrandPosition } from "@/contexts/themes";
import type { BrandConfig } from "@/platform/brand/get-brand-config";
import type { BrandMediaSelections } from "@/platform/brand/get-brand-media-selections";
import { updateBrandSettingsAction, type BrandSettingsActionState } from "../actions";

const initialState: BrandSettingsActionState = { error: null };

export function BrandSettingsForm({ brand, media }: { brand: BrandConfig; media: BrandMediaSelections }) {
  const [state, formAction, pending] = useActionState(updateBrandSettingsAction, initialState);

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
      <div className="space-y-4 rounded border border-border bg-card p-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground">Nome do site</label>
          <input
            name="siteName"
            defaultValue={brand.siteName}
            onChange={(event) => setSiteName(event.target.value)}
            className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>

        <div>
          <span className="block text-xs font-medium text-muted-foreground">Modo do brand</span>
          <div className="mt-1 flex gap-4">
            {(["text", "svg", "png"] as const).map((option) => (
              <label key={option} className="flex items-center gap-1.5 text-sm text-foreground">
                <input
                  type="radio"
                  name="headerMode"
                  value={option}
                  defaultChecked={brand.mode === option}
                  onChange={() => setMode(option)}
                />
                {option.toUpperCase()}
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
                />
                {option === "left" ? "Esquerda" : "Centro"}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Tamanho (%)</label>
            <input
              type="number"
              name="size"
              min={50}
              max={200}
              step={5}
              defaultValue={brand.size}
              onChange={(event) => setSize(Number(event.target.value))}
              className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Tamanho ao rolar (%)</label>
            <input
              type="number"
              name="scrolledSize"
              min={50}
              max={200}
              step={5}
              defaultValue={brand.scrolledSize}
              onChange={(event) => setScrolledSize(Number(event.target.value))}
              className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
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
          label="Logo (estado scrolled)"
          initialMedia={media.logoScrolled}
          onSelect={(selected) => setScrolledLogoUrl(selected?.url ?? brand.scrolledLogoUrl)}
        />
        <MediaPickerField name="faviconMediaId" label="Favicon" initialMedia={media.favicon} />

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Salvar
        </button>
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      </div>

      <div className="space-y-4 rounded border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-caps text-muted-foreground">Preview do header</p>
        <div className="space-y-3">
          <div className="rounded border border-border bg-background p-4">
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
          <div className="rounded border border-border bg-primary p-4 text-primary-foreground">
            <p className="mb-2 text-[11px] text-primary-foreground/80">Ao rolar</p>
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
