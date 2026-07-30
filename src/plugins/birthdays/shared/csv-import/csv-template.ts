const TEMPLATE_HEADER = ["Nome completo", "Mês", "Dia", "Cargo", "Localidade"];
const TEMPLATE_EXAMPLE_ROW = ["João da Silva", "3", "15", "Gerente", "Matriz"];

// Modelo oferecido pra download na UI de importação — colunas na ordem esperada, mais uma linha
// de exemplo. Separador vírgula (o autodetector do parser aceita ; também, mas o modelo em si usa
// o delimitador mais universal).
export function generateBirthdaysCsvTemplate(): string {
  const escape = (value: string) => (value.includes(",") ? `"${value}"` : value);
  const lines = [TEMPLATE_HEADER, TEMPLATE_EXAMPLE_ROW].map((row) => row.map(escape).join(","));
  return `${lines.join("\r\n")}\r\n`;
}
