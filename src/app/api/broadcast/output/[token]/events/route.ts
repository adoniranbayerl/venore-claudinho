export { GET } from "@/plugins/broadcast/routes/api/output-events/route";

// Precisa ficar declarado aqui, direto no arquivo de rota — Next.js só lê route segment config
// (`dynamic`, `revalidate`, etc.) de export direto no arquivo dentro de app/, não segue re-export.
// Nunca deve ser respondida a partir de cache estático — é um stream vivo por conexão.
export const dynamic = "force-dynamic";
