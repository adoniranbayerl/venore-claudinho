// Monta o payload "Pix Copia e Cola" (BR Code / EMV QR Code) a partir de uma chave estática —
// mesmo formato que qualquer app de banco lê, sem depender de PSP/gateway (decisão do usuário:
// PIX aqui é doação de valor livre, não cobrança). Função pura, sem I/O, pra ser testável isolada
// e reutilizável tanto pela geração inicial (sem valor) quanto pela regeneração com valor
// escolhido pelo doador.
//
// Referência: Manual de Padrões para Iniciação do Pix (Bacen/DICT), formato EMV QRCPS-MPM.

const CRC16_POLYNOMIAL = 0x1021;
const CRC16_INITIAL_VALUE = 0xffff;

// CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF, sem reflect, xorout 0x0000) — não existe em
// node:crypto, implementação própria seguindo o algoritmo padrão exigido pelo campo "63" do BR
// Code. Testado contra o valor de conferência oficial do catálogo CRC ("123456789" -> 0x29B1),
// independente do formato PIX.
export function computeCrc16(input: string): string {
  let crc = CRC16_INITIAL_VALUE;

  for (let i = 0; i < input.length; i += 1) {
    crc ^= input.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ CRC16_POLYNOMIAL) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

// Nome/cidade do recebedor só aceitam ASCII no BR Code — acento não removido quebra a leitura em
// vários apps de banco (erro comum de implementações caseiras). Corta no limite do campo depois
// de normalizar, nunca antes (evita cortar no meio de um caractere acentuado).
export function normalizeMerchantText(value: string, maxLength: number): string {
  const withoutDiacritics = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7e]/g, "")
    .trim();
  return withoutDiacritics.slice(0, maxLength);
}

export type PixBrCodeInput = {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number | null;
};

export function buildPixBrCodePayload(input: PixBrCodeInput): string {
  const merchantAccountInfo = tlv("26", tlv("00", "br.gov.bcb.pix") + tlv("01", input.pixKey));
  const merchantName = normalizeMerchantText(input.merchantName, 25);
  const merchantCity = normalizeMerchantText(input.merchantCity, 15);
  // "***" é o placeholder oficial do manual pra "sem identificação de txid" num código estático
  // (não gerado sob demanda por um PSP) — não exposto como setting, não muda por doação.
  const additionalData = tlv("62", tlv("05", "***"));
  const amountField = input.amount != null ? tlv("54", input.amount.toFixed(2)) : "";

  const payloadWithoutCrc =
    tlv("00", "01") + // Payload Format Indicator
    tlv("01", "11") + // Point of Initiation Method: 11 = estático, reutilizável
    merchantAccountInfo +
    tlv("52", "0000") + // Merchant Category Code: não especificado
    tlv("53", "986") + // Transaction Currency: BRL (ISO 4217)
    amountField +
    tlv("58", "BR") +
    tlv("59", merchantName) +
    tlv("60", merchantCity) +
    additionalData +
    "6304"; // ID + tamanho do próprio campo CRC, valor é anexado depois de calculado

  return payloadWithoutCrc + computeCrc16(payloadWithoutCrc);
}
