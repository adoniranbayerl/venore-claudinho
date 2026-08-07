import { DONATIONS_SETTINGS, MAX_PIX_KEY_LENGTH, MAX_RECIPIENT_CITY_LENGTH, MAX_RECIPIENT_NAME_LENGTH, type DonationSettingsValues } from "./settings";

// FormData só entrega string — inclusive suggestedAmounts (número[] só depois de parseado aqui).
export type DonationSettingsFormInput = Record<keyof DonationSettingsValues, string>;
export type ParsedDonationSettingsInput = DonationSettingsValues;

export type DonationSettingsValidationError = { code: string; message: string };

type StringSettingKey = Exclude<keyof DonationSettingsValues, "suggestedAmounts">;

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

// Campos com validação própria (limite de tamanho do BR Code, parsing numérico) ou sem
// obrigatoriedade (message pode ficar vazio) — todo o resto de shared/settings.ts é texto livre
// que só precisa não vir vazio, porque vira cabeçalho/botão/placeholder/parágrafo direto na UI
// (pedido desta sessão: "nenhum texto deve ser hardcoded nos widgets", então a lista só cresce).
// O label do erro reaproveita o mesmo DONATIONS_SETTINGS[field].label que já alimenta o formulário
// admin — uma fonte só, sem lista duplicada de labels aqui.
const BESPOKE_FIELDS = new Set<keyof DonationSettingsValues>([
  "pixKey",
  "recipientName",
  "recipientCity",
  "suggestedAmounts",
  "message",
]);
const REQUIRED_TEXT_FIELDS = (Object.keys(DONATIONS_SETTINGS) as StringSettingKey[]).filter((field) => !BESPOKE_FIELDS.has(field));

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

  const message = input.message.trim();

  const data = { pixKey, recipientName, recipientCity, suggestedAmounts, message } as ParsedDonationSettingsInput;
  // Cast pontual: `field` percorre REQUIRED_TEXT_FIELDS (nunca "suggestedAmounts", o único campo
  // não-string), mas o filtro em runtime não estreita o tipo estático de `field`, então a escrita
  // indexada exigiria satisfazer todo tipo possível de valor ao mesmo tempo sem este cast.
  const textFields = data as unknown as Record<StringSettingKey, string>;

  for (const field of REQUIRED_TEXT_FIELDS) {
    const value = input[field].trim();
    if (value.length === 0) {
      return { error: { code: `donations.invalid_${field}`, message: `${DONATIONS_SETTINGS[field].label} não pode ser vazio.` } };
    }
    textFields[field] = value;
  }

  return { error: null, data };
}
