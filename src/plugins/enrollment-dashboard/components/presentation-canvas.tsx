"use client";

import { useEffect, useState, type ReactNode } from "react";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

// Canvas de design fixo 16:9 (1920×1080) — pedido explícito: a view pública é pra abrir num
// telão/projetor como um slide, não navegada como página comum. Escala uniforme (nunca X/Y
// separado, senão distorce) calculada do viewport real, centralizada, com barra de letterbox
// quando a tela não é exatamente 16:9 (ex: 16:10, ultrawide). Mesmo racional de design-size-fixo
// do preview de saída do broadcast (plugins/broadcast/components/admin/outputs-section.tsx,
// PREVIEW_DESIGN_WIDTH/HEIGHT), só que aqui é a view real, não uma miniatura.
//
// bg-background (token já existente do tema, não um valor de cor novo do plugin) — a view segue
// o light/dark do site como qualquer outra tela; um fundo sempre-escuro exigiria um token próprio
// em theme.css, fora do que um plugin pode tocar.
export function PresentationCanvas({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function updateScale() {
      setScale(Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT));
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
      <div
        className="overflow-hidden bg-background"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        {children}
      </div>
    </div>
  );
}
