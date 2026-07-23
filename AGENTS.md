<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:venore-docks-rules -->
# Venore Docks — regras de arquitetura

Documento completo em `docs/venore-docks.md`. Leia antes de decisões estruturais.

## Camadas por use case
handler.ts (orquestra, valida, autoriza — chama 1 service) → service.ts (regra de negócio) → store.ts (acesso a dado, sem regra) → view.ts (DTO de saída) → types.ts (tipos e OperationResult)

`handler` e `service` sempre retornam:
```ts
type OperationResult<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };
```

## Boundary — nunca violar
- `use case` não importa `use case` de outro `context` diretamente.
- `plugin` só importa `contexts/<nome>/contracts` e `contexts/<nome>/index.ts` (barrel público). Nunca `store`, `schema`, `database/client`, nem `service` fora do barrel — nem para leitura.
- `service` pode chamar `service` público de outro `context` via barrel, para compor dado (ex: CMS + RBAC). Sem ciclo entre contexts.
- Toda regra de boundary acima precisa virar `eslint-plugin-boundaries` ou hook — não confiar só em instrução.
<!-- END:venore-docks-rules -->