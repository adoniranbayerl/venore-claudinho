import StarterKit from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/core";

// Fonte única de extensões Tiptap — importada tanto pelo editor (client, useEditor em
// rich-text-field.tsx) quanto pelo renderer (server, renderToReactElement em block-renderers.tsx).
// Edição e publicação NUNCA podem divergir nas extensões: mesmo JSON com extensões diferentes
// produz HTML/React diferente, o que quebraria o contrato "o que você edita é o que publica".
//
// StarterKit (Tiptap 3) já embute a extensão Link — configurar via `link:` aqui em vez de
// adicionar um `Link.configure(...)` separado, senão as duas cópias colidem ("Duplicate
// extension names found: ['link']", warning visto em produção nesta sessão).
export function createRichTextExtensions(): Extensions {
  return [StarterKit.configure({ link: { openOnClick: false, autolink: true } })];
}
