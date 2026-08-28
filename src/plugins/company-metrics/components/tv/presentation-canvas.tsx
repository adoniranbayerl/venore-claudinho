"use client";

import { useEffect, useState, type ReactNode } from "react";

const REFERENCE_HEIGHT = 1080;

// Cópia adaptada do PresentationCanvas do enrollment-dashboard (§0/§9.2 — plugin não importa
// outro plugin). Altura de referência fixa (1080); a largura de design é derivada da proporção
// real do container, então a escala uniforme preenche o espaço inteiro sem letterbox nem corte,
// em qualquer proporção — inclusive quando esta página é embutida como camada "webpage" do
// Broadcast. Segue o tema do site (bg-background), sem token fixo de dark.
export function PresentationCanvas({ children }: { children: ReactNode }) {
  const [box, setBox] = useState({ width: 1920, height: REFERENCE_HEIGHT, scale: 1 });

  useEffect(() => {
    function update() {
      const scale = window.innerHeight / REFERENCE_HEIGHT;
      setBox({ width: window.innerWidth / scale, height: REFERENCE_HEIGHT, scale });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
      <div
        className="overflow-hidden bg-background"
        style={{ width: box.width, height: box.height, transform: `scale(${box.scale})`, transformOrigin: "center center" }}
      >
        {children}
      </div>
    </div>
  );
}
