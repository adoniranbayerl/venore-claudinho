# Shell spec — leitura do protótipo (venore-docks)

`Fonte`: `../venore-docks` (read-only). Código lido: `src/docs/venore_v2_unified_blueprint.md` §1.7
(nota: o arquivo se chama `venore_v2_unified_blueprint.md`, não `ARCHITECTURE.md` — não existe
`ARCHITECTURE.md` no protótipo; é o único lugar que contém "Shell and Navigation UI Model"),
`src/components/ui/layout/platform-frame.tsx`, `platform-shell.tsx`, `platform-brand.tsx`,
`auth-shell.tsx`, `page-header.tsx`, `theme-mode-toggle.tsx`, `src/components/admin/admin-shell.tsx`,
`src/components/admin/page-header.tsx`, `src/app/globals.css`, `components.json`, `public/brand/`.

Este documento é só leitura + especificação. Nenhum código de aplicação foi escrito. Números vêm
direto do código do protótipo, não de estimativa visual. Onde o protótipo diverge de si mesmo
(blueprint texto vs. implementação) ou é internamente inconsistente, isso é registrado como
ambiguidade — não resolvido por mim.

Achado prévio relevante: o repositório atual (`venore-claudinho`) **já tem uma implementação da
shell** (`src/themes/venore-slime/components/{Header,Footer,SidebarLeft,Content}Slot.tsx`) que já
fez parte da tradução prototype → arquitetura-alvo, com decisões próprias e divergências
deliberadas e documentadas em comentário no próprio código. As seções 5 e 6 abaixo apontam pra
esse código existente em vez de propor caminhos novos, e sinalizam onde a implementação atual já
diverge do protótipo (decisão tomada) vs. onde ainda não existe (gap).

---

## 1. Regiões estruturais e donos

O protótipo declara duas shells estruturais (blueprint §1.7): `platform shell` (pública +
autenticada) e `auth shell` (login/registro). Não existe uma terceira shell de admin — apesar de
`src/components/admin/admin-shell.tsx` existir no código.

| Região | Dono no protótipo | Arquivo | Observação |
| --- | --- | --- | --- |
| Header (sticky) | `PlatformFrame` | `platform-frame.tsx:264-312` | Renderiza brand + nav de usuário + toggle hamburger. **Não renderiza main-nav** — main-nav vive só na sidebar. |
| Sidebar esquerda | `PlatformFrame` | `platform-frame.tsx:329-438` | Hospeda main-nav ou admin-nav conforme `activeSidebarMode`; controla collapse. |
| Sheet mobile (off-canvas) | `MobileNavigationSheet` | `platform-frame.tsx:638-828` | Componente **separado** da sidebar desktop, não uma variante responsiva dela — duplica boa parte da lógica de section-nav. |
| Conteúdo principal | `PlatformFrame` (slot `children`) | `platform-frame.tsx:441` | `<main>`, recebido via prop `children` do server component `PlatformShell`. |
| Footer | `PlatformFrame` | `platform-frame.tsx:442-498` | Brand + sitemap agrupado por categoria. |
| Região contextual | **Não existe como região dedicada** | — | Ver ambiguidade no fim desta seção. |
| Botão back-to-top | `PlatformFrame` | `platform-frame.tsx:503-512` | Fixed, fora do fluxo das regiões acima; não mencionado no blueprint §1.7. |
| Auth shell | `AuthShell` | `auth-shell.tsx` | Estrutura própria e mais simples: brand centralizado + card, sem header/sidebar/footer. |
| "Admin shell" (`admin-shell.tsx`) | — | `src/components/admin/admin-shell.tsx` | **Código morto.** Grep confirma zero imports em `src/` fora do próprio arquivo. Usa paleta hardcoded (slate/cyan/emerald, `bg-white/10`) sem nenhum token do tema — o oposto do resto do shell. Todas as rotas `/admin/**` de fato passam por `(platform)/layout.tsx` → `PlatformShell` → `PlatformFrame`, o mesmo componente das rotas públicas. Isso já bate com a decisão "shell única" documentada em `docs/venore-docks.md` do repo atual — não precisa ser portado, só confirma que a decisão já tomada no repo atual está correta. |
| `src/components/admin/page-header.tsx` | — | idem | Também código morto — todas as páginas `admin/**` importam `PageHeader` de `@/components/ui/layout`, não deste arquivo (confirmado por grep em 40+ arquivos). |

**Ambiguidade — região contextual**: o blueprint (§1.7 "Contextual Region") descreve uma região
dedicada, page-scoped, para "local summary, page actions, diagnostics context, editor context,
content metadata". A implementação real não tem essa região como área espacial separada. O que
existe são dois mecanismos distintos, nenhum dos dois batendo com a descrição de "região":
1. `PageHeader` (`ui/layout/page-header.tsx`) — um bloco full-width renderizado **dentro** do
   `<main>}`, no topo, pela própria página (breadcrumb + eyebrow + título + descrição + ações).
   Isso é conteúdo de página, não uma região do shell.
2. Section-navigation dentro da **sidebar** — quando a rota atual bate com um item de menu que
   tem `sectionNavigationKey`, o conteúdo da sidebar é *substituído* (não complementado) por um
   sub-menu com botão "voltar" (`platform-frame.tsx:219-244`, `362-385`). Isso contraria a regra
   explícita do blueprint "contextual navigation must not replace the main navigation" — a
   implementação literalmente substitui a main-nav pela contextual dentro do mesmo slot visual.

Não há, no protótipo, nenhuma "aside" ou coluna lateral de conteúdo contextual. Registro isso como
ambiguidade a decidir, não escolho por conta própria.

---

## 2. HEADER — máquina de estados

Fonte: `platform-frame.tsx:170-203` (lógica de scroll) e `264-312` (markup/classes).

### 2.1 Estados

Existem exatamente 2 estados visuais, controlados por um único boolean `isScrolled` (não há
estado "hover" ou "focus" adicional no header em si).

| Estado | Nome no código | Gatilho de entrada | Gatilho de saída |
| --- | --- | --- | --- |
| `top` | `isScrolled === false` | `scrollY <= 96` vindo do estado `top` | — |
| `scrolled` | `isScrolled === true` | `scrollY > 96` vindo do estado `top` | volta a `top` quando `scrollY <= 18` vindo do estado `scrolled` |

### 2.2 Limiar exato (hysteresis, não é um único breakpoint)

```js
const nextScrolled = scrollStateRef.current ? nextY > 18 : nextY > 96;
```

Isso é **histerese assimétrica** de propósito: entra em `scrolled` só depois de passar 96px, mas
só volta para `top` abaixo de 18px — banda morta de 78px entre 18 e 96 evita flicker perto do
limiar único. Cálculo roda dentro de `requestAnimationFrame`, disparado por um listener `scroll`
`passive: true` (`platform-frame.tsx:183-194`) — throttle por frame, não por tempo.

Existe um terceiro estado independente, **não acoplado** ao header: `showBackToTop`, que vira
`true` quando `scrollY > 360` (usado só pelo botão fixo de voltar ao topo, seção 1).

### 2.3 Alturas por breakpoint

| Estado | Mobile (`< md`, abaixo de 768px) | Desktop (`≥ md`) |
| --- | --- | --- |
| `top` | `100px` (`h-[100px]`) | `140px` (`md:h-[140px]`) |
| `scrolled` | `64px` (`h-16`) | `70px` (`md:h-[70px]`) |

**Ambiguidade com o blueprint**: §1.7 declara só os números desktop (`140px` topo, `70px`
scrolled) e diz "mobile target heights may be reduced but must preserve the same behavior" sem
fixar valor. O código concretiza isso em `100px`/`64px` — não há um terceiro documento que
autorize especificamente esses dois números; são os que existem hoje na implementação de
referência, registrados aqui como fato de código, não como requisito do blueprint.

### 2.4 Token de superfície e foreground por estado

| Estado | Border | Background | Foreground (texto) | Sombra |
| --- | --- | --- | --- | --- |
| `top` | `var(--header-border-subtle)` | `var(--background)` | `var(--text-primary)` | nenhuma |
| `scrolled` | `var(--primary)` | `var(--primary)` | `var(--primary-foreground)` | `0 18px 48px -34px var(--shadow-color-strong)` (valor arbitrário inline, não um token de sombra nomeado) |

Ou seja: no estado `scrolled` o header **inverte para a cor de destaque** (`--primary`, que no
tema é o verde-neon `--accent`) com texto quase-preto (`--primary-foreground`), e não para uma
superfície neutra elevada (`--surface-panel`/`--card`) como seria de esperar de um "header
elevado" convencional. Isso é uma escolha de identidade visual (motion/neon, blueprint §1.3), não
um bug — mas é importante registrar que não é o padrão "escurece/clareia levemente" comum em
outras shells.

Todos os elementos filhos do header (chip do avatar, dropdown de usuário, botão hamburger,
`ThemeModeToggle` quando `invert`) trocam de paleta em uníssono com `isScrolled`, cada um com sua
própria combinação de `color-mix()` sobre `--primary`/`--primary-foreground` (ex.:
`platform-frame.tsx:542-550`). Não há uma classe utilitária única "estado scrolled" — cada
subcomponente reimplementa o par de classes condicionalmente.

### 2.5 O que muda além da altura

- **Brand** (`platform-brand.tsx`): escala para baixo quando `isScrolled`. Fator depende do
  `size` configurado (`compact`/`balanced`/`prominent`):
  | `size` | Escala mobile (`scrolled`) | Escala desktop (`scrolled`, `md:`) |
  | --- | --- | --- |
  | `compact` | `0.8` | `0.72` |
  | `balanced` | `0.82` | `0.78` |
  | `prominent` | `0.84` | `0.8` |
  Estado `top` sempre `scale-100`. Em modo `mode="png"`, a imagem trocada é literalmente outro
  arquivo (`/brand/brand-logo.png` → `/brand/brand-logo-scrolled.png`), não um filtro CSS — os
  dois PNGs existem em `public/brand/` como assets distintos, presumivelmente pré-compostos com
  cor/contraste diferentes para cada fundo de header. Em `mode="svg"`, a troca é de cor via prop
  (`svgColor` vs `svgScrolledColor`), aplicada com `currentColor` + `mask-image` sobre o mesmo
  `brand-logo.svg`. Em `mode="text"` nada muda.
- **Densidade da nav**: não se aplica — o header do protótipo **não contém main-nav** em nenhum
  estado (ver §1). O único "conteúdo de navegação" no header é o menu de usuário (`UserNavigation`
  ou `LoginLink`) à direita e o botão hamburger (`lg:hidden`) que abre o sheet mobile.
- **Borda**: muda de cor junto com o background (ver tabela 2.4); não muda de espessura (sempre
  `border-b` = `1px`).
- **Sombra**: aparece só no estado `scrolled` (nenhuma sombra no estado `top`).
- **Blur**: `backdrop-blur-xl` é constante nos dois estados (não muda com o scroll).

### 2.6 Duração e curva da transição

```
transition-[height,background-color,border-color,box-shadow] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)]
```

`450ms`, curva custom `cubic-bezier(0.22,1,0.36,1)` (easeOutQuint-like, overshoot leve).

**Inconsistência com o blueprint**: §1.4 ("Motion") fixa `default transition duration: 150–250ms`
para todo o sistema. A transição do header (450ms) e a da largura da sidebar (`duration-700`, ver
§3) excedem esse teto em quase o dobro e o triplo, respectivamente. A transição da escala do brand
(`duration-300`) e a dos itens de nav (`duration-500`) também excedem. Não há, no protótipo, uma
segunda regra de motion documentada que justifique essas exceções — registro como inconsistência
entre o blueprint e a implementação, não decido qual dos dois está "certo".

---

## 3. SIDEBAR

Fonte: `platform-frame.tsx:172, 254-260, 329-438` (desktop) e `638-828` (sheet mobile, componente
separado).

### 3.1 Estados

| Estado | Quando existe | Largura | Onde |
| --- | --- | --- | --- |
| Expandida | Desktop (`lg:` = `≥ 1024px`), `sidebarCollapsed === false` (default) | `280px` (`lg:grid-cols-[280px_minmax(0,1fr)]`) | coluna fixa via CSS grid do container pai |
| Colapsada | Desktop, `sidebarCollapsed === true` | `88px` (`lg:grid-cols-[88px_minmax(0,1fr)]`) | mesma coluna, grid-template-columns anima |
| Off-canvas mobile | `< lg` (abaixo de 1024px) | `min(86vw, 360px)` | painel **separado**, `MobileNavigationSheet`, não a mesma árvore de componente da sidebar desktop |

Abaixo de `lg` a `<aside>` desktop tem `hidden lg:flex` — não existe uma sidebar "colapsada por
padrão" no mobile; ela simplesmente não é renderizada, e o sheet a substitui por completo.

### 3.2 Controle de colapso

- Botão flutuante `absolute right-0 top-6` (24px do topo), `translate-x-1/2` (metade do botão para
  fora da borda direita da sidebar) — `40×40px` (`h-10 w-10`), ícone chevron que cross-fade/desliza
  entre `ChevronLeft`/`ChevronRight` (`platform-frame.tsx:330-344`).
- Existe só no desktop; o sheet mobile não tem controle de colapso (não faz sentido para um
  off-canvas).
- Largura da coluna anima com `transition-[grid-template-columns] duration-700
  ease-[cubic-bezier(0.16,1,0.3,1)]` (700ms) no container pai; o padding interno da sidebar anima
  separadamente com `duration-500` na mesma curva. Rótulos de item de nav colapsam via
  `max-width`+`opacity`+`translate-x` em `duration-500`.

### 3.3 Onde o estado é persistido

**Não é persistido.** `sidebarCollapsed`, `mobileMenuOpen`, `activeSidebarMode` e
`activeSectionNavigationKey` são todos `useState` puro em `PlatformFrame`
(`platform-frame.tsx:170-177`) — client component sem `localStorage`, cookie ou querystring.
Recarregar a página reseta collapse para expandido e o modo para o valor calculado por
`isOperationalPath(pathname)` no mount seguinte (ver 3.4). Isso é uma escolha de implementação
explícita a registrar, especialmente porque contrasta com o padrão já adotado no repo atual para
`nav-mode` (cookie, para o servidor montar a sidebar certa no primeiro render — ver seção 5).

### 3.4 Alternador Site/Admin

Componente `SidebarSurfaceSwitch` (`platform-frame.tsx:830-901`), renderizado dentro da sidebar
(desktop) e do sheet (mobile) — **não no header**, batendo com a decisão já registrada em
`docs/venore-docks.md` do repo atual ("o toggle main-nav/admin-nav mora aqui [SidebarLeft], não no
Header").

- **Regra de visibilidade**: só renderiza se `canAccessAdmin` (`actor && canAccessAdminSurface(actor)`)
  for verdadeiro. Ninguém sem essa permissão vê o alternador — nem colapsado, nem expandido.
- **Estado inicial**: calculado uma única vez no mount via
  `canAccessAdmin && isOperationalPath(pathname) ? "admin" : "site"`
  (`platform-frame.tsx:175-177`), onde `isOperationalPath` (linhas 1164-1172) cobre só:
  `/admin`, `/admin/system`, `/admin/modules`, `/admin/runtime`, `/admin/settings`,
  `/admin/logs`, `/admin/traces`.
  **Ambiguidade/inconsistência**: `/admin/cms/**` e `/admin/community/**` **não** estão na lista —
  navegar direto (ex.: link externo, refresh) para `/admin/cms/entries` deixa a sidebar em modo
  `site` por padrão, mesmo a página renderizada sendo administrativa. Não sei se isso é
  intencional (talvez CMS seja tratado como "quase-site") ou um esquecimento na lista — registro
  sem resolver.
- **Comportamento**: pill de 2 colunas com um indicador deslizante (`translate-x`,
  `duration-300 ease-out`) quando expandida; quando colapsada, vira um único botão de ícone que
  alterna e mostra o modo oposto no `title`/`aria-label`.
- Trocar de modo (`onChange`) só troca o React state local — não navega, não muda a URL. Selecionar
  "Admin" no menu de usuário (`onOpenAdmin`) também só seta esse state antes do `<Link href="/admin">`
  navegar.

---

## 4. Inventário de tokens

Base de comparação: tokens shadcn canônicos declarados em `components.json` (`style: base-nova`,
`baseColor: neutral`) e `@theme inline` de `globals.css` do protótipo — `background`, `foreground`,
`card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`,
`secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`,
`destructive`, `border`, `input`, `ring`.

O repo atual (`venore-claudinho`) já fez essa migração para o vocabulário shadcn — ver
`AGENTS.md` §3, que documenta a tabela completa. A tabela abaixo é uma leitura independente a
partir do código do protótipo (para auditar se bate com a tabela já publicada) e não deveria
divergir dela; onde diverge, sinalizo.

| Valor no protótipo (`globals.css` / componentes) | Token semântico shadcn equivalente | Observação |
| --- | --- | --- |
| `--surface-canvas` | `background` | idêntico ao mapeamento já publicado em `AGENTS.md` |
| `--surface-panel` | `card` | idem |
| `--surface-elevated` | `muted` | idem |
| `--surface-overlay` | `popover` | idem; usado no protótipo como scrim do sheet mobile (`platform-frame.tsx:704`, `color-mix(in_srgb,var(--surface-canvas)_36%,black)` — na prática mistura `--surface-canvas`, não `--surface-overlay`, para o scrim; **inconsistência interna do protótipo**, o nome sugere `--surface-overlay` mas o código usa `--surface-canvas`) |
| `--text-primary` | `foreground` | idem |
| `--text-secondary`, `--text-muted` | `muted-foreground` | idem |
| `--text-accent` | `primary` | idem (troca de papel, não de opacidade — já documentado) |
| `--border-subtle` | `border` | idem |
| `--border-strong` | `ring` | idem, numérico: `--border-strong` no protótipo é literalmente definido a partir do mesmo espectro de verde que `--ring` |
| `--accent-soft` | `accent` + opacidade fixa (`/14`) | protótipo usa `color-mix(in srgb, var(--accent) 14%, transparent)` — mesma proporção (14%) já adotada em `AGENTS.md` |
| `--info-*`, `--warning-*`, `--error-*`, `--success-*` | sem equivalente shadcn direto | Não usados em nenhum arquivo do shell lido (header/sidebar/footer/page-header) — só existem declarados em `globals.css`, sem consumidor visível nos arquivos auditados aqui. Fora do escopo desta spec de shell; **não** deveriam gerar token novo só por existirem no CSS do protótipo. |
| `--header-bg`, `--header-chip-bg`, `--header-avatar-bg`, `--header-avatar-fg`, `--header-border-subtle`, `--header-border-strong`, `--header-foreground-strong` | **token candidato** — sem equivalente shadcn | Justificativa: o header precisa de uma paleta que reage a `isScrolled` sem ser literalmente igual a `card`/`popover` (ver §2.4 — o estado scrolled usa `--primary`, não uma superfície neutra). O repo atual já resolveu isso adotando esse mesmo grupo como tokens de **identidade de tema** (`src/themes/venore-slime/theme.css`, prefixo `--header-*`), não como tokens globais shadcn — é a decisão certa e já tomada; não proponho nada novo aqui, só confirmo que o protótipo e o repo atual concordam nesse ponto. |
| `--sidebar-bg`, `--sidebar-bg-admin` (+ `-start`/`-end`) | **token candidato**, mesmo raciocínio | Já existe em `globals.css` do repo atual com os mesmos nomes (gradiente linear por navMode). Confirma que a decisão já tomada é suficiente — nenhum token novo necessário. |
| `--app-bg` (+ `-start`/`-mid`/`-end`) | **token candidato**, identidade de tema | Já existe como `--app-background` no repo atual (`theme.css`), com composição mais elaborada (radial-gradients) que o protótipo (só linear-gradient). Divergência de valor, não de conceito — o repo atual já decidiu enriquecer o gradiente; não é uma lacuna a preencher. |
| `--radius-panel` | **token candidato** — sem equivalente shadcn 1:1 | Já existe em `globals.css` do repo atual com o mesmo nome e mesmo valor conceitual (derivado de `--radius`). Nenhuma ação necessária. |
| `--shadow-color`, `--shadow-color-strong` | sem token shadcn direto, mas **já resolvido** no repo atual | O protótipo usa esses dois crus, mais valores de sombra arbitrários inline (`0_18px_48px_-34px_var(--shadow-color-strong)` no header scrolled, `0_24px_80px_-40px` no sheet, `0_18px_36px_-24px` no botão back-to-top — três sombras "flutuantes" ligeiramente diferentes sem nome). O repo atual já nomeou essa família (`--shadow-panel`, `--shadow-float`, `--shadow-header`) com valores próprios, não idênticos aos três do protótipo. Recomendo **não** perseguir paridade numérica exata com o protótipo aqui — são três valores arbitrários que nem o próprio protótipo mantém consistentes entre si. |
| `--surface-base` (só em `theme-mode-toggle.tsx:26,44`) | **não declarado em nenhum lugar** | Grep em todo `globals.css` do protótipo não encontra `--surface-base`. É uma classe Tailwind arbitrária (`bg-[var(--surface-base)]`) referenciando uma custom property inexistente — resolve para o valor herdado do body (ou `initial`), não para o que o nome sugere. **Bug do protótipo**, registrado aqui, não deve ser copiado. |

Nenhum token novo é proposto por esta spec além dos que o repo atual já adotou. A leitura confirma
que a tradução já feita em `venore-claudinho` é consistente com o protótipo nos pontos onde os dois
se sobrepõem.

---

## 5. Tabela de tradução — componente do protótipo → arquitetura deste repo

Convenção deste repo (`docs/venore-docks.md`): shell é feita de "slots" (`HeaderSlot`,
`FooterSlot`, `ContentSlot`, `SidebarLeftSlot`) dentro de um tema (`src/themes/venore-slime/`),
compostos por `src/platform/theme-rendering/resolve-theme-slot-props.ts`. Boa parte da tradução
abaixo **já está feita** — a tabela documenta onde, e sinaliza divergência de comportamento/número
como decisão já tomada (não uma lacuna).

| Componente do protótipo | Já existe no repo atual como | Diverge em |
| --- | --- | --- |
| `PlatformFrame` header (`platform-frame.tsx:264-312`) | `src/themes/venore-slime/components/HeaderSlot.tsx` | Alturas (`64/96/112px` no repo atual vs. `64/100/140px` no protótipo — breakpoint único `md`/`lg` no repo atual em vez de só `md` no protótipo); **`scrollState.isScrolled` é hardcoded em `false`** no mock atual (`mock-data.ts:36`) — não há listener de scroll implementado no repo atual ainda. A máquina de estados descrita na seção 2 deste documento **não está portada**; é a especificação de referência para portá-la. |
| `PlatformBrand` (`platform-brand.tsx`) | `src/themes/venore-slime/components/PlatformBrand.tsx` | Reescrito deliberadamente (comentário no próprio arquivo): dimensionamento via `--ui-control-height-lg` + aspect-ratio em vez dos 4 números px fixos do protótipo; `size`/`scrolledSize` numéricos configuráveis (não mais 3 presets fixos `compact/balanced/prominent`). Decisão já tomada, não portar os presets antigos. |
| Sidebar desktop (`platform-frame.tsx:329-438`) | `src/themes/venore-slime/components/SidebarLeftSlot.tsx` | **Sem estado colapsado** no repo atual — largura fixa `w-56` (`224px`), sem botão de collapse. Sem "voltar"/section-nav (contextual não substitui main-nav aqui, ao contrário do protótipo — ver ambiguidade §1). Toggle site/admin é um `<form>` submit no rodapé da sidebar (server action, `onToggleNavMode`), não um switch client-side — porque o modo é persistido em cookie e lido no servidor (`src/platform/nav-mode/get-nav-mode.ts`), ao contrário do `useState` client do protótipo (§3.3). |
| Sheet mobile (`MobileNavigationSheet`, `platform-frame.tsx:638-828`) | `src/themes/venore-slime/components/MobileNavDrawer.tsx` + `mobile-nav-store.ts` | Abre pela **esquerda** (`w-64`, `256px`) no repo atual, contra pela **direita** (`min(86vw,360px)`) no protótipo. É a mesma árvore de componente reaproveitada para desktop/mobile no repo atual (`SidebarLeftSlot` é envolvido por `MobileNavDrawer`), diferente do protótipo, que duplica lógica em dois componentes irmãos. Convergência arquitetural deliberada — não portar a duplicação do protótipo. |
| Footer (`platform-frame.tsx:442-498`) | `src/themes/venore-slime/components/FooterSlot.tsx` | Sitemap **não é agrupado por categoria** no repo atual (`FooterSlotProps.sitemapItems` é lista plana) — o protótipo agrupa subindo a cadeia `parentId` até achar `category`. Já documentado como simplificação aceita no comentário do próprio `FooterSlot.tsx`. `creditsEnabled` é um conceito do repo atual sem equivalente no protótipo. |
| Conteúdo + região contextual | `src/themes/venore-slime/components/ContentSlot.tsx` | O repo atual modela contextual como **aside lateral** (`sidebarContextual`, `lg:w-72` = `288px`) — uma resposta de design diferente da ambiguidade §1 do protótipo (que usa `PageHeader` inline + substituição de sidebar). Nenhum dos dois é "a" tradução correta do blueprint; são duas interpretações diferentes da mesma frase vaga do blueprint. Reportado, não resolvido. |
| `PageHeader` (`ui/layout/page-header.tsx`) | **sem equivalente direto encontrado** em `venore-claudinho/src` nesta leitura | Não localizado em `src/themes/venore-slime` nem `src/platform`; pode estar implícito em `ContentSlot`/página individual. Não verificado a fundo — fora do escopo desta leitura (focada no shell, não em todas as páginas). |
| `admin-shell.tsx` / `admin/page-header.tsx` (código morto) | N/A — não deveria ter equivalente | Confirma a decisão "shell única" do repo atual; nada a portar. |
| `ThemeModeToggle` | Substituído por `useTheme()` direto (`next-themes`) | Já documentado como exceção deliberada em `AGENTS.md` §1 ("Exceção deliberada — dark/light toggle") — não portar o componente do protótipo, ele já foi conscientemente descartado. |

---

## 6. Não portar

Itens do protótipo que são dívida, gambiarra, ou violam as fronteiras já declaradas deste repo
(`docs/venore-docks.md`, `AGENTS.md`):

1. **`src/components/admin/admin-shell.tsx` e `src/components/admin/page-header.tsx`** —
   código morto (zero imports), paleta hardcoded (`slate-950`, `cyan-200`, `bg-white/10`) sem
   nenhum token de tema. Violaria diretamente a regra "nenhum valor hardcoded" do repo atual se
   fosse copiado. Confirma, por omissão, que a decisão "shell única" já tomada no repo atual está
   certa — o protótipo tentou (ou começou a tentar) uma segunda shell e não terminou/usou.

2. **`--surface-base` em `theme-mode-toggle.tsx`** — referencia uma custom property nunca
   declarada em `globals.css`. Bug silencioso (Tailwind arbitrary value não falha em build,
   resolve pra herdado/`initial`). Não copiar a variável nem o padrão de não validar que o token
   referenciado existe.

3. **Persistência client-only de `sidebarCollapsed`/`activeSidebarMode`/`mobileMenuOpen`** via
   `useState` sem cookie/localStorage (§3.3). Pelo menos o modo site/admin já foi corrigido no
   repo atual (cookie, resolvido no servidor) — não regredir para o padrão client-only do
   protótipo ao portar qualquer comportamento de sidebar restante (ex.: se um "collapse" vier a
   ser portado, decidir explicitamente se persiste, em vez de repetir o silêncio do protótipo).

4. **Contextual navigation substituindo main-nav no mesmo slot** (§1, §3) — contraria a frase
   explícita do próprio blueprint do protótipo ("must not replace the main navigation"). Não é
   sequer um padrão que o protótipo segue conscientemente; é uma contradição interna dele. Não
   portar esse comportamento específico independentemente de qual solução for escolhida para a
   região contextual.

5. **`isOperationalPath()` com lista de rotas incompleta** (§3.4) — `/admin/cms` e
   `/admin/community` ausentes da detecção de "estou numa rota administrativa". Se a
   detecção-por-rota for portada, ela precisa ser derivada de uma fonte única (ex.: prefixo
   `/admin` inteiro, ou a lista real de admin-nav resolvida no servidor) em vez de uma lista
   mantida à mão que já ficou desatualizada uma vez.

6. **Durações de transição fora da regra de motion do próprio protótipo** (§2.6: `450ms`,
   `500ms`, `700ms` contra o teto declarado de `250ms`) — não copiar os números como se fossem a
   intenção de design; são o que a implementação acabou tendo, não o que o blueprint pede. Se
   alguma dessas transições for portada, calibrar contra `--ui-motion-base`/`--ui-motion-slow`
   (`200ms`/`300ms`, já definidos em `globals.css` do repo atual), não contra os valores do
   protótipo.

7. **Duplicação sidebar-desktop / sheet-mobile como duas árvores de componente** (§1, §5) — o
   repo atual já convergiu isso em uma árvore só (`MobileNavDrawer` envolvendo `SidebarLeftSlot`).
   Não regredir para dois componentes irmãos com lógica de section-nav reimplementada duas vezes.

8. **Três valores de sombra "flutuante" inline e não nomeados** (`0_18px_48px_-34px`,
   `0_24px_80px_-40px`, `0_18px_36px_-24px` — §4) — o repo atual já nomeou essa família
   (`--shadow-panel`/`--shadow-float`/`--shadow-header`). Não introduzir um quarto valor arbitrário
   ao portar qualquer elemento "flutuante" (ex. botão back-to-top, se vier a ser portado); escolher
   entre os três já existentes.
