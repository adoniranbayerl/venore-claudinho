import { beforeEach, describe, expect, it, vi } from "vitest";

const getMediaAsset = vi.fn();
vi.mock("@/contexts/media", () => ({
  getMediaAsset: (...args: unknown[]) => getMediaAsset(...args),
}));

const getSetting = vi.fn();
vi.mock("@/contexts/settings", () => ({
  getSetting: (...args: unknown[]) => getSetting(...args),
}));

const getBrandConfig = vi.fn();
vi.mock("@/platform/brand/get-brand-config", () => ({
  getBrandConfig: (...args: unknown[]) => getBrandConfig(...args),
}));

const resolveRegionWeather = vi.fn();
vi.mock("../../../runtime/region-weather", () => ({
  resolveRegionWeather: (...args: unknown[]) => resolveRegionWeather(...args),
}));

const resolveRegionNews = vi.fn();
vi.mock("../../../runtime/region-news", () => ({
  resolveRegionNews: (...args: unknown[]) => resolveRegionNews(...args),
}));

const findOutputByToken = vi.fn();
const findSceneById = vi.fn();
const findLayersBySceneId = vi.fn();
const findVisiblePlaylistItemsByPlaylistId = vi.fn();
const findAllAgendas = vi.fn();
const findAllUpcomingAgendaEvents = vi.fn();
const findAllOutputAgendaLinks = vi.fn();
const findActiveAlertMessage = vi.fn();
vi.mock("./store", () => ({
  findOutputByToken: (...args: unknown[]) => findOutputByToken(...args),
  findSceneById: (...args: unknown[]) => findSceneById(...args),
  findLayersBySceneId: (...args: unknown[]) => findLayersBySceneId(...args),
  findVisiblePlaylistItemsByPlaylistId: (...args: unknown[]) => findVisiblePlaylistItemsByPlaylistId(...args),
  findAllAgendas: (...args: unknown[]) => findAllAgendas(...args),
  findAllUpcomingAgendaEvents: (...args: unknown[]) => findAllUpcomingAgendaEvents(...args),
  findAllOutputAgendaLinks: (...args: unknown[]) => findAllOutputAgendaLinks(...args),
  findActiveAlertMessage: (...args: unknown[]) => findActiveAlertMessage(...args),
}));

describe("getOutputState", () => {
  beforeEach(() => {
    getMediaAsset.mockReset();
    getSetting.mockReset();
    getBrandConfig.mockReset();
    resolveRegionWeather.mockReset();
    resolveRegionNews.mockReset();
    findOutputByToken.mockReset();
    findSceneById.mockReset();
    findLayersBySceneId.mockReset();
    findVisiblePlaylistItemsByPlaylistId.mockReset();
    findAllAgendas.mockReset();
    findAllUpcomingAgendaEvents.mockReset();
    findAllOutputAgendaLinks.mockReset();
    findActiveAlertMessage.mockReset();
    // Defaults sensatos pra testes que disparam a resolução (agora a camada "video" também
    // dispara clima/logo/cor de marca) mas não se importam com o valor exato.
    getSetting.mockResolvedValue({ success: false });
    getBrandConfig.mockResolvedValue({ logoUrl: null });
    resolveRegionWeather.mockResolvedValue(null);
    // Sem vínculo nenhum = toda agenda aparece em toda saída (modelo opt-out, ver schema) — default
    // que a maioria dos testes de agenda quer, só o teste dedicado abaixo sobrescreve.
    findAllOutputAgendaLinks.mockResolvedValue([]);
  });

  it("fails when the token does not match any output", async () => {
    findOutputByToken.mockResolvedValue(null);

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "missing" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("broadcast.get-output-state.not_found");
  });

  it("returns an empty scene/layers when the output has no current scene", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: false, footerOpen: false, currentSceneId: null });

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result).toEqual({
      success: true,
      data: {
        outputId: "o1",
        drawerOpen: false,
        footerOpen: false,
        scene: null,
        layers: [],
        playlistItemsByPlaylistId: {},
        resolvedAssetUrlByLayerId: {},
        regionWeather: null,
        regionNews: [],
        agendaRotation: [],
        activeAlertMessage: null,
        brandLogoUrl: null,
        brandColor: "#0f0f0f",
      },
    });
    expect(findSceneById).not.toHaveBeenCalled();
    expect(resolveRegionWeather).not.toHaveBeenCalled();
    expect(resolveRegionNews).not.toHaveBeenCalled();
    expect(findAllAgendas).not.toHaveBeenCalled();
    expect(findActiveAlertMessage).not.toHaveBeenCalled();
    expect(getBrandConfig).not.toHaveBeenCalled();
  });

  it("classifies local playlist items as video or image by extension, and resolves asset URLs for image layers", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: true, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Abertura" });
    findLayersBySceneId.mockResolvedValue([
      { id: "l1", type: "video", config: { playlistId: "p1" } },
      { id: "l2", type: "image", config: { mediaAssetId: "asset-1" } },
      { id: "l3", type: "text", config: { text: "Bem-vindo" } },
    ]);
    findVisiblePlaylistItemsByPlaylistId.mockResolvedValue([
      { id: "item-1", order: 0, sourceType: "local", relativePath: "clips/intro.mp4", mediaAssetId: null, url: null, durationSeconds: null },
      { id: "item-2", order: 1, sourceType: "local", relativePath: "clips/slide.jpg", mediaAssetId: null, url: null, durationSeconds: null },
    ]);
    getMediaAsset.mockResolvedValue({ success: true, data: { id: "asset-1", url: "https://blob.example/logo.png" } });

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.playlistItemsByPlaylistId).toEqual({
      p1: [
        { id: "item-1", order: 0, kind: "video", durationSeconds: null, url: null },
        { id: "item-2", order: 1, kind: "image", durationSeconds: 15, url: null },
      ],
    });
    expect(result.data.resolvedAssetUrlByLayerId).toEqual({ l2: "https://blob.example/logo.png" });
  });

  it("defaults webpage items to 60s and news items to 30s when no duration is set", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: false, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Principal" });
    findLayersBySceneId.mockResolvedValue([{ id: "l1", type: "video", config: { playlistId: "p1" } }]);
    findVisiblePlaylistItemsByPlaylistId.mockResolvedValue([
      { id: "item-1", order: 0, sourceType: "webpage", relativePath: null, mediaAssetId: null, url: "/cursos", durationSeconds: null },
      { id: "item-2", order: 1, sourceType: "news", relativePath: null, mediaAssetId: null, url: null, durationSeconds: null },
    ]);
    resolveRegionNews.mockResolvedValue([]);

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.playlistItemsByPlaylistId.p1).toEqual([
      { id: "item-1", order: 0, kind: "webpage", durationSeconds: 60, url: "/cursos" },
      { id: "item-2", order: 1, kind: "news", durationSeconds: 30, url: null },
    ]);
  });

  it("resolves news when a playlist item classifies as news, even without a dedicated news layer", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: false, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Principal" });
    findLayersBySceneId.mockResolvedValue([{ id: "l1", type: "video", config: { playlistId: "p1" } }]);
    findVisiblePlaylistItemsByPlaylistId.mockResolvedValue([
      { id: "item-1", order: 0, sourceType: "news", relativePath: null, mediaAssetId: null, url: null, durationSeconds: null },
    ]);
    resolveRegionNews.mockResolvedValue([{ title: "Notícia", description: null, link: "https://example.com", imageUrl: null, sourceName: null }]);

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(resolveRegionNews).toHaveBeenCalledTimes(1);
    expect(result.success && result.data.regionNews).toHaveLength(1);
  });

  it("groups upcoming events by agenda, drops agendas with no upcoming events, and resolves the brand logo (fallback for agendas without their own)", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: true, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Painel" });
    findLayersBySceneId.mockResolvedValue([{ id: "l1", type: "agenda", config: {} }]);
    findAllAgendas.mockResolvedValue([
      { id: "a1", name: "Semanal", displaySeconds: 20, order: 0, backgroundColor: null, logoMediaAssetId: null },
      { id: "a2", name: "Mensal", displaySeconds: 30, order: 1, backgroundColor: "#1a1a2e", logoMediaAssetId: null },
    ]);
    findAllUpcomingAgendaEvents.mockResolvedValue([
      { id: "e1", agendaId: "a1", title: "Reunião", startAt: new Date(), coverMediaAssetId: null },
    ]);
    getBrandConfig.mockResolvedValue({ logoUrl: "https://example.com/logo.png" });

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.agendaRotation).toEqual([
      {
        agenda: { id: "a1", name: "Semanal", displaySeconds: 20, order: 0, backgroundColor: null, logoMediaAssetId: null },
        events: [{ id: "e1", agendaId: "a1", title: "Reunião", startAt: expect.any(Date), coverMediaAssetId: null, coverUrl: null }],
        logoUrl: null,
      },
    ]);
    expect(result.data.brandLogoUrl).toBe("https://example.com/logo.png");
    expect(getBrandConfig).toHaveBeenCalledWith("png");
    // Relógio/clima saíram da coluna de agenda pra barra inferior da camada "video" — uma cena só
    // com "agenda" não deve mais disparar clima nenhum.
    expect(resolveRegionWeather).not.toHaveBeenCalled();
  });

  it("excludes an agenda restricted to other outputs, but keeps one with no restriction at all (opt-out model)", async () => {
    findOutputByToken.mockResolvedValue({ id: "o-externa", drawerOpen: true, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Painel" });
    findLayersBySceneId.mockResolvedValue([{ id: "l1", type: "agenda", config: {} }]);
    findAllAgendas.mockResolvedValue([
      { id: "a-admin", name: "Administrativo", displaySeconds: 20, order: 0, backgroundColor: null, logoMediaAssetId: null },
      { id: "a-geral", name: "Geral", displaySeconds: 20, order: 1, backgroundColor: null, logoMediaAssetId: null },
    ]);
    findAllUpcomingAgendaEvents.mockResolvedValue([
      { id: "e1", agendaId: "a-admin", title: "Reunião interna", startAt: new Date(), coverMediaAssetId: null },
      { id: "e2", agendaId: "a-geral", title: "Evento aberto", startAt: new Date(), coverMediaAssetId: null },
    ]);
    // "Administrativo" só está vinculada à saída "o-interna" — não deve aparecer em "o-externa".
    // "Geral" não tem nenhum vínculo — aparece em qualquer saída, inclusive "o-externa".
    findAllOutputAgendaLinks.mockResolvedValue([{ outputId: "o-interna", agendaId: "a-admin" }]);

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.agendaRotation.map((entry) => entry.agenda.id)).toEqual(["a-geral"]);
  });

  it("resolves per-agenda logo and per-event cover images via media assets", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: true, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Painel" });
    findLayersBySceneId.mockResolvedValue([{ id: "l1", type: "agenda", config: {} }]);
    findAllAgendas.mockResolvedValue([
      { id: "a1", name: "Semanal", displaySeconds: 20, order: 0, backgroundColor: null, logoMediaAssetId: "logo-1" },
    ]);
    findAllUpcomingAgendaEvents.mockResolvedValue([
      { id: "e1", agendaId: "a1", title: "Reunião", startAt: new Date(), coverMediaAssetId: "cover-1" },
    ]);
    getMediaAsset.mockImplementation(async ({ id }: { id: string }) => {
      if (id === "logo-1") return { success: true, data: { id, url: "https://example.com/agenda-logo.png" } };
      if (id === "cover-1") return { success: true, data: { id, url: "https://example.com/event-cover.jpg" } };
      return { success: true, data: null };
    });

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.agendaRotation[0].logoUrl).toBe("https://example.com/agenda-logo.png");
    expect(result.data.agendaRotation[0].events[0].coverUrl).toBe("https://example.com/event-cover.jpg");
  });

  it("resolves weather, brand logo, and brand color when the output's footer is open (BrandFooterBar needs all three)", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: false, footerOpen: true, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Principal" });
    findLayersBySceneId.mockResolvedValue([{ id: "l1", type: "video", config: { playlistId: "p1" } }]);
    findVisiblePlaylistItemsByPlaylistId.mockResolvedValue([]);
    resolveRegionWeather.mockResolvedValue({ temperatureC: 18, weatherCode: 2, conditionLabel: "Nublado", emoji: "⛅" });
    getBrandConfig.mockResolvedValue({ logoUrl: "https://example.com/logo.png" });
    getSetting.mockResolvedValue({ success: true, data: { value: "#221100" } });

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.regionWeather).toEqual({ temperatureC: 18, weatherCode: 2, conditionLabel: "Nublado", emoji: "⛅" });
    expect(result.data.brandLogoUrl).toBe("https://example.com/logo.png");
    expect(result.data.brandColor).toBe("#221100");
  });

  it("skips weather and brand logo resolution when the output's footer is closed, even with a video layer present", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: false, footerOpen: false, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Principal" });
    findLayersBySceneId.mockResolvedValue([{ id: "l1", type: "video", config: { playlistId: "p1" } }]);
    findVisiblePlaylistItemsByPlaylistId.mockResolvedValue([]);

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.regionWeather).toBeNull();
    expect(result.data.brandLogoUrl).toBeNull();
    expect(resolveRegionWeather).not.toHaveBeenCalled();
    expect(getBrandConfig).not.toHaveBeenCalled();
  });

  it("falls back to the default brand color when the setting is not configured", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: false, footerOpen: true, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Principal" });
    findLayersBySceneId.mockResolvedValue([{ id: "l1", type: "video", config: { playlistId: "p1" } }]);
    findVisiblePlaylistItemsByPlaylistId.mockResolvedValue([]);

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result.success && result.data.brandColor).toBe("#0f0f0f");
  });

  it("skips agenda resolution when the agenda sidebar is closed (drawerOpen=false), even with an agenda layer present", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: false, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Painel" });
    findLayersBySceneId.mockResolvedValue([{ id: "l1", type: "agenda", config: {} }]);

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.agendaRotation).toEqual([]);
    expect(findAllAgendas).not.toHaveBeenCalled();
  });

  it("resolves the active alert message only when the scene has an alert layer", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: false, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Painel" });
    findLayersBySceneId.mockResolvedValue([{ id: "l1", type: "alert", config: {} }]);
    findActiveAlertMessage.mockResolvedValue("Reunião às 15h no auditório");

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result.success && result.data.activeAlertMessage).toBe("Reunião às 15h no auditório");
  });

  it("skips a media asset that no longer resolves instead of failing the whole state", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: false, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Abertura" });
    findLayersBySceneId.mockResolvedValue([{ id: "l2", type: "image", config: { mediaAssetId: "gone" } }]);
    getMediaAsset.mockResolvedValue({ success: true, data: null });

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.resolvedAssetUrlByLayerId).toEqual({});
  });

  it("does not call the weather/news/agenda/alert resolvers when the scene has none of those layer types", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: false, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Vídeo" });
    findLayersBySceneId.mockResolvedValue([{ id: "l1", type: "text", config: { text: "Olá" } }]);

    const { getOutputState } = await import("./service");
    await getOutputState({ token: "tok-1" });

    expect(resolveRegionWeather).not.toHaveBeenCalled();
    expect(resolveRegionNews).not.toHaveBeenCalled();
    expect(findAllAgendas).not.toHaveBeenCalled();
    expect(findActiveAlertMessage).not.toHaveBeenCalled();
  });
});
