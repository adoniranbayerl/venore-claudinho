import { notFound } from "next/navigation";
import { getEntryBody, getPublishedEntryBySlug } from "@/contexts/cms";

// force-dynamic: conteúdo (CMS) e tema ativo são runtime-configuráveis, sem rebuild
// (docs/venore-docks.md — "Sobre temas").
export const dynamic = "force-dynamic";

// Home é a entry reservada com categoryId null e slug "home" — convenção documentada no plano
// desta sessão, não string vazia (evita abrir exceção na validação de slug não-vazio do form).
const HOME_SLUG = "home";

export default async function HomePage() {
  const result = await getPublishedEntryBySlug({ categoryId: null, slug: HOME_SLUG });

  if (!result.success || !result.data) {
    notFound();
  }

  const entry = result.data;

  return (
    <article>
      <h1>{entry.title}</h1>
      <p>{getEntryBody(entry.data)}</p>
    </article>
  );
}
