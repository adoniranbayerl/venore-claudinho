// Fallback do slot paralelo @sidebarContextual (Next.js parallel routes) para toda rota que não
// define um page.tsx próprio dentro deste slot — ver app/(platform)/layout.tsx.
export default function Default() {
  return null;
}
