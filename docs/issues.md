# Issues — pedidos e lacunas registradas fora do escopo de uma sessão

Lista de trabalho futuro identificado durante o desenvolvimento de um plugin/feature, mas
deliberadamente deixado fora da sessão que o identificou. Cada entrada diz o que é, por que ficou
de fora, e (quando aplicável) de que depende para ser retomado.

## Plugin `birthdays` (Fase 2 — cadastro de aniversariantes)

- **G1 — Ativação/desativação de plugin (persistida, com efeito real em navegação/permissões).**
  Hoje `registerPlugins()` (`src/platform/plugin-engine/register-plugins.ts`) trata todo plugin em
  `PLUGIN_REGISTRY` como sempre ativo — não existe estado persistido de "ligado/desligado" por
  plugin, nem ação admin que grave esse estado. O plugin `birthdays` entrou sempre-ativo, no mesmo
  padrão do `academy`. Implementar isso implica estender o motor do plugin-engine (não é "só criar
  um plugin novo"). **Observação importante:** o modelo atual instala plugins em código com import
  estático (`src/plugins/registry.ts` — Next.js exige isso pra bundling); qualquer desativação
  precisaria acontecer depois desse import já ter resolvido em build-time, então o plugin continua
  fisicamente presente no bundle mesmo "desativado" — isso reduz bastante o valor prático dessa
  capacidade frente a um sistema de módulos com resolução em runtime (como o `fem-colaborador`
  original tinha). Vale essa ressalva antes de priorizar a implementação.
  Detalhado em `docs/plugins/birthdays-port.md`, seção 3 (G1).

- **G5 — `settings.manage` como permission global única pra escrever qualquer setting.**
  `setSetting` (`src/contexts/settings/features/set-setting/handler.ts`) autoriza só com
  `authorizeActor("settings.manage")` — não há escopo por namespace de chave. Um ator com
  `birthdays.manage` mas sem `settings.manage` não consegue salvar a paleta de aparência do
  próprio plugin em `/admin/birthdays/appearance` (a ação delega pra `setSetting`, que exige a
  permission global). Não é bloqueante — os papéis padrão (admin/superadmin) já têm as duas — mas
  fica registrado pra não surpreender configurações de RBAC mais granulares depois. Resolver
  exigiria `setSetting` aceitar uma permission alternativa por namespace de chave, mudança em
  `contexts/settings`, fora do escopo de "criar o plugin birthdays".

- **G6 — Block `birthdays-month-list` — RESOLVIDO.** Implementado em `src/plugins/birthdays/blocks/`
  (`birthdays.month.list`), registrado em `platform/page-builder/block-registry.ts` e
  `block-renderers.tsx`, no mesmo padrão de `academy.course.list`. Não é fidelidade visual com o
  bloco original do fem-colaborador (pedido explícito: "não precisa ter fidelidade visual, pode
  gerar algo que você acredita ser melhor") — usa tokens do tema (`bg-card`, `border-border`, etc.)
  em vez das cores de `birthdays.appearance.*`, e ordena os aniversariantes do mês corrente
  colocando "hoje em diante" antes de quem já fez aniversário no mês, com destaque para quem faz
  aniversário hoje.

- **Identidade visual / impressão — RESOLVIDO.** A impressão de PDF (`src/plugins/birthdays/
  features/print-birthdays/`) já usa `getBrandConfig()` (`src/platform/brand/get-brand-config.ts`)
  para logo/nome/cor da marca — inclusive um campo `color`/`brand.color` novo, adicionado ali
  porque nada expunha isso ainda (o Header do tema não pinta a marca por cor de setting). Decisão
  explícita: não criar subsistema de brand paralelo nem helper local no plugin — quando um
  subsistema real existe (como já era o caso pra logo/nome), ele absorve a leitura.

## Footer + componente de Sitemap

- **`sitemap.xml` (SEO) — não existe.** Não há rota `app/sitemap.ts`/`app/sitemap.xml` nem
  equivalente hoje (`find src/app -iname sitemap*` não retorna nada). É trabalho diferente do
  componente de sitemap implementado nesta sessão (`src/components/sitemap.tsx`), e a distinção
  importa o suficiente pra registrar aqui em vez de reaproveitar: o componente mostra o que foi
  **escolhido pra aparecer** (deriva do menu de location `sitemap`, `contexts/cms`); o `sitemap.xml`
  listaria o que **existe publicado** (derivaria de `entries` via `contexts/cms`, provavelmente
  `listEntries`/`getPublishedEntryBySlug` — não investigado a fundo). Não implementar o XML
  reaproveitando a leitura do menu, nem o componente derivando de conteúdo publicado — são fontes
  de dado propositalmente separadas. Fica como sessão própria.

- **Importação CSV.** Fora do escopo desta sessão. No módulo original
  (`fem-colaborador/src/modules/birthdays/views/admin/client.tsx`, função
  `parseAndValidateCsv`), o parser é client-side, faz split por vírgula fixo, funciona mas quebra
  silenciosamente com nome contendo vírgula, e não tem teste próprio (só os `services` de import
  têm cobertura). Se entrar em escopo depois, não copiar esse parser sem revisão — pelo menos
  trocar por um parser de CSV de verdade (aspas/escape) e cobrir com teste.

## Plugin `broadcast` (Broadcast Studio — switcher de cenas em camadas pra TV)

Sessão implementou o plugin completo (schema, playlist dual-source com scan de pasta + itens de
`media.assets`, streaming com Range request, realtime via SSE/pub-sub em memória, view de saída
standalone pra TV com layers/transições, painel admin). O que ficou deliberadamente fora:

- **Editor de layer é guiado por tipo (RESOLVIDO — não é mais JSON cru).** Primeira versão expunha
  `config`/`drawerVariant` como textarea de JSON livre; usuário sinalizou "tá mto confuso, não tão
  dev". Reescrito: `_components/scenes-section.tsx` tem um `<Select>` de tipo que revela só os
  campos daquele tipo (`video` → escolher playlist por nome; `text` → texto + input de cor nativo;
  `image` → `MediaPickerField`, o mesmo componente usado em Academy/CMS; etc), presets de posição
  (botões "Tela cheia"/"Rodapé"/...) além dos 4 números de ajuste fino, e uma caixa de marcar pra
  ativar a variante de "gaveta" em vez de JSON. `actions.ts` (`buildLayerConfigFromFields`/
  `buildDrawerVariantFromFields`) monta o `config` a partir desses campos nomeados. Ainda falta um
  editor visual de arrastar/redimensionar (fast-follow real, não crítico — os presets cobrem os
  casos mais comuns).
- **Editar cena/layer (RESOLVIDO).** `EditSceneDialog`/`EditLayerDialog` em `scenes-section.tsx`
  reusam os mesmos campos guiados do formulário de criar (via `LayerTypeFields` compartilhado),
  pré-preenchidos com os valores atuais. O tipo de uma layer continua imutável na edição (exclui e
  recria pra trocar) — decisão deliberada, não um gap.
- **Sem reordenação de playlist/cena/layer via UI** (drag-and-drop). As colunas `order`/`zIndex`
  existem no schema e são respeitadas na renderização — dá pra editar o número direto no diálogo de
  editar cena, só não há arrastar-e-soltar.
- **Lista de tipos de layer simplificada — RESOLVIDO (2ª rodada).** Pedido explícito: "simplifica
  tudo, não preciso de tantas opções". `clock`/`lower-third`/`custom-html` foram removidos (o
  primeiro virou `info`, superset com clima; os outros dois eram redundantes com `text` + preset de
  posição) — nenhum resquício de "renderiza só texto escapado" continua existindo, porque o tipo
  que fazia isso (`custom-html`) foi removido, não só restrito. Migration `0001` remapeia dados
  existentes (`clock`→`info`, `lower-third`/`custom-html`→`text`) — nenhuma linha antiga quebrou.
  Lista final: `video` (agora playlist mista vídeo/imagem/site), `text`, `image`, `info`
  (relógio+clima), `news`, `agenda` — os três últimos sem nenhum campo manual, resolvidos sozinhos
  a partir de `broadcast.region` e da agenda interna.
- **Playlist mista (vídeo/imagem/site) + esconder/mostrar item — RESOLVIDO.** `playlist_items`
  ganhou `sourceType: "webpage"` (guarda `url`, sem arquivo) e `hidden` (esconde da reprodução sem
  apagar o cadastro). "kind" (vídeo vs. imagem) nunca é uma coluna — é derivado em
  `get-output-state` a partir da extensão (local) ou do `contentType` resolvido via
  `getMediaAsset` (media-asset), pra não duplicar fonte de verdade. O scan de pasta já descobre
  imagem junto com vídeo (mesma allowlist de extensão, ampliada).
- **Clima e notícias por região — RESOLVIDO, com ressalvas.** `broadcast.region` (cidade, texto
  livre) alimenta duas fontes externas cacheadas em `runtime/region-weather.ts` (Open-Meteo,
  geocoding + forecast, sem chave) e `runtime/region-news.ts` (NewsData.io, precisa de
  `NEWSDATA_API_KEY` no `.env` — sem a chave, a camada "Notícias" fica vazia sem erro, não quebra a
  página). Ambas degradam pra `null`/`[]` em qualquer falha (região não configurada, API fora do
  ar, timeout) — a camada "info" nunca perde o relógio por causa do clima ter falhado.
  **Correção pós-sessão:** a implementação original usava o parâmetro `region` da NewsData.io (é o
  que a documentação pública deles indica pra filtrar por cidade/estado) — na prática, esse
  parâmetro retorna `403 Access Denied` no plano free ("upgrade your plan or contact support"),
  descoberto só testando direto contra a API com a chave real. Trocado por `q` (busca livre, usa só
  o primeiro pedaço do texto de `broadcast.region` antes da vírgula — ex: "Curitiba, PR" vira
  "Curitiba"), que funciona no free tier e devolve resultado com imagem. Lição: `EMPTY_RESULT_CACHE_TTL_SECONDS`/
  `FAILURE_CACHE_TTL_SECONDS` (60s) foram adicionados nos dois resolvers depois disso — resultado
  vazio/falho não fica preso no cache pelo TTL cheio (15-20min) mais, senão um erro de configuração
  já corrigido continua "invisível" até o cache expirar sozinho.
- **Agenda interna — RESOLVIDO, escopo propositalmente mínimo, virou múltiplas agendas na 3ª
  rodada.** Título + data/hora + descrição opcional, sem recorrência, sem convidados, sem
  categoria — exatamente o pedido ("nossa própria agenda interna"), não um calendário genérico.
  Uma instalação tem N agendas nomeadas (`broadcast_agendas`: semanal, mensal, faculdade,
  colégio...), cada uma com `displaySeconds` próprio; a camada "Agenda" alterna entre as que têm
  pelo menos um evento futuro (`get-output-state` → `resolveAgendaRotation`, agenda vazia não entra
  no rodízio pra não desperdiçar tempo de tela).
- **3ª rodada — "3 views" (playlist principal + coluna de agenda + aviso rápido) — RESOLVIDO.**
  Pedido: coluna direita 20% com logo + rodízio de agendas ("UX premium"); playlist principal
  (esquerda) tocando vídeo/imagem/site/notícias juntos; "lower third" só pra avisos rápidos,
  invisível por padrão, sobrepondo tudo quando ativo. Implementado como:
  - **Notícias mescladas na playlist principal** (não mais uma camada própria obrigatória):
    **[5ª rodada]** virou um item de playlist de verdade (`sourceType: "news"`, feature
    `add-news-playlist-item`), não mais um checkbox `layers.config.includeNews` — pedido direto:
    "o componente notícia deve aparecer na playlist para ser manipulado" (reordenar/remover como
    qualquer outro item). `durationSeconds` do item é o teto do **bloco inteiro** (todas as
    manchetes rodando, default 30s — `DEFAULT_NEWS_BLOCK_DURATION_SECONDS`), não por manchete; o
    rodízio interno de manchetes dentro do bloco é um timer separado e mais rápido
    (`NEWS_ARTICLE_ROTATION_MS = 6000` em `layer-renderer.tsx`, componente `NewsCardRotator`
    compartilhado com a camada `news` isolada). Itens `webpage` ganharam default próprio de 60s
    (`DEFAULT_WEBPAGE_SLIDE_DURATION_SECONDS`, vs. 15s de imagem) — precisa de mais tempo pra ler
    a página. O card de notícia também mudou de imagem full-bleed + título pequeno sobreposto pra
    banner de imagem menor no topo + título grande + `description` (novo campo em
    `RegionNewsArticle`, mapeado do `description` que a NewsData.io já devolvia sem ser usado).
  - **Painel de agenda "premium"**: logo da marca (`getBrandConfig("png")`, resolvido em
    `get-output-state` só quando há camada `agenda` na cena) + cards por evento (badge de
    data/mês, destaque de cor pro evento de hoje) + pontos indicando posição no rodízio + fade
    entre trocas de agenda. Presets de posição "Coluna esquerda (80%)"/"Coluna direita (20%)"
    adicionados em `scenes-section.tsx` pra montar o layout descrito com um clique cada.
  - **Aviso rápido (`alert`)**: tabela `broadcast_alerts` (mensagem + `expiresAt`, sem fila — um
    novo aviso publicado sempre substitui o anterior, mesmo que ainda não tenha expirado).
    Controle fica na aba Saídas (`QuickAlertPanel`: mensagem + duração em segundos + "Publicar"/
    "Remover agora"), porque é global (não por cena/saída) e é uma ação de controle ao vivo, mesmo
    lugar de trocar cena/abrir gaveta. Na view de saída, a camada `alert` **ignora a geometria
    configurada** — `LayerRenderer` a trata num caminho separado (`position: fixed`, z-index
    9999), só existe como layer pra o operador decidir *em quais cenas* o aviso pode aparecer, não
    *onde* ele aparece (isso é sempre rodapé, sempre por cima).
- **Risco não verificado: `infrastructure/cache/memory-cache.ts` pode sofrer o mesmo bug do
  `output-bus.ts` (módulo duplicado entre Server Action/Route Handler/Server Component).** Usado
  pelos resolvers de clima/notícias (TTL 15-20min) — se as chamadas vierem de camadas de bundle
  diferentes, o cache nunca "pega" (sempre miss, refaz a chamada externa toda vez) em vez de servir
  dado errado — não é um bug de correção, só de custo/rate-limit da API de notícias. Não
  investigado a fundo nesta sessão porque `get-output-state` é chamado só de Server
  Component/Route Handler (nunca Server Action), cenário onde o bug do `output-bus` não foi
  reproduzido. [NÃO VERIFICADO] se esses dois tipos de camada de fato compartilham módulo aqui.
- **Pub/sub de output (`runtime/output-bus.ts`) é em memória, assume processo Node único.** Bate
  com o requisito confirmado nesta sessão (servidor local, rede local) — se o deploy algum dia
  virar multi-instância/serverless, precisa virar Redis pub/sub ou equivalente. **Nota de
  implementação:** o estado precisou ser guardado em `globalThis`, não numa variável de módulo
  comum — bug real encontrado em produção: Server Actions e o Route Handler de SSE acabam em
  "camadas" de bundle diferentes no Next.js, cada uma com sua própria cópia avaliada do módulo, e
  eventos publicados numa nunca chegavam na outra (sintoma: painel atualiza o banco, TV só reflete
  depois de F5). `globalThis` é o único objeto garantido compartilhado entre as camadas dentro do
  mesmo processo.
- **Fonte de vídeo "local" (pasta do filesystem) só funciona em servidor self-hosted com disco
  persistente** — não funciona em serverless (Vercel). Fonte "media-asset" (Blob) funciona nos
  dois cenários. Decisão confirmada com o usuário no início da sessão, não uma limitação
  descoberta depois.



######


Estou criando um tema e aproveitando para pegar alguns issues.

## Issues
### Temas

1. Venore Slime: Precisamos aplicar efeito de transição no sidebar. Hoje quando ele colapsa, a animação dá uma travadinha; às vezes muito rapido, às vezes travando. Fiz uma cópia do Venore Slime para criar o tema Menonitas Classic. É apenas uma versão com outras cores, o problema do sidebar persiste aqui.
2. As configurações estéticas do brand deveriam estar no tema, não em settings. Ex: tamanho da brandlogo.
3. Como poderíamos criar um subsistema em temas para troca de cores dentro da plataforma? Seria interessante o admin/designer poder escolher as paletas de cores e até mesmo salvá-las dentro do subsistema - podendo escolher entre paletas salvas.
4. No tema Venore Slime, poderíamos criar uma settings para escolher comportamento do header e sidebar.
5. Acredito que devemos ter tokens para o background e foreground de cada slot. Hoje temos do sitebar, header e app (content), mas não temos para o footer.

### Home Page
1. Quando crio um conteúdo com o caminho /home, ele se torna a página inicial. Esse é comportamento esperado
2. Porém, a página não rederiza o seu conteúdo quando está como /home

### Breadcrumbs
1. Breadcrumbs não atualiza quando uma nova rota é carregada na url, só atualiza quando troco entre main nav e admin nav. Aparentemente ela dá reload na shell toda quando troca entre os navs, correto?


### Content Management System (Aba conteúdos, vamos alterar o nome para Editorial)
1. Páginas de tipos de conteúdo, contegorias, conteúdos e navegação devem seguir o mesmo padrão:
Botões de criação de novo (Novo tipo de conteúdo, Nova categoria, Novo conteúdo, Nova navegação) devem vir na parte superior da página, logo após o título e descrição. Esses botões devem ser evidentes.
2. Na sequencia, vamos usar uma table do shadcn para organizar o conteúdo. Essa tabela deve conter filtro quando possível e também campo para busca por nome.
3. Além disso, no caso dos Conteúdos, prcisamos de um botão para editar e outro para ver a página ao vivo
4. Também vamos precisar de um select para definir o estado do conteúdo
5. Sobre os estados:
    - Rascunho (o primeiro estado de um conteúdo, quando ele está sendo construido)
    - Publicado (o estado quando o conteúdo está disponível para ser consumido pelo site)
    - Agendado (o agendamento pode publicar e/ou arquivar um conteúdo no prazo determinado)
    - Arquivado (Arquivado é quando o conteúdo sai do estado publicado via agendamento ou pelo editor/admin/superadmin )

6. Apenas conteúdos arquivados podem ser deletados definitivamente (com confirmação)
7. Conteúdos devem ter um campo de privacidade, assim o editor e superiores podem definir quem pode ver aquele conteúdo. Sobre a privacidade:
    - Conteúdo aberto para qualquer visitante (não logados e logados)
    - Conteúdo fechado (apenas logados)
    
Dúvida: Ainda estou em dúvida com relação a tipos de conteúdo e categorias, se não são redundantes. Em teoria, deveriam ser dois tipos de taxonomia que se complementam. Estou pensando seriamente em alterar tipos de conteúdo para "tags" e liberar mais de uma por conteúdo. Categorias hoje define a url.

8. Tanto em categorias quanto em "tipos de conteúdo", deve dar a informação de quantidade de conteúdos em cada um. Podemos elaborar um dashboard bem informativo para saber o que acontece em cada. Incluindo acesso e etc.

9. Acesso! Esse é um ponto interessante, poderiamos ter uma forma de contador de visitas em cada conteúdo. 

### Media Management System (Mídia)
1. Criamos categorias, mas precisamos de um sistema mais elaborado para mídia. Talvez um sistema de pastas - tudo o que for avatar, apenas o autor tem acesso e no blob vai tudo para uma pasta chamada avatar ou profilePic. Imagens de plugins (como Academy) também tem sua pasta, e categoria. Arquivos para conteúdos em geral herdam as categorias onde forem consumidos.
2. Pensando assim, não enviamos mais mídia e deixamos elas orfãs no Mídia. Os uploads já são feitos dentro do contexto onde vão ser usadas e nesse upload já se define o status dessa midia (que pode ser audio, pdf, arquivos office, imagem, basicamente consumíveis pela plataforma)
3. Sobre os status:
    - Público (pode ser consumido em qualquer conteúdo e aula por editores e superiores)
    - Restrito (pode ser consumido apenas no contexto de origem)
    - Privado (no caso dos avatares, só pode ser visto pelo usuário que fez upload. )


### Academy
1. As aulas não devem mais depender de conteúdos pré-publicados. Embora o subsystem possa usar do page-builder, sistema de categorias e as futuras tags, os conteúdos devem ser construídos no contexto do academy. 
2. As aulas não devem contar como Contéudo, elas não devem aparecer publicamente FORA do contexto do Academy
3. Sobre o status do Curso e aula
    - Público (curso público que qualquer usuário pode se matricular)
    - Restrito (apenas pessoas autorizadas podem acessar (matrícula é feita pelo admin ou moderador))
    - Rascunho (curso visivel apenas para o autor, editores, moderadores e admin)

4. O Curso como produto final deve ter essa rota e experiência
- Aluno clica no curso e entra numa espécie de dashboard do curso.
- Nesse dahsboard, vamos ter um progress bar mostrando o quanto do curso ele concluiu
- Um card de agenda (similar ao que criamos dos aniversariantes), nessa agenda deve mostrar todas as atividades com prazos de entrega (se houver) e assinalar as que já foram feitas
- Um card de aproveitamento das aulas, mostrando um gráfico de pontuação de cada aula (pontuação feita com entrega de atividades, leituras, quiz e etc)
- Uma tabela com as aulas. Aulas concluidas sinalizadas, aulas que precisam de atenção também sinalizadas, aulas fechadas muted. 

Na página da aula o aluno deve se deparar
- Um rota de leitura. A ideia é que cada capítulo seja uma página, assim o aluno não bate o olho com muito texto de uma vez... ele vai progredindo pela rota.
- Dentro da rota de leitura, o professor pode linkar material complementar (audio, vídeo, pdf, etc).
- Ao final de cada capítulo, o aluno deve satisfazer as requisições do capítulo para avançar. Algumas ele deve assinalar que fez (por exmeplo, um exercicio vocal), outras podem ser um quiz. 

Além da rota de leitura, quero um card com todo o material complementar separado para acesso rápido e outro com todas as atividades para acesso rapido.


Sobre Papéis e Permissões
Vamos ter o nome interno do sistema, mas podemos criar "aliases" para mostrar no site.

- Overlord - é o Superadmin, o dono do site ou quem instalou a bagaça toda. Tem acesso geral à tudo. 
- Administrador - Pode comandar uma ou mais seções do site (Por exemplo, Administrador do Academy, ou o Administrador Editorial)
- Editor - Modera e administra o Editorial, pode ser vinculado à uma categoria especifica (Por exemplo, Editor de Novidades), ele vai coordenar os autores. Ele não tem acesso as categorias que ele não pode trabalhar. As categorias devem ser atribuidas a ele
- Autor - Criar e publica nas categorias atribuidas. Não pode publicar, apenas criar drafts. 
- Membro - Consumidor do site logado
- Fora esses papeis, nosso sistema já permite criar roles personalizadas. Mantenha assim.

### Registro de usuários
- O subsistema de registro que deveria ser aprovado pelo Admin não está funcionando, os usuários estão sendo registrados direto.


### Plugins e Temas
- Precisamos ter a habilidade de instalar e desinstalar plugins dentro do site.
- Instalar via .zip
- Desinstalar deve perguntar se é para limpar tudo (inclui banco de dados) ou apenas apaga da pasta plugins 

- **Seed de plugin "com opção via site" — RESOLVIDO.** Manifesto ganhou `seeds?: { key, label,
  description? }[]`; cada key mapeia pra uma função idempotente em
  `src/plugins/<key>/seeds/<seedKey>.ts`, agregada por import estático em
  `src/platform/plugin-engine/plugin-seed-registry.ts`. `seedPlugin(pluginKey, seedKey)`
  (`src/platform/plugin-engine/seed-plugin.ts`) é gateada por `platform.extensions.manage`,
  observada e auditada (`recordAuditEvent` — `plugin-engine.seed-plugin`), e só roda com o plugin
  instalado. Exposta como caixa "popular com dados de exemplo" no diálogo de instalar e como botão
  "Popular dados de exemplo" na listagem de `/admin/plugins`. Seeds concretos: `academy` (curso +
  3 aulas), `birthdays` (6 aniversariantes), `enrollment-dashboard` (Erasto Gaertner + Fidelis —
  `scripts/seed-enrollment-dashboard.ts` virou wrapper fino em cima do seed). `broadcast` e
  `donations` sem seed de propósito (dependem de arquivo de mídia real / são settings-only).
- **[I4] Concessão das permissions de plugin ao papel `admin` no install — RESOLVIDO.**
  `registerPlugins()` só devolvia as `permissions` do plugin pro catálogo de `/admin/rbac`, nunca
  gravava em `rbac.role_permissions` — o papel `admin` não via nenhuma tela de plugin até alguém
  marcar na mão. `installPlugin` agora chama `grantPermissionsToRole({ roleKey: "admin",
  permissionKeys })` (novo use case aditivo/idempotente em
  `src/contexts/rbac/features/role-management/grant-permissions-to-role/`, sem `authorizeActor` —
  ver nota no handler). Reclicar "Instalar" num plugin já instalado repara a concessão.
  `superadmin` não precisa — `authorize-actor.ts` libera incondicional.
- **Desinstalar plugin — os dois modos possíveis em runtime, RESOLVIDO.** O pedido original
  (linha 275) tinha dois modos: "limpar tudo (inclui banco)" OU "apenas apaga da pasta plugins".
  Como plugin é import estático (`src/plugins/registry.ts` — Next.js exige isso pra bundling),
  "apagar da pasta" de verdade só tem efeito com edição de código + rebuild; não dá pra fazer
  100% em runtime. Os dois modos entregues, ambos só runtime:
  - **Modo A — Desativar** (já existia como `togglePluginEnabled(false)`): nada é apagado, schema
    e dados intactos, reversível. Renomeado na UI de "Desabilitar" para "Desativar" / "Ativo" /
    "Inativo" / "Reativar".
  - **Modo B — Desinstalar e limpar o banco** (novo, `src/platform/plugin-engine/uninstall-plugin.ts`
    — `uninstallPlugin` gateado por `platform.extensions.manage`, núcleo `performPluginUninstall`
    sem `authorizeActor` pros testes de integração, mesmo split de handler/service dos contexts).
    Bloqueado se houver plugin dependente ativo (mesma regra do desativar). Numa transação só:
    `DROP SCHEMA "<key_>" CASCADE` (dado) + `DROP SCHEMA "<key_>_migrations" CASCADE` (tracking) +
    `DELETE settings.settings WHERE key LIKE '<key>.%'` +
    `DELETE rbac.role_permissions WHERE permission_key LIKE '<key>.%'` +
    `UPDATE extensions.extension_state SET installed_at = NULL, enabled = true`. Auditado
    (`recordAuditEvent` — `plugin-engine.uninstall-plugin`). Preview de consequência
    (`preview-plugin-uninstall.ts`, estende `previewPluginDisable`): schemas dropados, linhas por
    tabela do plugin, contagem de settings/permissions do namespace — carregado sob demanda ao
    abrir o diálogo (COUNT por tabela). UI em `/admin/plugins`: diálogo de 2 passos
    (`uninstall-plugin-control.tsx`, substitui `toggle-plugin-control.tsx`) — escolha do modo,
    depois confirmação digitando a key do plugin.
- **[G1-plugins] Instalar via `.zip` e "apagar fisicamente da pasta" continuam pendentes.** Motivo:
  `src/plugins/registry.ts` importa cada manifesto estaticamente (exigência de bundling do
  Next.js, mesmo padrão de `src/themes/registry.ts`). Um plugin só passa a existir pro sistema
  quando há uma entrada nesse arquivo, resolvida em build — não há scan de filesystem em runtime.
  Então: (a) upload de `.zip` exigiria descompactar pro disco **e** reescrever `registry.ts` +
  rebuild/redeploy, fora do que uma Server Action faz; (b) "apagar da pasta" de um plugin
  bundlado não tira ele do bundle já servido. O que dá pra fazer hoje é o Modo A/Modo B acima
  (estado no banco), não a presença do código. Retomar isto depende de decidir um mecanismo de
  carregamento dinâmico de plugin (fora do bundle) — não está desenhado.

### Subsistema de importar e exportar conteúdo
- Esse sistema deve servir para o CMS e o MMS
- Academy deve criar seu próprio subsistema

Esse sistema deve servir para quando eu querer migrar o site.


### Blogroll
Quandoa acessar a rota de uma categoria, por exemplo /cursos. Devve mostrar como blog todo o conteúdo daquela cateogira, respeitando o status.

### Ainda sobre blogroll
- Um caso real que estou planejando. O Recursos Humanos da empresa publica para o público externo e interno diversas vagas de emprego com frequencia. 
O que eu quero
- Embora o site Fem Colaborador vai ser um site fechado para colaboradores (membros), quero deixar uma blogroll "Vagas de Emprego" público para acesso de quem quiser. 


### Broadcast (plugin `broadcast` — Broadcast Studio)

**Cards de Eventos**
1. Diminuir a quantidade de eventos exibidos por vez nos cards.
2. Aumentar o tamanho das informações nos cards de eventos e acrescentar o local (informação de
   sala, etc).

**View de saída (TV)**
3. Quando a agenda estiver fechada, a view do vídeo deve preencher toda a tela — o footer onde está
   a marca pode sobrepor, mas com um height menor (quase como uma barra de tarefas).
4. Novo componente no footer: um slider/ticker da agenda rodando na barra, apenas com texto.
   Desligado por padrão, ligado só quando desejado nas opções da view. Quando ligado: intervalo de
   15s entre cada evento, e 30s entre cada lista (agenda).
5. Todas as views devem ser públicas (sem necessidade de login), porém protegidas por PIN — PIN
   cadastrado nas opções da própria view.



