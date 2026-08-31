# Formato do pacote de curso da Academy (`manifest.json`)

Como escrever um curso **fora da plataforma** (ex: no Claude) e importar por
`/admin/academy` → **"Importar curso"**.

Fonte da verdade do schema: `src/plugins/academy/shared/course-bundle-manifest.ts`
(validação zod, `academyCourseBundleManifestSchema`). Este documento é o guia prático.

---

## O arquivo

Um `.zip` com **`manifest.json` na raiz** (+ pasta `assets/` só se houver mídia).
Curso sem mídia = um único `manifest.json` zipado.

- Rota de import: `POST /api/academy/courses/import` (campo `file`, multipart) — ou o botão
  **"Importar curso"** em `/admin/academy`.
- Permissão: `academy.courses.manage` **e** `media.manage`.
- **Dedupe por `slug`, create-only.** Se já existe um curso com o mesmo `slug` no destino, o
  import inteiro é **pulado** — nada é mesclado nem sobrescrito. Para reimportar uma versão
  editada: apague o curso antes, ou troque o `slug`.
- Import é **best-effort por aula**: uma aula com erro não trava as outras; o relatório mostra
  linha a linha (`created` / `reused` / `skipped` / `failed`).

## Estrutura

```jsonc
{
  "format": "venore-academy-course",
  "formatVersion": 1,
  "exportedAt": "2026-08-31T00:00:00.000Z",   // ISO; qualquer data serve num pacote feito à mão
  "course": {
    "title": "Nome do curso",
    "description": "Uma linha ou null",
    "slug": "slug-unico-kebab-case",
    "status": "draft" | "restricted" | "public",
    "publiclyListed": true,
    "coverMediaRef": null,                     // checksum de um asset em mediaAssets, ou null
    "lessons": [ /* ver abaixo */ ]
  },
  "mediaAssets": []                            // vazio quando o curso não tem mídia
}
```

### Aula (`lessons[]`)

```jsonc
{
  "title": "Aula 1 — Título",
  "videoUrl": null,                            // ou "https://..." (vídeo da aula inteira)
  "coverMediaRef": null,
  "status": "draft" | "restricted" | "public",
  "sections":     [ /* ExportedLessonSection */ ],
  "materials":    [ /* { "label": "...", "mediaRef": "<checksum>" } */ ],
  "examples":     [ /* ExportedLessonExample */ ],
  "activities":   [ /* { "title": "...", "instructionsText": "...", "deliverableFormat": "text"|"audio"|"image"|"pdf"|"none" } */ ],
  "quizQuestions":[ /* ExportedQuizQuestion */ ],
  "requirements": { /* ExportedLessonRequirements */ } | null
}
```

`requirements` (o gate pra concluir a aula) — **precisa estar presente** (objeto ou `null`):

```jsonc
{
  "readTextEnabled": true,
  "watchVideoEnabled": false,
  "quizEnabled": true,
  "quizPassThresholdPercent": 70,             // ou null
  "quizMaxAttempts": 3,                        // ou null
  "activityEnabled": true
}
```

### Seção de texto (`sections[]`)

```jsonc
{ "title": "Título da seção", "textData": { "blocks": [ /* composição */ ] }, "videoUrl": null }
```

- `textData` é a **composição do page-builder** (o mesmo formato que a entry do CMS guarda).
  Um bloco de texto NÃO pode ficar na raiz — precisa de um `core.layout.section` em volta:

```jsonc
"textData": {
  "blocks": [
    {
      "id": "sec-1",                          // qualquer string única dentro do pacote
      "key": "core.layout.section",
      "slot": "",
      "data": { "background": "none", "maxWidth": "full", "paddingY": "sm", "paddingX": "sm",
                "title": "", "icon": "", "titleAlign": "start" },
      "areas": [
        { "key": "content", "blocks": [
          { "id": "rt-1", "key": "core.content.richtext", "slot": "", "areas": [],
            "data": { "content": "Markdown **aqui**.\n\n- item\n- item" } },
          { "id": "dg-1", "key": "academy.drum-grid", "slot": "", "areas": [],
            "data": { "style": "groove-funk", "bpm": 80, "bars": 2, "caption": "..." } }
        ] }
      ]
    }
  ]
}
```

- `core.content.richtext` → `data.content` aceita **string markdown** (é renderizada como markdown).
- Blocos de plugin que dá pra escrever à mão numa seção:
  - `academy.progression` → `data: { chords: "A D E7:2 A:2", key: "A", bpm: 80, beatsPerChord: 4, caption: "" }`
  - `academy.drum-grid` → `data: { style: "backbeat"|"marcha"|"meio-tempo"|"levada-cheia"|"groove-funk"|"estrofe-corinho"|"virada-fim-de-frase", bpm: 80, bars: 2, caption: "" }`
  - `academy.ear-trainer` → `data: { mode: "interval"|"chord", set: "2M,3m,3M,4J,5J,6M", roots: "A,D,E", direction: "asc"|"desc"|"harmonic", rounds: 10, caption: "" }`
- `academy.notation.sheet` **não** é prático à mão (o `data` guarda os tokens já parseados da ABC,
  não a string). Para partitura tocável dentro de uma seção, prefira um **exemplo** (abaixo).
- Seção só de vídeo: `{ "title": "...", "textData": null, "videoUrl": "https://..." }`.

### Exemplo de aula (`examples[]`) — partitura tocável

```jsonc
{
  "title": "Frase 1 — 80 BPM",
  "audioMediaRef": null,                       // checksum de um áudio, ou null
  "sheetMediaRef": null,                       // checksum de uma imagem de partitura, ou null
  "notationData": "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\nz4 A,2 B,2 | CCC C2 B,A,E- |\nw: Je-sus Cris-to mu-dou meu vi-ver",
  "captionText": "Legenda do exemplo."
}
```

`notationData` é uma **string ABC** (https://abcnotation.com) — inclui `w:` pra letra,
`V:1`/`V:2` pra vozes, `Q:1/4=80` pro andamento. É o jeito recomendado de pôr partitura tocável.

### Pergunta de quiz (`quizQuestions[]`)

Comum (texto):

```jsonc
{ "text": "Pergunta?", "options": ["A", "B", "C"], "correctOptionIndex": 1 }
```

Tipo **áudio** (treino de ouvido) — `questionKind: "audio"` + notação no enunciado e/ou nas opções
(pelo menos um dos dois):

```jsonc
{
  "text": "Ouça o intervalo e escolha:",
  "options": ["Terça maior", "Quinta justa"],
  "correctOptionIndex": 0,
  "questionKind": "audio",
  "promptNotation": "X:1\nL:1/4\nK:C\nC E |",         // ABC do "ouça isto" (ou null)
  "optionNotations": null                              // ou ["X:1\nK:C\nC E|", "X:1\nK:C\nC G|"] — 1:1 com options
}
```

`questionKind`, `promptNotation` e `optionNotations` são **opcionais** — um pacote sem eles
importa como pergunta de texto normal.

---

## Exemplo mínimo completo

```json
{
  "format": "venore-academy-course",
  "formatVersion": 1,
  "exportedAt": "2026-08-31T00:00:00.000Z",
  "course": {
    "title": "Curso de teste",
    "description": "Um curso pequeno para validar o import.",
    "slug": "curso-de-teste-import",
    "status": "draft",
    "publiclyListed": false,
    "coverMediaRef": null,
    "lessons": [
      {
        "title": "Aula 1 — Primeira",
        "videoUrl": null,
        "coverMediaRef": null,
        "status": "restricted",
        "sections": [
          {
            "title": "Introdução",
            "videoUrl": null,
            "textData": {
              "blocks": [
                {
                  "id": "s1",
                  "key": "core.layout.section",
                  "slot": "",
                  "data": { "background": "none", "maxWidth": "full", "paddingY": "sm", "paddingX": "sm", "title": "", "icon": "", "titleAlign": "start" },
                  "areas": [
                    { "key": "content", "blocks": [
                      { "id": "rt1", "key": "core.content.richtext", "slot": "", "areas": [], "data": { "content": "Bem-vindo. Este é um **parágrafo** de teste." } }
                    ] }
                  ]
                }
              ]
            }
          }
        ],
        "materials": [],
        "examples": [
          { "title": "Escala de Dó", "audioMediaRef": null, "sheetMediaRef": null, "notationData": "X:1\nL:1/4\nK:C\nC D E F | G A B c |", "captionText": "A escala maior de Dó." }
        ],
        "activities": [
          { "title": "Cantar a escala", "instructionsText": "Cante a escala de Dó junto do exemplo e grave.", "deliverableFormat": "audio" }
        ],
        "quizQuestions": [
          { "text": "Quantas notas tem a escala maior?", "options": ["5", "7", "12"], "correctOptionIndex": 1 },
          { "text": "Ouça e diga: sobe ou desce?", "options": ["Sobe", "Desce"], "correctOptionIndex": 0, "questionKind": "audio", "promptNotation": "X:1\nL:1/4\nK:C\nC E G c |" }
        ],
        "requirements": {
          "readTextEnabled": true,
          "watchVideoEnabled": false,
          "quizEnabled": true,
          "quizPassThresholdPercent": 70,
          "quizMaxAttempts": 3,
          "activityEnabled": true
        }
      }
    ]
  },
  "mediaAssets": []
}
```

Salve como `manifest.json`, zipe (o `manifest.json` tem que ficar na raiz do zip, não dentro de
uma pasta) e importe em `/admin/academy`.
