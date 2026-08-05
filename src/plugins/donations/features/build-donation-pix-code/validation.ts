// Teto de sanidade — não é um limite do formato EMV (o campo "54" aceita até 13 chars), só evita
// um doador digitar um valor absurdo por engano no formulário público.
const MAX_AMOUNT = 999_999.99;

export type AmountValidationError = { code: string; message: string };

// undefined/null = "valor livre" (o app do banco pede o valor na hora) — não é erro, é a opção
// padrão pra doação (pedido explícito do usuário: "a pessoa pode doar quanto quiser").
export function normalizeAmount(
  amount: number | null | undefined,
): { error: AmountValidationError } | { error: null; amount: number | null } {
  if (amount === null || amount === undefined) {
    return { error: null, amount: null };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: { code: "donations.invalid_amount", message: "O valor da doação precisa ser um número positivo." } };
  }

  if (amount > MAX_AMOUNT) {
    return {
      error: { code: "donations.invalid_amount", message: `O valor da doação não pode ser maior que R$ ${MAX_AMOUNT.toFixed(2)}.` },
    };
  }

  // Arredonda pra centavos em vez de rejeitar imprecisão de ponto flutuante (ex: 0.1 + 0.2 do
  // client) — mais amigável pro doador do que devolver erro por causa de um artefato de float.
  return { error: null, amount: Math.round(amount * 100) / 100 };
}
