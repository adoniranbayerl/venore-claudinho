export { default } from "@/plugins/donations/routes/public/page";

// Precisa ficar declarado aqui, direto no arquivo de rota — Next.js só lê route segment config
// de export direto no arquivo dentro de app/, não segue re-export.
//
// force-dynamic: rota literal ("donations") precisa de prioridade sobre o catch-all [...slug], e
// a configuração muda em runtime (mesmo motivo de birthdays/page.tsx).
export const dynamic = "force-dynamic";
