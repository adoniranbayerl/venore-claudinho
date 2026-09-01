# Academy — recursos musicais e didáticos: backlog e ordem de implementação

Documento de trabalho aberto numa sessão de avaliação do plugin `academy` (`src/plugins/academy/`).
O plugin **é e continuará sendo** parte do Venore — consome `contexts/*`, `platform/*`, temas e o
page builder; não há intenção de torná-lo standalone.

Contexto: o dono já autora cursos e apontou que a **dor está nos recursos musicais** — em especial
a escrita de partitura, hoje "truncada, pouco fluida". Este backlog nasce disso, mais dois cursos
reais que dependem de parte dele:

- `docs/curso-teoria-musical.md` — "Teoria Musical na Prática" (ainda via seed).
- `docs/cursos/jesus-cristo-mudou-meu-viver.md` — análise de uma música em Lá maior (entra por
  pacote de importação: `scripts/build-course-bundle.ts` → `/admin/academy` "Importar curso").

Toda feature aqui segue o *Definition of Done* do `AGENTS.md` §6 (fluxo de camadas, `OperationResult<T>`,
lint de cor + boundary, typecheck, teste unitário de `service`, migration rastreada quando toca
schema) e a regra "plugin não toca o core" (`feedback_plugin_never_touches_core`).

---

## 1. Estado atual (o que já existe)

| Área | Onde | O que faz |
| --- | --- | --- |
| Editor de partitura | `components/notation-editor.tsx` (442 ln) | Entrada nota-a-nota por teclado de piano visual; ABC no header fixo `L:1/8`; tom/compasso/andamento; staccato, acento, fermata, ligadura, crescendo, slur; cifra por nota (texto livre); nomes de nota em pt |
| Serialização ABC | `components/notation-abc.ts` (227 ln) | `NotationToken` (monofônico: `note` \| `rest` \| `bar`) → ABC; `compositionToAbcWithRanges` devolve o range de caractere de cada token (base pra clique↔token) |
| Notação interativa (aluno) | `components/notation-sheet-block-client.tsx`, bloco `academy.notation-sheet` | Renderiza ABC, clica na nota → ouve |
| Cantar junto | `components/sing-along-practice.tsx` (379 ln) | "Ouvir modelo" → "Cantar"; capta microfone (`usePitchListener`), compara **classe de nota** + **tempo de ataque** (tol. 250 ms) contra a sequência esperada; metrônomo; veredito por nota (certa / fora do tempo / nota errada / não cantada) |
| Exemplos da aula | `lessonExamples` (schema) | Áudio+partitura (par de mídia) **ou** `notationData` ABC; `captionText` obrigatório (acessibilidade) |
| Quiz | `lessonQuestions` (schema) | Múltipla escolha **só texto** (`options: string[]`, `correctOptionIndex`) |

Limites estruturais de hoje: notação **monofônica** (sem `[CEG]` nem `V:`), **sem letra** (`w:`),
quiz **sem áudio**, cifra é **rótulo, não som**, entrada **só por clique**.

---

## 2. Fluidez da escrita de partitura (#1 — prioridade)

Objetivo: reduzir o número de cliques por nota e abrir um caminho de texto pra quem prefere.

| Sub-item | Descrição | Esforço |
| --- | --- | --- |
| ~~**Entrada por teclado do computador**~~ **(feito)** | `a`–`g` = altura na oitava mais próxima da última nota; `1`–`5` = figura (semibreve→semicolcheia); `#` / `-` / `=` = acidente da próxima nota; `r` = pausa; espaço ou `\|` = barra; `Backspace` = desfaz; `↑`/`↓` = transpõe a nota selecionada (ou a última) meio-tom; `←`/`→` = anda a seleção. `components/notation-keyboard.ts` (puro, testado) + `handleKeyDown` no `NotationEditor`. Ponto de aumento fica pra quando existir o token correspondente | M |
| ~~**Painel ABC lado a lado + colar ABC**~~ **(feito)** | `components/notation-abc-parse.ts` — `parseAbcToComposition(abc)` usa `abcjs.parseOnly` (sem DOM) e mapeia pra tokens; round-trip exato do que o editor gera (`notation-abc-parse.test.ts`, 11 casos), best-effort pro resto (acorde → nota grave, tom/compasso fora do catálogo → padrão + aviso). No `NotationEditor`: `<details>` "Editar como texto (ABC)" com `<textarea>` + Aplicar/Descartar. Efeito colateral: `tokenToAbc` passou a emitir `.` no lugar de `!staccato!` (parseOnly do abcjs 6.6.4 ignora `!staccato!`) | M–G |
| **Entrada por teclado MIDI** | Web MIDI API, modo passo: tocar a nota grava com a duração corrente | M |
| **Barra de compasso automática** | Inserir `|` contando tempos contra `M:` (já existe `BEAT_LENGTH_IN_EIGHTHS`); toggle liga/desliga | P |
| **Seleção de trecho + lote** | Selecionar N notas → transpor / mudar duração / slur / apagar | M |
| **Duplicar compasso, repetir última nota** | Atalhos | P |
| **Modelos** | "4 compassos vazios em X/4", "blues 12 compassos em Lá", geradores de escala/arpejo | P |

Sem mudança de schema (o editor só produz `notationData` string). Testes: unit no novo
parser ABC→tokens (ida e volta com `compositionToAbc`).

---

## 3. Questão tipo áudio + treinador de intervalos (#2 — prioridade)

O quiz atual não ensina ouvido. Mudança central: a **pergunta** e cada **alternativa** podem ter
notação ABC tocável, não só texto.

### Schema (`academy.quiz_questions`) — **feito** (migration `0018_warm_bishop.sql`)
- `question_kind text not null default 'text'` — `'text' | 'audio'`.
- `prompt_notation text` (nulável) — ABC do enunciado (o "ouça isto").
- `option_notations jsonb` (nulável) — array **paralelo a `options`** (`(string | null)[]`): entrada
  i = ABC tocável da opção i, ou null. **Decisão:** `options` continua `string[]` (só rótulos) —
  zero migração de dado; linhas existentes ganham `question_kind='text'` e os dois campos novos
  nulos. A consistência ("audio" exige `prompt_notation` OU ao menos uma `option_notations` não
  nula; comprimentos casam) é validada no handler/service via `shared/quiz-audio.ts` (puro,
  testado), não por `check()`.

### Camadas — **feito**
- `contracts/types.ts`: `QuizQuestionKind`, `QuizQuestionRecord.{optionNotations,questionKind,promptNotation}`.
  `StudentQuizQuestionRecord` mantém os campos de notação (o aluno precisa deles pra tocar), só
  omite `correctOptionIndex`.
- `add-quiz-question` / `update-quiz-question`: `types`/`handler`/`service`/`store` aceitam os
  campos novos; `validateQuizAudioShape` roda no handler (add) e no service sobre o estado final
  mesclado (update). Testes: `shared/quiz-audio.test.ts`, `add-quiz-question/handler.test.ts` novo,
  `update-quiz-question/service.test.ts` estendido.
- `list-quiz-questions-for-student/service.ts`: passa `optionNotations`/`promptNotation`/`questionKind`
  no DTO do aluno; `list-quiz-questions-by-lesson` e `submit-quiz-attempt` não mudaram (usam
  `select()` + cast; índice da opção continua sendo a resposta).
- `components/notation-play-button.tsx` (novo): botão "Ouvir" que renderiza o ABC num container
  `sr-only` e toca via `synth.CreateSynth` — não mostra a partitura (numa questão de ouvido, ver
  entregaria a resposta).
- Aluno: `quiz-form.tsx` e `preview-quiz-form.tsx` mostram "Ouvir a pergunta" (`promptNotation`) e
  um "Ouvir" por opção com `optionNotations[i]`.
- Professor: `add-quiz-question-form.tsx` — seletor Texto/Ouvido; no modo Ouvido, um `NotationEditor`
  visual pro enunciado (sem ABC cru — `feedback_admin_ux_no_dev_jargon`).

### Pendências do #2
- **Áudio por opção na UI do professor** — back-end e render do aluno já suportam `optionNotations`;
  falta o editor por alternativa em `add-quiz-question-form.tsx` (risco de UI em lista sem
  verificação visual — deixado pra uma passada com browser).
- **Edição de pergunta existente** no admin (nunca existiu; `updateQuizQuestion` handler já pronto).
- **Verificação visual** (nenhuma tela foi aberta em browser).

### Treinador de intervalos (bloco reutilizável) — **feito**
- Bloco de page builder `academy.ear-trainer` (`blocks/ear-trainer{,.-abc,-block,-client}.ts[x]`),
  config: `mode` (`interval` | `chord`), `roots` (lista de tônicas), `set` (quais intervalos/qualidades,
  vírgula), `direction` (`asc` | `desc` | `harmonic`), `rounds` (nº de questões), `caption`.
- `ear-trainer-abc.ts` é puro e testado (`INTERVAL_SEMITONES`/`INTERVAL_LABEL`/`CHORD_INTERVALS` +
  `earQuestionToAbc(...)` que devolve o ABC tocável e **nunca** o rótulo da resposta).
- Client-only: gera a questão, toca via `synth.CreateSynth`, corrige na hora, mostra placar.
  **Não persiste** (é prática) — a avaliação "de verdade" continua sendo o quiz da aula.
- Registrado em `blocks/{definitions,renderers}.ts` + `manifest.ts`. Falta: adicionar o bloco no seed
  das Aulas 8–9 do curso de teoria + verificação visual em browser.

---

## 4. Acorde tocável + progressão + toggles de reprodução (#3) — **feito (o essencial)**

Pedido: ouvir acorde e progressão; **e** poder ouvir **só a melodia**.

- **Player de progressão — bloco `academy.progression`** (novo). `blocks/progression-abc.ts` (puro,
  testado): `parseChordSymbol` entende `A / F#m / E7 / Cmaj7 / D/F# / Asus4 / m7b5 / …`;
  `parseProgression("A D E7:2 A:2", padrão)` → lista `{symbol, beats}`; `progressionToAbc` gera um
  ABC tocável (voicing fechado: baixo na 8ª 3, tríade/7ª na 4ª; barra a cada 4 tempos; cifra
  inválida vira pausa mantendo o tempo). Campos genéricos (text/select/number) — sem field panel
  custom. Renderer mostra as cifras + `NotationPlayButton` "Ouvir a progressão". Registrado em
  `definitions`/`renderers`/`manifest`.
- **"Ouvir só a melodia"** sai do #7: o bloco `academy.notation.sheet` multi-voz ganhou uma linha
  de botões de reprodução — `Tudo` / `Melodia` / um por voz — cada um toca o ABC filtrado daquela
  parte (`NotationPlayButton`). Sheet de uma voz só continua com um botão `Ouvir`.
- **Deferido (mais arriscado, precisa de browser):** token de acorde empilhado numa única voz
  (`[CEG]` como um `NotationToken` de verdade no editor) — hoje o parser ABC aceita `[CEG]` de
  entrada reduzindo à nota mais grave, e a harmonia é coberta pelo bloco de progressão + cifra
  sobre a melodia + voz de acompanhamento. Slider de andamento / contagem de entrada / loop também
  ficaram de fora.

---

## 5. Letra na partitura (#6) — **feito**

- `NotationComposition.lyrics?: string[]` — uma entrada por verso; `compositionToAbcWithRanges`
  emite uma linha `w: <verso>` por verso depois da linha de notas (versos em branco descartados).
- `parseAbcToComposition` recupera as linhas `w:` verbatim (round-trip exato — teste em
  `notation-abc-parse.test.ts`).
- `NotationEditor`: `<textarea>` "Letra (um verso por linha)" + dica (`-` separa sílabas, `_`
  prolonga). Todo `commit*` do editor passou a espalhar uma `composition` base pra não descartar a
  letra ao mexer em tom/compasso/etc.
- Bloco `academy.notation.sheet`: `readLyrics` no renderer e no field panel — a letra persiste em
  `block.data.lyrics` e aparece na partitura do aluno. `SingAlongPractice` recebe o ABC com `w:` e
  renderiza a letra; a comparação de pitch não muda.

## 6. Múltiplas vozes (#7) — **feito**

- `NotationComposition.voices?: NotationVoice[]` (`{ name?, tokens }`) = vozes **2..N**; `tokens` de
  raiz é sempre a voz 1. Sem `voices`, a saída ABC é **idêntica à de antes** (nenhum `V:`).
- `compositionToAbcWithRanges` refatorado: `buildVoiceBody` por voz; header ganha `V:1 / V:2 name="…"`;
  linhas `[V:n] …`; `w:` alinha à voz 1; `options.rangesForVoice` diz de qual voz vêm os `noteRanges`
  (o clique-pra-selecionar do editor). `parseAbcToComposition` lê **todas as pautas** que o abcjs
  cria (uma por `V:`), primeira = `tokens`, resto = `voices` (nome vindo de `staff.title`). Round-trip
  exato, inclusive com letra (testes em `notation-abc-parse.test.ts`).
- `NotationEditor`: abas de voz ("Voz 1 (melodia)", nome das extras, "+ voz"), campo de nome +
  "Remover esta voz" pra vozes extras. Tudo (piano, teclado, ABC, transpor…) opera na voz ativa. O
  destaque da nota selecionada no preview é desligado em multi-voz (o `TimingCallbacks` intercala as
  vozes) — clicar pra selecionar continua.
- Bloco `academy.notation.sheet`: renderiza o ABC multi-voz; playback por voz (ver #3). O
  `SingAlongPractice` recebe **só o ABC da voz 1** (`singAlongAbc`) — comparar pitch com uma linha
  só. "Cantar contra a voz N" ficou pra depois.
- Field panel do bloco: `readVoices` + `voices` no `value`; `onChange` grava `voices: []` quando
  zeradas.

## 7. Percussão, slash e marcas de ensaio (para o curso da música)

- **Grade de bateria** — **feito**: bloco `academy.drum-grid`
  (`blocks/drum-grid{,-patterns,-block,-client}.ts[x]`). `drum-grid-patterns.ts` = presets em 4/4,
  16 passos (`backbeat`, `marcha`, `meio-tempo`, `levada-cheia`), linhas chimbal/caixa/bumbo. O
  client mostra a grade e toca N compassos (`bars`) no andamento (`bpm`) via Web Audio sintetizado
  (bumbo = seno com queda de freq.; caixa/chimbal = ruído com filtro passa-alta + envelope curto),
  **fora** do modelo ABC. Config: `style` / `bpm` / `bars` / `caption`. Registrado em
  `blocks/{definitions,renderers}.ts` + `manifest.ts`. Falta: editor de célula (autoria só por
  preset hoje), adicionar no seed das Aulas 3/6/8 da música, verificação visual.
- **Notação rítmica / slash**: `NotationToken` `{ type: "slash"; duration }` → cabeça sem altura;
  pra padrões de levada com cifra em cima.
- **Marcas de ensaio / rótulos de seção**: `{ type: "mark"; label: string }` → `"^Intro"` /
  texto acima da pauta; ou campo `sections: {atToken, label}[]` na composição.
- **Repetições e casas**: `{ type: "repeat"; kind: "start" | "end" | "1" | "2" }`.

## 8. Acessibilidade (#8) — parcial

- **Feito:** teclas do `piano-keyboard.tsx` de `w-8`/`h-20` → `w-11`/`h-28` (44px, alvo mínimo);
  pretas `w-5`/`h-12` → `w-7`/`h-16`; largura da oitava acompanhou (`w-77`). `SingAlongPractice`
  ganhou uma linha fixa (estado `idle`) explicando o pedido de microfone antes de ele acontecer.
- **Falta:** leitura por voz (TTS) nas seções (`speechSynthesis`); preferências de leitura na conta
  (hoje o tamanho de texto vive em `localStorage` por aula em `lesson-step-flow.tsx`) — tamanho,
  entrelinha, fonte p/ dislexia, alto contraste, "teclado grande"; auditoria de navegação por
  teclado no fluxo de etapas + `prefers-reduced-motion`; campo de legenda/transcrição em vídeo.

## 9. Outras áreas (Letramento Digital) — backlog secundário

Glossário com tooltip por seção · verificação rápida no meio da seção (1 pergunta) · cartões/
repetição espaçada · bloco "passo a passo de tarefa" (passos numerados + captura + marcar feito) ·
certificado de conclusão em PDF · aula imprimível em PDF · código de turma pra auto-matrícula em
curso restrito · anotações/grifos do aluno · lembrete de progresso por e-mail (opt-in).

---

## 10. Ordem de implementação

```
#1 Fluidez ✔   #2 Áudio ✔   #6 Letra ✔   #7 Vozes ✔   #3 Progressão/só-melodia ✔   #8 Acess. (parcial)
   ear-trainer ✔   drum-grid ✔   └─→ slash/marcas de ensaio ─→ Seeds dos 2 cursos
```

| Nº | Item | Estado | Destrava no conteúdo |
| --- | --- | --- | --- |
| 1 | Fluidez da partitura | **feito** (teclado do PC + painel/colar ABC); falta MIDI, barra automática, seleção de trecho, modelos | exemplos dos dois cursos |
| 2 | Questão tipo áudio | **feito** (migration 0018 + camadas + UI); falta áudio por opção na UI, edição | Módulo 2 de teoria |
| 2b | Treinador de ouvido (bloco `academy.ear-trainer`) | **feito** (bloco + `earQuestionToAbc` puro/testado); falta pôr no seed das Aulas 8–9 | Aulas 8–9 de teoria |
| 6 | Letra na partitura (`w:`) | **feito** | Aula 4 da música |
| 7 | Múltiplas vozes (`V:`) | **feito** (modelo + serialize/parse + abas no editor + playback por voz); falta "cantar contra a voz N" | Aula 7 da música |
| 3 | Acorde/progressão tocável + só-melodia | **feito o essencial** (bloco `academy.progression` + playback por voz no sheet); token de acorde empilhado deferido | Módulo 3 de teoria; Aula 5 da música |
| — | Grade de bateria (bloco `academy.drum-grid`) | **feito** (presets + Web Audio); falta editor de célula e pôr no seed | Aulas 3, 6, 8 da música |
| — | Slash + marcas de ensaio na notação | não iniciado | Aulas 3, 6, 8 da música |
| 8 | Acessibilidade | **parcial** (teclas do piano, aviso de microfone); falta TTS, prefs de conta, auditoria de teclado | qualidade geral |
| — | Seeds dos dois cursos (`seeds/`) | **feito** (rodam na instalação/reinstalação via `manifest.seeds`) | conteúdo real via `/admin/plugins` |

**Próximo:** slash/marcas de ensaio na notação (Aulas 3/6/8 da música); adicionar os blocos
`academy.ear-trainer` e `academy.drum-grid` aos seeds dos dois cursos; revisar as telas num browser
e ajustar os ABC "modelo" do curso da música contra a gravação/partitura de referência do dono.

## 11. Seeds de curso (`seeds/`)

Os dois cursos entram no fluxo de install/reinstall do plugin, no mesmo padrão do `company-metrics`
(`manifest.seeds` + `seeds/index.ts` + função idempotente). Ao instalar academy com "popular dados
de exemplo" (ou clicar "Popular dados de exemplo" em `/admin/plugins`), `runPluginSeeds` roda os
três seeds em ordem: `example` → `teoria-musical` → `jesus-cristo-mudou-meu-viver`.

- `seeds/shared/course-builder.ts` — `runCourseSeed(config, lessons)` (cria curso rascunho → monta
  aulas → publica como `public`; idempotente: pula se já existe curso **publicado** com o slug — um
  `draft` órfão é resíduo de run que falhou, apagar e rodar de novo) + `seedLesson` (seções via
  `createLessonTextSection` + `updateEntry`, exemplos, quizzes com `questionKind: "audio"` quando
  têm `promptAbc`, atividade, requisitos).
- `seeds/*.lessons.ts` — dados puros (`SeedLesson[]`), separados dos runners pra o teste
  (`seeds/seed-content.test.ts`) importar sem puxar a cadeia de services/next-auth. O teste valida
  todo ABC (parseia), todo quiz (`correctIndex` no range, forma de áudio consistente) e as contagens
  (19 + 8 aulas).
- **Seções de texto:** cada seção é uma entry oculta do CMS + um bloco `core.content.richtext` com
  markdown; algumas seções também trazem um bloco `academy.notation.sheet` (ABC → tokens via
  `parseAbcToComposition`, com letra e vozes) ou `academy.progression`. Isso faz o seed chamar o
  handler `updateEntry` do CMS — o ator que dispara o seed via `/admin/plugins` precisa de
  `cms.entries.manage` (admin/superadmin têm; se faltar, o seed para com erro claro e o curso fica
  em `draft`).
