import { headers } from "next/headers";
import QRCode from "qrcode";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import type { KioskListItem } from "@/plugins/helpdesk";
import { CreateKioskDialog, EditKioskDialog } from "./kiosk-dialogs";
import { KioskQr } from "./kiosk-qr";

type QueueOption = { id: string; name: string };

async function resolveOrigin(): Promise<string> {
  const store = await headers();
  const host = store.get("x-forwarded-host") ?? store.get("host") ?? "localhost:3000";
  const proto = store.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Aba Quiosques do admin (§2.5) — só `helpdesk.manage`. Lista os quiosques com o QR pronto pra
// impressão (SVG gerado no servidor, mesma lib do PIX do donations).
export async function KiosksView({
  kiosks,
  queueOptions,
}: {
  kiosks: KioskListItem[];
  queueOptions: QueueOption[];
}) {
  const origin = await resolveOrigin();
  const withQr = await Promise.all(
    kiosks.map(async (kiosk) => {
      const url = `${origin}/chamados/quiosque/${kiosk.token}`;
      const svg = await QRCode.toString(url, { type: "svg", margin: 1 });
      return { kiosk, url, svg };
    }),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Cada quiosque é um QR Code para abrir chamados sem login. Cole o código impresso no setor.
        </p>
        <CreateKioskDialog queueOptions={queueOptions} />
      </div>

      {withQr.length === 0 ? (
        <EmptyState
          title="Nenhum quiosque"
          description="Crie um quiosque para gerar um QR Code de abertura anônima."
        />
      ) : (
        <ul className="space-y-3">
          {withQr.map(({ kiosk, url, svg }) => (
            <li
              key={kiosk.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{kiosk.label}</span>
                  {!kiosk.active && <Badge variant="outline">Desativado</Badge>}
                  <Badge variant="secondary">{kiosk.queueName ?? "Fila escolhida pelo solicitante"}</Badge>
                </div>
                {kiosk.defaultLocation && (
                  <p className="text-xs text-muted-foreground">Local padrão: {kiosk.defaultLocation}</p>
                )}
                <p className="break-all text-xs text-muted-foreground">{url}</p>
              </div>
              <div className="flex items-center gap-2">
                <KioskQr svg={svg} url={url} label={kiosk.label} />
                <EditKioskDialog kiosk={kiosk} queueOptions={queueOptions} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
