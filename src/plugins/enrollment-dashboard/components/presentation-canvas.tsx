"use client";

import { useEffect, useState, type ReactNode } from "react";

const REFERENCE_HEIGHT = 1080;

// Canvas de design com altura de referência fixa (1080) — pedido explícito: a view pública é pra
// abrir num telão/projetor como um slide, não navegada como página comum, então tudo cabe sem
// scroll através de escala uniforme (nunca X/Y separado, senão distorce), calculada do viewport
// real. A LARGURA de design, ao contrário da versão anterior (fixa em 1920, sempre 16:9), é
// derivada da proporção real do container — então a escala preenche o espaço inteiro sempre,
// sem barra de letterbox nem corte de conteúdo, em qualquer proporção (16:9 direto num
// telão/projetor, mas também num retângulo mais estreito quando esta página é embutida como
// camada "webpage" do Broadcast Studio com a coluna de agenda aberta, que não é 16:9 — pedido
// explícito: "gostaria que preenchesse todo o espaço da view"). O grid/flex do slide
// (EnrollmentColumnsSlide) já é proporcional (colunas em fr, sem px fixo), então uma largura de
// design diferente de 1920 não quebra o layout, só redistribui o mesmo espaço relativo.
export function PresentationCanvas({ children }: { children: ReactNode }) {
  const [box, setBox] = useState({ width: 1920, height: REFERENCE_HEIGHT, scale: 1 });

  useEffect(() => {
    function updateBox() {
      const scale = window.innerHeight / REFERENCE_HEIGHT;
      setBox({ width: window.innerWidth / scale, height: REFERENCE_HEIGHT, scale });
    }
    updateBox();
    window.addEventListener("resize", updateBox);
    return () => window.removeEventListener("resize", updateBox);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-presentation-ground">
      <div
        className="overflow-hidden bg-presentation-ground"
        style={{ width: box.width, height: box.height, transform: `scale(${box.scale})`, transformOrigin: "center center" }}
      >
        {children}
      </div>
    </div>
  );
}
