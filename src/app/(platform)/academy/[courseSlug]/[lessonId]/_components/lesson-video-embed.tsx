// Parser puro — sem estado, sem client component. Cobre os formatos de URL mais comuns de
// YouTube e Vimeo; URL não reconhecida cai no fallback de link simples (item 3 do pedido da
// sessão: aluno não devia precisar sair da plataforma pra assistir).
type EmbeddableVideo = { provider: "youtube" | "vimeo"; embedUrl: string };

function parseEmbeddableVideoUrl(rawUrl: string): EmbeddableVideo | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      const videoId = url.searchParams.get("v");
      if (videoId) return { provider: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}` };
      return null;
    }
    const match = url.pathname.match(/^\/(embed|shorts)\/([^/]+)/);
    if (match) return { provider: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${match[2]}` };
    return null;
  }

  if (host === "youtu.be") {
    const videoId = url.pathname.slice(1);
    if (videoId) return { provider: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}` };
    return null;
  }

  if (host === "vimeo.com") {
    const match = url.pathname.match(/^\/(\d+)/);
    if (match) return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${match[1]}` };
    return null;
  }

  if (host === "player.vimeo.com") {
    const match = url.pathname.match(/^\/video\/(\d+)/);
    if (match) return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${match[1]}` };
    return null;
  }

  return null;
}

export function LessonVideoEmbed({ url }: { url: string }) {
  const video = parseEmbeddableVideoUrl(url);

  if (!video) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="text-sm text-info hover:underline">
        {url}
      </a>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded border border-border-subtle">
      <iframe
        src={video.embedUrl}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
