import { describe, expect, it } from "vitest";
import { DEFAULT_BIRTHDAY_APPEARANCE } from "../../shared/appearance";
import { buildBirthdayPdfHtml } from "./build-birthday-pdf-html";

const baseInput = {
  monthLabel: "JANEIRO - 2026",
  appearance: DEFAULT_BIRTHDAY_APPEARANCE,
  brandMode: "svg" as const,
  brandAssetUrl: "data:image/svg+xml;base64,AAAA",
  brandName: "Venore",
  brandColor: "#143b52",
  giftSvgMarkup: '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#fff" /></svg>',
};

describe("buildBirthdayPdfHtml", () => {
  it("gera o documento sem erro para uma lista real de aniversariantes", () => {
    const html = buildBirthdayPdfHtml({
      ...baseInput,
      birthdays: [
        { id: "1", fullName: "Maria da Silva Santos", role: "Recepção", day: 12 },
        { id: "2", fullName: "João Pedro", role: null, day: 3 },
      ],
    });

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("@page");
    expect(html).toContain("size: A4 portrait");
    expect(html).toContain("JANEIRO - 2026");
    expect(html).toContain("João Pedro");
    expect(html).toContain("Equipe");
    expect(html).not.toContain("undefined");
  });

  it("força impressão de cor de fundo (print-color-adjust:exact), senão cards e marca somem sem a opção de gráficos de fundo do navegador", () => {
    const html = buildBirthdayPdfHtml({ ...baseInput, birthdays: [] });

    expect(html).toContain("print-color-adjust: exact");
    expect(html).toContain("-webkit-print-color-adjust: exact");
  });

  it("gera o documento sem erro para lista vazia, com a grade preenchida por slots vazios", () => {
    // Nota de fidelidade: igual ao fem-colaborador, a mensagem "Nenhum aniversariante..." é
    // um fallback inalcançável — a grade de slots vazios (resolvePdfGridLayout) sempre produz uma
    // string não-vazia, então o `cards || <mensagem>` nunca cai no branch de mensagem. Mantido
    // idêntico de propósito: divergir aqui quebraria a fidelidade visual exigida.
    const html = buildBirthdayPdfHtml({ ...baseInput, birthdays: [] });

    expect(html).toContain("<!doctype html>");
    expect(html).toContain('class="birthday-card is-empty"');
    expect(html).not.toContain("undefined");
  });

  it("escapa HTML no nome e no cargo para evitar injeção no documento impresso", () => {
    const html = buildBirthdayPdfHtml({
      ...baseInput,
      birthdays: [{ id: "1", fullName: "<script>alert(1)</script>", role: "<b>x</b>", day: 1 }],
    });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("adiciona nota de excedente quando a quantidade ultrapassa o limite de uma página", () => {
    const birthdays = Array.from({ length: 60 }, (_, index) => ({
      id: `id-${index}`,
      fullName: `Pessoa ${index}`,
      role: null,
      day: (index % 28) + 1,
    }));

    const html = buildBirthdayPdfHtml({ ...baseInput, birthdays });

    expect(html).toContain("registros não exibidos por limite de uma página");
  });
});
