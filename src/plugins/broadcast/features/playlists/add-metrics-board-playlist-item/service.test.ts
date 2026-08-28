import { beforeEach, describe, expect, it, vi } from "vitest";

const isPluginActive = vi.fn();
vi.mock("@/platform/plugin-engine/is-plugin-active", () => ({
  isPluginActive: (...a: unknown[]) => isPluginActive(...a),
}));

const listMetricsBoards = vi.fn();
vi.mock("@/plugins/company-metrics", () => ({
  listMetricsBoards: (...a: unknown[]) => listMetricsBoards(...a),
}));

const addWebpagePlaylistItem = vi.fn();
vi.mock("../add-webpage-playlist-item/service", () => ({
  addWebpagePlaylistItem: (...a: unknown[]) => addWebpagePlaylistItem(...a),
}));

describe("addMetricsBoardPlaylistItem", () => {
  beforeEach(() => {
    isPluginActive.mockReset();
    listMetricsBoards.mockReset();
    addWebpagePlaylistItem.mockReset();
  });

  it("refuses when the company-metrics plugin is not active", async () => {
    isPluginActive.mockResolvedValue(false);

    const { addMetricsBoardPlaylistItem } = await import("./service");
    const result = await addMetricsBoardPlaylistItem({ playlistId: "p1", boardToken: "tok", actorId: "a1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("broadcast.add-metrics-board-playlist-item.plugin_inactive");
    expect(addWebpagePlaylistItem).not.toHaveBeenCalled();
  });

  it("refuses when the token does not match any board", async () => {
    isPluginActive.mockResolvedValue(true);
    listMetricsBoards.mockResolvedValue({ success: true, data: [{ token: "other", label: "Recepção" }] });

    const { addMetricsBoardPlaylistItem } = await import("./service");
    const result = await addMetricsBoardPlaylistItem({ playlistId: "p1", boardToken: "tok", actorId: "a1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("broadcast.add-metrics-board-playlist-item.board_not_found");
  });

  it("delegates to the webpage item path with the resolved TV url", async () => {
    isPluginActive.mockResolvedValue(true);
    listMetricsBoards.mockResolvedValue({ success: true, data: [{ token: "tok123", label: "TV do comercial" }] });
    addWebpagePlaylistItem.mockResolvedValue({ success: true, data: { id: "item-1" } });

    const { addMetricsBoardPlaylistItem } = await import("./service");
    const result = await addMetricsBoardPlaylistItem({ playlistId: "p1", boardToken: "tok123", durationSeconds: 45, actorId: "a1" });

    expect(result).toEqual({ success: true, data: { id: "item-1" } });
    expect(addWebpagePlaylistItem).toHaveBeenCalledWith({
      playlistId: "p1",
      url: "/company-metrics/tv/tok123",
      title: "TV do comercial",
      durationSeconds: 45,
      withAudio: false,
      actorId: "a1",
    });
  });
});
