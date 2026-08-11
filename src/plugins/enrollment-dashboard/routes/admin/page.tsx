import { getMediaAsset } from "@/contexts/media";
import { AdminAccessDenied } from "@/components/admin-access-denied";
import { AdminPageHeader } from "@/components/admin-page-header";
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
    return <AdminAccessDenied message="Você não tem permissão para ver o dashboard de matrícula." />;
  }

  const institutions = getMockEnrollmentDashboardData();
  const [logoEntries, presentationAccess] = await Promise.all([
    Promise.all(institutions.map(async (institution) => [institution.key, await resolveLogoUrl(institution.logoMediaId)] as const)),
    getPresentationAccess(),
  ]);
  const logoUrlByInstitution = new Map(logoEntries);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Links de apresentação"
        description="Esta tela usa o shell do admin (navegação, cabeçalho). Pra projetar num telão sem essa moldura, cada instituição tem seu próprio link — colégio e faculdade em telas separadas."
        actions={
          presentationAccess.success &&
          institutions.map((institution) => (
            <CopyPresentationLinkButton
              key={institution.key}
              token={presentationAccess.data.token}
              institutionKey={institution.key}
              label={institution.name}
            />
          ))
        }
      />

      <EnrollmentDashboardView institutions={institutions} logoUrlByInstitution={logoUrlByInstitution} />
    </div>
  );
}
