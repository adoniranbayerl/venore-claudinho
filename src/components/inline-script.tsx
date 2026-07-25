"use client";

// "use client" é obrigatório aqui: o toggle type=text/javascript (server) / text/plain (client)
// só funciona se este componente reexecutar no browser durante a hidratação. Chamado a partir de
// um Server Component (RootLayout), sem essa diretiva o componente inteiro roda só no servidor —
// o browser nunca reavalia "typeof window", o RSC payload sempre serializa "text/javascript", e o
// React continua avisando sobre <script> em runtime do client (docs Next.js locais —
// "Preventing Flash" — "Extracting a reusable component"). Com "use client", o browser só executa
// o script durante o parse do HTML vindo do server; um <script type="text/plain"> reidratado não é
// reconhecido/executado.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
