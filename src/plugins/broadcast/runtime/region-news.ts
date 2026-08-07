import { getSetting } from "@/contexts/settings";
import { getCache, setCache } from "@/infrastructure/cache/memory-cache";
import { BROADCAST_SETTINGS } from "../shared/settings";
import type { RegionNewsArticle } from "../contracts/types";

// Infra de runtime (chamada externa cacheada), não uma feature — mesmo espírito de
// runtime/region-weather.ts. NEWSDATA_API_KEY é opcional: sem ela a layer "news" fica vazia (sem
// erro pro operador, sem travar a página) — decisão explícita, não um bug de silenciar erro.
const NEWS_CACHE_TTL_SECONDS = 60 * 20;
// TTL curto pra resultado vazio (chave/API/rede falhou, ou a busca não achou nada) — não trava um
// erro passageiro em cache pelos 20min inteiros; achado direto na prática (403 de "region" ficou
// "sem notícia" por vários minutos até o cache expirar, mascarando o fix).
const EMPTY_RESULT_CACHE_TTL_SECONDS = 60;
const NEWS_ENDPOINT = "https://newsdata.io/api/1/latest";

type CachedEnvelope<T> = { value: T };

type NewsDataArticle = {
  title?: string;
  description?: string | null;
  link?: string;
  image_url?: string | null;
  source_name?: string | null;
  source_id?: string | null;
};

// Retorna [] quando a chave não está configurada, a região não está configurada, ou a API falha —
// nunca lança. A layer "news" mostra um estado vazio nesses casos, nunca quebra a página.
export async function resolveRegionNews(): Promise<RegionNewsArticle[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) return [];

  const regionSetting = await getSetting({ key: BROADCAST_SETTINGS.region.key });
  const region = regionSetting.success && typeof regionSetting.data?.value === "string" ? regionSetting.data.value : "";
  if (!region.trim()) return [];

  const cacheKey = `broadcast:news:${region.toLowerCase()}`;
  const cached = getCache<CachedEnvelope<RegionNewsArticle[]>>(cacheKey);
  if (cached) return cached.value;

  let articles: RegionNewsArticle[] = [];
  try {
    const url = new URL(NEWS_ENDPOINT);
    url.searchParams.set("apikey", apiKey);
    // "region" parece o parâmetro certo pela documentação pública, mas na prática retorna 403
    // ("Access Denied! To use the region parameter, please upgrade your plan") no plano free —
    // testado direto contra a API antes deste fix, não é suposição. "q" (busca livre) funciona no
    // free tier e devolve resultado com imagem — só o primeiro pedaço antes da vírgula (a cidade,
    // sem estado/país) pra não poluir a busca com texto que reduz o recall.
    const query = region.split(",")[0]?.trim() || region;
    url.searchParams.set("q", query);
    url.searchParams.set("language", "pt");
    url.searchParams.set("image", "1");
    url.searchParams.set("size", "10");

    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (response.ok) {
      const body = (await response.json()) as { results?: NewsDataArticle[] };
      articles = (body.results ?? [])
        .filter((article): article is NewsDataArticle & { title: string; link: string } => Boolean(article.title && article.link))
        .map((article) => ({
          title: article.title,
          description: article.description ?? null,
          link: article.link,
          imageUrl: article.image_url ?? null,
          sourceName: article.source_name ?? article.source_id ?? null,
        }));
    }
  } catch {
    articles = [];
  }

  const ttl = articles.length > 0 ? NEWS_CACHE_TTL_SECONDS : EMPTY_RESULT_CACHE_TTL_SECONDS;
  setCache<CachedEnvelope<RegionNewsArticle[]>>(cacheKey, { value: articles }, ttl);
  return articles;
}
