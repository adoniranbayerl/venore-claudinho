export type CanonicalCsvHeader = "fullName" | "month" | "day" | "role" | "locality";

export const REQUIRED_CSV_HEADERS: CanonicalCsvHeader[] = ["fullName", "month", "day"];

const CSV_HEADER_LABELS: Record<CanonicalCsvHeader, string> = {
  fullName: "Nome completo",
  month: "Mês",
  day: "Dia",
  role: "Cargo",
  locality: "Localidade",
};

export function csvHeaderLabel(header: CanonicalCsvHeader): string {
  return CSV_HEADER_LABELS[header];
}

// Aceita variação de caixa e acento no cabeçalho ("NOME COMPLETO", "nome_completo", "Mês", "mes"
// são todos reconhecidos). A chave é normalizada (minúsculas, sem diacríticos, espaços colapsados)
// antes de ser comparada com este mapa.
// Inclui as próprias chaves canônicas normalizadas (ex.: "fullname") porque o papaparse chama
// transformHeader mais de uma vez internamente quando o delimitador é autodetectado — a segunda
// chamada recebe o valor já transformado da primeira, então a função precisa ser idempotente.
const HEADER_ALIASES: Record<string, CanonicalCsvHeader> = {
  "nome completo": "fullName",
  nome: "fullName",
  colaborador: "fullName",
  "nome do aniversariante": "fullName",
  fullname: "fullName",
  mes: "month",
  month: "month",
  dia: "day",
  day: "day",
  cargo: "role",
  funcao: "role",
  role: "role",
  localidade: "locality",
  unidade: "locality",
  locality: "locality",
};

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function normalizeHeaderKey(header: string): string {
  return stripDiacritics(header.trim().toLowerCase()).replace(/\s+/g, " ");
}

export function resolveCsvHeader(header: string): CanonicalCsvHeader | string {
  const normalized = normalizeHeaderKey(header);
  return HEADER_ALIASES[normalized] ?? normalized;
}
