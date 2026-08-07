import { notFound } from "next/navigation";
import { getOutputState } from "@/plugins/broadcast";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { OutputCanvas } from "./_components/output-canvas";

// Rota standalone fora de (platform) de propósito: a view de saída (o que abre na TV) não tem
// header/nav/footer nenhum, é só o canvas em camadas — não existe slot de tema pra "canvas
// fullscreen" (achado da pesquisa: ContentSlotProps/HeaderSlotProps não cobrem esse caso, e os
// dois plugins existentes que têm página pública standalone, birthdays/academy, ainda reusam o
// layout de (platform); este é o primeiro caso que precisa fugir dele por completo).
export default async function BroadcastOutputPage({ params }: { params: Promise<{ token: string }> }) {
  if (!(await isPluginActive("broadcast"))) {
    notFound();
  }

  const { token } = await params;
  const initialState = await getOutputState({ token });
  if (!initialState.success) {
    notFound();
  }

  return <OutputCanvas token={token} initialState={initialState.data} />;
}
