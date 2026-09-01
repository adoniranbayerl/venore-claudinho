import type { SeedLesson } from "./shared/course-builder";

// Conteúdo (dados puros) do seed "jesus-cristo-mudou-meu-viver" — separado do runner pra poder
// ser importado por testes sem a cadeia de services/next-auth. Fonte: docs/curso-jesus-cristo-
// mudou-meu-viver.md + os dois MusicXML que o dono enviou (parte "Voz" e "Arranjo Violão").
//
// A MELODIA da Aula 5 vem do MusicXML "Voz" (Lá maior, 4/4, ♩=80, 9 compassos = o refrão inteiro).
// Convenções de apresentação de melodia pedidas pelo dono:
//  - sempre POR PARTES (uma frase por exemplo), nunca a melodia inteira de uma vez só;
//  - sempre DOIS andamentos por trecho: 80 BPM (real) e 70 BPM (treino);
//  - sempre com a LETRA na pauta (linha `w:`);
//  - evidenciar colcheia × mínima, os tempos e as pausas.
//
// A HARMONIA base é I–IV–V de Lá maior (Aula 6); o arranjo de violão (Aula 7) rearmoniza por cima
// da mesma melodia (Cmaj7/C#m7/D#°/Amaj7 + baixo cromático) e serve de interlúdio.

export const MUSICA_LESSONS: SeedLesson[] = [
  {
    title: "Aula 1 — A origem da música",
    sections: [
      {
        title: "De onde vem a música",
        markdown:
          "\"Jesus Cristo mudou meu viver\" é a **versão em português** de uma canção norte-americana: " +
          "**\"What a Difference You've Made in My Life\"** (1977), com música de **Archie Jordan** e " +
          "letra em inglês de **Joan Sutton**. O original **não é religioso** — é uma canção de amor, " +
          "sem citar Deus nem Jesus. A leitura cristã veio depois, quando artistas gospel a gravaram " +
          "(nos EUA, Amy Grant; no Brasil, o **Conjunto Som Maior** fez a primeira gravação, no LP " +
          "\"Mais de Cristo\"). Vale lembrar disso: parte do que se costuma dizer sobre \"a intenção " +
          "da música\" é **interpretação de quem canta**, não um fato da peça.",
      },
      {
        title: "Como ela circula no Brasil",
        markdown:
          "No uso das igrejas, a música passou a se comportar como um **corinho**: aprendida de " +
          "ouvido, cantada sem partitura, com **várias versões de letra** convivendo. Só do refrão " +
          "circulam pelo menos duas famílias de texto (\"Jesus Cristo mudou meu viver…\" e " +
          "\"Diferente, hoje é o meu coração…\"). O tom também muda de lugar para lugar. **Confirme " +
          "os créditos e a letra na edição que a sua igreja usa** antes de tratar qualquer versão " +
          "como \"a certa\".",
      },
      {
        title: "O que o texto faz",
        markdown:
          "A letra é um **testemunho na primeira pessoa**: alguém conta que algo mudou (\"mudou meu " +
          "viver\") e descreve os efeitos (luz, paz, perdão). Uma leitura comum da forma é " +
          "**afirma → repete → arremata com \"Sim, …\"** — a última linha do refrão retoma a " +
          "primeira, agora confirmada. Nas próximas aulas a gente vê **como a música espelha (ou " +
          "não) essa forma do texto**.",
      },
    ],
    quiz: [
      { text: "\"Jesus Cristo mudou meu viver\" é, na origem:", options: ["Um corinho brasileiro anônimo", "A versão em português de uma canção norte-americana de 1977", "Um hino da Reforma"], correctIndex: 1 },
      { text: "O título original em inglês é:", options: ["\"What a Difference You've Made in My Life\"", "\"Amazing Grace\"", "\"Shine, Jesus, Shine\""], correctIndex: 0 },
      { text: "A música do original é de:", options: ["Archie Jordan", "John Newton", "Bach"], correctIndex: 0 },
      { text: "Sobre a letra ORIGINAL em inglês:", options: ["Fala explicitamente de Jesus", "Não menciona Deus nem Jesus — é uma canção de amor", "É um salmo"], correctIndex: 1 },
      { text: "A primeira gravação brasileira foi de:", options: ["Conjunto Som Maior", "Aline Barros", "Padre Marcelo"], correctIndex: 0 },
      { text: "Por que existem \"várias versões de letra\"?", options: ["Erro de impressão", "A música passou a circular de ouvido, como corinho, e foi sendo adaptada", "Cada igreja tem direito autoral"], correctIndex: 1 },
      { text: "\"A intenção religiosa da música\" é:", options: ["Um fato comprovado da peça", "Em boa parte, interpretação de quem canta — o original é secular", "Escrita na partitura"], correctIndex: 1 },
      { text: "No uso das igrejas a música se comporta como:", options: ["Uma peça de concerto", "Um corinho — aprendida de ouvido, cantada sem partitura", "Uma ária de ópera"], correctIndex: 1 },
      { text: "Uma leitura comum da forma do texto do refrão é:", options: ["Pergunta e resposta jurídica", "Afirma → repete → arremata com \"Sim, …\"", "Não tem forma"], correctIndex: 1 },
      { text: "Antes de tratar uma versão como \"a certa\", o material pede:", options: ["Ignorar as diferenças", "Confirmar créditos e letra na edição que a sua igreja usa", "Escolher a mais antiga"], correctIndex: 1 },
    ],
    activities: [
      {
        title: "Comparar duas versões",
        instructions:
          "Ouça duas gravações diferentes (por exemplo Som Maior e uma mais recente). Em texto, anote " +
          "três diferenças concretas: andamento, tom, levada, letra do refrão, número de repetições.",
        format: "text",
      },
      {
        title: "Fato × interpretação",
        instructions:
          "Em texto: escreva três frases sobre a música que são FATO (data, autoria, forma) e três " +
          "que são INTERPRETAÇÃO (o que ela \"quer dizer\", que sentimento ela \"tem\"). O objetivo é " +
          "treinar a diferença.",
        format: "text",
      },
    ],
  },

  {
    title: "Aula 2 — A letra: versos, sílabas e sentido",
    sections: [
      {
        title: "Os três blocos de texto",
        markdown:
          "A música tem **três blocos de letra** que se revezam sobre praticamente a mesma ideia " +
          "melódica:\n\n" +
          "- **Refrão A:** \"Jesus Cristo mudou meu viver\" (×2) / \"É a Luz que ilumina meu ser\" / " +
          "\"Sim, Jesus Cristo mudou meu viver\".\n" +
          "- **Refrão B:** \"Diferente, hoje é o meu coração\" (×2) / \"Cristo deu-me paz e perdão\" / " +
          "\"Sim, diferente hoje é o meu coração\".\n" +
          "- **Estrofe:** \"O amor só conhecia em canções / Que falavam de ilusões / Tudo agora é " +
          "diferente / Isto falo a toda a gente / Pois, Cristo deu-me seu Amor\".",
      },
      {
        title: "Contar sílabas e achar as tônicas",
        markdown:
          "Para cantar bem, o que importa não é a sílaba escrita, é a **sílaba forte** (tônica) — é " +
          "ela que precisa cair num **tempo forte** da música.\n\n" +
          "- \"Je-**sus** Cris-to mu-**dou** meu vi-**ver**\": as tônicas são **sus / dou / ver**. " +
          "São elas que a melodia acentua.\n" +
          "- \"É a **Luz** que i-lu-**mi**-na meu **ser**\": **Luz / mi / ser**.\n" +
          "- Repare que \"**vi-ver**\", \"**meu ser**\" e \"**co-ra-ção**\" terminam as linhas — são as " +
          "**rimas** (ver/ser; coração/perdão).\n\n" +
          "Quando a tônica do texto cai num tempo fraco, a frase soa \"torta\" — é o primeiro lugar " +
          "para olhar se algo não encaixa.",
      },
      {
        title: "A forma: afirma, repete, arremata",
        markdown:
          "As quatro linhas do refrão fazem: **afirma** (linha 1) → **repete igual** (linha 2, para " +
          "fixar) → **desenvolve** (linha 3, a consequência: \"É a Luz…\") → **arremata** (linha 4, " +
          "\"**Sim**, Jesus Cristo mudou meu viver\" — a linha 1 de volta, agora confirmada). O " +
          "Refrão B faz o mesmo desenho com outras palavras. A **Estrofe** tem cinco linhas mais " +
          "curtas e \"conta\" (canções, ilusões, \"tudo agora é diferente\") antes de o refrão " +
          "\"confirmar\".",
      },
    ],
    quiz: [
      { text: "Quantos blocos de letra a música tem?", options: ["Um só", "Três (Refrão A, Refrão B e Estrofe)", "Sete"], correctIndex: 1 },
      { text: "A primeira linha do Refrão A é:", options: ["\"Diferente, hoje é o meu coração\"", "\"Jesus Cristo mudou meu viver\"", "\"O amor só conhecia em canções\""], correctIndex: 1 },
      { text: "No canto, o que precisa cair no tempo forte é:", options: ["A primeira sílaba de cada palavra", "A sílaba tônica (forte) da palavra", "Sempre uma vogal"], correctIndex: 1 },
      { text: "As tônicas de \"Jesus Cristo mudou meu viver\" são:", options: ["Je / Cris / meu", "sus / dou / ver", "todas iguais"], correctIndex: 1 },
      { text: "\"ver\" e \"ser\" no fim das linhas formam:", options: ["Uma aliteração", "Uma rima", "Um hiato"], correctIndex: 1 },
      { text: "Se a sílaba tônica cai num tempo fraco, a frase:", options: ["Fica mais bonita", "Soa \"torta\" — é o primeiro lugar pra investigar", "Não muda nada"], correctIndex: 1 },
      { text: "A linha 2 do refrão, em relação à linha 1:", options: ["É o contrário", "Repete igual, para fixar", "Muda de assunto"], correctIndex: 1 },
      { text: "A palavra \"Sim\" no começo da linha 4 serve para:", options: ["Rimar com \"não\"", "Arrematar — retomar a linha 1 agora confirmada", "Pedir licença"], correctIndex: 1 },
      { text: "A Estrofe, comparada ao refrão:", options: ["É idêntica", "Tem linhas mais curtas e \"conta\" antes de o refrão \"confirmar\"", "Não tem relação"], correctIndex: 1 },
      { text: "O Refrão B (\"Diferente, hoje é o meu coração\"):", options: ["Tem forma completamente diferente", "Faz o mesmo desenho (afirma/repete/desenvolve/arremata) com outras palavras", "É instrumental"], correctIndex: 1 },
    ],
    activities: [
      {
        title: "Marcar as tônicas",
        instructions:
          "Escreva as quatro linhas do Refrão A e sublinhe/maiúscula a sílaba TÔNICA de cada palavra " +
          "importante. Depois faça o mesmo com a Estrofe. Entregue em texto.",
        format: "text",
      },
      {
        title: "Ler em voz alta no ritmo da fala",
        instructions:
          "Grave você LENDO (não cantando) o Refrão A e a Estrofe, no ritmo natural da fala, batendo " +
          "palma nas sílabas tônicas. É esse ritmo de fala que a melodia vai seguir de perto.",
        format: "audio",
      },
    ],
  },

  {
    title: "Aula 3 — Andamento e caráter",
    sections: [
      {
        title: "Definir o BPM",
        markdown:
          "A partitura de referência traz **♩ = 80 BPM** — um andamento **moderado, marcado**, que " +
          "dá para bater palma confortavelmente em todos os tempos. Não é balada (ficaria arrastada) " +
          "nem corrido (perderia a solenidade). Na prática as versões variam entre uns **76 e 88 " +
          "BPM**; usamos **80** como referência de trabalho.",
      },
      {
        title: "Contagem de entrada e anacruse",
        markdown:
          "Antes de começar, quem conduz dá **um compasso de contagem** (\"1, 2, 3, 4\") no andamento " +
          "exato. A música começa com **anacruse** — as duas sílabas \"**Je-sus**\" caem **antes** do " +
          "primeiro tempo forte, ainda sobre o acorde de dominante (E). O tempo 1 chega junto com " +
          "\"**Cris**\" (de \"Cristo\"), já sobre a tônica (A). A contagem precisa deixar esse espaço " +
          "para a voz entrar na anacruse.",
      },
      {
        title: "Como o andamento muda a mensagem",
        markdown:
          "Cante a primeira frase a **70 BPM**, depois a **80** (o da partitura), depois a **96**. A " +
          "70 ela soa reflexiva; a 80, firme e celebrativa; a 96 começa a soar apressada, \"sem " +
          "deixar a palavra respirar\". A escolha do andamento **é uma decisão de interpretação** — e " +
          "muda o que a letra comunica.",
      },
    ],
    examples: [
      {
        title: "A 1ª frase com a anacruse — 80 BPM (andamento da partitura)",
        caption:
          "Duas semínimas (Lá–Si) antes do tempo 1; o tempo 1 chega com \"Cris\". Depois a corrida de " +
          "colcheias e a nota longa em \"vi-VER\".",
        abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\nz4 A,2 B,2 | CCC C2 B,A,E- | E4 z4 |]\nw: Je-sus Cris-to mu-dou meu vi-ver _\n",
      },
      {
        title: "A mesma frase — 70 BPM (treino)",
        caption: "A mesma entrada, mais devagar, para praticar sem correr a anacruse.",
        abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=70\nK:A\nz4 A,2 B,2 | CCC C2 B,A,E- | E4 z4 |]\nw: Je-sus Cris-to mu-dou meu vi-ver _\n",
      },
    ],
    quiz: [
      { text: "O andamento da partitura desta música é:", options: ["~60 BPM", "~80 BPM", "~130 BPM"], correctIndex: 1 },
      { text: "A 80 BPM, a sensação é:", options: ["Arrastada", "Firme e celebrativa", "Apressada demais"], correctIndex: 1 },
      { text: "\"Compasso de contagem\" antes de começar serve para:", options: ["Todos entrarem juntos no andamento certo", "Afinar os instrumentos", "Marcar o fim"], correctIndex: 0 },
      { text: "A anacruse desta música são as sílabas:", options: ["\"mu-dou\"", "\"Je-sus\", caindo antes do primeiro tempo forte", "\"vi-ver\""], correctIndex: 1 },
      { text: "O primeiro tempo forte (tempo 1) chega junto com:", options: ["\"Je-\"", "\"Cris-\" (de \"Cristo\")", "\"-ver\""], correctIndex: 1 },
      { text: "A anacruse acontece harmonicamente sobre:", options: ["A tônica (A)", "A dominante (E)", "A subdominante (D)"], correctIndex: 1 },
      { text: "A 96 BPM, o problema é:", options: ["Fica reflexiva demais", "A palavra não \"respira\"", "Ninguém consegue bater palma"], correctIndex: 1 },
      { text: "Escolher o andamento é:", options: ["Um detalhe sem importância", "Uma decisão de interpretação que muda a mensagem", "Fixado pela partitura, imutável"], correctIndex: 1 },
      { text: "Ouça: este andamento está mais perto de", options: ["70 BPM", "80 BPM", "110 BPM"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=80\nK:C\nc c c c | c c c c |" },
      { text: "Ouça a frase com anacruse: as duas primeiras notas caem antes ou depois do primeiro tempo forte?", options: ["Antes", "Depois"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\nz4 A,2 B,2 | CCC C2 B,A,E- | E4 z4 |]" },
    ],
    activities: [
      {
        title: "Cantar a anacruse no tempo",
        instructions: "Cante \"Je-sus Cristo mudou\" junto do metrônomo a 80 BPM, entrando na anacruse depois da contagem. Grave.",
        format: "audio",
      },
      {
        title: "Testar três andamentos",
        instructions: "Grave a primeira frase três vezes: ~70, ~80 e ~96 BPM. Em texto, diga qual você escolheria para a sua igreja e por quê.",
        format: "audio",
      },
    ],
  },

  {
    title: "Aula 4 — A bateria e o groove",
    sections: [
      {
        title: "A levada base — groove funk (gospel)",
        markdown:
          "O andamento (80 BPM) e o caráter celebrativo pedem uma **levada groovada, de pegada " +
          "gospel/funk** — não um rock reto. Três elementos:\n\n" +
          "- **Chimbal:** **semicolcheias** contínuas (mais miúdo que colcheia) — é o \"motor\" que " +
          "dá o balanço.\n" +
          "- **Caixa:** *backbeat* nos tempos **2 e 4** (o acento que a congregação imita batendo " +
          "palma), com **notas fantasma** fracas na semicolcheia logo antes de cada backbeat.\n" +
          "- **Bumbo:** **sincopado** — cai no tempo **1**, na \"a\" do 1, no \"e\" do 2 e no \"e\" " +
          "do 3. É ele que \"empurra\" a frente do tempo e cria o groove.",
        blocks: [
          {
            kind: "drum-grid",
            style: "groove-funk",
            bpm: 80,
            bars: 2,
            caption: "Groove funk (gospel) — a levada \"cheia\", que costuma servir para o refrão.",
          },
        ],
      },
      {
        title: "Grooves por parte da música",
        markdown:
          "A bateria **não toca igual o tempo todo** — ela sinaliza a forma. Uma distribuição de " +
          "trabalho, das partes mais leves para as mais cheias:\n\n" +
          "- **Introdução / interlúdio (arranjo de violão):** bateria **fora** ou só chimbal " +
          "fechado marcando, bem discreto.\n" +
          "- **Estrofe:** levada **contida** — chimbal em colcheias, caixa só no tempo **4**, bumbo " +
          "no 1 e no \"e\" do 2. Deixa espaço para a letra \"que conta\".\n" +
          "- **Refrão:** a levada **cheia** (o groove funk acima) — chimbal em semicolcheias, caixa " +
          "em 2 e 4, bumbo denso.\n" +
          "- **Refrão final (depois da parada):** igual ao refrão, com o **chimbal aberto no tempo " +
          "1** e tudo no volume máximo.",
        blocks: [
          {
            kind: "drum-grid",
            style: "estrofe-corinho",
            bpm: 80,
            bars: 2,
            caption: "Estrofe — levada contida: chimbal em colcheias, caixa só no 4, bumbo no 1 e no \"e\" do 2.",
          },
        ],
      },
      {
        title: "Viradas (fills): anunciar a mudança",
        markdown:
          "A **virada** é um pequeno desvio da levada — em geral **nos dois últimos tempos de um " +
          "compasso** — que avisa \"vem coisa nova\". Nesta música elas aparecem:\n\n" +
          "- **Da estrofe para o refrão:** uma virada de **1 compasso** — a caixa \"quebra\" em " +
          "semicolcheias nos tempos 3 e 4 e o bumbo marca forte o \"1\" do refrão.\n" +
          "- **Antes do refrão final:** a **parada** (a banda inteira para 1–2 tempos, só a voz ou " +
          "um prato) e volta com tudo.\n\n" +
          "Regra prática: virada **curta e clara** > virada longa e enfeitada. Ela serve para a banda " +
          "e a congregação **chegarem juntas** na parte nova.",
        blocks: [
          {
            kind: "drum-grid",
            style: "virada-fim-de-frase",
            bpm: 80,
            bars: 1,
            caption: "Virada de fim de frase: caixa em semicolcheias nos tempos 3–4, bumbo forte no 1 seguinte.",
          },
        ],
      },
    ],
    quiz: [
      { text: "Numa levada com backbeat, a caixa está tocando em:", options: ["1 e 3", "2 e 4", "Todos os tempos"], correctIndex: 1 },
      { text: "A peça que dá o \"balanço\" funk, correndo miúdo o tempo todo, é:", options: ["O bumbo", "A caixa", "O chimbal em semicolcheias"], correctIndex: 2 },
      { text: "Na ESTROFE, a levada de trabalho é:", options: ["A mais cheia possível", "Contida — chimbal em colcheias, caixa só no 4", "Igual ao refrão"], correctIndex: 1 },
      { text: "No REFRÃO, a levada é:", options: ["A cheia (groove funk)", "Só bumbo", "Sem bateria"], correctIndex: 0 },
      { text: "Durante o interlúdio de violão, a bateria costuma:", options: ["Tocar o mais forte possível", "Ficar fora, ou só um chimbal bem discreto", "Fazer um solo"], correctIndex: 1 },
      { text: "Uma \"virada\" (fill) costuma cair:", options: ["No tempo 1", "Nos dois últimos tempos de um compasso, anunciando a parte nova", "No meio de toda frase"], correctIndex: 1 },
      { text: "A virada da estrofe para o refrão serve para:", options: ["Corrigir o andamento", "A banda e a congregação chegarem juntas no refrão", "Dar um solo longo"], correctIndex: 1 },
      { text: "A \"parada\" antes do refrão final é:", options: ["A banda toda parando 1–2 tempos e voltando com tudo", "Um erro de ensaio", "O fim da música"], correctIndex: 0 },
      { text: "No refrão final, o chimbal costuma:", options: ["Sumir", "Abrir no tempo 1", "Ficar mais lento"], correctIndex: 1 },
      { text: "Ouça o groove: a caixa está em 1 e 3 ou em 2 e 4?", options: ["1 e 3", "2 e 4"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/8\nK:C\nz2 c2 z2 c2 | z2 c2 z2 c2 |" },
    ],
    activities: [
      {
        title: "Bater o backbeat e trocar de levada",
        instructions:
          "Com a gravação tocando: bata palma no backbeat (2 e 4) por uma estrofe e um refrão sem " +
          "errar. Em texto, descreva o que a bateria faz de diferente entre a estrofe e o refrão, e " +
          "onde entra a virada.",
        format: "text",
      },
      {
        title: "Cantar os grooves com a boca",
        instructions:
          "Grave você marcando com a boca (\"bum\" no bumbo, \"tá\" na caixa, \"ts\" no chimbal): 4 " +
          "compassos da levada de estrofe, uma virada de 1 compasso, e 4 compassos da levada de " +
          "refrão.",
        format: "audio",
      },
    ],
  },

  {
    title: "Aula 5 — A melodia, frase a frase",
    sections: [
      {
        title: "Âmbito, contorno e o pico",
        markdown:
          "A melodia (a do **refrão**, que é a linha que a partitura traz) vai da tônica **Lá** " +
          "grave até o **Mi agudo** — cerca de uma **oitava e um pouco**. O movimento é quase todo " +
          "por **graus conjuntos** (nota vizinha); os saltos maiores são a **quarta** \"de hino\" " +
          "(grau 5 → grau 1) e a subida ao **Mi agudo** no começo da 3ª frase — esse Mi é o **pico " +
          "da música**, sobre \"É a **Luz**\". Depois do pico a melodia **desce** de volta e o " +
          "fecho pousa no **grau 5** (Mi médio), uma nota que **não é a tônica** — por isso o refrão " +
          "\"pede\" para ser repetido.",
      },
      {
        title: "Colcheia, mínima, tempos e pausas",
        markdown:
          "Três coisas para o olho e o ouvido antes de cantar:\n\n" +
          "- **Colcheias** carregam as sílabas rápidas (\"Cris-to-mu-\", \"i-lu-mi-\"). São a " +
          "\"corrida\" da frase.\n" +
          "- **Mínimas** (e a semínima pontuada no comp. 7) são as **notas longas** — caem sempre " +
          "numa sílaba tônica (\"vi-**ver**\", \"meu **ser**\") e é onde a voz **sustenta** e a " +
          "frase respira.\n" +
          "- As **pausas** entre as frases são **respirações escritas** — não são \"buraco\", são " +
          "parte do fraseado. Respire nelas, não antes.\n\n" +
          "Regra: onde tem **nota longa**, aí é sílaba forte e ponto de apoio; onde tem **corrida de " +
          "colcheias**, as sílabas são leves e passam depressa.",
      },
      {
        title: "As quatro frases",
        markdown:
          "O refrão são **quatro frases** com o mesmo esqueleto:\n\n" +
          "1. \"Jesus Cristo mudou meu viver\" — sobe da tônica ao Mi médio, termina **aberta**.\n" +
          "2. \"Jesus Cristo mudou meu viver\" — **repete**, mas fecha no **Lá** (grau 1).\n" +
          "3. \"É a Luz que ilumina meu ser\" — **sobe ao pico** (Mi agudo) e começa a descer.\n" +
          "4. \"Sim, Jesus Cristo mudou meu viver\" — desce até o fecho no **grau 5**, com um " +
          "pequeno **melisma** em \"vi-**ver**\" (Fá♯ → Mi).",
      },
    ],
    examples: [
      {
        title: "Frase 1 — \"Jesus Cristo mudou meu viver\" — 80 BPM",
        caption:
          "Anacruse Lá–Si (\"Je-sus\"), corrida de colcheias em \"Cris-to-mu-\", e a nota longa em " +
          "\"vi-VER\" atravessando para o compasso seguinte, com pausa (respiração) depois.",
        abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\nz4 A,2 B,2 | CCC C2 B,A,E- | E4 z4 |]\nw: Je-sus Cris-to mu-dou meu vi-ver _\n",
      },
      {
        title: "Frase 1 — 70 BPM (treino)",
        caption: "A mesma frase, mais devagar — sinta a diferença entre as colcheias rápidas e a nota longa em \"ver\".",
        abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=70\nK:A\nz4 A,2 B,2 | CCC C2 B,A,E- | E4 z4 |]\nw: Je-sus Cris-to mu-dou meu vi-ver _\n",
      },
      {
        title: "Frase 2 — repete e fecha no Lá — 80 BPM",
        caption:
          "Mesmo texto, contorno parecido, mas agora a frase DESCE e pousa no Lá (grau 1). Compare o " +
          "fim desta com o fim da frase 1.",
        abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\nz4 z2 C E | FFF F2 E D A- | A4 z4 |]\nw: Je-sus Cris-to mu-dou meu vi-ver _\n",
      },
      {
        title: "Frase 2 — 70 BPM (treino)",
        caption: "A mesma, devagar.",
        abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=70\nK:A\nz4 z2 C E | FFF F2 E D A- | A4 z4 |]\nw: Je-sus Cris-to mu-dou meu vi-ver _\n",
      },
      {
        title: "Frase 3 — o pico, \"É a Luz que ilumina meu ser\" — 80 BPM",
        caption:
          "Sobe ao Mi AGUDO logo no começo (\"É a LUZ\") — o ponto mais alto da música — e começa a " +
          "descer. Note a semínima pontuada e as colcheias de \"i-lu-mi-na\".",
        abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\nz4 z2 A B | c2 ccc d e A- | A4 z4 |]\nw: É a Luz que~i-lu-mi-na meu ser _\n",
      },
      {
        title: "Frase 3 — 70 BPM (treino)",
        caption: "A subida ao pico, devagar, para acertar a afinação do Mi agudo sem forçar.",
        abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=70\nK:A\nz4 z2 A B | c2 ccc d e A- | A4 z4 |]\nw: É a Luz que~i-lu-mi-na meu ser _\n",
      },
      {
        title: "Frase 4 — o fecho, \"Sim, Jesus Cristo mudou meu viver\" — 80 BPM",
        caption:
          "Desce do agudo até o fecho no GRAU 5 (Mi médio, não a tônica). \"vi-VER\" tem um pequeno " +
          "melisma (Fá♯ → Mi) — duas notas na mesma sílaba.",
        abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\nA B c3 E A c | d d c A3 F2 | E8 |]\nw: Sim, Je-sus Cris-to mu-dou meu vi-ver _ _\n",
      },
      {
        title: "Frase 4 — 70 BPM (treino)",
        caption: "O fecho, devagar — segure o Mi final e ouça que ele \"não resolve\", puxando a repetição.",
        abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=70\nK:A\nA B c3 E A c | d d c A3 F2 | E8 |]\nw: Sim, Je-sus Cris-to mu-dou meu vi-ver _ _\n",
      },
      {
        title: "O refrão inteiro, com a letra — 80 BPM (referência)",
        caption:
          "As quatro frases seguidas, uma vez, com a letra do Refrão A. Use os exemplos por frase " +
          "acima para estudar; este é só para ouvir o conjunto.",
        abc:
          "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\n" +
          "z4 A,2 B,2 | CCC C2 B,A,E- | E4 z2 C E | FFF F2 E D A- | A4 z2 A B | c2 ccc d e A- | A B c3 E A c | d d c A3 F2 | E8 |]\n" +
          "w: Je-sus Cris-to mu-dou meu vi-ver _ Je-sus Cris-to mu-dou meu vi-ver _ É a Luz que~i-lu-mi-na meu ser _ Sim, Je-sus Cris-to mu-dou meu vi-ver _\n",
      },
    ],
    quiz: [
      { text: "A linha melódica que a partitura traz é a do:", options: ["Estrofe", "Refrão", "Contracanto do baixo"], correctIndex: 1 },
      { text: "O pico (nota mais aguda) da música cai sobre a palavra:", options: ["\"viver\"", "\"Luz\" (no \"É a Luz\")", "\"Jesus\""], correctIndex: 1 },
      { text: "A melodia se move principalmente por:", options: ["Saltos grandes", "Graus conjuntos (notas vizinhas)", "Repetição da mesma nota"], correctIndex: 1 },
      { text: "As colcheias em \"Cris-to-mu-\" são:", options: ["As notas longas da frase", "A \"corrida\" — sílabas rápidas e leves", "Pausas"], correctIndex: 1 },
      { text: "As notas longas (mínimas) caem sempre:", options: ["Numa sílaba fraca", "Numa sílaba tônica, onde a voz sustenta", "No meio de uma palavra"], correctIndex: 1 },
      { text: "As pausas entre as frases são:", options: ["Erro da partitura", "Respirações escritas — parte do fraseado", "Para o instrumento solar"], correctIndex: 1 },
      { text: "A frase 1 termina:", options: ["Fechada, na tônica", "Aberta (não na tônica)", "No pico"], correctIndex: 1 },
      { text: "A frase 2, comparada à 1:", options: ["É totalmente diferente", "Repete o contorno mas fecha no Lá (grau 1)", "É mais aguda"], correctIndex: 1 },
      { text: "O fecho da música (frase 4) pousa no:", options: ["Grau 1 (tônica, resolvido)", "Grau 5 (aberto — \"pede\" a repetição)", "Grau 7"], correctIndex: 1 },
      { text: "Ouça: a frase começa por uma nota grave ou pelo pico agudo?", options: ["Grave", "Pelo pico (agudo)"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\nz4 z2 A B | cccc de A2 |" },
    ],
    activities: [
      {
        title: "Cantar frase a frase (80 e 70)",
        instructions:
          "Cante cada uma das quatro frases junto do modelo, primeiro a 70 BPM e depois a 80 " +
          "(\"Cantar junto\" — feedback por nota). Preste atenção em respirar nas pausas e sustentar " +
          "as notas longas. Grave a versão a 80.",
        format: "audio",
      },
      {
        title: "Marcar longas, corridas e respirações",
        instructions:
          "Em texto: para cada frase, diga onde estão as notas LONGAS (sílaba e palavra), onde está a " +
          "CORRIDA de colcheias, e onde você RESPIRA. Depois diga em que sílaba cai o pico da música.",
        format: "text",
      },
    ],
  },

  {
    title: "Aula 6 — A harmonia: como é criada",
    sections: [
      {
        title: "Os acordes da casa",
        markdown:
          "A versão simples usa quase só o **campo harmônico de Lá maior**: **A (I)**, **D (IV)**, " +
          "**E / E7 (V)** e o **F#m (vi)** para dar cor. Bm (ii) aparece em algumas versões no lugar " +
          "do D. É uma harmonia de **três/quatro acordes** — de propósito: assim a congregação " +
          "acompanha sem ensaio.",
      },
      {
        title: "A progressão do refrão (uma versão de trabalho)",
        markdown:
          "Sobre as quatro frases do refrão, uma harmonização simples e comum:\n\n" +
          "`| (E na anacruse) | A | D | A | E |  | A | D | E7 | A |`\n\n" +
          "- Frase 1 sai da **anacruse em E** (dominante) e cai em **A**; passa por **D** e termina " +
          "\"aberta\" em **E** (meia-cadência).\n" +
          "- Frase 2 refaz e fecha **E7 → A** (cadência autêntica).\n" +
          "- Frases 3–4 costumam repetir o mesmo caminho, com o **E7 → A** final \"amarrando\".\n\n" +
          "**Confirme contra a sua gravação** — a distribuição exata dos acordes varia bastante.",
      },
      {
        title: "Onde a música respira e resolve",
        markdown:
          "Toda quebra de frase é uma **cadência**. Frase 1 termina numa **meia-cadência** (para no " +
          "V, \"vírgula\"); frases 2 e 4 fecham com **E7 → A** (autêntica, \"ponto final\"). É a " +
          "alternância vírgula/ponto que dá forma. O detalhe fino: a **melodia** fecha no grau 5 " +
          "(Mi), então mesmo com o acorde de **A** embaixo, o fim soa \"não totalmente resolvido\" — " +
          "e é isso que puxa a repetição.",
      },
    ],
    examples: [
      {
        title: "Progressão do refrão (tocável)",
        caption: "E (anacruse) → A → D → A → E (abre) / A → D → E7 → A (resolve). Ouça o D \"abrir\", o E \"apertar\", o A \"assentar\".",
        abc: "X:1\nM:4/4\nL:1/1\nQ:1/4=80\nK:A\n\"E\"[E,GB] | \"A\"[A,CE] | \"D\"[D,FA] | \"A\"[A,CE] | \"E\"[E,GB] | \"A\"[A,CE] | \"D\"[D,FA] | \"E7\"[E,GBd] | \"A\"[A,CE] |",
      },
    ],
    quiz: [
      { text: "Os acordes principais da música, em Lá maior, são:", options: ["A–B–C#–D", "A (I), D (IV), E (V), F#m (vi)", "Qualquer acorde"], correctIndex: 1 },
      { text: "A harmonia é de poucos acordes porque:", options: ["O compositor não sabia mais", "Assim a congregação acompanha sem ensaio", "É uma regra da partitura"], correctIndex: 1 },
      { text: "A anacruse (\"Je-sus\") acontece sobre:", options: ["A (tônica)", "E (dominante)", "F#m"], correctIndex: 1 },
      { text: "A frase 1 do refrão termina numa:", options: ["Cadência autêntica", "Meia-cadência (para no V)", "Cadência plagal"], correctIndex: 1 },
      { text: "A cadência que \"fecha\" (ponto final) é:", options: ["A → D", "E7 → A (autêntica)", "D → E"], correctIndex: 1 },
      { text: "Mesmo com o acorde de A no fim, a música soa \"não resolvida\" porque:", options: ["O baixista erra", "A MELODIA fecha no grau 5 (Mi), não na tônica", "O andamento cai"], correctIndex: 1 },
      { text: "Pensar a progressão como I–IV–V em vez de A–D–E serve para:", options: ["Tocar mais rápido", "Transpor a música para outro tom facilmente", "Nada, é igual"], correctIndex: 1 },
      { text: "Algumas versões trocam o D por:", options: ["Bm (ii)", "G (bVII)", "C#m (iii)"], correctIndex: 0 },
      { text: "Ouça: esta progressão termina resolvida (na tônica) ou aberta (na dominante)?", options: ["Resolvida", "Aberta"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=100\nK:A\n\"A\"[A,CE] \"D\"[D,FA] | \"E\"[E,GB]2 |" },
      { text: "Ouça: a cadência final é A→D→A ou E7→A?", options: ["A→D→A", "E7→A"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=100\nK:A\n\"D\"[D,FA] \"E7\"[E,GBd] | \"A\"[A,CE]2 |" },
    ],
    activities: [
      {
        title: "Tocar a progressão do refrão",
        instructions: "Toque no seu instrumento harmônico a progressão do refrão (as duas linhas), 4 tempos por acorde. Grave.",
        format: "audio",
      },
      {
        title: "Achar D e E de ouvido",
        instructions:
          "Ouça a música três vezes e, em texto, anote em que sílaba do refrão entra o D e em que " +
          "sílaba entra o E. Compare com o modelo desta aula.",
        format: "text",
      },
    ],
  },

  {
    title: "Aula 7 — Rearmonização: o arranjo de violão",
    sections: [
      {
        title: "O que é rearmonizar",
        markdown:
          "**Rearmonizar** é trocar os acordes que vão embaixo de uma melodia **sem mudar a " +
          "melodia**. A mesma linha do refrão que na Aula 6 andava em **A–D–E** pode ganhar acordes " +
          "\"mais coloridos\" — com sétima, com baixo caminhando por semitom, com um acorde de " +
          "passagem. O ouvido reconhece a música, mas ela soa \"mais trabalhada\". É o que o " +
          "**arranjo de violão** desta música faz.",
      },
      {
        title: "A progressão do arranjo de violão",
        markdown:
          "O arranjo (violão clássico, 8 compassos sobre o refrão) faz, um acorde por compasso:\n\n" +
          "`A(add9) → C#m7 → Dmaj7 → D#°7 →  A/F#m → F#m → Dmaj7 → Amaj7`\n\n" +
          "Duas ideias no comando:\n\n" +
          "- **Sétimas e cores:** o `D` vira **Dmaj7**, o final vira **Amaj7**, aparece um **C#m7** " +
          "onde antes era só A ou E. Mesma função, som mais \"aberto\".\n" +
          "- **Baixo cromático:** as notas graves sobem quase de semitom em semitom — **Lá → Dó♯ → " +
          "Ré → Ré♯ → (Mi) → Fá♯** — e o **Ré♯°7** é um **acorde de passagem** que só existe para " +
          "ligar o Ré ao Mi. É esse caminho do baixo que dá a sensação de \"arranjo\".",
      },
      {
        title: "Quando usar",
        markdown:
          "Este arranjo funciona bem como **interlúdio** — os 8 compassos tocados **sem canto**, " +
          "entre um refrão e outro, para \"respirar\" e preparar a volta. **Não** é a melhor escolha " +
          "para acompanhar a congregação cantando (os acordes com sétima e o baixo andando **tiram " +
          "firmeza** de quem canta de ouvido). Regra: **congregação cantando → harmonia simples da " +
          "Aula 6; instrumental sozinho → pode rearmonizar**.",
      },
    ],
    examples: [
      {
        title: "A rearmonização, com a melodia por cima — 80 BPM",
        caption:
          "A MESMA melodia do refrão (Aula 5), agora com os acordes do arranjo de violão. Ouça as " +
          "sétimas e o baixo caminhando. Comparação direta com a Aula 6.",
        abc:
          "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\n" +
          "z4 \"E\"A,2 B,2 | \"A\"CCC C2 B,A,E- | \"C#m7\"E4 z2 C E | \"Dmaj7\"FFF F2 E D A- | \"D#o7\"A4 z2 A B | \"A\"c2 c c \"F#m\"c d e A- | \"F#m\"A B c3 E A c | \"Dmaj7\"d d c A3 \"Amaj7\"F2 | \"Amaj7\"E8 |]\n" +
          "w: Je-sus Cris-to mu-dou meu vi-ver _ Je-sus Cris-to mu-dou meu vi-ver _ É a Luz que~i-lu-mi-na meu ser _ Sim, Je-sus Cris-to mu-dou meu vi-ver _\n",
      },
      {
        title: "Só os acordes do arranjo (tocável) — 80 BPM",
        caption: "Um acorde por compasso. Repare no baixo subindo Lá → Dó♯ → Ré → Ré♯ → Fá♯.",
        abc: "X:1\nM:4/4\nL:1/1\nQ:1/4=80\nK:A\n\"A(add9)\"[A,CEB] | \"C#m7\"[C,EGB] | \"Dmaj7\"[D,FAc] | \"D#o7\"[^D,FA=c] | \"F#m\"[F,Ac] | \"F#m\"[F,Ac] | \"Dmaj7\"[D,FAc] | \"Amaj7\"[A,C^GB] |",
      },
    ],
    quiz: [
      { text: "\"Rearmonizar\" é:", options: ["Mudar a melodia", "Trocar os acordes embaixo da melodia sem mudar a melodia", "Mudar a letra"], correctIndex: 1 },
      { text: "No arranjo de violão, o acorde de D vira:", options: ["Dm", "Dmaj7", "D7"], correctIndex: 1 },
      { text: "O baixo do arranjo, ao longo dos primeiros compassos:", options: ["Fica parado no Lá", "Sobe quase de semitom em semitom (Lá–Dó♯–Ré–Ré♯–Fá♯)", "Pula uma oitava"], correctIndex: 1 },
      { text: "O Ré♯°7 (D#°7) no arranjo é:", options: ["A tônica", "Um acorde de passagem, só para ligar o Ré ao Mi", "O acorde final"], correctIndex: 1 },
      { text: "A melodia, na rearmonização:", options: ["Muda junto com os acordes", "Continua exatamente a mesma", "Some"], correctIndex: 1 },
      { text: "O melhor uso deste arranjo é:", options: ["Acompanhar a congregação cantando", "Interlúdio instrumental, sem canto, entre refrões", "Substituir a melodia"], correctIndex: 1 },
      { text: "Por que ele NÃO é ideal para acompanhar quem canta de ouvido?", options: ["É muito alto", "As sétimas e o baixo andando tiram firmeza de quem canta", "É rápido demais"], correctIndex: 1 },
      { text: "A regra prática é:", options: ["Rearmonizar sempre", "Congregação cantando → harmonia simples; instrumental sozinho → pode rearmonizar", "Nunca usar sétimas"], correctIndex: 1 },
      { text: "O acorde final do arranjo é:", options: ["A (tríade simples)", "Amaj7", "E7"], correctIndex: 1 },
      { text: "Ouça as duas versões: qual soa \"mais trabalhada\"?", options: ["A primeira (tríades simples)", "A segunda (com sétimas e baixo caminhando)"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=80\nK:A\n\"A\"[A,CE] \"D\"[D,FA] | \"Dmaj7\"[D,FAc] \"Amaj7\"[A,C^GB] |" },
    ],
    activities: [
      {
        title: "Tocar as duas harmonias em sequência",
        instructions:
          "Grave: primeiro o refrão com a harmonia simples da Aula 6, depois o mesmo refrão com os " +
          "acordes do arranjo de violão. A melodia (cantada ou tocada) é a mesma nas duas.",
        format: "audio",
      },
      {
        title: "Marcar o baixo do arranjo",
        instructions:
          "Em texto: escreva a nota do BAIXO de cada um dos 8 compassos do arranjo (Lá, Dó♯, Ré, …) " +
          "e diga em que compasso está o acorde de passagem.",
        format: "text",
      },
    ],
  },

  {
    title: "Aula 8 — Ritmo harmônico e acompanhamento",
    sections: [
      {
        title: "Ritmo harmônico",
        markdown:
          "\"Ritmo harmônico\" é **a velocidade com que os acordes trocam**. Nesta música ele é " +
          "**lento e regular**: em geral **um acorde por compasso**, acelerando para **dois por " +
          "compasso** só nas cadências (o `D E7` antes do A). Ritmo harmônico lento = música " +
          "\"assentada\", fácil de acompanhar.",
      },
      {
        title: "A levada de acompanhamento",
        markdown:
          "Um padrão idiomático para 80 BPM, por compasso:\n\n" +
          "- **Baixo** (ou polegar do violão): a **fundamental do acorde no tempo 1**, às vezes a " +
          "**quinta no tempo 3** (\"baixo alternado\").\n" +
          "- **Harmonia:** acordes nas **colcheias dos tempos 2, 3 e 4**, deixando o tempo 1 " +
          "\"limpo\" para o baixo aparecer.\n" +
          "- **Síncope de acompanhamento:** antecipar o acorde do próximo compasso no \"e\" do tempo " +
          "4 — o empurrãozinho para frente característico do gênero.",
      },
      {
        title: "Piano e violão dividem funções",
        markdown:
          "Quando há os dois: o **violão** costuma segurar a levada rítmica (o \"motorzinho\" de " +
          "colcheias) e o **piano** faz notas mais longas, contracantos nos vãos da melodia e " +
          "reforça as cadências. Tocar tudo junto, os dois cheios, \"engorda\" e tira espaço da voz " +
          "— sobretudo com cantores mais velhos, que precisam de espaço para respirar.",
      },
    ],
    examples: [
      {
        title: "Levada de acompanhamento (representada) — 80 BPM",
        caption: "Baixo (nota grave) no tempo 1, acordes nas colcheias 2–3–4. No 2º compasso, o acorde seguinte é antecipado no \"e\" do 4.",
        abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\nV:1\nV:2\n[V:1] z2 [CE]2 [CE][CE] [CE]2 | z2 [CE]2 [CE][CE] [CE][CE] |\n[V:2] A,4 E,4 | A,4 E,4 |",
      },
    ],
    quiz: [
      { text: "\"Ritmo harmônico\" é:", options: ["A velocidade da melodia", "A velocidade com que os acordes trocam", "O andamento da bateria"], correctIndex: 1 },
      { text: "Nesta música, o ritmo harmônico é em geral:", options: ["Um acorde por compasso", "Um acorde por tempo", "Dois acordes por tempo"], correctIndex: 0 },
      { text: "Ele acelera para dois acordes por compasso:", options: ["Na introdução", "Só nas cadências (o D E7 antes do A)", "O tempo todo"], correctIndex: 1 },
      { text: "Ritmo harmônico lento deixa a música:", options: ["Agitada", "\"Assentada\", fácil de acompanhar", "Difícil de cantar"], correctIndex: 1 },
      { text: "Na levada, o tempo 1 costuma ser reservado para:", options: ["Os acordes cheios", "O baixo (fundamental do acorde)", "Uma pausa total"], correctIndex: 1 },
      { text: "\"Baixo alternado\" é o baixo tocando:", options: ["Só a fundamental o tempo todo", "Fundamental no 1 e quinta no 3", "Notas aleatórias"], correctIndex: 1 },
      { text: "\"Síncope de acompanhamento\" é:", options: ["Parar de tocar no meio", "Antecipar o acorde do próximo compasso no \"e\" do tempo 4", "Tocar mais devagar"], correctIndex: 1 },
      { text: "Com piano e violão juntos, o violão costuma:", options: ["Fazer notas longas e contracantos", "Segurar a levada rítmica de colcheias", "Ficar em silêncio"], correctIndex: 1 },
      { text: "Tocar piano e violão os dois cheios, com cantores mais velhos:", options: ["Ajuda a voz", "Tira espaço da voz para respirar", "Não faz diferença"], correctIndex: 1 },
      { text: "Ouça a levada: o baixo aparece mais no tempo 1 ou no tempo 4?", options: ["No tempo 1", "No tempo 4"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/8\nK:A\nA,4 z2 [CE]2 | A,4 z2 [CE]2 |" },
    ],
    activities: [
      {
        title: "Gravar 8 compassos de acompanhamento",
        instructions:
          "Grave 8 compassos de acompanhamento do refrão no seu instrumento harmônico, aplicando: " +
          "baixo no tempo 1, acordes nas colcheias, e pelo menos uma antecipação sincopada na quebra " +
          "de frase.",
        format: "audio",
      },
      {
        title: "Descrever a divisão piano/violão",
        instructions:
          "Em texto: se você tivesse piano e violão juntos nesta música, o que cada um faria em cada " +
          "parte (interlúdio, estrofe, refrão)? Onde cada um \"abre espaço\" para a voz?",
        format: "text",
      },
    ],
  },

  {
    title: "Aula 9 — Criando vozes (harmonia vocal)",
    sections: [
      {
        title: "A segunda voz por terças e sextas",
        markdown:
          "O jeito mais direto de harmonizar uma melodia é cantar uma **terça abaixo** dela, usando " +
          "**só notas da escala de Lá maior** (por isso a terça às vezes é maior, às vezes menor — o " +
          "ouvido aceita, porque tudo pertence ao tom). Onde a terça abaixo soa \"apertada\" ou sai " +
          "do âmbito confortável, troca-se por uma **sexta abaixo**. A 2ª voz assim **acompanha o " +
          "contorno** da melodia.\n\n" +
          "Abaixo, a frase \"É a Luz que ilumina meu ser\": primeiro as **duas vozes juntas** (só pra " +
          "ouvir), depois **cada voz separada** pra você cantar junto.",
        blocks: [
          {
            kind: "notation",
            abc:
              "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\nV:1 name=\"Melodia\"\nV:2 name=\"2a voz\"\n" +
              "[V:1] z4 z2 A B | c2 c c c d e A2 |\n" +
              "[V:2] z4 z2 F ^G | A2 A A A B c F2 |\n" +
              "w: É a Luz que~i-lu-mi-na meu ser\n",
            caption: "As duas vozes juntas — alterne \"Tudo\" / \"Melodia\" / \"2a voz\" no botão Ouvir.",
            allowSingAlong: false,
          },
          {
            kind: "notation",
            abc:
              "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\n" +
              "z4 z2 A B | c2 c c c d e A2 |\n" +
              "w: É a Luz que~i-lu-mi-na meu ser\n",
            caption: "Cante a MELODIA (voz de cima).",
            allowSingAlong: true,
          },
          {
            kind: "notation",
            abc:
              "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\n" +
              "z4 z2 F ^G | A2 A A A B c F2 |\n" +
              "w: É a Luz que~i-lu-mi-na meu ser\n",
            caption: "Cante a 2ª VOZ (uma terça abaixo da melodia).",
            allowSingAlong: true,
          },
        ],
      },
      {
        title: "Quando NÃO andar em paralelo",
        markdown:
          "Dois cuidados que separam um arranjo amador de um bom:\n\n" +
          "- **Nas cadências**, em vez de seguir a melodia em paralelo, a 2ª voz faz **movimento " +
          "contrário** ou **nota comum** — a melodia desce e a 2ª voz **fica parada** ou **sobe**. " +
          "Isso faz o acorde final \"fechar\" de verdade.\n" +
          "- **Evite as duas vozes na mesma nota** (uníssono) por muito tempo — perde-se o efeito de " +
          "harmonia.",
        blocks: [
          {
            kind: "notation",
            abc:
              "X:1\nM:4/4\nL:1/4\nQ:1/4=80\nK:A\nV:1 name=\"Melodia\"\nV:2 name=\"2a voz\"\n" +
              "[V:1] \"E7\"c B \"A\"A2 |\n[V:2] \"E7\"G, A, \"A\"C2 |\n",
            caption: "Movimento contrário na cadência: a melodia desce até o Lá, a 2ª voz sobe — o acorde \"fecha\".",
            allowSingAlong: false,
          },
        ],
      },
      {
        title: "A terceira voz e o âmbito",
        markdown:
          "Uma **3ª voz** costuma fazer as **fundamentais dos acordes** (quase um baixo cantado): " +
          "sobre A canta Lá, sobre D canta Ré, sobre E canta Mi. É a voz mais fácil de decorar e a " +
          "que mais \"assenta\" o conjunto.\n\n" +
          "Para grupos com **vozes mais velhas**: se o pico (o Mi agudo do \"É a Luz\") aperta, a " +
          "primeira solução é **baixar o tom da música inteira** (de Lá para Sol ou Fá), não " +
          "empurrar ninguém para o agudo.",
      },
    ],
    quiz: [
      { text: "A forma mais direta de criar uma 2ª voz é cantar, usando só notas do tom:", options: ["Uma oitava abaixo", "Uma terça (ou sexta) abaixo, acompanhando o contorno", "A mesma nota"], correctIndex: 1 },
      { text: "A 2ª voz por terças usa terças \"às vezes maiores, às vezes menores\" porque:", options: ["É um erro comum", "Todas as notas pertencem à escala do tom", "A melodia muda de tom o tempo todo"], correctIndex: 1 },
      { text: "Onde a terça abaixo fica \"apertada\", troca-se por:", options: ["Uma segunda abaixo", "Uma sexta abaixo", "Uníssono"], correctIndex: 1 },
      { text: "Nas cadências, é melhor a 2ª voz:", options: ["Seguir a melodia em paralelo", "Fazer nota comum ou movimento contrário", "Parar de cantar"], correctIndex: 1 },
      { text: "Duas vozes na mesma nota por muito tempo:", options: ["É o ideal", "Perde o efeito de harmonia (soa uníssono)", "Cria um acorde de sétima"], correctIndex: 1 },
      { text: "\"Movimento contrário\" na cadência é:", options: ["As duas vozes descem juntas", "Uma sobe enquanto a outra desce", "As duas ficam paradas"], correctIndex: 1 },
      { text: "A 3ª voz (\"baixo vocal\") normalmente canta:", options: ["A melodia uma oitava abaixo", "As fundamentais dos acordes", "Notas aleatórias graves"], correctIndex: 1 },
      { text: "Por que a 3ª voz é a mais fácil de decorar?", options: ["Só muda quando o acorde muda", "Canta a melodia toda", "Não tem letra"], correctIndex: 0 },
      { text: "Se o pico (Mi agudo do \"É a Luz\") aperta o grupo, a primeira solução é:", options: ["Gritar mais", "Baixar o tom da música toda", "Cortar a frase 3"], correctIndex: 1 },
      { text: "Ouça melodia + 2ª voz: a 2ª voz está acima ou abaixo da melodia?", options: ["Acima", "Abaixo"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=80\nK:A\nV:1\nV:2\n[V:1] e e c A |\n[V:2] c c A F |" },
    ],
    activities: [
      {
        title: "Cantar a 2ª voz do trecho",
        instructions:
          "Cante a 2ª voz do trecho do refrão junto de uma gravação da melodia (\"Cantar junto\", " +
          "comparando com a voz 2). Onde ela \"brigar\" com a melodia, anote o compasso e proponha " +
          "uma correção.",
        format: "audio",
      },
      {
        title: "Escrever a 3ª voz",
        instructions:
          "Em texto: escreva a linha da 3ª voz (baixo vocal) para o refrão — só as fundamentais dos " +
          "acordes, um valor por acorde, seguindo a progressão da Aula 6.",
        format: "text",
      },
    ],
  },

  {
    title: "Aula 10 — Arranjo: juntando tudo",
    sections: [
      {
        title: "A forma completa com as repetições",
        markdown:
          "A música tem três blocos de letra (Aula 2) sobre a mesma ideia melódica. Um mapa de " +
          "trabalho, com as repetições:\n\n" +
          "`Interlúdio de violão (8) – Estrofe (…) – Refrão A (9) – Refrão A (9) – Interlúdio de " +
          "violão (8) – Refrão B (9) – Refrão B (9) – PARADA (1–2 tempos) – Refrão A final (9) – " +
          "Final (fermata)`\n\n" +
          "- **Interlúdio:** os 8 compassos do arranjo de violão (Aula 7), sem canto — abre e " +
          "\"respira\" entre os blocos.\n" +
          "- Cada **Refrão** é cantado **duas vezes** seguidas (é curto).\n" +
          "- **Parada:** a banda toda para, sobra a voz (ou um prato), e volta no Refrão A final com " +
          "tudo. É o clímax.\n" +
          "- **Final:** último `E7 → A`, o A com **fermata** e um pequeno **ritardando** no compasso " +
          "anterior.",
      },
      {
        title: "Dinâmica e quem entra quando",
        markdown:
          "- **Interlúdio inicial:** só violão (arranjo rearmonizado). Sem bateria, ou chimbal " +
          "discreto.\n" +
          "- **Estrofe:** voz + violão + baixo leve. Bateria contida (levada de estrofe). 2ª voz " +
          "**não** entra.\n" +
          "- **Refrão A (1ª vez):** entra a bateria cheia (groove funk) e a **2ª voz**.\n" +
          "- **Refrão B:** mantém tudo; o piano faz contracanto nos vãos.\n" +
          "- **Refrão A final:** tudo, 3ª voz inclusa se houver — o pico da música.\n\n" +
          "**Regra de ouro:** deixar **um elemento novo entrar a cada parte** dá sensação de a " +
          "música \"crescer\" sem tocar mais alto o tempo todo.",
      },
      {
        title: "O mapa numa página",
        markdown:
          "Escreva o arranjo como uma **tabela** que a banda inteira lê de relance: uma coluna por " +
          "parte, uma linha por instrumento/voz, a célula dizendo o que cada um faz (ou \"—\" para " +
          "\"não toca\"). É esse documento que faz um ensaio render.",
      },
    ],
    examples: [
      {
        title: "Interlúdio de violão (acordes) — 80 BPM",
        caption: "Os 8 compassos do arranjo rearmonizado (Aula 7), tocados sem canto entre os blocos.",
        abc: "X:1\nM:4/4\nL:1/1\nQ:1/4=80\nK:A\n\"A(add9)\"[A,CEB] | \"C#m7\"[C,EGB] | \"Dmaj7\"[D,FAc] | \"D#o7\"[^D,FA=c] | \"F#m\"[F,Ac] | \"F#m\"[F,Ac] | \"Dmaj7\"[D,FAc] | \"Amaj7\"[A,C^GB] |",
      },
    ],
    quiz: [
      { text: "O interlúdio de violão, no arranjo, é:", options: ["Um solo de bateria", "Os 8 compassos do arranjo rearmonizado, sem canto, entre os blocos", "A introdução cantada"], correctIndex: 1 },
      { text: "Cada refrão, no mapa de trabalho, é cantado:", options: ["Uma vez", "Duas vezes seguidas", "Cinco vezes"], correctIndex: 1 },
      { text: "A \"parada\" antes do refrão final é:", options: ["A banda toda parando 1–2 tempos e voltando com tudo", "Um erro de ensaio", "O fim da música"], correctIndex: 0 },
      { text: "No final, o acorde de A leva:", options: ["Um staccato curto", "Uma fermata, com ritardando no compasso anterior", "Uma síncope"], correctIndex: 1 },
      { text: "Na Estrofe, a 2ª voz:", options: ["Já entra desde o começo", "Não entra ainda", "Substitui a melodia"], correctIndex: 1 },
      { text: "A 2ª voz normalmente entra:", options: ["No interlúdio inicial", "No primeiro Refrão A", "Só no final"], correctIndex: 1 },
      { text: "A \"regra de ouro\" da dinâmica é:", options: ["Tocar tudo forte desde o início", "Deixar um elemento novo entrar a cada parte", "Nunca mudar nada"], correctIndex: 1 },
      { text: "Refrão A e Refrão B, na melodia:", options: ["São linhas diferentes", "São a mesma linha, só muda a letra", "Um é instrumental"], correctIndex: 1 },
      { text: "O mapa de arranjo serve para:", options: ["Impressionar a plateia", "A banda inteira ler de relance quem faz o quê em cada parte", "Cronometrar a música"], correctIndex: 1 },
      { text: "Ouça a frase 3 do refrão: ela sobe ao agudo (o pico) ou fica na região grave?", options: ["Sobe ao agudo (pico)", "Fica grave"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\nz4 z2 A B | cccc de A2 |" },
    ],
    activities: [
      {
        title: "Gravar a música inteira (entrega principal)",
        instructions:
          "Grave a música inteira no seu formato (voz + um instrumento no mínimo), seguindo o seu " +
          "mapa: interlúdio de violão, estrofe contida, refrões (cada um 2×), a parada antes do " +
          "refrão final e o final com fermata. Anexe o mapa de arranjo escrito (foto ou texto).",
        format: "audio",
      },
      {
        title: "Escrever o mapa de arranjo",
        instructions:
          "Em texto: monte a tabela do arranjo — uma coluna por parte (Interlúdio, Estrofe, Refrão A, " +
          "Refrão A, Interlúdio, Refrão B, Refrão B, Parada, Refrão A final, Final) e uma linha por " +
          "elemento (Voz, 2ª voz, 3ª voz, Violão, Baixo, Bateria, Piano). Preencha o que cada um " +
          "faz, ou \"—\".",
        format: "text",
      },
    ],
  },
];
