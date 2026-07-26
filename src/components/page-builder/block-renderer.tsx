import Link from "next/link";
import Markdown from "react-markdown";
import { isBlockConfigured, type Block, type Composition } from "@/contexts/cms";
import { getMedia } from "@/contexts/media";
import { resolveBlockDefinition } from "@/platform/page-builder/block-registry";
import { ROW_BLOCK_KEY, ROW_COLUMN_GRID_CLASSES, resolveRowColumns } from "@/platform/page-builder/row-columns";
import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { AcademyCourseCardBlock } from "./academy/course-card-block";
import { AcademyCourseListBlock } from "./academy/course-list-block";
import { AcademyEnrollCtaBlock } from "./academy/enroll-cta-block";

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

// "edit": bloco não configurado vira placeholder visível (o editor precisa mostrar que o botão
// existe mas está incompleto). "published": some, como sempre foi — pedido explícito da sessão
// pra parar de confundir "não configurado" com "não existe" só no modo edit.
export type BlockRenderMode = "edit" | "published";

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
  panel: "rounded-panel bg-surface-panel p-4",
  elevated: "rounded-panel bg-surface-elevated p-4",
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

function isDev() {
  return process.env.NODE_ENV !== "production";
}

function readString(data: Block["data"], key: string, fallback = ""): string {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

// Bloco desconhecido (key sem definition resolvível) não deve derrubar a página em produção —
// entries com composição de um plugin desativado, ou de uma versão futura do editor, ainda
// precisam renderizar o resto. Em dev, um aviso discreto ajuda a notar o problema cedo.
function UnknownBlockWarning({ blockKey }: { blockKey: string }) {
  if (!isDev()) {
    return null;
  }
  return (
    <div className="rounded border border-dashed border-destructive/50 p-2 text-xs text-destructive">
      Bloco desconhecido: {blockKey}
    </div>
  );
}

function UnconfiguredBlockPlaceholder({ label, missingMessage }: { label: string; missingMessage: string }) {
  return (
    <div className="rounded border border-dashed border-border-subtle p-3 text-xs">
      <p className="font-medium text-text-secondary">{label}</p>
      <p className="mt-1 text-text-tertiary">{missingMessage}</p>
    </div>
  );
}

export async function BlockRenderer({ blocks, mode }: { blocks: Composition; mode: BlockRenderMode }) {
  const rendered = await Promise.all(blocks.map((block) => renderBlock(block, mode)));
  return <>{rendered}</>;
}

async function renderBlock(block: Block, mode: BlockRenderMode) {
  const definition = resolveBlockDefinition(block.key);
  if (!definition) {
    return <UnknownBlockWarning key={block.id} blockKey={block.key} />;
  }

  if (!isBlockConfigured(definition, block.data)) {
    if (mode === "published") {
      return null;
    }
    return (
      <UnconfiguredBlockPlaceholder
        key={block.id}
        label={definition.label}
        missingMessage={definition.missingConfigMessage ?? "Bloco não configurado."}
      />
    );
  }

  switch (block.key) {
    case ROW_BLOCK_KEY:
      return <RowBlock key={block.id} block={block} mode={mode} />;
    case "core.content.heading":
      return <HeadingBlock key={block.id} data={block.data} />;
    case "core.content.richtext":
      return <RichtextBlock key={block.id} data={block.data} />;
    case "core.content.image":
      return <ImageBlock key={block.id} data={block.data} />;
    case "core.content.button":
      return <ButtonBlock key={block.id} data={block.data} />;
    case "academy.course.list":
      return <AcademyCourseListBlock key={block.id} data={block.data} />;
    case "academy.course.card":
      return <AcademyCourseCardBlock key={block.id} data={block.data} />;
    case "academy.enroll.cta":
      return <AcademyEnrollCtaBlock key={block.id} data={block.data} />;
    default:
      return <UnknownBlockWarning key={block.id} blockKey={block.key} />;
  }
}

async function RowBlock({ block, mode }: { block: Block; mode: BlockRenderMode }) {
  const columns = resolveRowColumns(block.data);
  const gap = GAP_CLASSES[readString(block.data, "gap", "md")] ?? GAP_CLASSES.md;
  const align = ALIGN_CLASSES[readString(block.data, "align", "stretch")] ?? ALIGN_CLASSES.stretch;
  const surface = SURFACE_CLASSES[readString(block.data, "surface", "none")] ?? "";

  // Só as N primeiras areas (na ordem em que foram criadas: col-1..col-4) — bloco em coluna
  // oculta continua no dado, só não é renderizado aqui (o editor mostra o aviso).
  const areas = await Promise.all(
    block.areas.slice(0, columns).map(async (area) => ({
      key: area.key,
      content: await Promise.all(area.blocks.map((child) => renderBlock(child, mode))),
    })),
  );

  return (
    <div
      className={cn(
        "grid",
        ROW_COLUMN_GRID_CLASSES[columns] ?? ROW_COLUMN_GRID_CLASSES[2],
        gap,
        align,
        surface,
      )}
    >
      {areas.map(({ key, content }) => (
        <div key={key}>{content}</div>
      ))}
    </div>
  );
}

function HeadingBlock({ data }: { data: Block["data"] }) {
  const level = Number(data.level) || 2;
  const text = readString(data, "text");
  const align = HEADING_ALIGN_CLASSES[readString(data, "align", "start")] ?? HEADING_ALIGN_CLASSES.start;
  const className = cn("font-semibold tracking-tight text-text-primary", HEADING_SIZE_CLASSES[level] ?? HEADING_SIZE_CLASSES[2], align);

  if (level === 1) return <h1 className={className}>{text}</h1>;
  if (level === 3) return <h3 className={className}>{text}</h3>;
  if (level === 4) return <h4 className={className}>{text}</h4>;
  return <h2 className={className}>{text}</h2>;
}

function RichtextBlock({ data }: { data: Block["data"] }) {
  const markdown = readString(data, "markdown");

  return (
    <div
      className={cn(
        "max-w-none space-y-3 text-text-primary",
        "[&_a]:text-text-accent [&_a]:underline",
        "[&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold",
        "[&_p]:leading-relaxed",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border-subtle [&_blockquote]:pl-3 [&_blockquote]:text-text-secondary",
      )}
    >
      {/* react-markdown nunca renderiza HTML cru do markdown de origem (sem dangerouslySetInnerHTML,
          sem rehype-raw) — é a sanitização exigida pra conteúdo de usuário nesta sessão. */}
      <Markdown>{markdown}</Markdown>
    </div>
  );
}

async function ImageBlock({ data }: { data: Block["data"] }) {
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
      {caption && <figcaption className="mt-1 text-xs text-text-tertiary">{caption}</figcaption>}
    </figure>
  );
}

function ButtonBlock({ data }: { data: Block["data"] }) {
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
