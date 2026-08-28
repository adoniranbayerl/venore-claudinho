"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

// Rotaciona as telas do board pelos seus dwellSeconds e, a cada REFRESH_MS, chama
// router.refresh() para o server component rebuscar os números (sem sessão — funciona por token).
const REFRESH_MS = 30_000;

export function TvRotator({ slides }: { slides: { id: string; dwellSeconds: number; content: ReactNode }[] }) {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const slideCount = slides.length;
  const safeIndex = slideCount > 0 ? index % slideCount : 0;
  const current = slides[safeIndex];
  const dwellSeconds = current?.dwellSeconds ?? 20;

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = setTimeout(() => setIndex((value) => (value + 1) % slideCount), Math.max(3, dwellSeconds) * 1000);
    return () => clearTimeout(timer);
  }, [safeIndex, slideCount, dwellSeconds]);

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [router]);

  if (slideCount === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center p-16 text-center text-3xl text-muted-foreground">
        Nenhuma tela configurada para este painel.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 overflow-hidden">{current.content}</div>
      {slideCount > 1 && (
        <div className="flex justify-center gap-2 pb-6">
          {slides.map((slide, i) => (
            <span
              key={slide.id}
              className={`h-1.5 rounded-full transition-all ${i === safeIndex ? "w-10 bg-primary" : "w-4 bg-border"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
