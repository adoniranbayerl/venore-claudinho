import { getBrandConfig } from "@/platform/brand/get-brand-config";
import { getBrandMediaSelections } from "@/platform/brand/get-brand-media-selections";
import { getSettingsPageData } from "@/platform/admin-shell/get-settings-page-data";
import { BrandSettingsForm } from "./_components/brand-settings-form";

export default async function AppearanceSettingsPage() {
  const gate = await getSettingsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para gerenciar a aparência do site.</p>
      </div>
    );
  }

  const [brand, media] = await Promise.all([getBrandConfig(), getBrandMediaSelections()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Aparência</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marca do site: nome, logo, favicon e comportamento no header.
        </p>
      </div>

      <BrandSettingsForm brand={brand} media={media} />
    </div>
  );
}
