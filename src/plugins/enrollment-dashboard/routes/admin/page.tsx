import { GraduationCap } from "lucide-react";
import { getMediaAsset } from "@/contexts/media";
import type { PickableMedia } from "@/components/media-picker-field.actions";
import { AdminAccessDenied } from "@/components/admin-access-denied";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { getEnrollmentDashboardPageData } from "@/platform/admin-shell/get-enrollment-dashboard-page-data";
import { EnrollmentDashboardView, getEnrollmentDashboardData, getPresentationAccess } from "@/plugins/enrollment-dashboard";
import { CopyPresentationLinkButton } from "./copy-presentation-link-button";
import { CreateInstitutionDialog } from "./create-institution-dialog";
import { EditInstitutionDialog } from "./edit-institution-dialog";
import { DeleteInstitutionButton } from "./delete-institution-button";
import { CreateProgramDialog } from "./create-program-dialog";
import { EditProgramDialog } from "./edit-program-dialog";
import { DeleteProgramButton } from "./delete-program-button";

async function resolveLogoUrl(mediaId: string | null): Promise<string | null> {
  if (!mediaId) return null;
  const result = await getMediaAsset({ id: mediaId });
  return result.success && result.data ? result.data.url : null;
}

async function resolvePickableLogo(mediaId: string | null): Promise<PickableMedia | null> {
  if (!mediaId) return null;
  const result = await getMediaAsset({ id: mediaId });
  return result.success && result.data
    ? { id: result.data.id, filename: result.data.filename, url: result.data.url, contentType: result.data.contentType }
    : null;
}

export default async function EnrollmentDashboardAdminPage() {
  const gate = await getEnrollmentDashboardPageData();

  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para ver o dashboard de matrícula." />;
  }

  const dataResult = await getEnrollmentDashboardData();
  if (!dataResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar o dashboard: {dataResult.error.message}</p>;
  }
  const institutions = dataResult.data;

  const [logoEntries, pickableLogoEntries, presentationAccess] = await Promise.all([
    Promise.all(institutions.map(async (institution) => [institution.key, await resolveLogoUrl(institution.logoMediaId)] as const)),
    Promise.all(institutions.map(async (institution) => [institution.id, await resolvePickableLogo(institution.logoMediaId)] as const)),
    getPresentationAccess(),
  ]);
  const logoUrlByInstitution = new Map(logoEntries);
  const pickableLogoByInstitution = new Map(pickableLogoEntries);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard de Matrícula"
        description="Meta, rematrícula e novas matrículas por instituição. Dado editado manualmente aqui — integração com o sistema Prima é etapa futura."
        actions={
          <>
            {institutions.length > 0 && <CreateInstitutionDialog />}
            {presentationAccess.success &&
              institutions.map((institution) => (
                <div key={institution.key} className="flex gap-1">
                  <CopyPresentationLinkButton
                    token={presentationAccess.data.token}
                    institutionKey={institution.key}
                    mode="detalhada"
                    label={institution.name}
                  />
                  <CopyPresentationLinkButton
                    token={presentationAccess.data.token}
                    institutionKey={institution.key}
                    mode="resumida"
                    label={institution.name}
                  />
                </div>
              ))}
          </>
        }
      />

      <EnrollmentDashboardView
        institutions={institutions}
        logoUrlByInstitution={logoUrlByInstitution}
        emptyState={
          <EmptyState
            icon={<GraduationCap className="size-8" strokeWidth={1.5} />}
            title="Nenhuma instituição cadastrada"
            description="Cadastre a primeira instituição para começar a lançar turmas/cursos e os números de matrícula."
            action={<CreateInstitutionDialog />}
          />
        }
        renderInstitutionActions={(institution) => (
          <>
            <EditInstitutionDialog institution={institution} logo={pickableLogoByInstitution.get(institution.id) ?? null} />
            <DeleteInstitutionButton institutionId={institution.id} name={institution.name} />
          </>
        )}
        renderCreateProgramAction={(institution) => (
          <CreateProgramDialog institutionId={institution.id} programLabel={institution.programLabel} />
        )}
        renderProgramActions={(institution, program) => (
          <>
            <EditProgramDialog program={program} programLabel={institution.programLabel} />
            <DeleteProgramButton programId={program.id} label={program.label} />
          </>
        )}
      />
    </div>
  );
}
