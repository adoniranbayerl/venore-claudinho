import { getMediaAsset } from "@/contexts/media";
import { getEnrollmentDashboardPageData } from "@/platform/admin-shell/get-enrollment-dashboard-page-data";
import { EnrollmentDashboardView, getMockEnrollmentDashboardData, getPresentationAccess } from "@/plugins/enrollment-dashboard";
import { CopyPresentationLinkButton } from "./copy-presentation-link-button";

async function resolveLogoUrl(mediaId: string): Promise<string | null> {
  const result = await getMediaAsset({ id: mediaId });
  return result.success && result.data ? result.data.url : null;
}

export default async function EnrollmentDashboardAdminPage() {
  const gate = await getEnrollmentDashboardPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para ver o dashboard de matrícula.</p>
      </div>
    );
  }

  const institutions = getMockEnrollmentDashboardData();
  const [logoEntries, presentationAccess] = await Promise.all([
    Promise.all(institutions.map(async (institution) => [institution.key, await resolveLogoUrl(institution.logoMediaId)] as const)),
    getPresentationAccess(),
  ]);
  const logoUrlByInstitution = new Map(logoEntries);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Esta tela usa o shell do admin (navegação, cabeçalho). Pra projetar num telão sem essa moldura, cada instituição tem
          seu próprio link — colégio e faculdade em telas separadas.
        </p>
        {presentationAccess.success && (
          <div className="flex flex-wrap items-center gap-2">
            {institutions.map((institution) => (
              <CopyPresentationLinkButton
                key={institution.key}
                token={presentationAccess.data.token}
                institutionKey={institution.key}
                label={institution.name}
              />
            ))}
          </div>
        )}
      </div>

      <EnrollmentDashboardView institutions={institutions} logoUrlByInstitution={logoUrlByInstitution} />
    </div>
  );
}
