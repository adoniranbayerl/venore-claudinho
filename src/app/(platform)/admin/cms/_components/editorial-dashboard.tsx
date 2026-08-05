import Link from "next/link";
import type { CategoryRecord, ContentTypeRecord, EntryRecord, EntryStatus } from "@/contexts/cms";

const STATUS_TILES: { status: EntryStatus; label: string; badgeClass: string }[] = [
  { status: "draft", label: "Rascunho", badgeClass: "bg-muted text-muted-foreground" },
  { status: "scheduled", label: "Agendado", badgeClass: "bg-warning-soft text-warning" },
  { status: "published", label: "Publicado", badgeClass: "bg-accent/14 text-primary" },
  { status: "archived", label: "Arquivado", badgeClass: "bg-muted text-muted-foreground/56" },
];

const TOP_N = 5;

// C8 (docs/implementation-roadmap.md, Fase 3): "dashboard bem informativo... incluindo acesso" —
// só números e listas ranqueadas, sem gráfico — a métrica que importa aqui é a contagem em si,
// não a forma dela (skill de dataviz: "a bare stat tile" é a resposta certa quando não há série
// temporal nem comparação de magnitude que precise de eixo).
export function EditorialDashboard({
  entries,
  categories,
  contentTypes,
}: {
  entries: EntryRecord[] | null;
  categories: Array<CategoryRecord & { entryCount: number }> | null;
  contentTypes: Array<ContentTypeRecord & { entryCount: number }> | null;
}) {
  if (!entries && !categories && !contentTypes) return null;

  const statusCounts = entries
    ? STATUS_TILES.map((tile) => ({
        ...tile,
        count: entries.filter((entry) => entry.status === tile.status).length,
      }))
    : null;

  const topViewed = entries
    ? [...entries]
        .filter((entry) => entry.viewCount > 0)
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, TOP_N)
    : null;

  const topCategories = categories
    ? [...categories].sort((a, b) => b.entryCount - a.entryCount).slice(0, TOP_N)
    : null;

  const topTags = contentTypes
    ? [...contentTypes].sort((a, b) => b.entryCount - a.entryCount).slice(0, TOP_N)
    : null;

  return (
    <section className="space-y-4">
      {statusCounts && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statusCounts.map((tile) => (
            <div key={tile.status} className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
              <p className="text-2xl font-semibold text-foreground">{tile.count}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tile.badgeClass}`}>
                {tile.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {(topCategories || topTags || topViewed) && (
        <div className="grid gap-3 md:grid-cols-3">
          {topCategories && (
            <RankedList
              title="Categorias com mais conteúdo"
              emptyMessage="Nenhuma categoria ainda."
              items={topCategories.map((category) => ({
                key: category.id,
                label: category.name,
                value: category.entryCount,
              }))}
            />
          )}
          {topTags && (
            <RankedList
              title="Tags com mais conteúdo"
              emptyMessage="Nenhuma tag ainda."
              items={topTags.map((contentType) => ({
                key: contentType.id,
                label: contentType.name,
                value: contentType.entryCount,
              }))}
            />
          )}
          {topViewed && (
            <RankedList
              title="Mais acessados"
              emptyMessage="Nenhum acesso registrado ainda."
              items={topViewed.map((entry) => ({
                key: entry.id,
                label: entry.title,
                value: entry.viewCount,
                href: `/admin/cms/entries/${entry.id}`,
              }))}
            />
          )}
        </div>
      )}
    </section>
  );
}

function RankedList({
  title,
  emptyMessage,
  items,
}: {
  title: string;
  emptyMessage: string;
  items: { key: string; label: string; value: number; href?: string }[];
}) {
  return (
    <div className="rounded-panel border border-border bg-card ui-panel-padding-roomy">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground/56">{emptyMessage}</p>
      ) : (
        <ol className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li key={item.key} className="flex items-center justify-between gap-3 text-sm">
              {item.href ? (
                <Link
                  href={item.href}
                  className="min-w-0 flex-1 truncate rounded-sm text-foreground outline-none ui-motion-base hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="min-w-0 flex-1 truncate text-foreground">{item.label}</span>
              )}
              <span className="shrink-0 text-xs text-muted-foreground">{item.value}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
