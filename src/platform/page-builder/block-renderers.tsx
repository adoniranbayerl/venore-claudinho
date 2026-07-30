import "server-only";
import type { ReactNode } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import type { Block, Composition } from "@/contexts/cms";
import { getMedia } from "@/contexts/media";
import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { blockRenderers as academyBlockRenderers } from "@/plugins/academy";
import { blockRenderers as birthdaysBlockRenderers } from "@/plugins/birthdays";
import { PLUGIN_REGISTRY } from "@/plugins/registry";
import { ROW_BLOCK_KEY, ROW_COLUMN_GRID_CLASSES, resolveRowColumns } from "./row-columns";

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

// "edit": bloco não configurado vira placeholder visível (o editor precisa mostrar que o botão
// existe mas está incompleto). "published": some, como sempre foi — pedido explícito da sessão
// pra parar de confundir "não configurado" com "não existe" só no modo edit.
export type BlockRenderMode = "edit" | "published";

// Assinatura única pra todo renderer de bloco (core ou plugin) — row deixa de ser caso
// especial: renderBlocks é o mesmo renderer recursivo do block-renderer.tsx, injetado, então
// um plugin futuro com blocos de "areas" tem o mesmo mecanismo que row usa.
export type BlockRendererProps = {
  block: Block;
  mode: BlockRenderMode;
  renderBlocks: (blocks: Composition) => Promise<ReactNode>;
};
export type BlockRendererComponent = (props: BlockRendererProps) => ReactNode | Promise<ReactNode>;

const GAP_CLASSES: Record<string, string> = {
  sm: "gap-2 sm:gap-3",
  md: "gap-3 sm:gap-4",
  lg: "gap-4 sm:gap-6",
};

const ALIGN_CLASSES: Record<string, string> = {
  start: "items-start",
  center: "items-center",
  stretch: "items-stretch",
};

const SURFACE_CLASSES: Record<string, string> = {
  none: "",
  panel: "rounded-panel bg-card p-4",
  elevated: "rounded-panel bg-muted p-4",
};

const WIDTH_CLASSES: Record<string, string> = {
  full: "w-full",
  medium: "mx-auto w-full max-w-md",
  small: "mx-auto w-full max-w-xs",
};

const HEADING_ALIGN_CLASSES: Record<string, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

const HEADING_SIZE_CLASSES: Record<number, string> = {
  1: "text-4xl",
  2: "text-3xl",
  3: "text-2xl",
  4: "text-xl",
};

const BUTTON_VARIANTS = new Set<ButtonVariant>(["default", "outline", "secondary", "ghost"]);

function readString(data: Block["data"], key: string, fallback = ""): string {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

async function RowBlock({ block, renderBlocks }: BlockRendererProps) {
  const columns = resolveRowColumns(block.data);
  const gap = GAP_CLASSES[readString(block.data, "gap", "md")] ?? GAP_CLASSES.md;
  const align = ALIGN_CLASSES[readString(block.data, "align", "stretch")] ?? ALIGN_CLASSES.stretch;
  const surface = SURFACE_CLASSES[readString(block.data, "surface", "none")] ?? "";

  // Só as N primeiras areas (na ordem em que foram criadas: col-1..col-4) — bloco em coluna
  // oculta continua no dado, só não é renderizado aqui (o editor mostra o aviso).
  const areas = await Promise.all(
    block.areas.slice(0, columns).map(async (area) => ({
      key: area.key,
      content: await renderBlocks(area.blocks),
    })),
  );

  return (
    <div className={cn("grid", ROW_COLUMN_GRID_CLASSES[columns] ?? ROW_COLUMN_GRID_CLASSES[2], gap, align, surface)}>
      {areas.map(({ key, content }) => (
        <div key={key}>{content}</div>
      ))}
    </div>
  );
}

function HeadingBlock({ block }: BlockRendererProps) {
  const data = block.data;
  const level = Number(data.level) || 2;
  const text = readString(data, "text");
  const align = HEADING_ALIGN_CLASSES[readString(data, "align", "start")] ?? HEADING_ALIGN_CLASSES.start;
  const className = cn("font-semibold tracking-tight text-foreground", HEADING_SIZE_CLASSES[level] ?? HEADING_SIZE_CLASSES[2], align);

  if (level === 1) return <h1 className={className}>{text}</h1>;
  if (level === 3) return <h3 className={className}>{text}</h3>;
  if (level === 4) return <h4 className={className}>{text}</h4>;
  return <h2 className={className}>{text}</h2>;
}

function RichtextBlock({ block }: BlockRendererProps) {
  const markdown = readString(block.data, "markdown");

  return (
    <div
      className={cn(
        "max-w-none space-y-3 text-foreground",
        "[&_a]:text-primary [&_a]:underline",
        "[&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold",
        "[&_p]:leading-relaxed",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
      )}
    >
      {/* react-markdown nunca renderiza HTML cru do markdown de origem (sem dangerouslySetInnerHTML,
          sem rehype-raw) — é a sanitização exigida pra conteúdo de usuário nesta sessão. */}
      <Markdown>{markdown}</Markdown>
    </div>
  );
}

async function ImageBlock({ block }: BlockRendererProps) {
  const data = block.data;
  const mediaId = readString(data, "mediaId");
  const mediaResult = await getMedia({ id: mediaId });
  if (!mediaResult.success || !mediaResult.data) {
    return null;
  }

  const media = mediaResult.data;
  const alt = readString(data, "alt", media.filename);
  const caption = readString(data, "caption");
  const width = WIDTH_CLASSES[readString(data, "width", "full")] ?? WIDTH_CLASSES.full;

  return (
    <figure className={width}>
      {/* eslint-disable-next-line @next/next/no-img-element -- mesmo padrão de media-picker-field.tsx, sem domínio remoto configurado pra next/image */}
      <img src={media.url} alt={alt} className="w-full rounded-panel object-cover" />
      {caption && <figcaption className="mt-1 text-xs text-muted-foreground/56">{caption}</figcaption>}
    </figure>
  );
}

function ButtonBlock({ block }: BlockRendererProps) {
  const data = block.data;
  const href = readString(data, "href");
  const label = readString(data, "label", "Saiba mais");
  const requestedVariant = readString(data, "variant", "default") as ButtonVariant;
  const variant = BUTTON_VARIANTS.has(requestedVariant) ? requestedVariant : "default";

  return (
    <Button asChild variant={variant}>
      <Link href={href}>{label}</Link>
    </Button>
  );
}

const CORE_BLOCK_RENDERERS: Record<string, BlockRendererComponent> = {
  [ROW_BLOCK_KEY]: RowBlock,
  "core.content.heading": HeadingBlock,
  "core.content.richtext": RichtextBlock,
  "core.content.image": ImageBlock,
  "core.content.button": ButtonBlock,
};

// Mesmo padrão de PLUGIN_BLOCK_BARRELS em block-registry.ts: import estático (Next exige pra
// bundling), chave = manifest.key, filtrado por PLUGIN_REGISTRY. Paralelo ao registry de
// definitions, mas nunca cruza o boundary RSC — este módulo é "server-only".
const PLUGIN_BLOCK_RENDERER_BARRELS: Record<string, { blockRenderers?: Record<string, BlockRendererComponent> }> = {
  academy: { blockRenderers: academyBlockRenderers },
  birthdays: { blockRenderers: birthdaysBlockRenderers },
};

function collectPluginRenderers(): Record<string, BlockRendererComponent> {
  return Object.assign(
    {},
    ...PLUGIN_REGISTRY.map((manifest) => PLUGIN_BLOCK_RENDERER_BARRELS[manifest.key]?.blockRenderers ?? {}),
  );
}

const ALL_BLOCK_RENDERERS: Record<string, BlockRendererComponent> = {
  ...CORE_BLOCK_RENDERERS,
  ...collectPluginRenderers(),
};

export function resolveBlockRenderer(key: string): BlockRendererComponent | null {
  return ALL_BLOCK_RENDERERS[key] ?? null;
}

export function listBlockRendererKeys(): string[] {
  return Object.keys(ALL_BLOCK_RENDERERS);
}
