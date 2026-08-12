import { notFound } from "next/navigation";
import { getMediaAsset } from "@/contexts/media";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import {
  EnrollmentColumnsSlide,
  getMockEnrollmentDashboardData,
  getPresentationAccess,
  PresentationCanvas,
} from "@/plugins/enrollment-dashboard";

// Fora de (platform) de propósito — pedido explícito: uma view "só o dashboard", sem sidebar,
// cabeçalho nem breadcrumb do admin, pra abrir num telão/projetor de apresentação. Acesso por
// token opaco na URL, sem sessão (mesmo racional do broadcast: plugins/broadcast/routes/out/
// page.tsx), não pela permission enrollment-dashboard.read do admin.
//
// Uma instituição por rota (pedido explícito: "separar Faculdade Fidelis de colégio Erasto") —
// cada uma tem seu próprio telão/projetor na prática, e mostrar as duas juntas não deixava espaço
// pra detalhar por turma/curso sem virar rolagem ou poluição visual.
async function resolveLogoUrl(mediaId: string): Promise<string | null> {
  const result = await getMediaAsset({ id: mediaId });
  return result.success && result.data ? result.data.url : null;
}

export default async function EnrollmentDashboardPresentationPage({
  params,
}: {
  params: Promise<{ token: string; institutionKey: string }>;
}) {
  if (!(await isPluginActive("enrollment-dashboard"))) {
    notFound();
  }

  const { token, institutionKey } = await params;
  const access = await getPresentationAccess();
  if (!access.success || access.data.token !== token) {
    notFound();
  }

  const institution = getMockEnrollmentDashboardData().find((candidate) => candidate.key === institutionKey);
  if (!institution) {
    notFound();
  }

  const logoUrl = await resolveLogoUrl(institution.logoMediaId);

  return (
    <PresentationCanvas>
      {/* Sem overflow de rolagem de propósito (pedido explícito: nada de scroll, tudo cabe na tela
          como um slide) — h-full/flex força o conteúdo a caber na altura fixa do canvas. */}
      <div className="h-full w-full overflow-hidden px-10 py-8">
        {/* Mesmo componente pras duas instituições (pedido explícito: "a view da Faculdade deve
            ter o mesmo layout da view do Colégio") — a diferença de colunas (4 segmentos x 1
            grupo só) vem inteiramente do dado (program.group), não de um branch aqui. */}
        <EnrollmentColumnsSlide institution={institution} logoUrl={logoUrl} />
      </div>
    </PresentationCanvas>
  );
}
