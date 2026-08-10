import { describe, expect, it } from "vitest";
import { sanitizeSvgBuffer } from "./sanitize-svg-buffer";

describe("sanitizeSvgBuffer", () => {
  it("removes <script> tags", () => {
    const input = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><circle r="1"/></svg>');
    const result = sanitizeSvgBuffer(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.toString("utf8")).not.toContain("<script");
      expect(result.data.toString("utf8")).not.toContain("alert(1)");
    }
  });

  it("removes event-handler attributes like onload/onclick", () => {
    const input = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><circle onclick="alert(2)" r="1"/></svg>');
    const result = sanitizeSvgBuffer(input);
    expect(result.success).toBe(true);
    if (result.success) {
      const clean = result.data.toString("utf8");
      expect(clean).not.toContain("onload");
      expect(clean).not.toContain("onclick");
    }
  });

  it("removes external URI references (href pointing outside the file)", () => {
    const input = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><a href="http://evil.example/x"><circle r="1"/></a></svg>',
    );
    const result = sanitizeSvgBuffer(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.toString("utf8")).not.toContain("evil.example");
    }
  });

  it("keeps internal fragment references (href=\"#id\")", () => {
    const input = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><a href="#dot"><circle r="1"/></a></svg>');
    const result = sanitizeSvgBuffer(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.toString("utf8")).toContain('href="#dot"');
    }
  });

  it("removes <foreignObject> (can embed arbitrary HTML/script)", () => {
    const input = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><body xmlns="http://www.w3.org/1999/xhtml"><script>alert(1)</script></body></foreignObject></svg>',
    );
    const result = sanitizeSvgBuffer(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.toString("utf8")).not.toContain("foreignObject");
    }
  });

  it("keeps a well-formed SVG mostly intact", () => {
    const input = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"/></svg>');
    const result = sanitizeSvgBuffer(input);
    expect(result.success).toBe(true);
    if (result.success) {
      const clean = result.data.toString("utf8");
      expect(clean).toContain("<svg");
      expect(clean).toContain("<circle");
      expect(clean).toContain('fill="red"');
    }
  });

  it("rejects input that isn't an SVG at all", () => {
    const input = Buffer.from("<html><body>not an svg</body></html>");
    const result = sanitizeSvgBuffer(input);
    expect(result).toEqual({
      success: false,
      error: { code: "media.upload.invalid_svg", message: expect.any(String) },
    });
  });
});
