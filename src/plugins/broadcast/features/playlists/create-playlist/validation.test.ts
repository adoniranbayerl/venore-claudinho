import { describe, expect, it } from "vitest";
import { validateCreatePlaylistInput } from "./validation";

describe("validateCreatePlaylistInput", () => {
  it("accepts a valid name without a folder path", () => {
    expect(validateCreatePlaylistInput({ name: "Comerciais" })).toBeNull();
  });

  it("accepts a plain relative folder path", () => {
    expect(validateCreatePlaylistInput({ name: "Comerciais", folderPath: "clips/comerciais" })).toBeNull();
  });

  it("rejects an empty name", () => {
    expect(validateCreatePlaylistInput({ name: "   " })?.code).toBe("broadcast.create-playlist.invalid_name");
  });

  it("rejects a folder path with a parent-directory segment", () => {
    expect(validateCreatePlaylistInput({ name: "Comerciais", folderPath: "../secrets" })?.code).toBe(
      "broadcast.create-playlist.invalid_folder_path",
    );
  });

  it("rejects a folder path with a parent-directory segment nested deeper", () => {
    expect(validateCreatePlaylistInput({ name: "Comerciais", folderPath: "clips/../../secrets" })?.code).toBe(
      "broadcast.create-playlist.invalid_folder_path",
    );
  });

  it("rejects an absolute unix-style folder path", () => {
    expect(validateCreatePlaylistInput({ name: "Comerciais", folderPath: "/etc/passwd" })?.code).toBe(
      "broadcast.create-playlist.invalid_folder_path",
    );
  });

  it("rejects an absolute windows-style folder path", () => {
    expect(validateCreatePlaylistInput({ name: "Comerciais", folderPath: "C:\\Windows" })?.code).toBe(
      "broadcast.create-playlist.invalid_folder_path",
    );
  });
});
