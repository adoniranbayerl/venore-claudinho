import { notFound } from "next/navigation";
import { getTvBoard } from "@/plugins/company-metrics";
import { ChartTokens } from "@/plugins/company-metrics/components/dashboard/chart-tokens";
import { PresentationCanvas } from "@/plugins/company-metrics/components/tv/presentation-canvas";
import { TvRotator } from "@/plugins/company-metrics/components/tv/tv-rotator";
import { TvScreenContent } from "@/plugins/company-metrics/components/tv/tv-screens";

// Página de TV — fora da shell do (platform), acesso só por token (ver o shim em
// src/app/company-metrics/tv/[token]/). O server component rebusca os números; o TvRotator
// (client) roda a rotação e chama router.refresh() periodicamente.
export const dynamic = "force-dynamic";

export default async function CompanyMetricsTvPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getTvBoard(token);
  if (!result.success) {
    notFound();
  }

  const slides = result.data.screens.map((screen) => ({
    id: screen.id,
    dwellSeconds: screen.dwellSeconds,
    content: <TvScreenContent screen={screen} />,
  }));

  return (
    <>
      <ChartTokens />
      <PresentationCanvas>
        <TvRotator slides={slides} />
      </PresentationCanvas>
    </>
  );
}
