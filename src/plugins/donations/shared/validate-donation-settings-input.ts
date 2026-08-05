import { MAX_PIX_KEY_LENGTH, MAX_RECIPIENT_CITY_LENGTH, MAX_RECIPIENT_NAME_LENGTH } from "./settings";

export type DonationSettingsFormInput = {
  pixKey: string;
  recipientName: string;
  recipientCity: string;
  suggestedAmounts: string;
  title: string;
  message: string;
};

export type ParsedDonationSettingsInput = {
  pixKey: string;
  recipientName: string;
  recipientCity: string;
  suggestedAmounts: number[];
  title: string;
  message: string;
};

export type DonationSettingsValidationError = { code: string; message: string };

function parseSuggestedAmounts(raw: string): number[] | null {
  const amounts = raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => Number(part));

  if (amounts.some((amount) => !Number.isFinite(amount) || amount <= 0)) {
    return null;
  }

  return amounts;
}

// Validação pura (sem authorizeActor) — a permission de escrita é a de contexts/settings
// (setSetting exige "settings.manage" internamente, mesmo padrão que
// updateBirthdaysAppearanceAction já usa: birthdays.read controla quem vê a tela, settings.manage
// controla quem grava, porque contexts/settings é o único ponto de acesso a esse dado e não
// conhece a permission "donations.manage" do plugin). Aqui só garante que o payload EMV não fique
// inválido — nome/cidade/chave estourando o limite do campo quebrariam o QR gerado depois.
export function validateDonationSettingsInput(
  input: DonationSettingsFormInput,
): { error: DonationSettingsValidationError } | { error: null; data: ParsedDonationSettingsInput } {
  const pixKey = input.pixKey.trim();
  if (pixKey.length === 0) {
    return { error: { code: "donations.invalid_pix_key", message: "A chave PIX não pode ser vazia." } };
  }
  if (pixKey.length > MAX_PIX_KEY_LENGTH) {
    return {
      error: { code: "donations.invalid_pix_key", message: `A chave PIX não pode ter mais que ${MAX_PIX_KEY_LENGTH} caracteres.` },
    };
  }

  const recipientName = input.recipientName.trim();
  if (recipientName.length === 0) {
    return { error: { code: "donations.invalid_recipient_name", message: "O nome do recebedor não pode ser vazio." } };
  }
  if (recipientName.length > MAX_RECIPIENT_NAME_LENGTH) {
    return {
      error: {
        code: "donations.invalid_recipient_name",
        message: `O nome do recebedor não pode ter mais que ${MAX_RECIPIENT_NAME_LENGTH} caracteres (limite do campo no BR Code).`,
      },
    };
  }

  const recipientCity = input.recipientCity.trim();
  if (recipientCity.length === 0) {
    return { error: { code: "donations.invalid_recipient_city", message: "A cidade do recebedor não pode ser vazia." } };
  }
  if (recipientCity.length > MAX_RECIPIENT_CITY_LENGTH) {
    return {
      error: {
        code: "donations.invalid_recipient_city",
        message: `A cidade do recebedor não pode ter mais que ${MAX_RECIPIENT_CITY_LENGTH} caracteres (limite do campo no BR Code).`,
      },
    };
  }

  const suggestedAmounts = parseSuggestedAmounts(input.suggestedAmounts);
  if (suggestedAmounts === null) {
    return {
      error: {
        code: "donations.invalid_suggested_amounts",
        message: "Os valores sugeridos precisam ser números positivos separados por vírgula (ex: 20, 50, 100).",
      },
    };
  }

  const title = input.title.trim();
  if (title.length === 0) {
    return { error: { code: "donations.invalid_title", message: "O título não pode ser vazio." } };
  }

  const message = input.message.trim();

  return { error: null, data: { pixKey, recipientName, recipientCity, suggestedAmounts, title, message } };
}
