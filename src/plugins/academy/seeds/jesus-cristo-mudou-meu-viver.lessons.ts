import type { SeedLesson } from "./shared/course-builder";

// Conteúdo (dados puros) do seed "jesus-cristo-mudou-meu-viver" — separado do runner pra poder
// ser importado por testes sem a cadeia de services/next-auth. Fonte completa em
// docs/curso-jesus-cristo-mudou-meu-viver.md.

export const MUSICA_LESSONS: SeedLesson[] = [
  {
    title: "Aula 1 — A origem da música",
    sections: [
      {
        title: "De onde vêm os corinhos de avivamento",
        markdown:
          "\"Jesus Cristo mudou meu viver\" pertence à família dos **corinhos** — cânticos curtos, de " +
          "melodia simples e âmbito pequeno, criados para serem aprendidos **de ouvido, na hora**, em " +
          "cultos e reuniões de avivamento no Brasil ao longo do século XX. Não têm autor único " +
          "documentado na maioria dos casos: circulam, são adaptados, mudam de tom e de letra conforme a " +
          "região e a denominação.\n\n" +
          "Três características típicas do corinho, todas aqui: **âmbito curto** (a melodia cabe folgada " +
          "em qualquer voz — cerca de uma sexta), **frases curtas e simétricas** (trechos de 2 e 4 " +
          "compassos que se respondem), e **ritmo declamatório** (a melodia acompanha de perto a fala do texto).",
      },
      {
        title: "O texto e seu sentido",
        markdown:
          "A letra é um **testemunho na primeira pessoa**: afirma uma transformação (\"mudou meu viver\") " +
          "e seus efeitos (\"gozo\", \"paz\"). A forma do texto — uma afirmação inicial que se desdobra e " +
          "depois retorna — é o que a forma musical vai espelhar: estrofe que \"conta\", refrão que " +
          "\"confirma\".\n\n" +
          "**Confirme a letra exata da sua edição** e anote-a como material da aula, junto com a(s) " +
          "gravação(ões) de referência.",
      },
    ],
    activity: {
      title: "Comparar duas versões",
      instructions:
        "Ouça duas versões diferentes da música (a sua de referência e outra, de outra igreja/época). " +
        "Anote três diferenças que você percebeu (andamento, tom, levada, letra, número de repetições).",
      format: "none",
    },
  },
  {
    title: "Aula 2 — Andamento e caráter",
    sections: [
      {
        title: "Definir o BPM",
        markdown:
          "Nas versões mais comuns, a música anda por volta de **92 a 100 BPM** — um andamento " +
          "**moderado, marcado**, que dá para bater palma confortavelmente em todos os tempos. Não é " +
          "balada (ficaria arrastada) nem corrido (perderia a solenidade). Vamos usar **96 BPM** como " +
          "referência de trabalho.\n\n" +
          "Antes de começar, quem conduz dá **um compasso de contagem** no andamento exato. Se a música " +
          "começa com **anacruse** (uma ou duas notas antes do primeiro tempo forte — o \"Je-\" de " +
          "\"Jesus\" caindo antes do 1), a contagem precisa deixar espaço para essa entrada.",
      },
      {
        title: "O andamento muda a sensação",
        markdown:
          "Cante a primeira frase a **80 BPM**, depois a **96**, depois a **112**. A 80 ela soa " +
          "reflexiva; a 96, firme e celebrativa; a 112 começa a soar apressada, \"sem deixar a palavra " +
          "respirar\". A escolha do andamento **é uma decisão de interpretação**.",
        blocks: [
          {
            kind: "notation",
            abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:A\nz2 E2 A2 A2 | B2 A2 A4 |\nw: * Je-sus Cris-to mu-dou\n",
            caption: "Modelo: anacruse de duas colcheias — \"Je-sus\" entrando antes do tempo 1. Ajuste à sua referência.",
          },
        ],
      },
    ],
    activity: {
      title: "Cantar a primeira frase no tempo",
      instructions: "Cante a primeira frase da música junto do metrônomo a 96 BPM, entrando na anacruse depois da contagem. Grave.",
      format: "audio",
    },
  },
  {
    title: "Aula 3 — A bateria e o groove",
    sections: [
      {
        title: "A levada base",
        markdown:
          "Numa levada moderada de louvor: o **chimbal** toca colcheias contínuas (o \"relógio\" da " +
          "banda); a **caixa** faz o **backbeat**, nos tempos **2 e 4** (é o que a congregação imita " +
          "batendo palma); o **bumbo** marca o tempo **1** sempre, mais um reforço perto do tempo **3** " +
          "(muitas vezes uma antecipação sincopada).",
      },
      {
        title: "Como a bateria conduz a forma",
        markdown:
          "A bateria **não toca igual o tempo todo** — ela é o principal sinalizador das partes:\n\n" +
          "- **Estrofe:** mais contida (às vezes só chimbal e bumbo).\n" +
          "- **Virada de 1 compasso** na passagem estrofe → refrão: anuncia a chegada.\n" +
          "- **Refrão:** cheio — chimbal **aberto** no tempo 1, caixa forte em 2 e 4, bumbo mais denso.\n" +
          "- **A \"parada\" antes do último refrão:** a banda inteira para por 1 ou 2 tempos e volta com " +
          "tudo. É o momento mais dramático do arranjo.\n\n" +
          "O que faz um groove \"gostoso\" é a **constância** (chimbal e backbeat que não falham) somada " +
          "a pequenas **respirações** (a virada, uma síncope de bumbo, o prato que abre).",
      },
    ],
    quiz: [
      { text: "Numa levada com backbeat, a caixa está tocando em:", options: ["1 e 3", "2 e 4", "Todos os tempos"], correctIndex: 1 },
      { text: "A peça que mantém as colcheias correndo o tempo todo é:", options: ["O bumbo", "A caixa", "O chimbal"], correctIndex: 2 },
      { text: "O que a banda faz antes do último refrão, no arranjo desta música?", options: ["Acelera", "Para por um ou dois tempos e volta com tudo", "Muda de tom"], correctIndex: 1 },
    ],
    activity: {
      title: "Bater o backbeat",
      instructions:
        "Com a gravação tocando: marque os tempos com o pé e bata palma no backbeat (2 e 4) por toda uma " +
        "estrofe e um refrão sem errar. Descreva o que a bateria faz de diferente na passagem da estrofe " +
        "para o refrão.",
      format: "none",
    },
  },
  {
    title: "Aula 4 — A melodia, frase a frase",
    sections: [
      {
        title: "Âmbito e movimento",
        markdown:
          "A melodia se move dentro de um espaço pequeno — cerca de uma **sexta**, da tônica **Lá** até " +
          "o **Fá#** (grau 6), com passagens rápidas ao **Mi** (grau 5). Quase todo o movimento é por " +
          "**graus conjuntos** (nota vizinha), com poucos saltos — o maior é normalmente de **quarta**, " +
          "aquele som \"de hino\".\n\n" +
          "A estrofe se organiza em **duas frases de 4 compassos** que funcionam como **pergunta (A) e " +
          "resposta (A')**: a primeira \"abre\" (para numa nota que não é a tônica, sobre a dominante), a " +
          "segunda \"fecha\" (desce até o grau 1). Entre uma frase e outra há uma **respiração**.",
      },
      {
        title: "O pico do refrão",
        markdown:
          "O refrão sobe: a nota mais aguda da música inteira costuma cair **no primeiro ou segundo " +
          "compasso do refrão**, num tempo forte, sobre a palavra mais importante do texto. Depois disso " +
          "a melodia **desce gradualmente** de volta para a tônica. Esse arco — sobe, atinge o pico cedo, " +
          "desce devagar — é o desenho melódico mais comum de refrão.",
        blocks: [
          {
            kind: "notation",
            abc:
              "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:A\n" +
              "z2 \"A\"E2 A2 A2 | \"D\"B2 A2 F,4 | \"A\"E2 A2 A2 B2 | \"E7\"c2 B2 A4 |\n" +
              "w: * Je-sus Cris-to mu-dou meu vi-ver, mui-to go-zo_a mi-nh'al-ma tem\n",
            caption: "Modelo de contorno da estrofe, com letra. Ajuste ritmo e alturas à sua gravação — o que deve permanecer: anacruse, graus conjuntos, frase 1 \"aberta\", frase 2 no grau 1.",
          },
        ],
      },
    ],
    activity: {
      title: "Cantar a estrofe",
      instructions: "Cante a estrofe inteira junto do modelo (Cantar junto). Depois cante só o refrão, prestando atenção em onde está o pico e respirando nos mesmos lugares.",
      format: "audio",
    },
  },
  {
    title: "Aula 5 — A harmonia: como é criada",
    sections: [
      {
        title: "Os acordes da casa",
        markdown:
          "A música usa quase só o **campo harmônico de Lá maior**: **A (I)**, **D (IV)**, **E / E7 (V)** " +
          "e o **F#m (vi)** para dar cor. Nada fora disso.\n\n" +
          "Progressão típica da **estrofe** (8 compassos): `| A | A | D | E |  | A | D | E7 | A |` → " +
          "funções **I – I – IV – V** (frase 1, meia-cadência: para na tensão); **I – IV – V7 – I** " +
          "(frase 2, cadência autêntica: resolve).\n\n" +
          "Progressão típica do **refrão**: `| A | F#m | D | E |  | A | F#m | D E7 | A |` → **I – vi – IV – " +
          "V** repetido, com o F#m dando o contraste \"mais sentido\" logo depois do pico melódico. " +
          "**Confirme contra a sua gravação** — algumas versões trocam o primeiro D por Bm.",
      },
      {
        title: "Onde a música respira e resolve",
        markdown:
          "Toda quebra de frase é uma **cadência**. Fim da frase 1 da estrofe = **no E** (meia-cadência, " +
          "a \"vírgula\" — por isso a música \"quer continuar\"). Fim da frase 2 e fim do refrão = " +
          "**E7 → A** (autêntica, o \"ponto final\"). Sem o E7 puxando, o fim soaria frouxo.",
        blocks: [
          { kind: "progression", chords: "A A D E A D E7:2 A:2", key: "A", bpm: 96, caption: "Progressão da estrofe (8 compassos). Ouça o D \"abrir\", o E \"apertar\", o A \"resolver\"." },
        ],
      },
    ],
    quiz: [
      { text: "Os acordes principais da música, em Lá maior, são:", options: ["A–B–C#–D", "A (I), D (IV), E (V), F#m (vi)", "Qualquer acorde"], correctIndex: 1 },
      { text: "No fim da primeira frase da estrofe, a harmonia para no:", options: ["I", "IV", "V (meia-cadência)"], correctIndex: 2 },
      { text: "O F#m (vi) no refrão serve para:", options: ["Mudar de tom", "Dar um contraste \"mais sentido\" depois do pico", "Marcar o fim"], correctIndex: 1 },
    ],
    activity: {
      title: "Tocar a progressão da estrofe",
      instructions: "Toque no seu instrumento harmônico a progressão da estrofe (8 compassos), 2 batidas por acorde. Ou, se preferir: ouça a música três vezes e anote em que compasso entram o D e o E.",
      format: "audio",
    },
  },
  {
    title: "Aula 6 — Ritmo harmônico e acompanhamento",
    sections: [
      {
        title: "Quanto cada acorde dura",
        markdown:
          "\"Ritmo harmônico\" é a velocidade com que os acordes trocam. Nesta música ele é **lento e " +
          "regular**: em geral **um acorde por compasso** (quatro tempos), acelerando para dois por " +
          "compasso só nas cadências (o `D E7` antes do A final). Ritmo harmônico lento = música " +
          "\"assentada\", fácil de acompanhar.",
      },
      {
        title: "A levada de acompanhamento",
        markdown:
          "Um padrão idiomático para 96 BPM, por compasso: **baixo** (ou polegar do violão) toca a " +
          "**fundamental do acorde no tempo 1**, às vezes a quinta no tempo 3; a **harmonia** entra nas " +
          "colcheias dos tempos 2, 3 e 4. **Antecipar** o acorde do próximo compasso no \"e\" do tempo 4 " +
          "dá o empurrãozinho para frente característico do gênero.\n\n" +
          "Quando há piano e violão juntos: o violão segura a levada rítmica (o \"motorzinho\" de " +
          "colcheias) e o piano faz notas mais longas e contracantos nos vãos da melodia. Tocar tudo " +
          "cheio tira espaço da voz — sobretudo com cantores mais velhos.",
      },
    ],
    activity: {
      title: "Gravar 8 compassos de acompanhamento",
      instructions:
        "Grave 8 compassos de acompanhamento da estrofe no seu instrumento harmônico, aplicando: baixo no " +
        "tempo 1, acordes nas colcheias, e pelo menos uma antecipação sincopada na quebra de frase.",
      format: "audio",
    },
  },
  {
    title: "Aula 7 — Criando vozes (harmonia vocal)",
    sections: [
      {
        title: "A segunda voz por terças e sextas",
        markdown:
          "O jeito mais direto de harmonizar uma melodia é cantar uma **terça abaixo** dela, usando **só " +
          "notas da escala de Lá maior** (por isso a terça às vezes é maior, às vezes menor — o ouvido " +
          "aceita, porque tudo pertence ao tom). Onde a terça abaixo soa apertada ou sai do âmbito " +
          "confortável, troca-se por uma **sexta abaixo** (a mesma nota uma oitava acima — \"abre\" o acorde).\n\n" +
          "Dois cuidados que separam um arranjo amador de um bom: **nas cadências**, deixe a 2ª voz fazer " +
          "**movimento contrário** ou **nota comum** em vez de seguir em paralelo; e **evite as duas " +
          "vozes na mesma nota** (uníssono) por muito tempo.",
      },
      {
        title: "A terceira voz e o âmbito",
        markdown:
          "Uma **3ª voz** costuma fazer as **fundamentais dos acordes** (quase um baixo cantado): sobre A " +
          "canta Lá, sobre D canta Ré, sobre E canta Mi. É a voz mais fácil de decorar e a que mais " +
          "\"assenta\" o conjunto.\n\n" +
          "Para grupos com **vozes mais velhas**: não empurre ninguém para o agudo. Muitas vezes vale " +
          "**baixar o tom da música inteira** (de Lá para Sol ou Fá) antes de brigar com o âmbito.",
        blocks: [
          {
            kind: "notation",
            abc:
              "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:A\nV:1 name=\"Melodia\"\nV:2 name=\"2a voz\"\n" +
              "[V:1] \"A\"e2 e2 c2 A2 | \"F#m\"B2 A2 F4 |\n" +
              "[V:2] \"A\"c2 c2 A2 F2 | \"F#m\"A2 F2 D4 |\n",
            caption: "Modelo do refrão: 2ª voz correndo uma 3ª/6ª abaixo. No compasso da cadência as duas descem, mas a 2ª voz para no Ré. Ajuste letra e alturas à sua referência.",
            allowSingAlong: true,
          },
        ],
      },
    ],
    quiz: [
      { text: "A forma mais direta de criar uma 2ª voz é cantar, usando só notas do tom:", options: ["Uma oitava abaixo", "Uma terça (ou sexta) abaixo, acompanhando o contorno", "A mesma nota"], correctIndex: 1 },
      { text: "Nas cadências, é melhor a 2ª voz:", options: ["Seguir a melodia em paralelo", "Fazer nota comum ou movimento contrário", "Parar de cantar"], correctIndex: 1 },
      { text: "Com um grupo de vozes mais velhas, se o refrão está agudo demais, a primeira solução é:", options: ["Gritar mais", "Baixar o tom da música toda", "Cortar o refrão"], correctIndex: 1 },
    ],
    activity: {
      title: "Cantar a 2ª voz do refrão",
      instructions:
        "Cante a 2ª voz do refrão junto de uma gravação da melodia. Onde a 2ª voz \"brigar\" com a melodia " +
        "(uníssono longo ou nota fora do âmbito), anote o compasso e proponha uma correção.",
      format: "audio",
    },
  },
  {
    title: "Aula 8 — Arranjo: juntando tudo",
    sections: [
      {
        title: "A forma completa",
        markdown:
          "Um arranjo de trabalho: **Intro (4) – Estrofe 1 (8) – Refrão (8) – Estrofe 2 (8) – Refrão (8) " +
          "– PARADA (1–2 tempos) – Refrão final (8) – Final (2)**.\n\n" +
          "- **Introdução:** os 4 últimos compassos da melodia sem canto, ou um *vamp* de `A | E | A | E`.\n" +
          "- **Parada:** a banda toda para, sobra só a voz, e volta no refrão final com dinâmica máxima.\n" +
          "- **Final:** último `E7 → A`, o A com **fermata**, muitas vezes com um pequeno **ritardando** " +
          "no compasso anterior.",
      },
      {
        title: "Dinâmica e quem entra quando",
        markdown:
          "- **Estrofe 1:** voz + violão + baixo leve. Bateria contida. 2ª voz **não** entra ainda.\n" +
          "- **Refrão (1ª vez):** entra a bateria cheia, entra a **2ª voz**, o piano faz contracanto.\n" +
          "- **Estrofe 2:** pode manter a bateria — cresce em direção ao final.\n" +
          "- **Refrão final:** tudo, 3ª voz inclusa se houver.\n\n" +
          "**Regra de ouro:** deixar **um elemento novo entrar a cada parte** dá sensação de a música " +
          "\"crescer\" sem precisar tocar mais alto o tempo todo.",
        blocks: [
          {
            kind: "notation",
            abc:
              "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:A\nV:1 name=\"Melodia\"\nV:2 name=\"2a voz\"\n" +
              "[V:1] \"A\"e2 e2 c2 A2 | \"F#m\"B2 A2 F4 | \"D\"A2 B2 c2 A2 | \"E7\"B2 c2 B4 |\n" +
              "w: Je-sus mu-dou, trans-for-mou o meu ser,\n" +
              "[V:2] \"A\"c2 c2 A2 F2 | \"F#m\"A2 F2 D4 | \"D\"F2 G2 A2 F2 | \"E7\"G2 A2 G4 |\n",
            caption: "Modelo do refrão com as duas vozes e a letra — confira letra e alturas contra a sua referência.",
          },
        ],
      },
    ],
    activity: {
      title: "Gravar a música inteira (entrega final)",
      instructions:
        "Grave a música inteira no seu formato (voz + um instrumento no mínimo), seguindo o seu mapa de " +
        "arranjo: intro, dinâmica crescendo por parte, a parada antes do último refrão, e o final com " +
        "fermata. Anexe também o mapa de arranjo escrito. O professor devolve com nota e comentários.",
      format: "audio",
    },
  },
];
