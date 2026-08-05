import { beforeEach, describe, expect, it, vi } from "vitest";

const getDonationSettings = vi.fn();
vi.mock("../get-donation-settings/service", () => ({
  getDonationSettings: (...args: unknown[]) => getDonationSettings(...args),
}));

const qrCodeToString = vi.fn();
vi.mock("qrcode", () => ({
  default: { toString: (...args: unknown[]) => qrCodeToString(...args) },
}));

describe("buildDonationPixCode", () => {
  beforeEach(() => {
    getDonationSettings.mockReset();
    qrCodeToString.mockReset();
  });

  it("returns a business error when the PIX key/recipient hasn't been configured yet", async () => {
    getDonationSettings.mockResolvedValue({
      success: true,
      data: { pixKey: "", recipientName: "", recipientCity: "", suggestedAmounts: [], title: "", message: "" },
    });

    const { buildDonationPixCode } = await import("./service");
    const result = await buildDonationPixCode({ amount: null });

    expect(result).toEqual({
      success: false,
      error: { code: "donations.not_configured", message: expect.any(String) },
    });
    expect(qrCodeToString).not.toHaveBeenCalled();
  });

  it("builds a BR Code payload and SVG QR code from the settings and the given amount", async () => {
    getDonationSettings.mockResolvedValue({
      success: true,
      data: {
        pixKey: "doacoes@example.org",
        recipientName: "Instituto Exemplo",
        recipientCity: "Curitiba",
        suggestedAmounts: [20],
        title: "Faça uma doação",
        message: "Obrigado",
      },
    });
    qrCodeToString.mockResolvedValue("<svg>qr</svg>");

    const { buildDonationPixCode } = await import("./service");
    const result = await buildDonationPixCode({ amount: 25 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.qrSvg).toBe("<svg>qr</svg>");
      expect(result.data.amount).toBe(25);
      expect(result.data.payload).toContain("doacoes@example.org");
    }
    expect(qrCodeToString).toHaveBeenCalledWith(expect.any(String), { type: "svg", margin: 1 });
  });

  it("builds a payload without an amount field when amount is null", async () => {
    getDonationSettings.mockResolvedValue({
      success: true,
      data: {
        pixKey: "doacoes@example.org",
        recipientName: "Instituto Exemplo",
        recipientCity: "Curitiba",
        suggestedAmounts: [],
        title: "t",
        message: "m",
      },
    });
    qrCodeToString.mockResolvedValue("<svg>qr</svg>");

    const { buildDonationPixCode } = await import("./service");
    const result = await buildDonationPixCode({ amount: null });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBeNull();
    }
  });
});
