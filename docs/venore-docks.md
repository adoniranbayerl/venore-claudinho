# Venore Docks
`Version: 2.0.0-forge`

## Resumo
Venore Docks é um boilerplate — não uma plataforma multi-tenant — que integra autenticação, RBAC, observabilidade, gerenciamento de conteúdo, gerenciamento de mídia, banco de dados (Postgres) e customização de UI (temas), com capacidades específicas de cada site chegando através de plugins.

Cada site é uma instância própria: `git clone` do repositório original, customização, deploy independente. O core deve fornecer as capacidades básicas prontas, sem se preocupar com o que cada site vai precisar de específico — isso é papel do plugin daquele site.

### Modelo de atualização (fork + upstream)
Cada site mantém o repositório do Venore Docks como remote `upstream` e traz melhorias do core via `git fetch upstream && git merge upstream/main`. Esse modelo já foi validado em produção e deve continuar:
- `core/` evolui no repositório original e se propaga por merge.
- Cada site mantém seus próprios plugins e customizações sem conflito, desde que não edite arquivos de `core/` diretamente.
- Migrations de banco seguem numeração sequencial; conflito de migration entre core e site se resolve renumerando a migration local, nunca a do upstream.

## Sobre temas
Temas são instalados no código (arquivo/pacote), mas a escolha de qual tema está ativo é uma configuração trocável em runtime pelo admin — não é fixada no deploy. O core mantém um registro dos temas instalados e qual está ativo; trocar de tema não exige rebuild, só a mudança dessa configuração.

Os temas customizam todo o design do site, incluindo CSS e shells. A plataforma vai ter áreas definidas que podem ser manipuladas pelos temas:

### Áreas estruturais
1. Header
   1.1 Brand
   1.2 Userbar (pode ativar ou desativar para sites que não têm usuários)
2. Footer
   2.1 Brand
   2.2 Sitemap
   2.3 Credits (pode ativar ou desativar)
3. Content
   3.1 Sidebar Contextual (pode ativar ou desativar)
4. Sidebar Right (pode ativar ou desativar)

### Áreas dinâmicas
1. Navegações (`main-nav`, `header-nav`, `contextual-nav`, `user-nav`, `sitemap`)
2. Breadcrumbs
3. Page Headers (pode ativar ou desativar)

### Contrato de slot

Cada área estrutural é implementada pelo tema como um componente React que recebe um objeto de props definido pelo core — o tema nunca busca dado sozinho, ele só recebe e renderiza.

| Slot | Props recebidas (mínimo) |
| --- | --- |
| `HeaderSlot` | `brand`, `userbarEnabled`, `navItems` (de `header-nav`), `scrollState` |
| `FooterSlot` | `brand`, `sitemapItems`, `creditsEnabled` |
| `ContentSlot` | `children` (conteúdo resolvido da página), `sidebarContextualEnabled` |
| `SidebarRightSlot` | `enabled`, `blocks` (lista de blocos a renderizar, quando habilitado) |

Regras do contrato de slot:
- O tema recebe **dados já resolvidos** (ex: itens de navegação já filtrados por permissão) — nunca uma referência crua a `context` para ele mesmo buscar.
- Um tema pode optar por não renderizar uma área opcional, mas não pode inventar uma área nova fora dessa lista sem virar uma extensão formal do core.
- Toda prop nova que um slot passar a receber precisa ser uma mudança versionada do contrato (`themeContractVersion`), porque temas de terceiros/sites diferentes dependem dela.

## Stack inicial
- Next.js (framework React)
- Tailwind (CSS)
- shadcn (elementos UI)
- Auth.js (autenticação)
- Drizzle ORM + Postgres (persistência)
- Vitest (testes)

## Persistência e conexão com banco

Banco: Postgres gerenciado via **Neon**, provisionado através da integração Vercel-Neon — um banco por instância/site.

### Driver e pool
- Driver: `node-postgres` (`pg`) via `drizzle-orm/node-postgres` — não o driver HTTP serverless da Neon. Em ambiente Vercel com Fluid Compute, TCP com pool gerenciado é a recomendação atual da própria Neon/Vercel, porque reaproveita a conexão entre invocações da function em vez de abrir uma nova a cada request.
- O pool é aberto em **escopo de módulo** (`infrastructure/database/client.ts`), nunca dentro de um handler de rota — pool criado dentro do handler vaza conexão a cada invocação em serverless.
- Usar `attachDatabasePool` do pacote `@vercel/functions` para o runtime da Vercel drenar conexões ociosas antes de suspender a instância.

```ts
// infrastructure/database/client.ts
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
attachDatabasePool(pool);

export const db = drizzle({ client: pool });
```

### Configuração
- Connection string: variável de ambiente `DATABASE_URL`, uma por instância/site — mesmo padrão já usado para client ID/secret do Google OAuth.
- Migrations: `drizzle-kit generate` + aplicação em CI/deploy. `drizzle-kit push` fica reservado para desenvolvimento local, nunca produção.
- Todo `context`, `plugin` e o core acessam o banco através desse client único exportado por `infrastructure/database` — nenhum arquivo `store.ts` cria sua própria conexão.

## Organização pretendida

### Arquivos por use case

| Arquivo | Papel |
| --- | --- |
| `handler.ts` | Orquestração do use case: valida input, autentica, autoriza (RBAC), chama exatamente UM `service`. Não acessa banco, não contém regra de negócio. |
| `service.ts` | Toda a regra de negócio do use case. Orquestra `store`. Não acessa banco diretamente, não depende de UI/framework. |
| `store.ts` | Único ponto de acesso a dados do use case. Não contém regra de negócio, não valida, não autoriza. |
| `view.ts` | View model, presenter ou DTO de saída. |
| `types.ts` | Tipos, comandos, resultados, eventos e erros. |

`handler.ts` e `service.ts` existem como arquivos separados mesmo quando pequenos — a separação existe para permitir testar regra de negócio isolada de teste de borda (auth/validação), não para organização estética.

### Formato de resultado

```ts
type OperationResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

`handler` e `service` sempre retornam `OperationResult<T>` — nunca lançam exception para um erro de negócio esperado (ex: "email já cadastrado", "sem permissão"). Exception fica reservada para falha não esperada (infraestrutura fora do ar, bug). Sem esse contrato fixo, cada use case inventa sua própria forma de sinalizar erro, e quem consome (handler de outro context, ou `app/`) não sabe o que verificar.

### Exemplo de árvore de pastas

```
contexts/
  rbac/
    index.ts                      # barrel público — só o que o context expõe
    contracts/
    features/
      role-management/
        update-role-permissions/
          handler.ts
          service.ts
          store.ts
          view.ts
          types.ts

plugins/
  birthdays/
    manifest.ts
    features/
      birthday-registration/
        create-birthday/
          handler.ts
          service.ts
          store.ts
          types.ts
```

### Estrutura de pastas

| Pasta | Papel |
| --- | --- |
| `app/` | Camada exclusiva do Next.js para rotas e route handlers. Não é contexto, slice ou lugar de regra de negócio — só chama a API pública de um `context`. |
| `contexts/` | Domínios (contextos) principais da plataforma. |
| `plugins/` | Capacidades específicas de cada site. |
| `infrastructure/` | Implementações de infraestrutura e adapters. |
| `observability/` | Monitoramento geral (logs, métricas e tracing). |
| `shared/` | Kernel compartilhado: tipos e constantes usados por todo o sistema (ex: `OperationResult<T>`). Só tipo/constante — zero lógica de negócio, zero acesso a dado. Importável por qualquer `context` ou `plugin` sem violar boundary, porque não carrega regra de domínio nenhuma. |

### Regras de limites de contexto (boundary)

| # | Regra |
| --- | --- |
| 1 | Contexto (`context`) é a principal fronteira modular. |
| 2 | O contexto é composto por características (`feature`) independentes para evolução, teste e deploy lógico. |
| 3 | Características (`feature`) são compostas por casos de uso (`use case`). |
| 4 | Comunicação entre `feature` deve ocorrer por contratos públicos do `context`. |
| 5 | Um `use case` não deve importar diretamente outro `use case` de outro contexto. |
| 6 | `Infrastructure` e `Observability` são capacidades técnicas consumidas por portas/adapters. Não devem ser acopladas. |
| 7 | Um `plugin` só pode importar de `contexts/<nome>/contracts` e de `contexts/<nome>/index.ts` — o barrel público do context, que reexporta só as funções de `service` que o context decide expor. Nunca de `store`, `schema`, `database/client`, ou de um arquivo de `service` importado direto fora do barrel. Isso vale tanto para leitura quanto para escrita. |
| 8 | Todo acesso de um plugin a dado de outro domínio passa pelo barrel público do context (que só expõe função de `service`), mesmo que seja só leitura. Join direto em tabela de outro context, ou import de `store`/`service` fora do barrel, é proibido, não só update/insert. |
| 9 | Essa regra precisa de enforcement mecânico (ex.: `eslint-plugin-boundaries` restringindo import de `plugins/**` para qualquer caminho profundo dentro de `contexts/**` — só `contexts/<nome>/index.ts` e `contexts/<nome>/contracts/**` são permitidos), não só de documentação — regra escrita sem lint vira regra ignorada sob prazo. |
| 10 | Um `service` pode chamar o `service` público (via `index.ts` barrel) de outro `context` diretamente, para compor dado de mais de um domínio (ex: resolver uma página precisa de CMS + RBAC). Isso não contradiz a regra 5 — a regra 5 proíbe `use case` importando `use case` de outro context; chamar a API pública de outro context é o canal permitido. |
| 11 | Dependência entre contexts não pode ser cíclica: se `cms` chama `rbac`, `rbac` não pode chamar `cms` de volta. Dependência entre contexts é uma hierarquia, não uma rede — isso evita acoplamento disfarçado de composição. |

### Regras de `use cases`

| # | Regra |
| --- | --- |
| 1 | `use cases` devem nascer de cenários BDD. |

## Sistema de plugins

Um plugin declara, num manifesto próprio, o que contribui para a plataforma — o core lê o manifesto para saber o que existe, o plugin nunca escreve direto em tabela do core para se registrar.

Pontos de extensão oficiais (a expandir conforme necessidade real aparecer, não antecipadamente):
- `permissions`
- `settings`
- `navigation`
- `routes`
- `contentTypes`
- `blocks`

Regras:
- Cada plugin cria seu próprio domínio dentro do banco (schema ou prefixo de tabela próprio) — nunca escreve em tabela de outro plugin ou do core.
- Chave do plugin (`key`) é única, kebab-case, estável ao longo do tempo.
- Módulo inválido ou com dependência quebrada não deve travar o bootstrap dos demais.

### Contrato de manifesto

```ts
type PluginManifest = {
  manifestVersion: string;
  key: string;              // kebab-case, único, estável
  name: string;
  version: string;
  description?: string;

  dependencies?: { pluginKey: string; type: "required" | "optional" }[];
  compatibility?: { coreVersion: string };  // semver range, ex: ">=2.0.0 <3.0.0"

  permissions?: { key: string; label: string }[];   // namespace: "<plugin>.<recurso>.<acao>"
  settings?: { key: string; defaultValue: unknown }[];
  navigation?: { key: string; label: string; href: string }[];
  routes?: { path: string; label: string }[];
  contentTypes?: { key: string; label: string }[];
  blocks?: { key: string; label: string }[];
};
```

Regras de dependência:
- `dependencies` obrigatória (`required`) impede ativação do plugin se a dependência não estiver ativa.
- `dependencies` opcional (`optional`) só desativa a funcionalidade específica que depende dela, sem bloquear o plugin inteiro.
- Ciclo de dependência entre plugins é inválido e bloqueia o registro de ambos, com erro explícito — nunca falha silenciosa.
- Plugin com manifesto inválido não derruba o bootstrap dos demais plugins.
- Depois de um `git merge upstream/main`, todo plugin tem seu `compatibility.coreVersion` checado contra a versão do core recém-atualizada. Fora da faixa declarada, o plugin é marcado `incompatible` e não é ativado — em vez de quebrar em runtime quando um `service` público de um context mudou de assinatura.

### Schema e migrations
- Configuração do Drizzle aponta para os schemas de core, contexts e plugins por glob (ex: `src/contexts/*/database/schema/index.ts`, `src/plugins/*/database/schema/index.ts`).
- Cada plugin numera suas próprias migrations dentro da própria pasta — migrations de plugins diferentes não competem entre si porque vivem em pastas separadas; só migration de core vs. site (já coberto em "Modelo de atualização") compete por número.

## Autenticação

Provedor inicial: Google OAuth, via Auth.js. Client ID e secret são configurados por variável de ambiente, um par por instância/site (cada site tem seu próprio client OAuth no Google).

### Identidade separada de credencial
O modelo de usuário separa **identidade** (o registro `user`, dono dos papéis de RBAC) de **credencial** (o vínculo com o provider usado para provar quem é aquele usuário) — mesmo havendo só um provider ativo hoje. É o padrão nativo do adapter do Auth.js (tabela de contas vinculada a usuários), não uma camada extra a construir. O motivo de fixar isso agora: quando o login por OTP (senha única por email) entrar, ele deve virar só mais um provider vinculado ao mesmo `user` — nunca uma migração de dado de usuário existente.

### Fluxo de registro (herdado do protótipo — confirmar se continua valendo)
1. Usuário faz login pela primeira vez via Google.
2. Registro é criado com status `pending`.
3. Um `admin` aprova o registro.
4. Só após aprovação o usuário recebe um papel (`member` por padrão, ou outro atribuído manualmente).

### Fora do escopo desta v1
- Login por senha única (OTP) enviada por email — entra como um segundo provider no futuro, sem alterar o modelo de identidade.

### Exceção conhecida à regra de `store.ts`
O `DrizzleAdapter` do Auth.js escreve diretamente nas tabelas `users`/`accounts`/`sessions` (via `events.createUser` e o próprio ciclo de login), sem passar por um `store.ts` do context de auth. Isso é esperado — é assim que o adapter do Auth.js funciona — e não deve ser "corrigido" para forçar passagem por `store.ts`, sob risco de quebrar o fluxo de login. É a única exceção documentada à regra de acesso a dado exclusivamente via `store.ts`.

## Modelo de RBAC

### Papéis
Existe um pequeno conjunto de papéis de sistema, fixos e não deletáveis, que garante que sempre exista quem administra a plataforma:

| Papel | Papel na prática |
| --- | --- |
| `superadmin` | Acesso irrestrito a todos os domínios. Não pode ser removido do sistema. |
| `admin` | Operação administrativa da plataforma e do CMS. |
| `member` | Consumidor autenticado do site, sem acesso administrativo. |

Além desses três, qualquer site pode criar **papéis customizados** (novo `key`, novo nome) e atribuir a eles qualquer combinação de permissions do catálogo — é assim que se resolve o caso de "editor que gerencia todo o CMS" vs "editor menor" com escopo mais restrito.

### Permissions
- Nomeadas por namespace: `dominio.recurso.acao` (ex: `cms.entries.manage`, `birthdays.read`).
- Cada `context` do core declara suas próprias permissions; cada plugin declara as suas via manifesto (seção "Sistema de plugins").
- Um usuário pode ter mais de um papel atribuído; suas permissions efetivas são a união das permissions de todos os papéis atribuídos a ele — sem hierarquia implícita entre papéis (um papel não "herda" de outro automaticamente).

> Em aberto: permission com escopo dentro de um recurso (ex: "editor restrito à seção X do CMS", e não ao CMS inteiro) não está coberta neste v1 — permissions são globais por recurso. Fica marcado como necessidade conhecida para uma fase seguinte, porque implementar isso direito exige decidir onde mora o "escopo" (no dado, na permission, ou nos dois), e essa decisão merece um documento próprio.

## Cache

Para esta v1, cache fica em processo (memória da própria aplicação), sem Redis ou serviço externo — mas com regras para não repetir o problema de desempenho sentido no protótipo:

- Cache in-memory tem TTL curto e explícito por tipo de dado (ex: navegação resolvida, catálogo de RBAC) — nunca cache "para sempre" sem invalidação.
- Dado que muda por ação de usuário (ex: publicar uma entry) invalida o cache daquele dado no fim da própria `service` que fez a mudança — invalidação é responsabilidade de quem escreve, não um job de limpeza separado tentando adivinhar o que mudou.
- Nada que é específico de um único usuário (permissions do ator, sessão) deve ir para esse cache compartilhado.

## Observabilidade

O problema de desempenho que você sentiu no protótipo tem uma causa concreta e localizada: cada chamada de log e cada passo de trace disparava um `INSERT`/`UPDATE` no Postgres, um por vez, de forma síncrona ao fluxo da aplicação. Isso significa uma escrita no banco por log e por passo de trace — sob carga, isso pesa.

Regras para a v1 nova:
- Log e trace acumulam em buffer em memória primeiro; a escrita em banco acontece em lote, por um processo periódico (ex: a cada N segundos ou X entradas acumuladas), nunca um `INSERT` por chamada de log individual.
- Log mínimo obrigatório por use case: início e fim da execução do `handler`, com resultado (sucesso/erro), ator, e duração — isso já é suficiente pra reconstruir "o que aconteceu" sem logar cada passo interno do `service`.
- Nível `info` de operações de leitura pura (`get*`, `list*`, `find*`) não é obrigatório por padrão — só entra no log se for uma operação de escrita ou se falhar. Isso evita volume alto de log sem valor de diagnóstico.
- Trace (linha do tempo de uma requisição) é opcional e amostrado (ex: 1 a cada N requisições, ou só quando um erro acontece), não obrigatório em 100% do tráfego.

## Ainda não coberto neste documento
- Permission com escopo dentro de um recurso (RBAC granular por seção/instância, não só por tipo de recurso).
- Estratégia de teste (Vitest) por camada — o que cada tipo de teste precisa provar.
- Segurança: rate limiting, auditoria de ações sensíveis, acesso a arquivos de mídia.
- Fluxo de registro de usuário (aprovação manual `pending → admin aprova`): confirmar se fica fixo no core ou vira configuração por site.
