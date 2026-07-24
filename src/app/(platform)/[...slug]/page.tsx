import { notFound } from "next/navigation";
import { getCategoryBySlug, getEntryBody, getPublishedEntryBySlug } from "@/contexts/cms";

// force-dynamic: mesmo motivo de app/page.tsx — conteúdo e tema ativo mudam em runtime.
export const dynamic = "force-dynamic";

export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: segments } = await params;

  // "home" só existe canonicamente em "/" — sem isso, /home renderizaria o mesmo conteúdo da
  // home num segundo endereço (docs/venore-docks.md — decisão de rota pública desta sessão).
  if (segments.length === 1 && segments[0] === "home") {
    notFound();
  }

  let entryResult;

  if (segments.length === 1) {
    entryResult = await getPublishedEntryBySlug({ categoryId: null, slug: segments[0] });
  } else if (segments.length === 2) {
    const categoryResult = await getCategoryBySlug({ slug: segments[0] });
    if (!categoryResult.success || !categoryResult.data) {
      notFound();
    }
    entryResult = await getPublishedEntryBySlug({ categoryId: categoryResult.data.id, slug: segments[1] });
  } else {
    notFound();
  }

  if (!entryResult.success || !entryResult.data) {
    notFound();
  }

  const entry = entryResult.data;

  return (
    <article>
      <h1>{entry.title}</h1>
      <p>{getEntryBody(entry.data)}</p>
    </article>
  );
}
