import type { SeedLesson } from "./shared/course-builder";

// Conteúdo (dados puros) do seed "jesus-cristo-mudou-meu-viver" — separado do runner pra poder
// ser importado por testes sem a cadeia de services/next-auth. Fonte completa em
// docs/curso-jesus-cristo-mudou-meu-viver.md. A melodia/2ª voz nos exemplos são um MODELO
// plausível em Lá maior; o dono ajusta contra a própria gravação de referência (Aula 1). Cada
// aula: 2–3 seções, exemplos de partitura, 2 atividades e uma avaliação de 10 perguntas.

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
          "documentado na maioria dos casos: circulam, são adaptados, mudam de tom e de letra " +
          "conforme a região e a denominação.",
      },
      {
        title: "Por que é fácil de cantar em grupo",
        markdown:
          "Três características típicas do corinho, todas aqui:\n\n" +
          "- **Âmbito curto:** a melodia cabe folgada na voz de qualquer pessoa (aqui, cerca de uma " +
          "sexta — da tônica Lá até o Fá#/Mi da região média).\n" +
          "- **Frases curtas e simétricas:** trechos de 2 e 4 compassos que respondem uns aos outros " +
          "(pergunta-e-resposta, A–A').\n" +
          "- **Ritmo declamatório:** a melodia acompanha de perto o ritmo natural da fala do texto.",
      },
      {
        title: "O texto e seu sentido",
        markdown:
          "A letra é um **testemunho na primeira pessoa**: afirma uma transformação (\"mudou meu " +
          "viver\") e seus efeitos (\"gozo\", \"paz\"). A forma do texto — uma afirmação inicial que " +
          "se desdobra e depois retorna — é o que a forma musical vai espelhar: **estrofe que " +
          "\"conta\", refrão que \"confirma\"**. Confirme a letra exata da sua edição e anote-a como " +
          "material da aula.",
      },
    ],
    quiz: [
      { text: "Um \"corinho\" de avivamento é, tipicamente:", options: ["Uma peça longa e complexa", "Um cântico curto, simples, aprendido de ouvido", "Uma obra instrumental"], correctIndex: 1 },
      { text: "A maioria dos corinhos brasileiros:", options: ["Tem autor e data bem documentados", "Circula de forma oral, com variações regionais", "Foi escrita por um único compositor"], correctIndex: 1 },
      { text: "\"Âmbito curto\" da melodia significa que ela:", options: ["Dura pouco tempo", "Cabe numa distância pequena entre a nota mais grave e a mais aguda", "Usa poucos acordes"], correctIndex: 1 },
      { text: "O âmbito aproximado desta música é de:", options: ["Uma terça", "Uma sexta", "Duas oitavas"], correctIndex: 1 },
      { text: "\"Frases simétricas A–A'\" quer dizer que:", options: ["As duas frases são idênticas", "Começam parecidas e terminam diferente (pergunta e resposta)", "A segunda é o dobro da primeira"], correctIndex: 1 },
      { text: "\"Ritmo declamatório\" significa que a melodia:", options: ["É toda sincopada", "Segue de perto o ritmo natural da fala do texto", "Não tem ritmo definido"], correctIndex: 1 },
      { text: "A forma do TEXTO (afirma, desdobra, retorna) vai ser espelhada pela:", options: ["Escolha do tom", "Forma musical (estrofe conta, refrão confirma)", "Levada da bateria"], correctIndex: 1 },
      { text: "Por que o material da Aula 1 pede a \"letra da sua edição\"?", options: ["Porque a letra é secreta", "Porque existem variações e o curso não fixa uma versão", "Porque a letra não importa"], correctIndex: 1 },
      { text: "O que torna um corinho fácil de a congregação inteira cantar sem partitura?", options: ["Âmbito pequeno + frases curtas + ritmo de fala", "Andamento muito rápido", "Muitos acordes diferentes"], correctIndex: 0 },
      { text: "A letra desta música é, no gênero, um:", options: ["Pedido de perdão", "Testemunho na primeira pessoa", "Louvor de adoração à Trindade"], correctIndex: 1 },
    ],
    activities: [
      {
        title: "Comparar duas versões",
        instructions:
          "Ouça duas versões diferentes da música (a sua de referência e outra, de outra igreja/época). " +
          "Anote três diferenças que você percebeu (andamento, tom, levada, letra, número de repetições).",
        format: "none",
      },
      {
        title: "Anotar a letra e a forma do texto",
        instructions:
          "Em texto: escreva a letra completa da sua edição, separada em estrofe e refrão. Marque qual " +
          "frase \"afirma\", qual \"desdobra\" e onde o texto \"retorna\".",
        format: "text",
      },
    ],
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
          "referência de trabalho.",
      },
      {
        title: "Contagem de entrada e anacruse",
        markdown:
          "Antes de começar, quem conduz dá **um compasso de contagem** (\"1, 2, 3, 4\") no andamento " +
          "exato. Se a música começa com **anacruse** — uma ou duas notas antes do primeiro tempo " +
          "forte, o \"Je-\" de \"Jesus\" caindo antes do 1 — a contagem precisa deixar espaço para " +
          "essa entrada, e a voz já entra \"em cima\" do tempo 1.",
      },
      {
        title: "Como o andamento muda a mensagem",
        markdown:
          "Cante a primeira frase a **80 BPM**, depois a **96**, depois a **112**. A 80 ela soa " +
          "reflexiva; a 96, firme e celebrativa; a 112 começa a soar apressada, \"sem deixar a " +
          "palavra respirar\". A escolha do andamento **é uma decisão de interpretação** — e muda o " +
          "que a letra comunica.",
      },
    ],
    examples: [
      {
        title: "A primeira frase a 96 BPM",
        caption: "Anacruse de duas colcheias — \"Je-sus\" (Lá–Si) entrando antes do tempo 1. Alturas da partitura oficial; ritmo a conferir.",
        abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:A\nz4 z2 A,B, | CCCCC B,A,E |\nw: Je-sus Cris-to mu-dou meu vi-ver *\n",
      },
      {
        title: "A primeira frase a 80 BPM",
        caption: "A mesma frase da estrofe, agora no andamento da partitura (80 BPM) — compare com o exemplo a 96 e sinta se a palavra \"respira\".",
        abc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\nz4 z2 A,B, | CCCCC B,A,E |",
      },
    ],
    quiz: [
      { text: "O andamento de trabalho desta música é:", options: ["~60 BPM", "~96 BPM", "~140 BPM"], correctIndex: 1 },
      { text: "A 96 BPM, a sensação é:", options: ["Arrastada", "Firme e celebrativa", "Apressada demais"], correctIndex: 1 },
      { text: "\"Compasso de contagem\" antes de começar serve para:", options: ["Todos entrarem juntos no andamento certo", "Afinar os instrumentos", "Marcar o fim"], correctIndex: 0 },
      { text: "A anacruse desta música é:", options: ["O acorde final", "As sílabas \"Je-sus\" caindo antes do primeiro tempo forte", "Uma pausa longa no meio"], correctIndex: 1 },
      { text: "Se a música tem anacruse, a contagem de entrada precisa:", options: ["Ser mais rápida", "Deixar espaço para a voz entrar antes do tempo 1", "Ter oito tempos"], correctIndex: 1 },
      { text: "A 112 BPM, o problema é:", options: ["Fica reflexiva demais", "A palavra não \"respira\"", "Ninguém consegue bater palma"], correctIndex: 1 },
      { text: "Escolher o andamento é:", options: ["Um detalhe sem importância", "Uma decisão de interpretação que muda a mensagem", "Fixado pela partitura, imutável"], correctIndex: 1 },
      { text: "Ouça: este andamento está mais perto de", options: ["70 BPM", "96 BPM", "130 BPM"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=96\nK:C\nc c c c | c c c c |" },
      { text: "Ouça a frase: o andamento está mais perto de", options: ["76 BPM (reflexivo)", "96 BPM (celebrativo)", "120 BPM (apressado)"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/8\nQ:1/4=76\nK:A\nE2 A2 A2 B2 | A6 z2 |" },
      { text: "Ouça a frase com anacruse: as duas primeiras notas caem antes ou depois do primeiro tempo forte?", options: ["Antes", "Depois"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:A\nz4 z2 E2 A2 A2 | B2 A2 A4 |" },
    ],
    activities: [
      {
        title: "Cantar a primeira frase no tempo",
        instructions: "Cante a primeira frase da música junto do metrônomo a 96 BPM, entrando na anacruse depois da contagem. Grave.",
        format: "audio",
      },
      {
        title: "Testar três andamentos",
        instructions: "Grave a primeira frase três vezes: ~80, ~96 e ~112 BPM. Em texto (na descrição da entrega), diga qual andamento você escolheria para a sua igreja e por quê.",
        format: "audio",
      },
    ],
  },
  {
    title: "Aula 3 — A bateria e o groove",
    sections: [
      {
        title: "A levada base",
        markdown:
          "Numa levada moderada de louvor como esta:\n\n" +
          "- **Chimbal:** colcheias contínuas — é o \"relógio\" da banda.\n" +
          "- **Caixa:** *backbeat*, nos tempos **2 e 4**. É o acento que faz a música \"andar\" e é o " +
          "que a congregação imita batendo palma.\n" +
          "- **Bumbo:** o tempo **1** sempre, mais um reforço perto do tempo **3** (muitas vezes uma " +
          "antecipação sincopada, o bumbo caindo no \"e\" antes do 3).",
      },
      {
        title: "Como a bateria conduz a forma",
        markdown:
          "A bateria **não toca igual o tempo todo** — ela é o principal sinalizador das partes:\n\n" +
          "- **Estrofe:** mais contida (às vezes só chimbal e bumbo, caixa só no 4).\n" +
          "- **Virada de 1 compasso** na passagem estrofe → refrão: anuncia a chegada.\n" +
          "- **Refrão:** cheio — chimbal **aberto** no tempo 1, caixa forte em 2 e 4, bumbo mais " +
          "denso.\n" +
          "- **A \"parada\" antes do último refrão:** a banda inteira para por 1 ou 2 tempos (só a " +
          "voz, ou um prato), e volta com tudo. É o momento mais dramático do arranjo.",
      },
      {
        title: "Groove é repetição + respiração",
        markdown:
          "O que faz um groove \"gostoso\" é a **constância** (o chimbal e o backbeat que não " +
          "falham) somada a pequenas **respirações** — a virada na quebra de frase, uma síncope de " +
          "bumbo, o prato que abre no refrão. Constante demais fica robótico; instável demais, " +
          "ninguém consegue cantar junto.",
      },
    ],
    examples: [
      {
        title: "Esqueleto da levada da estrofe (com notas)",
        caption: "Cima = chimbal (colcheias); meio = caixa (2 e 4); baixo = bumbo (1 e antecipando o 3).",
        abc: "X:1\nM:4/4\nL:1/8\nV:1\nV:2\nV:3\nK:C\n[V:1] G G G G G G G G |\n[V:2] z2 c2 z2 c2 |\n[V:3] C2 z2 z C z2 |",
      },
    ],
    quiz: [
      { text: "Numa levada com backbeat, a caixa está tocando em:", options: ["1 e 3", "2 e 4", "Todos os tempos"], correctIndex: 1 },
      { text: "A peça que mantém as colcheias correndo o tempo todo é:", options: ["O bumbo", "A caixa", "O chimbal"], correctIndex: 2 },
      { text: "O bumbo, além do tempo 1, costuma reforçar:", options: ["O tempo 2", "Perto do tempo 3, às vezes antecipando", "O contratempo do 4"], correctIndex: 1 },
      { text: "Na estrofe, comparada ao refrão, a bateria costuma ficar:", options: ["Mais cheia", "Mais contida", "Igual"], correctIndex: 1 },
      { text: "A virada de bateria na passagem estrofe→refrão serve para:", options: ["Corrigir o andamento", "Anunciar a mudança de parte", "Dar um solo longo"], correctIndex: 1 },
      { text: "No refrão, o chimbal costuma:", options: ["Sumir", "Abrir no tempo 1", "Ficar mais lento"], correctIndex: 1 },
      { text: "O que a banda faz antes do último refrão, neste arranjo?", options: ["Acelera", "Para por um ou dois tempos e volta com tudo", "Muda de tom"], correctIndex: 1 },
      { text: "Um groove \"gostoso\" combina:", options: ["Constância + pequenas respirações", "Só constância robótica", "Só variação o tempo todo"], correctIndex: 0 },
      { text: "Ouça o groove: a caixa está em 1 e 3 ou em 2 e 4?", options: ["1 e 3", "2 e 4"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/8\nK:C\nz2 c2 z2 c2 | z2 c2 z2 c2 |" },
      { text: "Ouça: chimbal em colcheias contínuas ou espaçado?", options: ["Contínuas", "Espaçado"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/8\nK:C\nG G G G G G G G |" },
    ],
    activities: [
      {
        title: "Bater o backbeat",
        instructions:
          "Com a gravação tocando: marque os tempos com o pé e bata palma no backbeat (2 e 4) por toda " +
          "uma estrofe e um refrão sem errar. Descreva o que a bateria faz de diferente na passagem da " +
          "estrofe para o refrão.",
        format: "none",
      },
      {
        title: "Cantar o groove com a boca",
        instructions:
          "Grave você marcando o groove com a boca por 8 compassos: \"bum\" no 1, \"tá\" no 2 e 4, " +
          "\"ts\" nas colcheias. Faça a estrofe (mais leve) e depois o refrão (mais cheio, com o " +
          "chimbal \"aberto\" no 1).",
        format: "audio",
      },
    ],
  },
  {
    title: "Aula 4 — A melodia, frase a frase",
    sections: [
      {
        title: "Âmbito e movimento",
        markdown:
          "A melodia se move dentro de um espaço pequeno — cerca de uma **sexta**, da tônica **Lá** " +
          "até o **Fá#** (grau 6), com passagens rápidas ao **Mi** (grau 5). Quase todo o movimento " +
          "é por **graus conjuntos** (nota vizinha), com poucos saltos — o maior é normalmente de " +
          "**quarta**, aquele som \"de hino\".",
      },
      {
        title: "Frases: pergunta e resposta",
        markdown:
          "A estrofe se organiza em **duas frases de 4 compassos** que funcionam como **pergunta (A) " +
          "e resposta (A')**: começam parecido e terminam diferente — a primeira \"abre\" (para " +
          "numa nota que não é a tônica, geralmente o grau 2 ou 3, sobre o acorde de dominante), a " +
          "segunda \"fecha\" (desce até o grau 1). Entre uma frase e outra há uma **respiração**.",
      },
      {
        title: "O pico do refrão",
        markdown:
          "O refrão sobe: a nota mais aguda da música inteira costuma cair **no primeiro ou segundo " +
          "compasso do refrão**, num tempo forte, sobre a palavra mais importante do texto. Depois " +
          "disso a melodia **desce gradualmente** de volta para a tônica. Esse arco — sobe, atinge o " +
          "pico cedo, desce devagar — é o desenho melódico mais comum de refrão.",
      },
    ],
    examples: [
      {
        title: "A melodia completa (da partitura \"Voz\")",
        caption:
          "Transcrição direta dos graus da partitura oficial (IM Conviver / Prática de canto), em Lá " +
          "maior, ♩=80. As ALTURAS seguem a partitura grau a grau (a anacruse Lá–Si; o Dó natural — " +
          "grau 3 rebaixado — no trecho do refrão; o fecho descendo 1–6–5, terminando no grau 5). As " +
          "notas longas usam a figura semínima pontuada + colcheia. O RITMO ainda é aproximado — " +
          "confira contra a partitura, sobretudo o agrupamento das colcheias dos últimos 4 compassos. " +
          "Repetição e casas 1ª/2ª da partitura foram simplificadas: aqui a melodia corre uma vez só.",
        abc:
          "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\n" +
          "A,B, | CCCCC B,A,E | E8 | C2-C E E4 | FFFF ED A,2 | A,4 A,2 A,B, | " +
          "CCCC DE A,2 | A,2 B,2 C4 | E2 A,2 C4 | D D C2 A,2 A,2 | F2-F E E4 | E2 B,2 A,4 | " +
          "F2 A, A, F2 A, B, | =C2 B, A, A, A, A, B, | C2 C2 D C B, B, | B,2 A, A, F2 A,2 | " +
          "C B, B, A, B, B, F2 | F A, C B, B, A, C C | F F A, C B, B, A, B, | A,2 F2 E4 |]\n",
      },
      {
        title: "A estrofe — primeira frase",
        caption:
          "Anacruse Lá–Si (\"Je-sus\") caindo antes do tempo 1, depois graus conjuntos. As notas " +
          "longas usam a figura semínima pontuada + colcheia. Alturas da partitura; barras das notas " +
          "longas ainda a conferir.",
        abc:
          "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\n" +
          "z4 z2 \"A\"A,B, | CCCCC B,A,E | \"A\"E8 | \"D\"C2-C E E4 | \"E7\"FFFF ED A,2 |\n",
      },
      {
        title: "O trecho do refrão com o Dó natural",
        caption:
          "Grau 3 rebaixado (Dó natural, marcado \"3b\" na partitura) como nota de passagem, e a frase " +
          "descendo por graus conjuntos de volta ao Lá. Alturas da partitura; ritmo a conferir.",
        abc:
          "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\n" +
          "\"A\"F2 A, A, F2 A, B, | \"A\"=C2 B, A, A, A, A, B, | \"D\"C2 C2 D C B, B, | \"E7\"B,2 A, A, F2 A,2 |",
      },
    ],
    quiz: [
      { text: "O âmbito da melodia é de cerca de:", options: ["Uma terça", "Uma sexta", "Uma oitava e meia"], correctIndex: 1 },
      { text: "A melodia se move principalmente por:", options: ["Saltos grandes", "Graus conjuntos (notas vizinhas)", "Repetição da mesma nota"], correctIndex: 1 },
      { text: "O maior salto da melodia é normalmente de:", options: ["Segunda", "Quarta", "Oitava"], correctIndex: 1 },
      { text: "A estrofe se organiza em:", options: ["Uma frase de 8 compassos", "Duas frases de 4 (pergunta e resposta)", "Quatro frases de 2, todas iguais"], correctIndex: 1 },
      { text: "A frase 1 da estrofe termina:", options: ["Na tônica (fechada)", "Numa nota que não é a tônica, sobre a dominante (aberta)", "Numa pausa longa"], correctIndex: 1 },
      { text: "A frase 2 da estrofe termina:", options: ["Aberta, no grau 2", "Fechada, descendo até o grau 1", "No pico da melodia"], correctIndex: 1 },
      { text: "O pico (nota mais aguda) da música costuma cair:", options: ["No fim da estrofe", "No começo do refrão", "Na introdução"], correctIndex: 1 },
      { text: "Depois do pico, a melodia do refrão:", options: ["Continua subindo", "Desce gradualmente até a tônica", "Fica parada na nota aguda"], correctIndex: 1 },
      { text: "Ouça a frase da estrofe: ela termina resolvida ou \"aberta\", pedindo continuação?", options: ["Resolvida", "Aberta"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:A\nE2 A2 A2 B2 | c2 B2 A2 B2 |" },
      { text: "Ouça o trecho do refrão (da partitura): ele se move mais por notas vizinhas (graus conjuntos) ou por saltos grandes?", options: ["Notas vizinhas (graus conjuntos)", "Saltos grandes"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/8\nQ:1/4=80\nK:A\nF2 A, A, F2 A, B, | =C2 B, A, A, A, A, B, |" },
    ],
    activities: [
      {
        title: "Cantar a estrofe",
        instructions:
          "Cante a estrofe inteira junto do modelo (\"Cantar junto\" — feedback por nota). Depois cante " +
          "só o refrão, prestando atenção em onde está o pico e respirando nos mesmos lugares do modelo.",
        format: "audio",
      },
      {
        title: "Desenhar o contorno",
        instructions:
          "Em texto: descreva o contorno da estrofe frase a frase (sobe / desce / repete / salto), e " +
          "diga em que sílaba do refrão cai o pico da música.",
        format: "text",
      },
    ],
  },
  {
    title: "Aula 5 — A harmonia: como é criada",
    sections: [
      {
        title: "Os acordes da casa",
        markdown:
          "A música usa quase só o **campo harmônico de Lá maior**: **A (I)**, **D (IV)**, **E / E7 " +
          "(V)** e o **F#m (vi)** para dar cor. Bm (ii) pode aparecer como alternativa ao D. Nada " +
          "fora disso.",
      },
      {
        title: "A progressão, parte por parte (modelo)",
        markdown:
          "- **Estrofe** (8 compassos): `| A | A | D | E |  | A | D | E7 | A |` → funções **I – I – " +
          "IV – V** (frase 1, meia-cadência: para na tensão); **I – IV – V7 – I** (frase 2, cadência " +
          "autêntica: resolve).\n" +
          "- **Refrão** (8 compassos): `| A | F#m | D | E |  | A | F#m | D E7 | A |` → **I – vi – IV – " +
          "V** repetido, com o F#m dando o contraste \"mais sentido\" logo depois do pico melódico. " +
          "A última frase fecha com **E7 → A** (autêntica).\n\n" +
          "**Confirme contra a sua gravação.** Algumas versões trocam o primeiro `D` por `Bm`, ou " +
          "fazem a estrofe inteira em `I–IV–V–I` sem o vi.",
      },
      {
        title: "Onde a música respira e resolve",
        markdown:
          "Toda quebra de frase é uma **cadência**. Fim da frase 1 da estrofe = **no E** " +
          "(meia-cadência, \"vírgula\" — por isso a música \"quer continuar\"). Fim da frase 2 e fim " +
          "do refrão = **E7 → A** (autêntica, \"ponto final\"). É essa alternância vírgula/ponto que " +
          "dá forma à música inteira. Sem o E7 puxando, o fim soaria frouxo.",
      },
    ],
    examples: [
      {
        title: "Progressão da estrofe (tocável)",
        caption: "8 compassos: I – I – IV – V (abre) / I – IV – V7 – I (resolve). Ouça o D \"abrir\", o E \"apertar\", o A \"resolver\".",
        abc: "X:1\nM:4/4\nL:1/1\nQ:1/4=96\nK:A\n\"A\"[A,CE] | \"A\"[A,CE] | \"D\"[D,FA] | \"E\"[E,GB] | \"A\"[A,CE] | \"D\"[D,FA] | \"E7\"[E,GBd] | \"A\"[A,CE] |",
      },
      {
        title: "Progressão do refrão (tocável)",
        caption: "I – vi – IV – V, com o F#m dando o contraste depois do pico.",
        abc: "X:1\nM:4/4\nL:1/1\nQ:1/4=96\nK:A\n\"A\"[A,CE] | \"F#m\"[F,Ac] | \"D\"[D,FA] | \"E\"[E,GB] | \"A\"[A,CE] | \"F#m\"[F,Ac] | \"E7\"[E,GBd] | \"A\"[A,CE] |",
      },
    ],
    quiz: [
      { text: "Os acordes principais da música, em Lá maior, são:", options: ["A–B–C#–D", "A (I), D (IV), E (V), F#m (vi)", "Qualquer acorde"], correctIndex: 1 },
      { text: "Na frase 1 da estrofe, a harmonia para no:", options: ["I", "IV", "V (meia-cadência)"], correctIndex: 2 },
      { text: "A frase 2 da estrofe fecha com:", options: ["IV → I (plagal)", "V7 → I (autêntica)", "V → vi (deceptiva)"], correctIndex: 1 },
      { text: "O F#m (vi) no refrão serve para:", options: ["Mudar de tom", "Dar um contraste \"mais sentido\" depois do pico", "Marcar o fim"], correctIndex: 1 },
      { text: "\"Toda quebra de frase é uma cadência\" — a da frase 1 da estrofe é:", options: ["Autêntica", "Meia-cadência (para no V)", "Plagal"], correctIndex: 1 },
      { text: "Sem o E7 puxando no fim, a resolução soaria:", options: ["Mais forte", "Frouxa", "Igual"], correctIndex: 1 },
      { text: "Pensar a progressão como I–IV–V–I em vez de A–D–E–A serve para:", options: ["Tocar mais rápido", "Poder transpor a música para outro tom facilmente", "Nada, é igual"], correctIndex: 1 },
      { text: "Algumas versões trocam o primeiro D da estrofe por:", options: ["Bm (ii)", "G (bVII)", "C#m (iii)"], correctIndex: 0 },
      { text: "Ouça a progressão da estrofe: ela termina resolvida (na tônica) ou aberta (na dominante)?", options: ["Resolvida", "Aberta"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=100\nK:A\n\"D\"[D,FA] \"E7\"[E,GBd] | \"A\"[A,CE]2 |" },
      { text: "Ouça: o segundo acorde do refrão é maior (I/IV/V) ou menor (vi)?", options: ["Maior", "Menor (vi)"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/2\nQ:1/4=100\nK:A\n\"A\"[A,CE] \"F#m\"[F,Ac] |" },
    ],
    activities: [
      {
        title: "Tocar a progressão da estrofe",
        instructions:
          "Toque no seu instrumento harmônico a progressão da estrofe (8 compassos), 2 batidas por " +
          "acorde. Grave.",
        format: "audio",
      },
      {
        title: "Identificar D e E de ouvido",
        instructions:
          "Ouça a música três vezes e, em texto, anote em que compasso da estrofe entra o D e em que " +
          "compasso entra o E. Compare com o modelo desta aula.",
        format: "text",
      },
    ],
  },
  {
    title: "Aula 6 — Ritmo harmônico e acompanhamento",
    sections: [
      {
        title: "Ritmo harmônico",
        markdown:
          "\"Ritmo harmônico\" é **a velocidade com que os acordes trocam**. Nesta música ele é " +
          "**lento e regular**: em geral **um acorde por compasso** (quatro tempos), acelerando para " +
          "**dois por compasso** só nas cadências (o `D E7` antes do A final). Ritmo harmônico lento " +
          "= música \"assentada\", fácil de acompanhar.",
      },
      {
        title: "A levada de acompanhamento",
        markdown:
          "Um padrão idiomático para 96 BPM, por compasso:\n\n" +
          "- **Baixo** (ou polegar do violão): a **fundamental do acorde no tempo 1**, às vezes a " +
          "**quinta no tempo 3** (\"baixo alternado\").\n" +
          "- **Harmonia:** acordes nas **colcheias dos tempos 2, 3 e 4**, deixando o tempo 1 " +
          "\"limpo\" para o baixo aparecer.\n" +
          "- **Síncope de acompanhamento:** antecipar o acorde do próximo compasso no \"e\" do tempo " +
          "4 — dá o empurrãozinho para frente característico do gênero.",
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
        title: "Levada de acompanhamento (representada)",
        caption: "Baixo (nota grave) no tempo 1, acordes nas colcheias 2–3–4. No 4º compasso, o acorde do 5º é antecipado.",
        abc: "X:1\nM:4/4\nL:1/8\nV:1\nV:2\nK:A\n[V:1] z2 [CE]2 [CE][CE] [CE]2 | z2 [CE]2 [CE][CE] [CE]2 |\n[V:2] A,4 E,4 | A,4 E,4 |",
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
          "Grave 8 compassos de acompanhamento da estrofe no seu instrumento harmônico, aplicando: " +
          "baixo no tempo 1, acordes nas colcheias, e pelo menos uma antecipação sincopada na quebra " +
          "de frase.",
        format: "audio",
      },
      {
        title: "Descrever a divisão piano/violão",
        instructions:
          "Em texto: se você tivesse piano e violão juntos nesta música, o que cada um faria em cada " +
          "parte (intro, estrofe, refrão)? Onde cada um \"abre espaço\" para a voz?",
        format: "text",
      },
    ],
  },
  {
    title: "Aula 7 — Criando vozes (harmonia vocal)",
    sections: [
      {
        title: "A segunda voz por terças e sextas",
        markdown:
          "O jeito mais direto de harmonizar uma melodia é cantar uma **terça abaixo** dela, usando " +
          "**só notas da escala de Lá maior** (por isso a terça às vezes é maior, às vezes menor — o " +
          "ouvido aceita, porque tudo pertence ao tom). Onde a terça abaixo soa \"apertada\" ou sai " +
          "do âmbito confortável, troca-se por uma **sexta abaixo** (a mesma nota uma oitava acima — " +
          "\"abre\" o acorde). A 2ª voz assim **acompanha o contorno** da melodia.",
      },
      {
        title: "Quando NÃO andar em paralelo",
        markdown:
          "Dois cuidados que separam um arranjo amador de um bom:\n\n" +
          "- **Nas cadências**, em vez de seguir a melodia em paralelo, a 2ª voz faz **movimento " +
          "contrário** ou **nota comum** — a melodia desce para o grau 1 e a 2ª voz **fica parada** " +
          "no grau 3, ou **sobe**. Isso faz o acorde final \"fechar\" de verdade.\n" +
          "- **Evite as duas vozes na mesma nota** (uníssono) por muito tempo — perde-se o efeito de " +
          "harmonia. Um cruzamento pontual tudo bem; sustentado, não.",
      },
      {
        title: "A terceira voz e o âmbito",
        markdown:
          "Uma **3ª voz** costuma fazer as **fundamentais dos acordes** (funciona quase como um " +
          "baixo cantado): sobre A canta Lá, sobre D canta Ré, sobre E canta Mi. É a voz mais fácil " +
          "de decorar e a que mais \"assenta\" o conjunto.\n\n" +
          "Para grupos com **vozes mais velhas**: não empurre ninguém para o agudo — muitas vezes " +
          "vale **baixar o tom da música inteira** (de Lá para Sol ou Fá) antes de brigar com o " +
          "âmbito.",
      },
    ],
    examples: [
      {
        title: "Melodia + 2ª voz — refrão (modelo)",
        caption:
          "2ª voz correndo uma 3ª/6ª abaixo. No compasso da cadência as duas descem, mas a 2ª voz " +
          "para no Ré. Ajuste letra e alturas à sua referência.",
        abc:
          "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:A\nV:1 name=\"Melodia\"\nV:2 name=\"2a voz\"\n" +
          "[V:1] \"A\"e2 e2 c2 A2 | \"F#m\"B2 A2 F4 |\n" +
          "[V:2] \"A\"c2 c2 A2 F2 | \"F#m\"A2 F2 D4 |\n",
      },
      {
        title: "Movimento contrário na cadência (modelo)",
        caption: "A melodia desce até o Lá; a 2ª voz sobe até o Dó# — o acorde \"fecha\".",
        abc:
          "X:1\nM:4/4\nL:1/4\nQ:1/4=88\nK:A\nV:1\nV:2\n" +
          "[V:1] \"E7\"c B \"A\"A2 |\n[V:2] \"E7\"G, A, \"A\"C2 |\n",
      },
    ],
    quiz: [
      { text: "A forma mais direta de criar uma 2ª voz é cantar, usando só notas do tom:", options: ["Uma oitava abaixo", "Uma terça (ou sexta) abaixo, acompanhando o contorno", "A mesma nota"], correctIndex: 1 },
      { text: "A 2ª voz por terças usa terças \"às vezes maiores, às vezes menores\" porque:", options: ["É um erro comum", "Todas as notas pertencem à escala do tom", "A melodia muda de tom o tempo todo"], correctIndex: 1 },
      { text: "Onde a terça abaixo fica \"apertada\" ou sai do âmbito, troca-se por:", options: ["Uma segunda abaixo", "Uma sexta abaixo", "Uníssono"], correctIndex: 1 },
      { text: "Nas cadências, é melhor a 2ª voz:", options: ["Seguir a melodia em paralelo", "Fazer nota comum ou movimento contrário", "Parar de cantar"], correctIndex: 1 },
      { text: "Duas vozes na mesma nota por muito tempo:", options: ["É o ideal", "Perde o efeito de harmonia (soa uníssono)", "Cria um acorde de sétima"], correctIndex: 1 },
      { text: "\"Movimento contrário\" na cadência é:", options: ["As duas vozes descem juntas", "Uma sobe enquanto a outra desce", "As duas ficam paradas"], correctIndex: 1 },
      { text: "A 3ª voz (\"baixo vocal\") normalmente canta:", options: ["A melodia uma oitava abaixo", "As fundamentais dos acordes", "Notas aleatórias graves"], correctIndex: 1 },
      { text: "Por que a 3ª voz é a mais fácil de decorar?", options: ["Só muda quando o acorde muda", "Canta a melodia toda", "Não tem letra"], correctIndex: 0 },
      { text: "Com um grupo de vozes mais velhas, se o refrão está agudo demais, a primeira solução é:", options: ["Gritar mais", "Baixar o tom da música toda", "Cortar o refrão"], correctIndex: 1 },
      { text: "Ouça melodia + 2ª voz: a 2ª voz está acima ou abaixo da melodia?", options: ["Acima", "Abaixo"], correctIndex: 1, promptAbc: "X:1\nM:4/4\nL:1/4\nQ:1/4=88\nK:A\nV:1\nV:2\n[V:1] e e c A |\n[V:2] c c A F |" },
    ],
    activities: [
      {
        title: "Cantar a 2ª voz do refrão",
        instructions:
          "Cante a 2ª voz do refrão junto de uma gravação da melodia (\"Cantar junto\", comparando com " +
          "a voz 2). Onde a 2ª voz \"brigar\" com a melodia (uníssono longo ou nota fora do âmbito), " +
          "anote o compasso e proponha uma correção.",
        format: "audio",
      },
      {
        title: "Escrever a 3ª voz",
        instructions:
          "Em texto: escreva a linha da 3ª voz (baixo vocal) para a estrofe inteira — só as " +
          "fundamentais dos acordes, um valor por acorde (Lá, Lá, Ré, Mi, Lá, Ré, Mi, Lá).",
        format: "text",
      },
    ],
  },
  {
    title: "Aula 8 — Arranjo: juntando tudo",
    sections: [
      {
        title: "A forma completa",
        markdown:
          "Um arranjo de trabalho para esta música:\n\n" +
          "`Intro (4) – Estrofe 1 (8) – Refrão (8) – Estrofe 2 (8) – Refrão (8) – PARADA (1–2 tempos) " +
          "– Refrão final (8) – Final (2)`\n\n" +
          "- **Introdução:** os 4 últimos compassos da melodia sem canto, OU um *vamp* de `A | E | A | " +
          "E` chamando a música.\n" +
          "- **Parada:** a banda toda para, sobra só a voz (ou um prato de sustain), e volta no " +
          "refrão final com dinâmica máxima. É o clímax do arranjo.\n" +
          "- **Final:** último `E7 → A`, o A com **fermata** (segura), muitas vezes com um pequeno " +
          "**ritardando** (desacelerando) no compasso anterior.",
      },
      {
        title: "Dinâmica e quem entra quando",
        markdown:
          "- **Estrofe 1:** voz + violão + baixo leve. Bateria contida. 2ª voz **não** entra ainda.\n" +
          "- **Refrão (1ª vez):** entra a bateria cheia, entra a **2ª voz**, o piano faz contracanto " +
          "nos vãos.\n" +
          "- **Estrofe 2:** pode manter a bateria — cresce em direção ao final.\n" +
          "- **Refrão final:** tudo, 3ª voz inclusa se houver, o pico da música.\n\n" +
          "**Regra de ouro:** deixar **um elemento novo entrar a cada parte** dá sensação de a música " +
          "\"crescer\" sem precisar tocar mais alto o tempo todo.",
      },
      {
        title: "O mapa numa página",
        markdown:
          "Escreva o arranjo como uma tabela que a banda inteira lê de relance: coluna por parte, " +
          "linha por instrumento/voz, célula dizendo o que cada um faz (ou \"—\" para \"não toca\"). " +
          "É esse documento que faz um ensaio render.",
      },
    ],
    examples: [
      {
        title: "Refrão com seções, letra e 2 vozes (modelo)",
        caption: "Modelo do refrão com as duas vozes e a letra — confira letra e alturas contra a sua referência.",
        abc:
          "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:A\nV:1 name=\"Melodia\"\nV:2 name=\"2a voz\"\n" +
          "[V:1] \"A\"e2 e2 c2 A2 | \"F#m\"B2 A2 F4 | \"D\"A2 B2 c2 A2 | \"E7\"B2 c2 B4 |\n" +
          "w: Je-sus mu-dou, trans-for-mou o meu ser,\n" +
          "[V:2] \"A\"c2 c2 A2 F2 | \"F#m\"A2 F2 D4 | \"D\"F2 G2 A2 F2 | \"E7\"G2 A2 G4 |\n",
      },
      {
        title: "Vamp de introdução (tocável)",
        caption: "A | E | A | E — chama a música antes de a voz entrar.",
        abc: "X:1\nM:4/4\nL:1/1\nQ:1/4=96\nK:A\n\"A\"[A,CE] | \"E\"[E,GB] | \"A\"[A,CE] | \"E\"[E,GB] |",
      },
    ],
    quiz: [
      { text: "Uma opção de introdução para esta música é:", options: ["Um solo de bateria de 16 compassos", "Os 4 últimos compassos da melodia sem canto, ou um vamp A|E|A|E", "Começar direto no refrão final"], correctIndex: 1 },
      { text: "A \"parada\" antes do último refrão é:", options: ["A banda toda parando 1–2 tempos e voltando com tudo", "Um erro de ensaio", "O fim da música"], correctIndex: 0 },
      { text: "No final, o acorde de A leva:", options: ["Um staccato curto", "Uma fermata (segura), com ritardando no compasso anterior", "Uma síncope"], correctIndex: 1 },
      { text: "Na Estrofe 1, a 2ª voz:", options: ["Já entra desde o começo", "Não entra ainda", "Substitui a melodia"], correctIndex: 1 },
      { text: "A 2ª voz normalmente entra:", options: ["Na introdução", "No primeiro refrão", "Só no final"], correctIndex: 1 },
      { text: "A \"regra de ouro\" da dinâmica é:", options: ["Tocar tudo forte desde o início", "Deixar um elemento novo entrar a cada parte", "Nunca mudar nada"], correctIndex: 1 },
      { text: "O mapa de arranjo serve para:", options: ["Impressionar a plateia", "A banda inteira ler de relance quem faz o quê em cada parte", "Cronometrar a música"], correctIndex: 1 },
      { text: "No arranjo de trabalho, o clímax da música é:", options: ["A introdução", "O refrão final (depois da parada)", "A Estrofe 1"], correctIndex: 1 },
      { text: "Ouça o vamp de introdução: os acordes alternam entre:", options: ["Tônica e dominante (A e E)", "Tônica e subdominante (A e D)", "Dois acordes menores"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/1\nQ:1/4=100\nK:A\n[A,CE] | [E,GB] | [A,CE] | [E,GB] |" },
      { text: "Ouça o refrão com as duas vozes: elas se movem mais em paralelo ou em uníssono?", options: ["Em paralelo (harmonizadas)", "Em uníssono (mesma nota)"], correctIndex: 0, promptAbc: "X:1\nM:4/4\nL:1/8\nQ:1/4=96\nK:A\nV:1\nV:2\n[V:1] e2 e2 c2 A2 |\n[V:2] c2 c2 A2 F2 |" },
    ],
    activities: [
      {
        title: "Gravar a música inteira (entrega principal)",
        instructions:
          "Grave a música inteira no seu formato (voz + um instrumento no mínimo), seguindo o seu mapa " +
          "de arranjo: intro, dinâmica crescendo por parte, a parada antes do último refrão, e o final " +
          "com fermata. Anexe também o mapa de arranjo escrito (foto ou texto). O professor devolve com " +
          "nota e comentários.",
        format: "audio",
      },
      {
        title: "Escrever o mapa de arranjo",
        instructions:
          "Em texto: monte a tabela do arranjo — uma coluna por parte (Intro, Estrofe 1, Refrão, " +
          "Estrofe 2, Refrão, Parada, Refrão final, Final) e uma linha por elemento (Voz, 2ª voz, " +
          "Violão, Baixo, Bateria, Piano). Preencha o que cada um faz, ou \"—\".",
        format: "text",
      },
    ],
  },
];
