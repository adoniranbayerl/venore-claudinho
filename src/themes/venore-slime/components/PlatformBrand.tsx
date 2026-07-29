import type { HeaderBrand } from "@/contexts/themes";

// Capacidade portada de PlatformBrand do protótipo (venore-docks) — modo texto/svg/png, variante
// scrolled, posição. Dimensionamento reescrito: em vez dos 4 números mágicos px do protótipo
// (base mobile/desktop hardcoded duas vezes) e da tabela de limiares de escala no scroll
// (0.72–0.84), a altura vem do token --ui-control-height-lg multiplicado pela porcentagem de
// `size`/`scrolledSize` (ambos já configuráveis via settings, não mais um "talvez" opcional), e
// a largura é derivada por aspect-ratio — não há dois números independentes pra manter em sync.
const BRAND_ASPECT_RATIO = "100 / 68";

export function PlatformBrand({
  name,
  mode,
  size,
  scrolledSize,
  position,
  isScrolled,
  logoUrl,
  scrolledLogoUrl,
}: HeaderBrand & { isScrolled: boolean }) {
  const originClass = position === "center" ? "origin-center" : "origin-left";
  const scale = isScrolled ? scrolledSize / size : 1;

  if (mode === "text") {
    return <span className="font-medium">{name}</span>;
  }

  const resolvedUrl = mode === "png" && isScrolled ? scrolledLogoUrl : logoUrl;

  return (
    <span
      className={
        "block h-[calc(var(--ui-control-height-lg)*(var(--brand-size-pct)/100))] " +
        "md:h-[calc(var(--ui-control-height-lg)*1.6*(var(--brand-size-pct)/100))] " +
        originClass +
        " ui-motion-emphasis"
      }
      style={{
        aspectRatio: BRAND_ASPECT_RATIO,
        transform: `scale(${scale})`,
        ["--brand-size-pct" as string]: size,
      }}
    >
      {mode === "svg" ? (
        <span
          aria-label={name}
          role="img"
          className="block h-full w-full bg-current"
          style={{
            maskImage: `url('${resolvedUrl}')`,
            WebkitMaskImage: `url('${resolvedUrl}')`,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
            maskSize: "contain",
            WebkitMaskSize: "contain",
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolvedUrl} alt={name} className="h-full w-full object-contain" />
      )}
    </span>
  );
}
