import { notFound } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { getKioskByToken } from "@/plugins/helpdesk";
import { KioskForm } from "../../components/kiosk/kiosk-form";

export const dynamic = "force-dynamic";

// Página do quiosque anônimo (§1 superfície 2, §2.5). Rota standalone FORA de (platform) de
// propósito (§4, exceção do AGENTS.md §1.1, igual broadcast/out): sem header/nav/footer — é um
// totem, a pessoa só quer avisar a manutenção. O shim que a expõe está em
// src/app/chamados/quiosque/[token]/page.tsx.
export default async function HelpdeskKioskPage({ params }: { params: Promise<{ token: string }> }) {
  if (!(await isPluginActive("helpdesk"))) {
    notFound();
  }

  const { token } = await params;
  const result = await getKioskByToken(token);
  if (!result.success) {
    notFound();
  }

  const kiosk = result.data;

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <header className="space-y-1 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <LifeBuoy className="size-6" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Abrir um chamado</h1>
          <p className="text-sm text-muted-foreground">
            {kiosk.label}
            {kiosk.fixedQueue ? ` · ${kiosk.fixedQueue.name}` : ""}
          </p>
        </header>

        <KioskForm
          token={kiosk.token}
          fixedQueue={kiosk.fixedQueue}
          queues={kiosk.queues}
          defaultLocation={kiosk.defaultLocation}
        />
      </div>
    </main>
  );
}
