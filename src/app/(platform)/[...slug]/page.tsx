import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getEntryBody, getEntryComposition, getPublishedEntryBySlug, listEntries, recordEntryView } from "@/contexts/cms";
import type { EntryRecord } from "@/contexts/cms";
import { getCurrentUser } from "@/contexts/auth";
import { BlockRenderer } from "@/components/page-builder/block-renderer";

// force-dynamic: mesmo motivo de app/page.tsx — conteúdo e tema ativo mudam em runtime.
export const dynamic = "force-dynamic";

// C7: "authenticated" nunca aparece pra visitante sem sessão — nem como entry única (notFound),
// nem como item de listagem (BL1: filtrado antes de renderizar, não link que ia dar 404).
async function isVisibleToCurrentViewer(entry: EntryRecord): Promise<boolean> {
  if (entry.visibility === "public") return true;
  const currentUser = await getCurrentUser();
  return currentUser.success && Boolean(currentUser.data);
}

// BL1 (docs/implementation-roadmap.md, Fase 4): rota de categoria em formato blog — lista as
// entries publicadas daquela categoria, respeitando status (listEntries já filtra
// status="published") e visibilidade por entry (C7).
async function renderCategoryBlogroll(category: { id: string; name: string; slug: string; description: string | null }) {
  const entriesResult = await listEntries({ categoryId: category.id });
  const allEntries = entriesResult.success ? entriesResult.data : [];

  const visibleFlags = await Promise.all(allEntries.map(isVisibleToCurrentViewer));
  const entries = allEntries.filter((_, index) => visibleFlags[index]);

  return (
    <div>
      <h1>{category.name}</h1>
      {category.description && <p>{category.description}</p>}
      {entries.length === 0 ? (
        <p>Nenhum conteúdo publicado nesta categoria ainda.</p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link href={`/${category.slug}/${entry.slug}`}>{entry.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: segments } = await params;

  // "home" só existe canonicamente em "/" — sem isso, /home renderizaria o mesmo conteúdo da
  // home num segundo endereço (docs/venore-docks.md — decisão de rota pública desta sessão).
  if (segments.length === 1 && segments[0] === "home") {
    notFound();
  }

  let entryResult;

  if (segments.length === 1) {
    // BL1: categoria tem precedência sobre uma entry raiz de mesmo slug — decisão registrada
    // (docs/implementation-roadmap.md, Fase 4/BL1): o banco não impede as duas existirem com o
    // mesmo slug (índices únicos independentes, ver database/schema/index.ts), então uma ordem
    // determinística era necessária. Categoria só existe pra ser uma seção navegável; uma entry
    // raiz de mesmo slug (caso raro) fica inalcançável por este endereço enquanto a categoria
    // existir.
    const categoryResult = await getCategoryBySlug({ slug: segments[0] });
    if (categoryResult.success && categoryResult.data) {
      return renderCategoryBlogroll(categoryResult.data);
    }

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

  // Privacidade por conteúdo (Fase 2/C7): "authenticated" nunca renderiza pra visitante sem
  // sessão — notFound() em vez de redirect pro login, pra não confirmar que existe conteúdo
  // fechado nesse endereço a quem não tem acesso.
  if (!(await isVisibleToCurrentViewer(entry))) {
    notFound();
  }

  recordEntryView(entry.id);

  const compositionResult = await getEntryComposition({ id: entry.id });
  const composition = compositionResult.success ? compositionResult.data : null;

  return (
    <article>
      <h1>{entry.title}</h1>
      {composition ? <BlockRenderer blocks={composition} mode="published" /> : <p>{getEntryBody(entry.data)}</p>}
    </article>
  );
}
