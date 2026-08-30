import type { SeedLesson } from "./shared/course-builder";

// Conteúdo (dados puros) do seed "teoria-musical" — separado do runner (teoria-musical.ts) pra
// poder ser importado por testes sem arrastar a cadeia de services/next-auth. Fonte completa em
// docs/curso-teoria-musical.md.

export const TEORIA_LESSONS: SeedLesson[] = [
  // ── MÓDULO 1 — O tempo e o ritmo ──────────────────────────────────────────
  {
    title: "Módulo 1 · Aula 1 — Pulso, andamento e BPM",
    sections: [
      {
        title: "Sentir a pulsação",
        markdown:
          "O **pulso** é a batida regular que faz o pé bater sozinho no chão. Ele não muda de tamanho: " +
          "é sempre o mesmo espaço de tempo, do começo ao fim. Toda a teoria do ritmo é sobre encaixar " +
          "sons dentro desse pulso.\n\n" +
          "**Andamento** é a velocidade do pulso, medida em **BPM** (batidas por minuto). 60 BPM é uma " +
          "batida por segundo; 120 é o dobro. Uma balada fica por volta de 60–75; um louvor animado, " +
          "100–130.\n\n" +
          "Dentro do pulso, algumas batidas soam **mais fortes**. Conte \"UM dois UM dois\" numa marcha, " +
          "ou \"UM dois três\" numa valsa: esse acento que se repete organiza o pulso em grupos.",
      },
    ],
    examples: [
      {
        title: "Metrônomo — 90 BPM",
        caption: "Quatro semínimas por compasso a 90 BPM; a primeira de cada grupo é o tempo forte.",
        abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=90\nK:A\nA A A A | A A A A |",
      },
    ],
    quiz: [
      { text: "Se o pulso está em 60 BPM, quanto dura uma batida?", options: ["Meio segundo", "Um segundo", "Dois segundos"], correctIndex: 1 },
      { text: "Numa valsa, o acento forte se repete a cada:", options: ["2 tempos", "3 tempos", "4 tempos"], correctIndex: 1 },
    ],
    activity: {
      title: "Bater o pulso",
      instructions:
        "Ouça três músicas curtas. Para cada uma, bata o pulso com a mão e diga se o andamento está mais " +
        "perto de 60, de 90 ou de 120 BPM. Marque como concluída quando tiver feito as três.",
      format: "none",
    },
  },
  {
    title: "Módulo 1 · Aula 2 — Compasso: 2/4, 3/4, 4/4 e 6/8",
    sections: [
      {
        title: "Como o pulso se agrupa",
        markdown:
          "Quando você conta \"UM dois UM dois\", está sentindo compassos de **2**. \"UM dois três\" é " +
          "compasso de **3** (valsa). \"UM dois três quatro\" é compasso de **4** — o mais comum na " +
          "música popular e nos louvores.\n\n" +
          "A fração no início da partitura tem dois números. O **de cima** diz quantos tempos há no " +
          "compasso. O **de baixo** diz qual figura vale um tempo (4 = semínima). Então `3/4` é \"três " +
          "semínimas por compasso\".\n\n" +
          "Em `6/8` você conta seis colcheias, mas **sente dois pulsos grandes**, cada um dividido em três " +
          "(\"UM-da-da dois-da-da\") — o balanço de muitas canções de embalar e de parte do repertório gospel.",
      },
    ],
    examples: [
      { title: "Valsa em 3/4", caption: "Três semínimas por compasso, acento no primeiro tempo.", abc: "X:1\nM:3/4\nL:1/4\nQ:1/4=120\nK:A\nA A A | A A A |" },
    ],
    quiz: [
      { text: "Em `2/4`, o número de baixo (4) significa:", options: ["Dois compassos", "A semínima vale um tempo", "Dois instrumentos"], correctIndex: 1 },
      { text: "`3/4` e `6/8` têm o mesmo número de colcheias. O que muda?", options: ["O andamento", "Onde cai o acento", "A tonalidade"], correctIndex: 1 },
    ],
    activity: { title: "Classificar por compasso", instructions: "Ouça quatro trechos e classifique cada um como 2, 3, 4 ou 6/8, contando junto até o acento forte voltar.", format: "none" },
  },
  {
    title: "Módulo 1 · Aula 3 — Figuras e valores",
    sections: [
      {
        title: "Da semibreve à semicolcheia",
        markdown:
          "Toda figura é o dobro ou a metade da vizinha. A **semibreve** dura 4 tempos; a **mínima**, 2; " +
          "a **semínima**, 1; a **colcheia**, meio tempo (duas por tempo); a **semicolcheia**, um quarto " +
          "de tempo (quatro por tempo).\n\n" +
          "Cante \"tá\" para semínima, \"tá-á\" para mínima, \"ti-ti\" para duas colcheias, " +
          "\"ti-ri-ti-ri\" para quatro semicolcheias.\n\n" +
          "Um **ponto de aumento** ao lado da figura soma metade do valor dela: semínima pontuada = " +
          "1 tempo e meio. Uma **ligadura de valor** une duas notas da mesma altura numa só, que " +
          "atravessa a barra de compasso.",
      },
    ],
    examples: [
      { title: "Leitura rítmica", caption: "Compasso 1: mínima + duas colcheias. Compasso 2: semínima pontuada + colcheia + duas colcheias.", abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=84\nK:A\nA4 A2 A2 | A3 A A2 A2 | A2 A2 A A A A | A8 |" },
    ],
    quiz: [
      { text: "Quantas colcheias cabem numa semínima?", options: ["Uma", "Duas", "Quatro"], correctIndex: 1 },
      { text: "A semínima pontuada dura:", options: ["1 tempo", "1 tempo e meio", "2 tempos"], correctIndex: 1 },
    ],
    activity: { title: "Bater a partitura", instructions: "Toque o exemplo em loop lento e bata cada figura com a palma, falando \"tá / tá-á / ti-ti / ti-ri-ti-ri\". Repita até acertar o compasso 2 sem hesitar.", format: "none" },
  },
  {
    title: "Módulo 1 · Aula 4 — Subdivisão, síncope e levada",
    sections: [
      {
        title: "O que acontece entre os pulsos",
        markdown:
          "Duas colcheias podem ser **iguais** (\"ti-ti\") ou **desiguais** (\"tiii-ti\", a primeira mais " +
          "longa) — o chamado *swing*. Muita música gospel, blues e samba usa colcheias com algum swing.\n\n" +
          "O **contratempo** é o \"e\" da contagem \"1 e 2 e\" — a metade fraca do tempo. Bater palma só " +
          "nos contratempos, enquanto o pé marca os tempos, é o exercício que destrava o suingue.\n\n" +
          "**Síncope** é quando um som começa numa parte fraca e se prolonga sobre a parte forte seguinte, " +
          "\"roubando\" o acento. Quase toda linha de melodia popular tem pelo menos uma síncope.",
      },
    ],
    examples: [
      { title: "Reto x sincopado", caption: "Compasso 1: colcheias retas. Compasso 3: síncope (colcheia + semínima ligada ao tempo forte).", abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:A\nA2 A2 A2 A2 | A A A A A A A A | A2 A4 A2 | A A2 A2 A2 A |" },
    ],
    quiz: [
      { text: "O contratempo é:", options: ["O tempo forte", "A metade fraca do tempo (o \"e\")", "O último compasso"], correctIndex: 1 },
      { text: "O que caracteriza a síncope?", options: ["Tocar mais rápido", "Um som começar no fraco e segurar sobre o forte", "Parar no meio do compasso"], correctIndex: 1 },
    ],
    activity: { title: "Bater o contratempo", instructions: "Com uma gravação tocando: marque os tempos com o pé e bata palma só nos contratempos por 8 compassos, sem perder o pé.", format: "none" },
  },
  {
    title: "Módulo 1 · Aula 5 — Como a bateria organiza o tempo",
    sections: [
      {
        title: "A função de cada peça",
        markdown:
          "Numa levada de música popular: o **bumbo** (grave, \"bum\") marca os tempos fortes, em especial " +
          "o **1**; a **caixa** (seca, \"tá\") marca o **contratempo do compasso** — nos tempos **2 e 4** " +
          "num 4/4, o chamado *backbeat*; o **chimbal** toca a **subdivisão**, mantendo as colcheias " +
          "correndo pra todo mundo se guiar.\n\n" +
          "Bater palma nos tempos 2 e 4 de um louvor animado é imitar a caixa. Quando ela muda para 1 e 3, " +
          "a sensação vira de marcha; quando sai e volta na metade da velocidade, é o *meio-tempo*.\n\n" +
          "Nas quebras de frase (a cada 4 ou 8 compassos) a bateria faz uma **virada** que \"anuncia\" a " +
          "próxima parte, e muda de densidade: mais leve na estrofe, cheia no refrão.",
      },
    ],
    quiz: [
      { text: "A peça que normalmente mantém as colcheias correndo é:", options: ["O bumbo", "A caixa", "O chimbal"], correctIndex: 2 },
      { text: "Uma virada de bateria na quebra de frase serve para:", options: ["Acelerar a música", "Anunciar a mudança de parte", "Afinar os tambores"], correctIndex: 1 },
    ],
    activity: { title: "Ouvir a bateria", instructions: "Ouça três levadas. Para cada uma, diga: a caixa está em 2 e 4 ou em 1 e 3? O chimbal está em colcheias ou mais espaçado?", format: "none" },
  },

  // ── MÓDULO 2 — Altura e intervalos ────────────────────────────────────────
  {
    title: "Módulo 2 · Aula 6 — Altura, as sete notas e a oitava",
    sections: [
      {
        title: "Grave, agudo e dó-móvel",
        markdown:
          "**Altura** é o quão grave ou agudo é um som. As notas se chamam **Dó, Ré, Mi, Fá, Sol, Lá, Si** " +
          "e depois **repetem** — o Dó seguinte é \"o mesmo som, mais agudo\". Essa distância até a " +
          "repetição é a **oitava**.\n\n" +
          "Neste curso usamos **dó-móvel**: \"Dó\" não é uma nota fixa, é o **primeiro grau** da escala em " +
          "que a música está. Em Lá maior, quem faz o papel de \"Dó\" é o **Lá**. O que importa é a " +
          "sequência de distâncias entre os graus — o molde — não os nomes absolutos.",
      },
    ],
    examples: [
      { title: "Escala de Lá maior com os graus", caption: "Os graus 1 a 8 escritos sob cada nota da escala.", abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=76\nK:A\n\"_1\"A \"_2\"B \"_3\"c \"_4\"d | \"_5\"e \"_6\"f \"_7\"g \"_8\"a | a g f e | d c B A |" },
    ],
    quiz: [
      { text: "A distância de um Dó até o próximo Dó chama-se:", options: ["Quinta", "Oitava", "Compasso"], correctIndex: 1 },
      { text: "Em dó-móvel, em Lá maior, quem faz o papel de grau 1 (\"Dó\")?", options: ["Dó", "Lá", "Sol"], correctIndex: 1 },
    ],
    activity: { title: "Cantar a escala", instructions: "Cante a escala ascendente e descendente três vezes junto do exemplo. Depois cante só os graus 1–3–5–8 (o esqueleto do acorde).", format: "audio" },
  },
  {
    title: "Módulo 2 · Aula 7 — Tom, semitom e a escala maior",
    sections: [
      {
        title: "A fórmula da escala maior",
        markdown:
          "**Semitom** é a menor distância entre duas notas — no piano, uma tecla e a imediatamente " +
          "seguinte. **Tom** é o dobro. Entre **Mi e Fá** e entre **Si e Dó** há só semitom; entre os " +
          "outros nomes vizinhos há um tom.\n\n" +
          "Toda escala maior segue o mesmo molde, do grau 1 ao 8: **Tom – Tom – semitom – Tom – Tom – " +
          "Tom – semitom**. Comece no Lá e a receita obriga a usar Fá#, Dó# e Sol# — por isso Lá maior " +
          "\"tem três sustenidos\".\n\n" +
          "Os dois semitons — entre 3–4 e entre 7–8 — são os pontos de \"encaixe\" da escala. O 7 puxando " +
          "para o 8 (a \"sensível\") é o efeito que a harmonia funcional inteira explora.",
      },
    ],
    examples: [
      { title: "Escala com tons e semitons", caption: "T = tom, st = semitom, entre cada par de graus.", abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:A\n\"_T\"A \"_T\"B \"_st\"c | \"_T\"d \"_T\"e \"_T\"f | \"_st\"g a2 |" },
    ],
    quiz: [
      { text: "Entre **Mi e Fá** há:", options: ["Um tom", "Um semitom", "Um tom e meio"], correctIndex: 1 },
      { text: "A fórmula da escala maior é:", options: ["st–T–T–st–T–T–T", "T–T–st–T–T–T–st", "T–st–T–st–T–st–T"], correctIndex: 1 },
    ],
    activity: { title: "Montar Ré maior", instructions: "No teclado do editor, monte a escala de Ré maior aplicando a fórmula T–T–st–T–T–T–st a partir do Ré. Confira: você deve ter usado Fá# e Dó#.", format: "none" },
  },
  {
    title: "Módulo 2 · Aula 8 — Intervalos: número e qualidade",
    sections: [
      {
        title: "Nomear a distância entre duas notas",
        markdown:
          "O **número** do intervalo é quantos graus ele abrange, contando as duas pontas. De Dó a Mi " +
          "(Dó-Ré-Mi) → **terça**. De Dó a Sol → **quinta**.\n\n" +
          "A **qualidade** completa o nome: uma terça pode ser **maior** (Dó–Mi, dois tons) ou **menor** " +
          "(Ré–Fá, tom e meio). Segundas, terças, sextas e sétimas vêm em maior/menor; **quartas, quintas " +
          "e oitavas** são **justas**.\n\n" +
          "Da tônica para cada grau da escala maior: 2ª maior, **3ª maior**, **4ª justa**, **5ª justa**, " +
          "6ª maior, 7ª maior, 8ª justa. Toque cada um a partir do Lá, primeiro melódico e depois harmônico.",
      },
    ],
    examples: [
      { title: "Intervalos a partir do Lá", caption: "2ª maior, 3ª maior, 4ª justa, 5ª justa, 6ª maior, 7ª maior e 8ª — melódicos.", abc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:A\n\"_2M\"A B | \"_3M\"A c | \"_4J\"A d | \"_5J\"A e | \"_6M\"A f | \"_7M\"A g | \"_8\"A a |" },
    ],
    quiz: [
      { text: "Ouça o intervalo (melódico, ascendente).", options: ["3ª maior", "4ª justa", "5ª justa", "2ª maior"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:A\nA c" },
      { text: "Ouça o intervalo (harmônico).", options: ["3ª maior", "5ª justa", "6ª maior", "8ª"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:A\n[Ae]" },
      { text: "Ouça o intervalo (melódico, ascendente).", options: ["5ª justa", "6ª maior", "3ª menor"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:A\nA f" },
      { text: "Quais intervalos são chamados \"justos\" (sem versão maior/menor)?", options: ["2ª, 3ª e 6ª", "4ª, 5ª e 8ª", "Todos"], correctIndex: 1 },
    ],
    activity: { title: "Treinador de intervalos", instructions: "Nomeie 10 intervalos de ouvido a partir de Lá, Ré e Mi (2ª maior, 3ª menor, 3ª maior, 4ª justa, 5ª justa, 6ª maior). Anote seu acerto.", format: "none" },
  },
  {
    title: "Módulo 2 · Aula 9 — Reconhecer intervalos por músicas-referência",
    sections: [
      {
        title: "A técnica da âncora",
        markdown:
          "O jeito mais rápido de aprender a ouvir intervalo é associar cada um ao **começo de uma " +
          "música**. Quando ouvir um salto e não souber o nome, cante a música-âncora daquele salto e " +
          "compare.\n\n" +
          "Ascendentes: **2ª maior** = \"Parabéns pra você\" (pa-ra); **3ª maior** = \"Atirei o pau no " +
          "gato\" (a-ti); **4ª justa** = início de muitos hinos; **5ª justa** = tema de *2001*; " +
          "**6ª maior** = \"My Bonnie\"; **8ª** = \"Somewhere over the rainbow\".\n\n" +
          "Descendentes têm outras âncoras: 4ª justa descendo = \"O Cravo brigou com a rosa\"; 5ª justa " +
          "descendo = tema dos *Flintstones*. Ajuste as âncoras para músicas do repertório dos seus alunos.",
      },
    ],
    quiz: [
      { text: "Ouça e escolha a âncora que combina.", options: ["\"Atirei o pau no gato\" (3ª maior)", "\"Parabéns pra você\" (2ª maior)", "\"My Bonnie\" (6ª maior)"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:A\nA c" },
      { text: "Ouça e escolha a âncora que combina.", options: ["\"Noite feliz\"", "\"Somewhere over the rainbow\" (8ª)", "\"Atirei o pau no gato\""], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=72\nK:A\nA a" },
    ],
    activity: { title: "Suas próprias âncoras", instructions: "Para cada um dos 7 intervalos da Aula 8, escreva uma música que você conhece que comece com ele.", format: "text" },
  },
  {
    title: "Módulo 2 · Aula 10 — Consonância, dissonância e o trítono",
    sections: [
      {
        title: "Repouso e tensão",
        markdown:
          "Alguns intervalos soam **estáveis** — dá pra parar neles: 3ªs, 6ªs, 5ªs justas, oitavas " +
          "(as **consonâncias**). Outros soam **instáveis, pedindo continuação**: 2ªs, 7ªs e o trítono " +
          "(as **dissonâncias**). A música usa a tensão de propósito, para depois resolver.\n\n" +
          "**Trítono** é a distância de três tons (de Fá a Si). É o intervalo mais tenso da música tonal " +
          "e o **motor do acorde de dominante**.\n\n" +
          "A tensão resolve por **movimento de semitom em direções contrárias**: no trítono Fá–Si, o Fá " +
          "desce para Mi e o Si sobe para Dó. É esse gesto, repetido milhões de vezes, que o final \"V–I\" produz.",
      },
    ],
    examples: [
      { title: "Trítono resolvendo", caption: "O trítono Fá–Si (harmônico) resolvendo em Mi–Dó, e depois um acorde de repouso.", abc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:C\n[FB] [Ec] | [DG]2 |" },
    ],
    quiz: [
      { text: "Ouça o par de notas: repouso ou tensão?", options: ["Repouso", "Tensão"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:C\n[CE]" },
      { text: "Ouça o par de notas: repouso ou tensão?", options: ["Repouso", "Tensão"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:C\n[FB]" },
      { text: "O trítono tem:", options: ["Dois tons", "Três tons", "Quatro tons"], correctIndex: 1 },
    ],
    activity: { title: "Descansada ou tensa", instructions: "Ouça oito pares de notas (harmônicos). Para cada um, escreva \"repouso\" ou \"tensão\". Depois confira com o professor.", format: "text" },
  },

  // ── MÓDULO 3 — Harmonia funcional ─────────────────────────────────────────
  {
    title: "Módulo 3 · Aula 11 — O acorde: a tríade",
    sections: [
      {
        title: "Empilhando terças",
        markdown:
          "Uma **tríade** são três notas empilhadas em terças: a **fundamental**, a **terça** e a " +
          "**quinta** — em dó-móvel, os graus **1–3–5**.\n\n" +
          "Se a distância da fundamental à terça é uma **3ª maior**, o acorde é **maior** (som aberto, " +
          "alegre). Se é uma **3ª menor**, o acorde é **menor** (som fechado, melancólico). A quinta é a " +
          "mesma nos dois: mexer só na **nota do meio** troca o caráter do acorde inteiro.\n\n" +
          "Em Lá maior você mais vai usar **A** (Lá–Dó#–Mi), **D** (Ré–Fá#–Lá) e **E** (Mi–Sol#–Si) — o " +
          "I, o IV e o V.",
      },
    ],
    examples: [
      { title: "A – D – E – A", caption: "As três tríades principais de Lá maior, tocadas em sequência.", abc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:A\n\"A\"[A,CE] \"D\"[D,FA] | \"E\"[E,GB] \"A\"[A,CE] |" },
    ],
    quiz: [
      { text: "Uma tríade é formada pelos graus:", options: ["1–2–3", "1–3–5", "1–4–5"], correctIndex: 1 },
      { text: "O que diferencia um acorde maior de um menor?", options: ["A quinta", "A terça (a nota do meio)", "A fundamental"], correctIndex: 1 },
      { text: "Ouça: qual é a tríade menor?", options: ["A primeira", "A segunda"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=60\nK:C\n[CEG] [CE_G] |" },
    ],
    activity: { title: "Tocar as tríades", instructions: "No seu instrumento, toque A, depois D, depois E, depois A de novo, ouvindo bem a nota do meio de cada um. Grave 20 segundos.", format: "audio" },
  },
  {
    title: "Módulo 3 · Aula 12 — O campo harmônico de Lá maior",
    sections: [
      {
        title: "Um acorde sobre cada grau",
        markdown:
          "Empilhando terças com **só as notas da escala de Lá maior**, sai um acorde sobre cada grau:\n\n" +
          "| Grau | Acorde | Número romano |\n|---|---|---|\n| 1 | A | **I** |\n| 2 | Bm | ii |\n" +
          "| 3 | C#m | iii |\n| 4 | D | **IV** |\n| 5 | E | **V** |\n| 6 | F#m | vi |\n| 7 | G#° | vii° |\n\n" +
          "Cada acorde cumpre um papel: **Tônica (repouso)** — I, vi, iii; **Subdominante (afastamento)** " +
          "— IV e ii; **Dominante (tensão)** — V e vii°. A música respira indo tônica → subdominante → " +
          "dominante → tônica.\n\n" +
          "Pensar em **I–IV–V** em vez de A–D–E deixa a progressão **transportável**: a mesma sequência " +
          "em Sol maior é G–C–D.",
      },
    ],
    quiz: [
      { text: "Em Lá maior, o acorde do grau IV é:", options: ["Ré maior (D)", "Ré menor", "Mi maior"], correctIndex: 0 },
      { text: "A função do acorde V (dominante) é:", options: ["Dar repouso", "Afastar de casa sem tensão", "Criar tensão que puxa para a tônica"], correctIndex: 2 },
      { text: "Qual grupo é função de tônica (repouso)?", options: ["ii e IV", "I e vi", "V e vii°"], correctIndex: 1 },
    ],
    activity: { title: "Campo de Sol maior", instructions: "Escreva os sete acordes de Sol maior com seus números romanos (dica: Sol maior tem um sustenido, o Fá#).", format: "text" },
  },
  {
    title: "Módulo 3 · Aula 13 — A cadência: como a música respira",
    sections: [
      {
        title: "Pontuação musical",
        markdown:
          "Cadência é o jeito como uma frase musical termina — o equivalente ao ponto, à vírgula ou às " +
          "reticências.\n\n" +
          "- **Autêntica (V → I):** o \"ponto final\". Máxima resolução — é como quase todo hino acaba.\n" +
          "- **Plagal (IV → I):** o \"amém\" das igrejas. Resolução mais suave.\n" +
          "- **Meia-cadência (… → V):** termina no V. É a \"vírgula\": a frase para, mas vem mais.\n" +
          "- **Deceptiva (V → vi):** o \"quase\" — o V prepara o I e no último instante vai pro vi.\n\n" +
          "Toque, em Lá: **A (I) – D (IV) – E (V) – A (I)**. Sinta: o D \"abre\", o E \"aperta\", o A \"resolve\".",
      },
    ],
    examples: [
      { title: "Melodia sobre I–IV–V–I", caption: "Uma frase simples em Lá maior sobre o ciclo I–IV–V–I.", abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=84\nK:A\n\"A\" A2 A2 B2 A2 | \"D\" c2 B2 A4 | \"E\" B2 B2 c2 B2 | \"A\" A6 z2 |" },
    ],
    quiz: [
      { text: "Ouça a progressão: que cadência é essa?", options: ["Autêntica", "Plagal", "Deceptiva"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:A\n\"E\"[E,GB] \"A\"[A,CE] |" },
      { text: "Ouça a progressão: ela terminou no repouso ou na tensão?", options: ["No repouso (I)", "Na tensão (V)"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=66\nK:A\n\"A\"[A,CE] \"E\"[E,GB] |" },
      { text: "No ciclo I–IV–V–I em Lá, o acorde que \"resolve\" é:", options: ["D", "E", "A"], correctIndex: 2 },
    ],
    activity: { title: "Repouso ou tensão", instructions: "Ouça seis progressões curtas. Para cada uma, diga se terminou no repouso (I) ou na tensão (V). Depois cante a tônica de Lá logo após cada uma parar.", format: "audio" },
  },
  {
    title: "Módulo 3 · Aula 14 — Progressões comuns e o loop de quatro acordes",
    sections: [
      {
        title: "Os loops mais usados",
        markdown:
          "O **loop I–V–vi–IV** — em Lá: **A – E – F#m – D**, repetindo — é a progressão de centenas de " +
          "sucessos pop e de louvor. Como é um loop, dá sensação de \"seguir girando\".\n\n" +
          "A variante **vi–IV–I–V** (F#m – D – A – E) soa um pouco mais melancólica no início e resolvida " +
          "no fim. Muitas músicas alternam as duas ordens entre estrofe e refrão.\n\n" +
          "O **blues de 12 compassos** usa só I, IV e V (A, D, E) numa forma fixa — base do blues, do " +
          "rock and roll e de muito gospel antigo.",
      },
      {
        title: "Ouvir o loop",
        markdown: "Toque a progressão e ouça como ela \"gira\" sem uma cadência forte de encerramento.",
        blocks: [{ kind: "progression", chords: "A E F#m D", key: "A", bpm: 96, caption: "Loop I–V–vi–IV em Lá maior." }],
      },
    ],
    quiz: [
      { text: "Em Lá, o loop I–V–vi–IV são os acordes:", options: ["A–E–F#m–D", "A–D–E–A", "A–Bm–C#m–D"], correctIndex: 0 },
      { text: "O blues de 12 compassos usa quais funções?", options: ["Só I e vi", "I, IV e V", "Todos os sete acordes do campo"], correctIndex: 1 },
    ],
    activity: { title: "Identificar a progressão", instructions: "Ouça três trechos. Identifique qual usa I–V–vi–IV, qual usa blues de 12 compassos e qual usa I–IV–V–I simples.", format: "none" },
  },
  {
    title: "Módulo 3 · Aula 15 — A sétima da dominante (V7)",
    sections: [
      {
        title: "A quarta nota do acorde",
        markdown:
          "Empilhando **mais uma terça** em cima da tríade do V (E: Mi–Sol#–Si) chega-se no **Ré** — e " +
          "tem o **E7** (Mi–Sol#–Si–Ré), o acorde de **sétima da dominante**.\n\n" +
          "Dentro do E7, entre **Sol# e Ré**, mora um **trítono**. É ele que dá ao E7 aquela \"coceira\" " +
          "muito maior que a do E simples, e ele resolve do jeito clássico: Sol# sobe para Lá, Ré desce " +
          "para Dó# — exatamente as notas do acorde de A.\n\n" +
          "O V7 aparece principalmente **logo antes da volta para a tônica**, no fim das frases e da " +
          "música inteira.",
      },
    ],
    examples: [
      { title: "E → A e depois E7 → A", caption: "Primeiro a tríade E resolvendo, depois o E7 — ouça a diferença de \"puxão\".", abc: "X:1\nM:4/4\nL:1/2\nQ:1/4=63\nK:A\n\"E\"[E,GB] \"A\"[A,CE] | \"E7\"[E,GBd] \"A\"[A,CE] |" },
    ],
    quiz: [
      { text: "O E7 é o acorde E com uma nota a mais:", options: ["Uma terça abaixo", "Uma sétima acima da fundamental (o Ré)", "A mesma nota dobrada"], correctIndex: 1 },
      { text: "Ouça os dois acordes: qual \"puxa\" mais para a tônica?", options: ["O primeiro", "O segundo"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=60\nK:A\n[E,GB] | [E,GBd] |" },
    ],
    activity: { title: "E x E7", instructions: "No instrumento, toque E → A e depois E7 → A, alternando. Descreva em uma frase o que a sétima acrescenta. Grave o exemplo.", format: "audio" },
  },

  // ── MÓDULO 4 — Juntando tudo ──────────────────────────────────────────────
  {
    title: "Módulo 4 · Aula 16 — Melodia sobre harmonia",
    sections: [
      {
        title: "Notas do acorde x notas de passagem",
        markdown:
          "Quando a melodia está sobre o acorde **A** (Lá–Dó#–Mi), as notas Lá, Dó# e Mi soam " +
          "\"apoiadas\" — são **notas do acorde**. As outras soam \"de caminho\": a melodia passa por " +
          "elas rapidamente, geralmente em parte fraca do tempo — são as **notas de passagem**.\n\n" +
          "A regra prática: nos **tempos fortes**, a melodia bem-comportada tende a estar numa **nota do " +
          "acorde** daquele momento. Nas partes fracas, ela pode \"enfeitar\" com notas de fora.\n\n" +
          "Toque o acorde A parado e cante o grau 1, depois o 2, depois o 3. O 1 e o 3 \"encaixam\"; o 2 " +
          "fica \"pendurado\", querendo resolver.",
      },
    ],
    examples: [
      { title: "Nota de acorde x passagem", caption: "Sobre A: Lá e Dó# nos tempos fortes (nota de acorde), Si de passagem.", abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\n\"A\" A2 B c2 A | \"D\" d2 c B2 A | \"E\" B2 c d2 B | \"A\" c2 B A4 |" },
    ],
    quiz: [
      { text: "Sobre o acorde A (Lá–Dó#–Mi), qual nota é \"de passagem\"?", options: ["Lá", "Si", "Mi"], correctIndex: 1 },
      { text: "Melodias bem-comportadas tendem a colocar, nos tempos fortes:", options: ["Notas de fora do acorde", "Notas do acorde", "Sempre a fundamental"], correctIndex: 1 },
    ],
    activity: { title: "Circular os tempos fortes", instructions: "Na partitura do exemplo, marque as notas que caem no tempo forte e verifique se cada uma pertence ao acorde escrito em cima.", format: "none" },
  },
  {
    title: "Módulo 4 · Aula 17 — Forma musical",
    sections: [
      {
        title: "As partes com nome",
        markdown:
          "**Introdução:** prepara o clima. **Estrofe (verso):** conta a \"história\", letra que muda a " +
          "cada repetição. **Refrão:** a parte que se repete igual, melodia no ponto mais alto — o que " +
          "todo mundo lembra. **Ponte:** aparece uma vez, contrasta, leva ao último refrão. " +
          "**Coda / final:** o encerramento.\n\n" +
          "Na partitura, `:|` manda repetir. Quando a repetição termina diferente, usa-se **casa 1** e " +
          "**casa 2**.\n\n" +
          "Escrever a forma como uma linha de letras ajuda a ensaiar: por exemplo **Intro – A – A – B – " +
          "A – B – B – Coda** (A = estrofe, B = refrão).",
      },
    ],
    quiz: [
      { text: "A parte que se repete igual, com a melodia mais alta e \"grudenta\", é:", options: ["A estrofe", "O refrão", "A ponte"], correctIndex: 1 },
      { text: "A ponte serve para:", options: ["Repetir o refrão", "Trazer um contraste, uma vez, antes do último refrão", "Afinar a banda"], correctIndex: 1 },
    ],
    activity: { title: "Mapa de forma", instructions: "Escolha uma música que você toca. Escreva o mapa de forma dela com os nomes das partes e quantos compassos cada uma tem.", format: "text" },
  },
  {
    title: "Módulo 4 · Aula 18 — Lendo uma lead sheet",
    sections: [
      {
        title: "Melodia + cifras",
        markdown:
          "Uma **lead sheet** é o formato mínimo de uma música: a melodia escrita na pauta e as cifras " +
          "dos acordes acima. Não diz qual levada tocar — isso fica a critério de quem toca.\n\n" +
          "Como se lê: (1) veja o **tom** e a **fórmula de compasso**; (2) passe o olho pelas **cifras** " +
          "— elas já dão a harmonia inteira; (3) a **melodia** dá o ritmo e o contorno do canto; " +
          "(4) junte: baixo faz a fundamental da cifra, harmonia preenche, a voz faz a melodia.\n\n" +
          "Cifras além da tríade: `A7` = com sétima; `Am` = menor; `D/F#` = Ré com Fá# no baixo; " +
          "`Asus4` = a terça trocada pela quarta. Reconhecer `X`, `Xm` e `X7` já cobre a maioria dos louvores.",
      },
    ],
    examples: [
      { title: "Lead sheet de 8 compassos em Lá maior", caption: "Melodia com cifras — leia o tom, as cifras e o contorno.", abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=92\nK:A\n\"A\" E2 A2 A2 B2 | \"D\" c2 B2 A4 | \"E\" B2 B2 c2 d2 | \"E7\" c4 B4 |\n\"A\" E2 A2 A2 B2 | \"D\" c2 B2 A2 F2 | \"E7\" B2 A2 G2 B2 | \"A\" A8 |]" },
    ],
    quiz: [
      { text: "Numa lead sheet, o que fica por conta de quem toca?", options: ["A melodia", "As cifras", "A levada / o arranjo"], correctIndex: 2 },
      { text: "A cifra `A7` significa:", options: ["Lá menor", "Lá maior com sétima (dominante)", "Lá com quarta"], correctIndex: 1 },
    ],
    activity: { title: "Tocar a lead sheet", instructions: "Toque a lead sheet do exemplo: cifras no instrumento harmônico + melodia cantada ou num instrumento melódico. Grave uma passada completa.", format: "audio" },
  },
  {
    title: "Módulo 4 · Aula 19 — Análise guiada do começo ao fim",
    sections: [
      {
        title: "O roteiro de análise",
        markdown:
          "Para qualquer música, responda nesta ordem:\n\n" +
          "1. **Tom e compasso.** Qual a tônica? Maior ou menor? Quantos tempos por compasso?\n" +
          "2. **Andamento e caráter.** BPM aproximado; a bateria marca o backbeat onde?\n" +
          "3. **Forma.** Mapa de partes (Intro / Estrofe / Refrão / …).\n" +
          "4. **Harmonia.** As cifras de cada parte em números romanos e funções. Que cadência fecha cada frase?\n" +
          "5. **Melodia.** Qual o âmbito? Move-se por graus conjuntos ou por saltos? Onde está o pico?\n\n" +
          "O próximo passo natural é o curso **\"Jesus Cristo mudou meu viver\"**, que faz exatamente essa " +
          "análise, em detalhe, numa música só.",
      },
    ],
    activity: {
      title: "Análise completa (entrega final)",
      instructions:
        "Escolha uma música que você toca ou canta. Escreva a análise completa seguindo o roteiro: tom, " +
        "compasso, andamento, forma, harmonia em números romanos, melodia. Entregue em texto — o professor " +
        "devolve com nota e comentários.",
      format: "text",
    },
  },
];
