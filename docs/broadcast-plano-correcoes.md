# Broadcast Studio — plano de correções, responsividade e fallback

Plano acordado numa sessão de revisão do plugin `broadcast` (`src/plugins/broadcast/`). O plugin
**já está em produção** num servidor **sempre local, processo único** (`next start`) — nenhuma fase
pode regredir a instância em uso.

Cada fase tem um **prompt de sessão** pronto pra colar numa sessão nova. Fases independentes podem
rodar em paralelo; as dependências estão na tabela de ordem.

Restrições que valem para TODAS as fases:

- **Plugin não toca o core.** Nada de editar `globals.css`, `next.config.ts`, `package.json`,
  `theme.css`, `src/themes/**`. Escala/animação da view vão por `style` inline ou o `<style>` que já
  existe em `output-canvas.tsx`.
- Cor na view sempre em `style` inline, nunca `className` (convenção já estabelecida em
  `layer-renderer.tsx`; o lint de cor só permite cor crua fora de `className`).
- Sem breakpoints `sm:/md:/lg:` no canvas de saída — é tela de TV de orientação fixa, resolvida por
  escala proporcional (ver Fase 1), não por media query.
- Fluxo de camadas do `AGENTS.md` (`handler → service → store`, `OperationResult<T>`,
  `authorizeActor` no handler) em qualquer feature nova.
- `npm run lint`, `npm run typecheck`, `npm run test` verdes no fim de cada fase. **A primeira fase
  que tocar `src/plugins/broadcast/components/admin/outputs-section.tsx` corrige os 2 erros de
  typecheck pré-existentes ali** (props faltando em `EditPinDialog` / select de playlist — WIP da
  branch `rbac-scoped-roles-phase-c`).

---

## Triagem dos issues

| # | Item | Decisão |
|---|---|---|
| 1 | Token de saída previsível (slug do nome) | **Fechado** — previsível é intencional (digitar no controle da TV). |
| 2 | Rota de stream sem checagem de PIN | **Fechado** — sem necessidade de proteger o conteúdo dos vídeos. |
| 3 | `getConnectedOutputIpsAction` sem `authorizeActor` | **Fase 6** |
| 4 | Bus SSE em memória assume processo único | **Fechado** — servidor sempre local. Vira nota no `manifest.ts` (Fase 6). |
| 5 | `publishAlert` / `setOutputPlaylist` não emitem evento SSE | **Fase 4** |
| 6 | `revalidatePath` da página inteira em toda action | **Fase 5** |
| 7 | PIN em texto plano, sem rate limit | **Fase 9** (com reset via admin) |
| 8 | SSE sem heartbeat/keep-alive | **Fase 8** |
| 9 | Fuso horário: `datetime-local` parseado na zona do servidor | **Fase 3** (setting `broadcast.timezone`, default `America/Sao_Paulo`) |
| 10 | `<iframe>` de webpage sem `sandbox` nem fallback de falha | **Fase 6** |
| 11 | `setOutputPlaylist` retorna registro desatualizado | **Fase 4** (mesmo arquivo do #5) |
| 12 | Nenhum `handler.test.ts` no plugin | **Fase 6** |
| 13 | 17 migrations | **Já feito** (squash 2026-08-28) — Fase 7 fecha só a verificação de integração |
| — | Responsividade da view (720p / 1080p / 4K quebram) | **Fases 1 e 2** |
| — | Faixa preta no vídeo quando o drawer abre | **Fase 10** (blurred fill) |
| — | Fallback quando a tela não está no ar (offline por admin ou sem conexão) | **Fase 11** |

---

## Explicações dos issues fechados / adiados

### #3 — `getConnectedOutputIpsAction` sem autorização

`components/admin/actions.ts:717` é uma `"use server"` function. Toda Server Action do Next vira um
endpoint POST com ID estável — qualquer um que alcança o site pode chamá-lo (via `curl`), logado ou
não, com permissão de broadcast ou não. Não há `authorizeActor` nem `isPluginActive` no corpo.
Devolve `{ token: [ip, ip…] }` de todas as TVs conectadas. Numa LAN o impacto é baixo, mas é o único
ponto do plugin que fura a cadeia `handler → service → authorizeActor`, e o token da saída é a
credencial de acesso à view pública — entregar a lista de tokens a um chamador anônimo é pior que os
IPs. Correção: passar a leitura por um handler com `authorizeActor("broadcast.manage")`.

### #4 — Bus em memória / processo único

`runtime/output-bus.ts` guarda a lista de assinantes SSE num `Map` em `globalThis`. `publishOutputEvent`
(chamado pelos services de controle ao vivo) percorre esse `Map` e empurra pra cada TV. Só funciona
se a Server Action e o Route Handler do SSE rodarem no mesmo processo do SO. Em serverless (Vercel)
cada request pode cair num worker isolado → o evento nunca chega, e a TV só atualiza no poll de 15s.
**Com servidor sempre local (um `next start`), não é um problema** — só fica uma nota no manifesto
pra ninguém tentar publicar em serverless depois.

### #5 — Ações ao vivo que não emitem evento SSE

O canal SSE tem um conjunto fixo de tipos (`BroadcastOutputEvent`): `scene-changed`,
`drawer-changed`, `footer-changed`, `ticker-changed`, `agenda-schedule-changed`. Os services
correspondentes chamam `publishOutputEvent` e a TV reage em ~1s. Mas:

- `publishAlert` / `clearAlert` nunca chamam `publishOutputEvent` — não existe tipo `alert-changed`.
  O "aviso urgente" só chega na TV no próximo poll de **15s**.
- `setOutputPlaylist` idem — trocar a playlist de uma tela demora até 15s.

Tudo funciona por causa do `FALLBACK_POLL_MS = 15_000` em `output-canvas.tsx`, mas "aviso urgente"
esperando 15s é o que incomoda. Correção: 2 tipos novos no union + `publishOutputEvent` nesses
services (o cliente já refaz o fetch de estado em qualquer evento que não seja `state`).

### #7 — PIN em texto plano, sem rate limit

O PIN opcional por saída: gravado na coluna `outputs.pin` como texto literal (sem hash); no cookie
`broadcast-output-pin-<token>` como texto literal, 1 ano, `httpOnly` mas **sem `secure`**; verificado
com `candidate === output.pin`; sem limite de tentativas (`submitOutputPinAction` pode ser chamada em
loop). Numa LAN com PIN numérico curto, dá pra scriptar milhares de tentativas em segundos. Decisão:
adicionar limitador com reset via admin (Fase 9); hash de PIN + `secure` no cookie no mesmo pacote.

### #8 — SSE sem keep-alive

A conexão `EventSource` é uma resposta HTTP de longa duração. A rota abre o stream, manda o estado
inicial e fica em silêncio até algo mudar (pode ser horas). Proxies/switches com timeout de ocioso
podem matar uma conexão silenciosa por 30–120s; o `EventSource` reconecta sozinho, mas se a
reconexão também falhar volta pro poll de 15s sem ninguém perceber. O servidor também nunca fecha
streams ociosos e não há teto de conexões por token. Correção: heartbeat `: ping\n\n` a cada ~20s +
hint `retry:` (Fase 8).

---

## Decisões de design

### Responsividade — unidade proporcional (Fases 1–2)

A view foi calibrada pra 1920×1080 com tamanhos fixos por toda parte (`text-6xl`, `text-[11px]`,
`px-16 py-14`) e matemática de pixel hardcoded (`BROADCAST_AGENDA_VIEW_SIZE_SCALE.footerHeightPx`
80/128/160, `COMPACT_FOOTER_HEIGHT_PX` 48). Num TV browser que reporta 1280 px o conteúdo
estoura/corta; num que reporta 3840 px fica minúsculo num vazio.

**Não** é caso de breakpoints. A solução é escalar o canvas proporcionalmente ao viewport,
mantendo o layout idêntico. Abordagem: **root font-size fluida**. No elemento raiz do canvas
(`output-canvas.tsx`) define-se `fontSize: "min(calc(100vw / 120), calc(100vh / 67.5))"` — `1rem` ≈
16px em 1920×1080 e escala com o viewport, com clamp por altura pra telas não-16:9. Como quase toda
utilitária do Tailwind (`text-*`, `p-*`, `gap-*`, `size-*`, `h-*`) já é baseada em `rem`, elas
escalam sozinhas. Sobra converter os poucos pontos em px cru e a matemática de pixel em JS.

Alternativa descartada (fallback se a fluida der trabalho demais): "palco" fixo 1920×1080 com
`transform: scale(...)` — layout idêntico garantido, quase zero mudança, mas `<video>`/`<img>` não
renderizam em resolução nativa 4K. Como há uma TV 4K, a fluida é melhor.

### Faixa preta com o drawer aberto — blurred fill (Fase 10)

Com o drawer (coluna de agenda) aberto, a caixa do vídeo deixa de ser 16:9 e o `object-contain`
letterboxa o vídeo 1920×1080 → faixa preta. Não usar `object-cover` puro (corta conteúdo — já
rejeitado pelo usuário: "a view do vídeo precisa permanecer 16:9").

Ideia de "sangria" no vídeo (produzir com margem de segurança) foi avaliada e **descartada como
mecanismo**: o corte necessário não é fixo (varia por tier, zero-bar e footer), viraria obrigação de
produção pra sempre, e o fluxo "joga MP4 na pasta" continuaria gerando faixa preta.

Solução adotada: **preenchimento desfocado** — a área que seria faixa preta é preenchida com uma
cópia borrada e ampliada do próprio vídeo (truque padrão de YouTube/broadcast). Zero perda de
conteúdo, zero re-produção, funciona pra qualquer vídeo. Opcionalmente, um opt-in por item de
playlist (`cropWhenDrawerOpen`) pra vídeos produzidos com sangria usarem `object-cover` direto.

### Fallback de tela fora do ar (Fase 11)

Dois gatilhos, mesma tela visual (marca do site + animação calma + texto de status):

- **Offline deliberado:** nova opção "Tela offline" no card da Tela (campo `broadcastOutputs.offline`).
- **Sem contato / sem conteúdo:** SSE + poll falhando por ~1min (detecção client-side), ou playlist
  vazia/ausente.

Um componente `StandbyScreen` parametrizado por `reason` (`"admin" | "no-content" | "disconnected"`),
construído sobre o palco escalado das Fases 1–2.

---

## Ordem das fases

| Fase | Tema | Depende de |
|---|---|---|
| 1 | Fundação de escala da view | — |
| 2 | Polimento responsivo por componente | 1 |
| 3 | Fuso horário via settings | — |
| 4 | Eventos SSE (alerta + playlist) + fix #11 | — |
| 5 | Performance do controle ao vivo no admin | 4 |
| 6 | Correção e higiene (#3, #10, #12, nota #4) | — |
| 8 | Heartbeat SSE | — |
| 10 | Fim da faixa preta (blurred fill) | 1, 2 |
| 11 | Tela de standby / offline | 1, 2, 4 |
| 9 | Hardening do PIN + reset via admin | — |
| 12 | Evento de agenda com datas espaçadas | — |
| 13 | Diagnóstico do Broadcast (sub-rota /diagnostico: TV + servidor) | — |
| 7 | Fechar verificação de migrations | 9, 11, 12, 13 (roda por último) |

---

## Prompts de sessão

### Fase 1 — Fundação de escala da view

```
Contexto: plugin src/plugins/broadcast. A view de saída (src/plugins/broadcast/components/output/output-canvas.tsx e layer-renderer.tsx, mais src/plugins/broadcast/routes/out/) foi calibrada para 1920x1080 e quebra em 1280x720 (corta/estoura) e em 3840x2160 (fica minúscula). O servidor é SEMPRE local, processo único. O plugin JÁ está em produção — não pode regredir.

Objetivo: a view de saída deve ficar proporcionalmente IDÊNTICA em 1280x720, 1920x1080 e 3840x2160 — mesmo layout, só escalado. Nada cortado, nenhum vazio morto na zona de vídeo.

Abordagem (unidade proporcional):
- No elemento raiz do canvas em output-canvas.tsx, definir font-size fluida via style inline:
  fontSize: "min(calc(100vw / 120), calc(100vh / 67.5))"
  (1rem ≈ 16px em 1920x1080, escala com o viewport, clamp por altura p/ telas não-16:9).
- Manter tudo baseado em rem. Converter os px crus de layer-renderer.tsx: text-[11px] -> text-[0.6875rem], text-[10px] -> text-[0.625rem], e varrer inline style com valor px que afete layout (offsets grandes de boxShadow podem ficar; foco no que muda posição/tamanho).
- Refazer a matemática de pixel:
  * shared/settings.ts: em BROADCAST_AGENDA_VIEW_SIZE_SCALE, adicionar footerHeightRem por tier (espelho do footerHeightClassName h-20/h-32 = 5/8), e footerLogo idem. Manter footerHeightPx apenas como derivado, NÃO como número fixo.
  * layer-renderer.tsx useZeroBarAgendaWidthPercent: continua medindo window.screen (isso já é robusto e resolve o F11), mas footerHeightPx deve ser calculado a partir da unidade proporcional: footerHeightRem * (window.screen.width / 120), não os 80/128/160 fixos.
  * COMPACT_FOOTER_HEIGHT_PX (48) -> COMPACT_FOOTER_HEIGHT_REM (3, = h-12); onde é usado em JS, converter com o mesmo fator.

NÃO mexer: a lógica de geometria agenda/vídeo/footer/drawer, os truques de estabilidade de mount do <video>, o sistema de eventos SSE, nem os keyframes.

Restrições:
- Plugin não toca core: nada de editar globals.css / next.config.ts / package.json / theme.css. Escala via style inline / o <style> que já existe no canvas.
- Sem breakpoints sm:/md:/lg: no canvas.
- Cor sempre em style inline (convenção do arquivo), nunca className.
- Se tocar src/plugins/broadcast/components/admin/outputs-section.tsx, corrigir os 2 erros de typecheck pré-existentes ali (props de EditPinDialog / select de playlist).

Definition of Done:
- npm run lint, npm run typecheck, npm run test passam.
- QA manual (devtools responsive nas 3 resoluções + TV real se possível): drawer aberto e fechado, footer aberto e fechado, ticker ligado, alerta ativo, slide de notícia, slide de evento em destaque — layout proporcionalmente idêntico, nada cortado, zona de vídeo sem faixa preta.
```

### Fase 2 — Polimento responsivo por componente

```
Contexto: continuação da Fase 1 (fundação de escala já aplicada na view do plugin broadcast). Agora varrer cada subcomponente da view em busca das últimas unidades não-proporcionais.

Objetivo: nenhum componente da view com px cru que quebre a proporção em 720p/1080p/4K.

Componentes a revisar (src/plugins/broadcast/components/output/layer-renderer.tsx salvo indicação):
- NewsSlideCard, NewsCardRotator
- FeaturedAgendaEventSlide
- AgendaLayer (cards de evento, dateBadge, statusPill, brand no rodapé, dots do rodízio)
- AgendaTickerInline
- AlertBanner
- InfoLayer, ClockWeatherBlock, BrandFooterBar
- PlaylistLayer / ProgressOverlay
- src/plugins/broadcast/routes/out/pin-form.tsx  (a tela de PIN precisa ser LEGÍVEL numa TV de longe — hoje provavelmente está em tamanho de formulário de admin)

Para cada um: trocar px cru de layout por rem/em; confirmar que style inline com px (w-24, w-px, boxShadow) não distorce em escala; conferir que os line-clamp continuam fazendo sentido escalados (fazem — são rem).

Restrições: idênticas à Fase 1 (plugin não toca core; sem breakpoints no canvas; cor em style inline).

Definition of Done:
- lint / typecheck / test passam.
- QA nas 3 resoluções cobrindo os mesmos estados da Fase 1 + a tela de PIN (src/plugins/broadcast/routes/out/pin-form.tsx) legível e centrada em 720p, 1080p e 4K.
```

### Fase 3 — Fuso horário via settings

```
Contexto: plugin broadcast. Hoje os campos datetime-local de evento de agenda são lidos com new Date(raw) em src/plugins/broadcast/components/admin/actions.ts (optionalDate + new Date(startAtRaw)) = hora local do servidor. Servidor é local em Curitiba hoje, mas quero isso explícito e correto, e a exibição normalizada (uma TV pode estar em qualquer fuso).

Objetivo: um setting de fuso horário da instituição, usado tanto no parse (admin) quanto na formatação (view).

Implementação:
- src/plugins/broadcast/shared/settings.ts: adicionar BROADCAST_SETTINGS.timezone, key "broadcast.timezone", defaultValue "America/Sao_Paulo", label "Fuso horário da instituição". (manifest.ts já mapeia settings a partir de BROADCAST_SETTINGS.)
- SettingsSection + nova action updateBroadcastTimezoneAction (espelhar updateBroadcastRegionAction) com um <select> de zonas IANA (ao menos as brasileiras + lista sensata). Sem dev jargon na UI (memory feedback_admin_ux_no_dev_jargon): rótulo tipo "Curitiba / Brasília (GMT-3)".
- Parse (server): em components/admin/actions.ts, create/update de evento — interpretar a string de parede (datetime-local) na zona configurada e gravar UTC (coluna já é timestamptz). Sem dependência nova: helper próprio via Intl.DateTimeFormat/formatToParts.
- Exibição: passar a zona por get-output-state -> BroadcastOutputState -> cliente. Aplicar { timeZone } em formatEventDay, formatEndTimeSuffix, isSameDay, no render de useClock, e em shared/weekly-recurrence.ts (resolveEventOccurrenceDate / resolveEventEndDate / isEventHappeningNow) — "hoje"/"agora"/dia da semana calculados na zona configurada, não na zona do browser da TV.
- Testes: shared/weekly-recurrence.test.ts com uma zona != UTC; um teste de service/handler de create/update de evento cobrindo o parse de fuso.

Definition of Done:
- lint / typecheck / test passam.
- Criar evento às 19:30 no admin -> o card na TV mostra 19:30 independente do fuso do browser da TV.
```

### Fase 4 — Eventos SSE (alerta + playlist) + fix #11

```
Contexto: plugin broadcast. src/plugins/broadcast/features/alerts/publish-alert/service.ts, clear-alert/service.ts e outputs/set-output-playlist/service.ts NÃO chamam publishOutputEvent — então alerta e troca de playlist só chegam na TV no poll de 15s (FALLBACK_POLL_MS em output-canvas.tsx). O cliente já refaz o fetch de estado em qualquer evento que não seja type:"state".

Objetivo: alerta e troca de playlist refletem na TV em ~1s.

Implementação:
- src/plugins/broadcast/contracts/types.ts: estender BroadcastOutputEvent com { type: "alert-changed" } e { type: "playlist-changed" } (sem payload — cliente só precisa saber que deve rebuscar).
- publish-alert/service.ts e clear-alert/service.ts: após o write, publishOutputEvent para TODOS os tokens de saída (alerta é global, não por saída). Adicionar um findAllOutputTokens no store de alerta ou um helper compartilhado.
- set-output-playlist/service.ts: publishOutputEvent(output.token, { type: "playlist-changed" }); e no MESMO commit corrigir #11 — retornar o registro atualizado da saída, não o output lido antes do update.
- Confirmar que a rota SSE (routes/api/output-events) e runtime/output-bus lidam com tipo de evento desconhecido sem quebrar (o cliente já lida).
- Estender os testes de service de alerta e de set-output-playlist para assertar a chamada de publishOutputEvent.

Definition of Done:
- lint / typecheck / test passam.
- Publicar um alerta -> TV mostra em ~1s (não 15s). Trocar a playlist de uma tela -> muda em ~1s.
```

### Fase 5 — Performance do controle ao vivo no admin

```
Contexto: plugin broadcast. Toda action em src/plugins/broadcast/components/admin/actions.ts chama revalidatePath("/admin/broadcast"), que re-executa o loader inteiro de BroadcastAdminPage (src/plugins/broadcast/routes/admin/page.tsx — ~15 queries + resolução de mídia) a cada toque. Controle ao vivo (abrir/fechar agenda no ar) fica lento.

Objetivo: os toggles de controle ao vivo respondem instantaneamente no admin, sem full reload da página.

Escopo (só os toggles que NÃO mudam estrutura): setOutputDrawer, setOutputFooter, setOutputTicker, setOutputAgendaSchedule, setOutputPlaylist, setOutputPin, publishAlert, clearAlert. MANTER revalidatePath completo em create/delete/reorder/editors/settings (estrutural).

Abordagem:
- Nesses toggles: remover revalidatePath e fazer a action RETORNAR o novo valor no result.
- Nos componentes de seção (outputs-section.tsx, controles de agenda/alerta): estado otimista (useOptimistic / estado local) que reflete o clique na hora, confirmado pelo valor retornado.
- Manter intacta a cadeia server action + authorizeActor — só troca revalidatePath por retorno de valor.
- A TV já atualiza via SSE (Fase 4) independente do admin, então o admin só precisa refletir o próprio widget.
- Corrigir os 2 erros de typecheck pré-existentes em outputs-section.tsx se ainda não foram.

Definition of Done:
- lint / typecheck / test passam.
- Alternar drawer/footer/ticker de uma tela atualiza o toggle no admin na hora, sem flash de página inteira; no painel de rede, uma chamada pequena de action, não um re-render RSC da página; a TV continua reagindo via SSE.
```

### Fase 6 — Correção e higiene (#3, #10, #12, nota #4)

```
Contexto: plugin broadcast, servidor sempre local, já em produção.

1. #3 — src/plugins/broadcast/components/admin/actions.ts getConnectedOutputIpsAction chama o barrel direto sem autorização. Criar features/outputs/list-connected-output-ips/ (handler + service que embrulha getConnectedOutputIps de runtime/output-bus) com authorizeActor("broadcast.manage"); a action passa a chamar o handler e mantém o guard isPluginActive. Ajustar o barrel index.ts.

2. #10 — layer-renderer.tsx, branch "webpage" de PlaylistLayer: no <iframe> adicionar sandbox (conjunto mínimo que ainda deixa dashboards renderizarem, ex: "allow-scripts allow-same-origin"), referrerPolicy="no-referrer", e fallback de falha de embed: em onError do iframe OU timeout de load (~8s sem evento load), avançar pro próximo slide (reusar advance() + setManualTick), no mesmo espírito de isEmptySlide que já existe.

3. #12 — adicionar handler.test.ts para os handlers com autorização escopada: ao menos set-output-playlist, add-media-asset-playlist-item, scan-playlist-folder e um handler de agenda. Cobrir os 3 casos: sem permission / com permission mas não atribuído / com permission + atribuído. Mockar @/contexts/rbac authorizeActor e o shared/scoped-authorization/store.

4. #4 (nota) — adicionar comentário curto em manifest.ts registrando que o plugin requer hospedagem em processo único (bus SSE em memória via globalThis), não serverless.

Definition of Done:
- lint / typecheck / test passam.
- POST não autenticado na action de IPs conectados é rejeitado.
- Item webpage apontando pra site que recusa framing pula pro próximo item em vez de tela em branco.
```

### Fase 7 — Fechar verificação de migrations (o squash já foi feito)

```
Contexto: o squash das 17 migrations do plugin broadcast num único baseline 0000_brainy_tenebrous JÁ foi feito em 2026-08-28 (ver docs/issues.md, seção "Plugin broadcast", bullet "Squash de migrations — FEITO"). O _journal.json tem o `when` do baseline fixado em 1786722843076 pra ser no-op num banco no head e aplicar tudo num banco novo. O que ficou pendente: test:integration e db:install:fresh não foram rodados (sem TEST_DATABASE_URL no ambiente).

As migrations novas introduzidas pelas Fases 9 (hash de PIN), 10 (cropWhenDrawerOpen, opcional) e 11 (broadcastOutputs.offline) são INCREMENTAIS sobre o baseline (0001, 0002, …) — não re-squashar.

Tarefa:
- Com um Postgres real + TEST_DATABASE_URL: rodar npm run test:integration e confirmar que o globalSetup aplica a árvore migrations/ do broadcast limpa (baseline + incrementais das Fases 9/11).
- Rodar npm run db:install:fresh (memory fresh_install_flow) e confirmar que o schema broadcast nasce completo.
- Confirmar 1 .sql == 1 entry no _journal == 1 snapshot (AGENTS.md §6.5) após as Fases 9/11.
- Registrar o resultado em docs/issues.md (fechar o "Pendente / não verificado" do bullet do squash).

Definition of Done: integração verde com banco real; fresh install cria o schema; contagem de migrations consistente.
```

### Fase 8 — Heartbeat SSE

```
Contexto: plugin broadcast, src/plugins/broadcast/routes/api/output-events/route.ts. O stream SSE fica silencioso entre eventos (horas). Proxies/switches podem matar conexão ociosa; sem heartbeat a reconexão pode falhar em silêncio.

Tarefa:
- A cada ~20s, escrever ": ping\n\n" no controller do ReadableStream (comentário SSE, ignorado pelo browser).
- Emitir um hint "retry: 5000\n\n" no início do stream.
- Limpar o intervalo no cancel() junto com unsubscribe.
- Opcional: teto de conexões por token no output-bus (fechar a mais antiga ao exceder).

Definition of Done: lint/typecheck/test passam; TV ligada por horas numa LAN com proxy no meio continua recebendo eventos sem depender do poll.
```

### Fase 9 — Hardening do PIN + reset via admin

```
Contexto: plugin broadcast, processo único, já em produção. PIN por saída hoje é texto plano (coluna outputs.pin + cookie 1 ano sem secure), comparação simples, sem rate limit (src/plugins/broadcast/shared/output-pin-cookie.ts, features/outputs/verify-output-pin/, routes/out/actions.ts).

Tarefa:
- Guardar o PIN como hash (verificar hasher já usado em contexts/auth — reusar, sem dep nova); verify-output-pin compara hash. Migration incremental pro schema (sobre o baseline 0000_brainy_tenebrous).
- setOutputPinCookie: secure: true.
- Limitador de tentativas em submitOutputPinAction: backoff por (token + IP), estado em memória (mesma pegada do output-bus; processo único). Ex.: após N falhas, bloquear a combinação por T minutos, com incremento progressivo.
- Reset via admin: nova feature features/outputs/reset-output-pin-attempts/ (handler + service) gateada por authorizeActor("broadcast.manage") OU authorizeOutputActor(outputId) — limpa o contador em memória daquele token (todos os IPs). Botão "Liberar tentativas de PIN" no card da Tela em outputs-section.tsx, visível quando há bloqueio ativo (ou sempre, se for mais simples).
- Testes: verify-output-pin com hash; limitador (N falhas -> bloqueio -> reset libera).

Definition of Done: lint/typecheck/test passam; brute force é barrado após N tentativas; "Liberar tentativas" no admin destrava na hora; PINs existentes continuam funcionando (ou migração de re-hash documentada).
```

### Fase 10 — Fim da faixa preta com o drawer aberto (blurred fill)

```
Contexto: plugin broadcast. Roda DEPOIS das Fases 1-2 (fundação de escala já aplicada). Com o drawer (coluna de agenda) aberto, a caixa do vídeo deixa de ser 16:9 e o object-contain (fillMode "contain" em src/plugins/broadcast/components/output/layer-renderer.tsx) letterboxa o vídeo 1920x1080 -> faixa preta. Não usar object-cover puro (corta conteúdo — já rejeitado).

Objetivo: com o drawer aberto, nenhuma faixa preta — a área de letterbox vira uma extensão borrada do próprio vídeo; conteúdo principal intacto e 16:9.

Implementação:
- Em PlaylistLayer / VideoZoneLayer, quando fillMode === "contain" (drawer aberto): renderizar ATRÁS do <video>/<img> da frente uma camada de fundo que preenche a caixa:
  * vídeo: segundo <video muted playsInline autoPlay aria-hidden> com o mesmo src, object-cover + filter: blur(~24px) brightness(0.6) + transform: scale(1.1), position absolute inset-0, pointer-events-none. Vídeo da frente continua object-contain.
  * imagem: mesma ideia com <img> de fundo (object-cover + blur) ou background-image.
  * Preferir 2 elementos <video> a captura em canvas — mais robusto em engine de TV antiga (o codebase já se preocupa com isso); documentar o custo de 1 decode extra.
- Slides webpage / news / agenda-event já são full-bleed — não têm letterbox, pular.
- Com o drawer FECHADO: comportamento atual (object-cover) inalterado.
- Opcional (2º passo, marcar como tal): coluna broadcastPlaylistItems.cropWhenDrawerOpen boolean default false + migration incremental + checkbox no form de edição do item; quando true, o item usa object-cover (sem blur) — pra vídeos produzidos com sangria.

Restrições: plugin não toca core; cor em style inline; sem breakpoints no canvas.

Definition of Done:
- lint / typecheck / test passam.
- Com o drawer aberto, um vídeo 1920x1080 comum não mostra faixa preta — a área lateral/superior é a extensão borrada do vídeo; conteúdo principal sem corte e 16:9.
- QA de performance na TV 4K: sem frames dropados perceptíveis com o fundo borrado ativo.
```

### Fase 11 — Tela de standby / offline

```
Contexto: plugin broadcast. Roda DEPOIS das Fases 1-2 (fundação de escala) e 4 (infra de evento SSE). Fallback branded pra quando a saída não está no ar, cobrindo:
(a) admin colocou a tela offline de propósito — nova opção na Tela;
(b) tela perdeu contato com o servidor (SSE + poll falhando) ou não há conteúdo resolvível.

Objetivo: em vez de tela preta / "Sem playlist configurada" cru, mostrar uma tela de espera com a marca do site + animação suave + texto de status.

Parte 1 — Offline por decisão do admin:
- schema (src/plugins/broadcast/database/schema/index.ts): broadcastOutputs.offline boolean not null default false. Migration incremental (sobre o baseline 0000_brainy_tenebrous).
- Nova feature features/outputs/set-output-offline/ (handler + service + store), gate authorizeOutputActor (mesmo padrão de set-output-drawer). O service publica evento SSE.
- contracts/types.ts: BroadcastOutputEvent += { type: "offline-changed"; offline: boolean }. get-output-state + BroadcastOutputState passam a incluir offline. Adicionar output.offline às condições needsBrandLogo / needsBrandColor em get-output-state/service.ts (hoje só resolvem quando footer/agenda ativos — offline precisa da logo e da cor mesmo com footer fechado).
- Admin: toggle "Tela offline" no card da Tela em components/admin/outputs-section.tsx, mesmo padrão otimista da Fase 5 (sem revalidatePath, action retorna o valor). Deixar claro o efeito na UI ("A TV mostra uma tela de espera com a marca, não o conteúdo").

Parte 2 — Componente StandbyScreen (view):
- Novo componente em components/output/, sobre o palco escalado das Fases 1-2 (unidade proporcional, style inline, sem breakpoints).
- Visual: fundo = broadcast.brandColor; logo do site centralizada (brandLogoUrl de get-output-state); paleta de contraste via resolveContrastPalette (já existe); texto de status abaixo da logo.
- Animação: calma, própria pra ficar horas ligada (respiração/pulse lento da logo ou shimmer discreto) via @keyframes no <style> do canvas — nada de spinner pesado.
- reason: "admin" -> "Tela em modo de espera"; "no-content" -> "Nenhum conteúdo programado"; "disconnected" -> "Sem conexão com o servidor — reconectando…". Um só componente parametrizado.

Parte 3 — Fios:
- output-canvas.tsx: state.offline -> StandbyScreen reason="admin" no lugar do canvas. Camada de vídeo sem nenhum item resolvido -> reason="no-content" (substitui o texto cru em PlaylistLayer).
- Detecção de desconexão (client-side, sem mudar servidor): rastrear lastSuccessfulSyncAt (atualizado no onmessage type:"state" e em refetchState ok); timer a cada ~5s; se now - lastSuccessfulSyncAt > ~45s -> overlay StandbyScreen reason="disconnected" sobre o último quadro; ao voltar a sincronizar, remove.
- routes/out/page.tsx (SSR): getOutputState com offline:true -> SSR já renderiza StandbyScreen direto (sem flash). Token inexistente continua notFound(). Opcional: erro transitório de SSR -> render disconnected em vez de notFound().

Restrições: plugin não toca core; cor em style inline; sem breakpoints no canvas.

Definition of Done:
- lint / typecheck / test passam.
- Admin liga "Tela offline" -> TV troca pra tela de espera branded em ~1s (via SSE) e volta ao desligar.
- Playlist sem itens -> tela de espera "nenhum conteúdo", não texto cru.
- Servidor derrubado ~1min -> TV mostra "sem conexão" sobre o último quadro e se recupera sozinha.
- QA nas 3 resoluções (720p/1080p/4K): logo + texto + animação proporcionais, legíveis de longe.
```

---

### Fase 12 — Evento de agenda com datas espaçadas (não consecutivas)

Decisões de design (já tomadas com o usuário): **um card com todas as datas** (o evento fica um
só, listando as datas, e sai do rodízio só quando a ÚLTIMA passa) + **horário próprio por data**
(cada data extra tem início e fim próprios).

```
Contexto: plugin broadcast, já em produção, servidor sempre local. Hoje um evento de agenda
(broadcastAgendaEvents) é um span único startAt -> endAt. Um evento que acontece em dois dias
NÃO consecutivos (ex: dia 10 e dia 15, sem nada entre eles) não é representável.

Objetivo: permitir adicionar datas extras a um evento. O evento continua UM card, listando todas
as datas; sai do rodízio da agenda só quando a última data (primária ou extra) já passou. Cada
data extra tem horário de início e término próprios. Datas extras NÃO se aplicam a evento "toda
semana" (recurring) — a seção fica escondida/ignorada quando recurring está marcado.

Schema (src/plugins/broadcast/database/schema/index.ts): nova tabela broadcast_agenda_event_dates
- id text pk ($defaultFn randomUUID)
- eventId text not null references broadcastAgendaEvents.id onDelete cascade
- startAt timestamptz not null
- endAt timestamptz (nullable)
Migration incremental (0003_*, sobre o baseline). db:generate:broadcast + db:migrate:broadcast
(aplicar no banco — não esquecer).

contracts/types.ts:
- BroadcastAgendaEventDate = { id: string; startAt: Date; endAt: Date | null }
- BroadcastAgendaEventRecord += extraDates: BroadcastAgendaEventDate[]
- AgendaRotationEvent (resolvido) carrega extraDates como estão (one-off, sem recorrência a
  resolver; JSON serializa Date -> string, as helpers da view já aceitam string|Date).

Features create-agenda-event / update-agenda-event:
- command/input += extraDates?: { startAt: Date; endAt?: Date | null }[]
- validation: cada data extra Date válida; se tiver endAt, endAt > startAt. (lenient no resto)
- service: se recurring, persiste ZERO datas extras. Create: insere evento, insere datas, retorna
  { ...row, extraDates }. Update: substitui todas as datas do evento (replaceAgendaEventDates),
  retorna com extraDates.
- store: insertAgendaEventDates(eventId, dates), replaceAgendaEventDates(eventId, dates); os
  finders de evento (findAgendaEventById aqui e nos outros) passam a anexar extraDates (query
  extra + group). Manter o padrão handler->service->store.

list-agenda-events (admin): store busca as datas de todos os eventos e agrupa por eventId ->
event.extraDates, pro formulário de editar prefill.

get-output-state:
- store findAllUpcomingAgendaEvents: um evento é "upcoming" se recurring OU
  max(sobre {primário, extras}) de (endAt ?? startAt) >= now. Mais simples buscar eventos + datas
  e filtrar em JS do que SQL com MAX/join. Anexar extraDates ao retorno.
- service resolveAgendaRotationEvent: anexar extraDates (one-off, passam cru). AGENDA_EVENTS_PER_
  ROTATION_LIMIT continua contando EVENTOS, não datas (modelo "um card").

View (components/output/layer-renderer.tsx):
- AgendaLayer card: quando extraDates.length > 0, trocar a linha única weekdayAndTime por uma
  LISTA de linhas "DD MMM • weekday HH:MM–HH:MM" (primária + extras, ordenadas por data). O
  dateBadge grande mostra a próxima data ainda futura entre todas. Sem extras: layout atual
  inalterado.
- FeaturedAgendaEventSlide: mesma lista de datas.
- "Acontecendo agora" / "Hoje": checar QUALQUER data (primária ou extra) — isEventHappeningNow /
  isSameDay aplicados sobre cada uma.
- AgendaTickerInline: mostrar a próxima data futura entre todas.
- Reaproveitar formatEventDay / formatEndTimeSuffix por data.

Admin (components/admin/agenda-section.tsx): componente cliente repetível "Outras datas" no form
de criar e editar evento — linhas { datetime-local início, datetime-local fim (opcional), remover }
+ "adicionar data", serializado num <input type="hidden" name="extraDates" value={JSON}> (mesmo
padrão de setAgendaOutputs). Escondido quando "toda semana" está marcado. Editar prefill de
event.extraDates. Sem dev jargon (memory feedback_admin_ux_no_dev_jargon).

actions.ts: createAgendaEventAction / updateAgendaEventAction parseiam extraDates do FormData
(JSON.parse -> [{ startAt: new Date, endAt: Date|null }]).

Testes: validation de data extra (create + update); get-output-state — evento com primária no
passado mas uma data extra futura AINDA aparece, e some quando todas passaram; update substitui as
datas. Estender fixtures que constroem BroadcastAgendaEventRecord com extraDates: [].

Restrições: fluxo handler->service->store + OperationResult; plugin não toca core; cor da view em
style inline; sem breakpoints no canvas.

Definition of Done:
- lint / typecheck / test passam; migration 0003 gerada E aplicada (db:migrate:broadcast).
- Criar um evento com data primária dia 10 e uma data extra dia 15 -> o card na TV mostra as duas
  datas com seus horários; continua aparecendo entre 10 e 15; some depois do dia 15.
- Marcar "toda semana" esconde a seção de datas extras.
- QA visual do card (720p/1080p/4K) com 2 e 3 datas — a lista cabe e fica legível.
```

---

### Fase 13 — Diagnóstico do Broadcast (sub-rota própria: TV + servidor)

Motivação real: um vídeo travou na tela e alguém teve que ir presencialmente ao PC verificar. E
não se sabe se o "engasgo" é da TV ou do **servidor local** ao servir o stream. Precisa de um
lugar no admin que mostre, à distância e em tempo quase real, a saúde do vídeo por saída, o
estado do PC de cada TV, **e o estado do próprio servidor**.

Decisões já tomadas com o usuário:
- **Sub-rota dedicada** `/admin/broadcast/diagnostico` (não um painel dentro da aba "Telas").
- **Três fontes:** `browser` (a página da TV), `agent` (PowerShell no PC da TV) e **`server`** (o
  processo Next.js do servidor local, auto-amostrado em processo — sem agente externo).
- **GPU Intel integrada** no PC da TV (uso % via contadores do Windows; sem temp/VRAM garantidos).
- **Agente PowerShell puro** (um `.ps1` + `config.json`, POST de JSON, Tarefa Agendada no logon —
  sem instalar Node em cada PC).
- **Histórico = estado agora + log de incidentes** (sem série temporal pra sparklines no MVP).

- **Parte A — Telemetria do navegador (a própria página da TV).** Saúde do vídeo + perf da página.
- **Parte B — Agente local PowerShell.** CPU/RAM/GPU/uptime/rede do PC da TV (o *porquê* do lado TV).
- **Parte C — Telemetria do servidor.** O processo Next.js se auto-amostra: event-loop lag, GC,
  RSS, e **saúde da rota de stream** (streams simultâneos, throughput, leitura lenta de disco,
  TTFB, aborts) — pra responder "o engasgo é do servidor?".

```
Contexto: plugin broadcast, já em produção, servidor SEMPRE local (processo único), PCs de TV são
Windows com GPU Intel integrada. Um vídeo travou numa TV e alguém teve que ir ao PC — e não se
sabe se o engasgo é da TV ou do servidor ao servir o stream. Quero uma SUB-ROTA
/admin/broadcast/diagnostico (não um painel na aba Telas) que mostre: por saída, saúde do vídeo
(travou / recuperou / pulou, dropped frames, estado do SSE) + CPU/RAM/GPU/uptime/rede do PC da TV
(quando há agente); e um bloco do SERVIDOR (event-loop lag, GC, RSS, saúde da rota de stream). Em
quase tempo real, + log de incidentes. Sem série temporal no MVP: "estado agora" + linha do tempo.

== Schema (src/plugins/broadcast/database/schema/index.ts) ==
Migration incremental (sobre o baseline). Aplicar no banco (db:generate:broadcast + db:migrate:broadcast).

- broadcast_output_diagnostics — último snapshot por (outputId, source). PK composta.
  outputId text not null references broadcastOutputs.id onDelete cascade
  source text not null check in ('browser','agent','server')
  reportedAt timestamptz not null   (setado no SERVIDOR na ingestão / na auto-amostragem)
  payload jsonb not null default {}  (blob livre — cada fonte modela o seu; o dashboard lê chaves
                                      conhecidas com fallback, sem migration a cada campo novo)
  primaryKey(outputId, source)
  Obs: a fonte 'server' é GLOBAL (não por saída). Guardar sob uma linha sentinela — ou uma tabela
  irmã broadcast_server_diagnostics (single-row). Escolher na implementação; o mais simples é a
  tabela irmã (sem outputId).

- broadcast_output_diag_events — log append-only de incidentes.
  id text pk ($defaultFn randomUUID)
  outputId text not null references broadcastOutputs.id onDelete cascade
  source text not null check in ('browser','agent','server')
  kind text not null   (video_stalled | video_recovered | video_skipped | video_error | sse_lost |
                         sse_restored | offline_on | offline_off | pc_unreachable | pc_back |
                         cpu_spike | ram_spike | gpu_spike | agent_started |
                         server_lag_spike | server_gc_spike | server_streams_high | server_disk_low)
  detail jsonb         (nullable — itemId, valores medidos, duração, etc.)
  at timestamptz not null default now()
  index (outputId, at desc)
  Prune: no handler de ingestão, apagar eventos desta saída com at < now() - interval '14 days'.

contracts/types.ts: BroadcastOutputDiagnostics { source; reportedAt: string; payload: Record<string,unknown> }
e BroadcastOutputDiagEvent { id; source; kind; detail: Record<string,unknown> | null; at: string }.

== Endpoint de ingestão (route-table.ts + routes/api/) ==
POST /api/broadcast/diagnostics/:token?source=browser|agent  (sem sessão — mesmo modelo das rotas
/state e /events). export const dynamic = "force-dynamic". A fonte 'server' NÃO usa endpoint —
é amostrada em processo (ver Parte C).
- source=browser: auth = o próprio token da saída (+ checagem de PIN idêntica a routes/api/output-
  state, pra paridade). Body = telemetria do navegador (ver Parte A).
- source=agent: auth = chave compartilhada. Nova setting broadcast.diagnosticsAgentKey (gerada,
  mostrada / rotacionável no admin — shared/settings.ts + SettingsSection). O .ps1 manda no header
  x-broadcast-agent-key + o token na URL. Chave errada -> 401.
- Handler (feature features/diagnostics/ingest-output-diagnostics/ — handler->service->store):
  resolve outputId pelo token; valida a forma de leve; lê o snapshot anterior daquela source;
  DERIVA incidentes comparando anterior vs novo (video ficou stalled; skipsForced incrementou;
  sseState open->closed; offline mudou; CPU/RAM > 90% em duas amostras seguidas; GPU > 95%);
  upsert do snapshot (reportedAt = now no servidor); insere os eventos derivados; prune 14d;
  publishOutputEvent(token, { type: "diagnostics-changed" }) (contracts BroadcastOutputEvent +=
  essa variante — a TV ignora, é só simetria/futuro). OperationResult.
- Thresholds como constantes tunáveis em shared/diagnostics-thresholds.ts.

== Leitura pro dashboard ==
features/diagnostics/list-broadcast-diagnostics/ (handler com authorizeActor "broadcast.manage" OU
authorizeOutputActor por saída — mesmo padrão de list-connected-output-ips): devolve
{ server: snapshot | null, outputs: [ { outputId, name, browser?, agent?, events: últimos ~20 } ]
filtrado pelo que o ator pode ver }. Uma action "use server" getBroadcastDiagnosticsAction()
chamada por um useEffect com polling ~5-8s na página da sub-rota (mesmo padrão de
getConnectedOutputIpsAction).
"PC sem reportar": o client compara reportedAt com agora; > ~90s => estado vermelho. O loader
insere UMA vez um evento pc_unreachable quando vê a saída ficar stale (e pc_back quando volta) —
sem sweep dedicado no MVP.

== Parte A — Telemetria do navegador ==
Novo hook client useOutputDiagnosticsReporter(token) montado em components/output/output-canvas.tsx.
A cada ~10s faz POST /api/broadcast/diagnostics/:token?source=browser com:
- page: performance.memory (usedJSHeapSize / jsHeapSizeLimit — só Chrome, null se ausente),
  navigator.deviceMemory, navigator.hardwareConcurrency, uptime da página (now - mountTs),
  document.visibilityState.
- fps: média amostrada por rAF na janela + pior frame (fps mínimo).
- longTasks: contagem + soma de ms de um PerformanceObserver('longtask') desde o último report (jank / picos).
- network: navigator.connection (effectiveType, downlink, rtt) se existir.
- connection: idade da última sincronização de estado OK (expor lastSyncAtRef do OutputCanvas),
  estado do EventSource (open / closed), state.offline.
- video: do VideoSlide (layer-renderer.tsx) — itemId atual, readyState, networkState, paused,
  currentTime, getVideoPlaybackQuality() -> droppedVideoFrames / totalVideoFrames, e contadores
  desde o último report: stalls detectados, play()-nudges, load()-resets, skipsForced, errors.
- Em CADA evento discreto do watchdog (stall / recover / skip / error) faz um POST IMEDIATO (não
  espera o tick de 10s) — é o que faz o incidente aparecer rápido no dashboard.
Fio dos eventos do VideoSlide até o reporter: um mini event-emitter client (módulo em
components/output/ ou shared/, no espírito do runtime/output-bus mas client-only) — VideoSlide
publica, o hook assina. Evita prop-drilling por 5 componentes.

== Parte B — Agente local (scripts/broadcast-diag-agent.ps1) ==
Auto-contido. Lê broadcast-diag-agent.config.json ao lado:
  { "serverUrl": "http://IP-DO-SERVIDOR:PORTA", "outputToken": "tv-da-recepcao",
    "agentKey": "...", "intervalSeconds": 10 }
Loop (ou -Once pra Tarefa Agendada por execução):
- CPU: Get-Counter '\Processor(_Total)\% Processor Time' (ou Win32_Processor.LoadPercentage, mais rápido).
- RAM: Get-CimInstance Win32_OperatingSystem -> FreePhysicalMemory / TotalVisibleMemorySize -> usado % e MB.
- GPU (Intel): Get-Counter '\GPU Engine(*)\Utilization Percentage' -> soma, cap 100; VRAM-ish via
  '\GPU Adapter Memory(*)\Dedicated Usage' + 'Shared Usage'. Tudo em try/catch -> null se indisponível.
- Uptime: (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime.
- Rede: Get-Counter '\Network Interface(*)\Bytes Total/sec' (soma, exclui loopback) + ping RTT ao host do serverUrl.
- Browser: Get-Process chrome,msedge,firefox -ErrorAction SilentlyContinue -> soma de CPU / WorkingSet
  (quanto o browser da TV consome). Nice-to-have.
- POST JSON pro <serverUrl>/api/broadcast/diagnostics/<outputToken>?source=agent com header
  x-broadcast-agent-key: <agentKey>. Timeout curto, 1 retry, log num .log local.
- Flag -Install: Register-ScheduledTask rodando no logon (sobrevive reboot). Flag -Uninstall.
Doc curta (README no topo do .ps1 + item em docs/): copiar pro PC da TV, preencher o config, rodar -Install.

== Parte C — Telemetria do servidor (auto-amostrada em processo) ==
O processo Next.js do servidor local se mede sozinho — sem agente, sem endpoint. Um sampler
singleton (runtime/, no espírito do output-bus, guardado em globalThis pra sobreviver às camadas
de bundle) roda a cada ~10s e faz upsert do snapshot 'server' (via um service interno, não uma
rota). Coleta:
- Processo: process.cpuUsage() (delta % entre amostras), process.memoryUsage() (rss, heapUsed,
  external), process.uptime(), versão do node.
- Event-loop lag: perf_hooks.monitorEventLoopDelay() (mean / p50 / p99 / max desde a última
  amostra) — é o sinal nº 1 de "o servidor está engasgando" (uma leitura de disco síncrona, GC,
  um handler pesado bloqueiam o loop e a rota de stream para de empurrar bytes).
- GC: PerformanceObserver('gc') — contagem + soma de ms de pausa desde a última amostra.
- Saúde da rota de stream (o ponto-chave pra "o engasgo é do servidor?"): a rota
  /api/broadcast/stream/[itemId] passa a registrar num contador em memória (runtime/, mesmo
  globalThis): nº de streams simultâneos (inc no start, dec no close/abort), bytes/s agregados,
  TTFB por request (createReadStream até o 1º chunk), duração, e nº de aborts (request.signal) e
  de leituras lentas (gap > ~500ms entre chunks). O snapshot 'server' expõe o resumo da janela.
- Disco: espaço livre da partição de public/broadcast/videos (statfs), e um teste de leitura
  rápido opcional (ler N KB de um arquivo conhecido e medir).
Onde montar o sampler: um módulo importado por um ponto que roda no boot do server — o
route-registry do plugin, ou instrumentation.ts do Next se preferir manter fora do plugin (é
core; decidir na implementação). Sem timers em ambiente de teste (guard por NODE_ENV / flag).

== Sub-rota /admin/broadcast/diagnostico ==
route-table.ts do plugin: admin += { pattern: "diagnostico", Component: asPluginPage(DiagnosticoPage) }.
Nav: entrada nova no manifest.navigation (label "Diagnóstico", mesma required permission do
"Broadcast Studio", groupKey "plugins") — OU um link/aba dentro da página que aponta pra
/admin/broadcast/diagnostico. Gate pelo mesmo get-broadcast-page-data.
routes/admin-diagnostico/page.tsx (server component): gate + primeira leitura via
list-broadcast-diagnostics; renderiza um client component que faz o polling.

Layout da página:
- Bloco SERVIDOR no topo: cabeçalho verde/amarelo/vermelho (event-loop p99 sob threshold? RSS?
  streams simultâneos sob teto? disco livre?), + números: CPU % do processo, RSS, uptime,
  event-loop lag (p50/p99/max), GC ms/min, streams ativos, throughput MB/s, TTFB médio, aborts,
  leituras lentas, disco livre GB. Um alerta grande e explícito quando o event-loop lag ou os
  streams simultâneos estouram — é a resposta a "o engasgo é do servidor".
- Uma linha/card por SAÍDA: cabeçalho de saúde (reportou < 90s? vídeo saudável? CPU/RAM/GPU da TV
  sob threshold?) + números do navegador (FPS, dropped-frame ratio, readyState, estado do SSE,
  "última sync há Xs") + números do agente quando houver (CPU/RAM/GPU/uptime/rede/ping). "PC não
  reporta há Xmin" e "vídeo travou e não recuperou" em vermelho grande.
- Incidentes: timeline global (todas as fontes) dos últimos ~20-50 eventos, hora + tipo + detalhe
  legível ("Vídeo travou 14:03 no item 'Institucional.mp4' — recuperou em 6s"; "event-loop lag
  p99 480ms 14:05"; "PC 'TV Recepção' sem reportar 14:20–14:31").
- SettingsSection (aba Configurações, não aqui): mostrar/rotacionar broadcast.diagnosticsAgentKey
  + bloco copiável do config.json por saída (serverUrl inferido do request, token, key).

Restrições: fluxo handler->service->store + OperationResult; app/ não conhece nome de plugin (a
sub-rota vai na route-table, não em app/); cor em token shadcn no admin; sem dev jargon.

Definition of Done:
- lint / typecheck / test passam; migration nova gerada E aplicada.
- /admin/broadcast/diagnostico existe, gateada, com bloco SERVIDOR + uma linha por saída +
  timeline de incidentes; polling ~5-8s.
- Parte A: abrir a view numa TV -> em <15s a sub-rota mostra a saída "reportando", FPS, dropped
  frames, estado do SSE. Forçar um travamento (throttle / DevTools) -> incidente "vídeo travou"
  em segundos, e "recuperou" / "pulou" quando o watchdog agir.
- Parte B: rodar o .ps1 num PC com a config -> em <15s a saída mostra CPU/RAM/GPU/uptime/rede;
  parar o script -> em ~90s vermelho "PC sem reportar" + evento.
- Parte C: o bloco SERVIDOR mostra event-loop lag, RSS, streams ativos, throughput e disco em
  <15s do boot. Rodar 3-4 streams pesados simultâneos -> streams ativos sobe, e se o event-loop
  lag estourar aparece o alerta "possível engasgo do servidor" + incidente.
- Chave de agente errada -> 401; token de saída inválido -> 404.
- Teste unitário: derivação de incidentes (anterior saudável -> novo com stall = video_stalled;
  CPU 95% em duas amostras = cpu_spike; event-loop p99 acima do threshold = server_lag_spike).
```
