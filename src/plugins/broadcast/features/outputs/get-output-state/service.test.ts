import { beforeEach, describe, expect, it, vi } from "vitest";

const getMediaAsset = vi.fn();
vi.mock("@/contexts/media", () => ({
  getMediaAsset: (...args: unknown[]) => getMediaAsset(...args),
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
const findActiveAlertMessage = vi.fn();
vi.mock("./store", () => ({
  findOutputByToken: (...args: unknown[]) => findOutputByToken(...args),
  findSceneById: (...args: unknown[]) => findSceneById(...args),
  findLayersBySceneId: (...args: unknown[]) => findLayersBySceneId(...args),
  findVisiblePlaylistItemsByPlaylistId: (...args: unknown[]) => findVisiblePlaylistItemsByPlaylistId(...args),
  findAllAgendas: (...args: unknown[]) => findAllAgendas(...args),
  findAllUpcomingAgendaEvents: (...args: unknown[]) => findAllUpcomingAgendaEvents(...args),
  findActiveAlertMessage: (...args: unknown[]) => findActiveAlertMessage(...args),
}));

describe("getOutputState", () => {
  beforeEach(() => {
    getMediaAsset.mockReset();
    getBrandConfig.mockReset();
    resolveRegionWeather.mockReset();
    resolveRegionNews.mockReset();
    findOutputByToken.mockReset();
    findSceneById.mockReset();
    findLayersBySceneId.mockReset();
    findVisiblePlaylistItemsByPlaylistId.mockReset();
    findAllAgendas.mockReset();
    findAllUpcomingAgendaEvents.mockReset();
    findActiveAlertMessage.mockReset();
  });

  it("fails when the token does not match any output", async () => {
    findOutputByToken.mockResolvedValue(null);

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "missing" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("broadcast.get-output-state.not_found");
  });

  it("returns an empty scene/layers when the output has no current scene", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: false, currentSceneId: null });

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result).toEqual({
      success: true,
      data: {
        outputId: "o1",
        drawerOpen: false,
        scene: null,
        layers: [],
        playlistItemsByPlaylistId: {},
        resolvedAssetUrlByLayerId: {},
        regionWeather: null,
        regionNews: [],
        agendaRotation: [],
        activeAlertMessage: null,
        brandLogoUrl: null,
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

  it("groups upcoming events by agenda, drops agendas with no upcoming events, resolves the brand logo, and also resolves weather (agenda panel shows a weather corner too)", async () => {
    findOutputByToken.mockResolvedValue({ id: "o1", drawerOpen: false, currentSceneId: "s1" });
    findSceneById.mockResolvedValue({ id: "s1", name: "Painel" });
    findLayersBySceneId.mockResolvedValue([{ id: "l1", type: "agenda", config: {} }]);
    findAllAgendas.mockResolvedValue([
      { id: "a1", name: "Semanal", displaySeconds: 20, order: 0, backgroundColor: null },
      { id: "a2", name: "Mensal", displaySeconds: 30, order: 1, backgroundColor: "#1a1a2e" },
    ]);
    findAllUpcomingAgendaEvents.mockResolvedValue([
      { id: "e1", agendaId: "a1", title: "Reunião", startAt: new Date() },
    ]);
    getBrandConfig.mockResolvedValue({ logoUrl: "https://example.com/logo.png" });
    resolveRegionWeather.mockResolvedValue({ temperatureC: 21, weatherCode: 1, conditionLabel: "Céu limpo", emoji: "☀️" });

    const { getOutputState } = await import("./service");
    const result = await getOutputState({ token: "tok-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.agendaRotation).toEqual([
      {
        agenda: { id: "a1", name: "Semanal", displaySeconds: 20, order: 0, backgroundColor: null },
        events: [{ id: "e1", agendaId: "a1", title: "Reunião", startAt: expect.any(Date) }],
      },
    ]);
    expect(result.data.brandLogoUrl).toBe("https://example.com/logo.png");
    expect(getBrandConfig).toHaveBeenCalledWith("png");
    expect(resolveRegionWeather).toHaveBeenCalledTimes(1);
    expect(result.data.regionWeather).toEqual({ temperatureC: 21, weatherCode: 1, conditionLabel: "Céu limpo", emoji: "☀️" });
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
