export { default } from "@/plugins/birthdays/routes/public/page";

// Precisa ficar declarado aqui, direto no arquivo de rota — Next.js só lê route segment config
// de export direto no arquivo dentro de app/, não segue re-export.
//
// force-dynamic: mesmo motivo de app/page.tsx e do catch-all — cadastro e aparência mudam em
// runtime, e esta rota é literal ("birthdays") então tem prioridade sobre [...slug].
export const dynamic = "force-dynamic";
