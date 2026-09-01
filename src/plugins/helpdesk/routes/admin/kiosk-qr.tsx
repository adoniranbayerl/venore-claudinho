"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

// QR pronto para impressão (§2.5). O SVG é gerado no servidor (qrcode.toString), aqui só
// exibimos e abrimos uma janela enxuta de impressão com o código grande + rótulo + URL — sem
// arrastar o layout do admin para a folha.
export function KioskQr({ svg, url, label }: { svg: string; url: string; label: string }) {
  function print() {
    const win = window.open("", "_blank", "width=520,height=680");
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>QR — ${escapeHtml(label)}</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 40px; text-align: center; color: #111; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  p { font-size: 13px; color: #555; margin: 0 0 24px; word-break: break-all; }
  .qr { width: 320px; height: 320px; margin: 0 auto; }
  .qr svg { width: 100%; height: 100%; }
  .hint { margin-top: 24px; font-size: 14px; color: #333; }
</style></head><body>
  <h1>${escapeHtml(label)}</h1>
  <p>${escapeHtml(url)}</p>
  <div class="qr">${svg}</div>
  <p class="hint">Aponte a câmera do celular para abrir um chamado.</p>
  <script>window.onload = function () { window.print(); }<\/script>
</body></html>`);
    win.document.close();
  }

  return (
    <div className="flex items-center gap-3">
      <div className="size-20 shrink-0 rounded-lg border border-border bg-card p-1 [&_svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />
      <Button type="button" size="sm" variant="outline" onClick={print}>
        <Printer className="size-4" />
        Imprimir QR
      </Button>
    </div>
  );
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}
