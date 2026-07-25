"use client";

import { useState } from "react";

// Não usa next-themes (removido do projeto — ver THEME_INIT_SCRIPT em src/app/layout.tsx).
// Mesma fonte de verdade do script inline: classe "dark" em <html> + localStorage["theme"].
// suppressHydrationWarning porque, assim como o próprio <html>, o label depende de estado que
// só existe no cliente (o script inline já aplicou a classe antes da hidratação rodar).
function readIsDark() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function ColorModeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(readIsDark);

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }

  return (
    <button type="button" onClick={toggle} className={className} suppressHydrationWarning>
      {isDark ? "Modo claro" : "Modo escuro"}
    </button>
  );
}
