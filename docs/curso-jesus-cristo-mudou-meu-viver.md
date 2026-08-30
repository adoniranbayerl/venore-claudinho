# Curso: "Jesus Cristo mudou meu viver" — anatomia de uma música (Lá maior)

> Conteúdo real para o plugin `academy`. Será instalado como seed
> (`src/plugins/academy/seeds/jesus-cristo-mudou-meu-viver.ts`) depois dos recursos #3
> (acorde/progressão + toggle só-melodia), #6 (letra na partitura), #7 (múltiplas vozes) e da
> grade de percussão — ver `docs/academy-recursos-musicais.md`.

## Aviso sobre a fonte musical

Este corinho tem **muitas variantes** de letra e melodia, transmitidas de ouvido em contextos
evangélicos brasileiros. **Toda a notação deste documento é um modelo plausível em Lá maior** e
**deve ser conferida contra a gravação/edição que o dono usa em sala**, que entra como material da
Aula 1. Onde o documento diz "modelo" ou "ajuste à sua referência", é literal: a estrutura
pedagógica (o que analisar e como) vale sempre; os `abc` concretos são ponto de partida.

## Ficha do curso

| Campo | Valor |
| --- | --- |
| `title` | Jesus Cristo mudou meu viver — anatomia de uma música |
| `slug` | `jesus-cristo-mudou-meu-viver` |
| `status` | `public` |
| `publiclyListed` | `true` |
| `description` | Uma música só, do começo ao fim: de onde ela vem, em que andamento anda, como a bateria segura o groove, como a melodia se move, como a harmonia é construída e como criar a segunda voz e o arranjo. Em Lá maior. |

**Público:** quem já canta ou toca a música de ouvido e quer entender **como ela funciona** —
para conduzir melhor, ensinar, ou arranjar. Acesso individual (o trabalho em grupo é na sala; a
plataforma é o material de cada aluno).

**Pré-requisito recomendado:** o curso "Teoria Musical na Prática" (ou familiaridade com pulso,
compasso, intervalos e campo harmônico maior).

**Requisitos por aula:** toda seção `readTextEnabled`. Quiz `quizEnabled` nas aulas 3, 5 e 7
(limiar 70%, 3 tentativas). Atividade `activityEnabled` em todas; `deliverableFormat` conforme a
tabela final — a maioria é `audio` (é um curso de execução), a Aula 8 tem a entrega final.

**Parâmetros musicais assumidos (modelo):** Lá maior · 4/4 · ≈ 96 BPM · caráter celebrativo,
marcado · forma `Intro – Estrofe – Refrão – Estrofe – Refrão – (parada) – Refrão – Final`.

---

## Aula 1 — A origem da música

**Objetivo:** situar a música na tradição de onde veio e no seu texto.

### Seção 1.1 — De onde vêm os corinhos de avivamento
"Jesus Cristo mudou meu viver" pertence à família dos **corinhos** — cânticos curtos, de melodia
simples e âmbito pequeno, criados para serem aprendidos **de ouvido, na hora**, em cultos e
reuniões de avivamento no Brasil ao longo do século XX. Não têm um autor único documentado na
maioria dos casos: circulam, são adaptados, mudam de tom e de letra conforme a região e a
denominação. É música **de função** — feita para toda a congregação cantar junto sem partitura.

### Seção 1.2 — Por que ela é fácil de cantar em grupo
Três características típicas do corinho, todas presentes aqui:
- **Âmbito curto:** a melodia cabe folgada na voz de qualquer pessoa (aqui, cerca de uma sexta —
  da tônica Lá até o Fá#/Mi da região média).
- **Frases curtas e simétricas:** trechos de 2 e 4 compassos que respondem uns aos outros
  (estrutura de pergunta-e-resposta, A–A').
- **Ritmo declamatório:** a melodia acompanha de perto o ritmo natural da fala do texto.

### Seção 1.3 — O texto e seu sentido
A letra é um **testemunho na primeira pessoa**: afirma uma transformação ("mudou meu viver") e
seus efeitos ("gozo", "paz"). A forma do texto — uma afirmação inicial que se desdobra e depois
retorna — é o que a forma musical vai espelhar (estrofe que "conta", refrão que "confirma").
**Confirme a letra exata da sua edição** e anote-a como material da aula.

### Material da aula
- Sua(s) gravação(ões) de referência da música (uma ou mais versões).
- A letra completa, na edição que você usa.

### Atividade
Ouça **duas versões diferentes** da música (a sua de referência e outra, de outra igreja/época).
Anote **três diferenças** que você percebeu (andamento, tom, levada, letra, número de repetições).
`(none)`

---

## Aula 2 — Andamento e caráter

**Objetivo:** definir e sentir o andamento da música.

### Seção 2.1 — O BPM da música
Nas versões mais comuns, "Jesus Cristo mudou meu viver" anda por volta de **92 a 100 BPM** — um
andamento **moderado, marcado**, que dá para bater palma confortavelmente em todos os tempos. Não
é balada (ficaria arrastada) nem corrido (perderia a solenidade). Vamos usar **96 BPM** como
referência de trabalho. Ligue o metrônomo a 96 e apenas ande pela sala no pulso, sem cantar.

### Seção 2.2 — Contagem de entrada
Antes de começar, quem conduz dá **um compasso de contagem** ("1, 2, 3, 4") no andamento exato.
Se a música começa com **anacruse** (uma ou duas notas antes do primeiro tempo forte — muito
comum em corinho, o "Je-" de "Jesus" caindo antes do 1), a contagem precisa deixar espaço para
essa entrada.

### Seção 2.3 — Como o andamento muda a sensação
Cante a primeira frase a **80 BPM**, depois a **96**, depois a **112**. A 80 ela soa reflexiva; a
96, firme e celebrativa; a 112 começa a soar apressada, "sem deixar a palavra respirar". A
escolha do andamento **é uma decisão de interpretação** — e muda o que a letra comunica.

### Exemplo sonoro
```abc
X:1
M:4/4
L:1/8
Q:1/4=96
K:A
z2 E2 A2 A2 | B2 A2 A4 |
w: * * Je-sus Cris-to mu-dou
```
(Modelo: anacruse de duas colcheias — "Je-sus" entrando antes do tempo 1. Ajuste à sua referência.)

### Atividade
Cante a **primeira frase** da música junto do metrônomo a **96 BPM**, entrando na anacruse depois
da contagem. Grave. `(áudio)`

---

## Aula 3 — A bateria e o groove

**Objetivo:** entender e reproduzir como a bateria segura o andamento e conduz a música.

### Seção 3.1 — A levada base
Numa levada moderada de louvor como esta, a distribuição típica é:
- **Chimbal:** colcheias contínuas (as oito subdivisões do compasso) — é o "relógio" da banda.
- **Caixa:** **backbeat**, nos tempos **2 e 4**. É o acento que faz a música "andar" e é o que a
  congregação imita batendo palma.
- **Bumbo:** o tempo **1** sempre, mais um reforço perto do tempo **3** (muitas vezes uma
  antecipação sincopada, o bumbo caindo no "e" antes do 3).

### Seção 3.2 — Como a bateria conduz a forma
A bateria **não toca igual o tempo todo** — ela é o principal sinalizador das partes:
- **Estrofe:** mais contida (às vezes só chimbal e bumbo, caixa só no 4, ou caixa com vassoura).
- **Virada de 1 compasso** na passagem estrofe → refrão: anuncia a chegada.
- **Refrão:** cheio — chimbal **aberto** no tempo 1, caixa forte em 2 e 4, bumbo mais denso.
- **A "parada" antes do último refrão:** a banda inteira para por 1 ou 2 tempos (só a voz, ou um
  prato), e volta com tudo. É o momento mais dramático do arranjo (ver Aula 8).

### Seção 3.3 — Groove é repetição + respiração
O que faz um groove "gostoso" é a **constância** (o chimbal e o backbeat que não falham) somada a
pequenas **respirações** — a virada na quebra de frase, uma síncope de bumbo, o prato que abre no
refrão. Constante demais fica robótico; instável demais, ninguém consegue cantar junto.

### Exemplo — grade de bateria (estrofe)
```
tempo:     1  e  2  e  3  e  4  e
chimbal:   x  x  x  x  x  x  x  x
caixa:     .  .  o  .  .  .  o  .
bumbo:     o  .  .  .  .  x  .  .     (bumbo no 1 e antecipando o 3)
```
Refrão (mais denso):
```
tempo:     1  e  2  e  3  e  4  e
chimbal:   O  x  x  x  x  x  x  x     (O = chimbal aberto no 1)
caixa:     .  .  o  .  .  .  o  .
bumbo:     o  .  .  o  o  x  .  .
```

### Atividade
Com a gravação tocando: (a) marque os tempos com o pé; (b) bata palma no **backbeat (2 e 4)** por
toda uma estrofe e um refrão sem errar; (c) descreva o que a bateria faz de diferente **na
passagem** da estrofe para o refrão. `(none)`

### Quiz (tipo áudio)
1. *(toca a levada da estrofe)* A caixa está tocando em: 1 e 3 · **2 e 4** · todos os tempos
2. A peça que mantém as colcheias correndo o tempo todo é: o bumbo · a caixa · **o chimbal**
3. *(toca estrofe e depois refrão)* No refrão, o que mudou no chimbal? Ficou mais lento · **abriu no tempo 1** · parou
4. A virada de bateria na quebra de frase serve para: corrigir o andamento · **anunciar a mudança de parte** · dar um solo longo
5. *(toca o trecho com a "parada")* O que a banda fez antes do último refrão? Acelerou · **parou por um ou dois tempos e voltou com tudo** · mudou de tom

---

## Aula 4 — A melodia, frase a frase

**Objetivo:** descrever como a melodia se move e cantá-la inteira com consciência.

### Seção 4.1 — O âmbito e o material
A melodia se move dentro de um espaço pequeno — cerca de uma **sexta**, da tônica **Lá** até o
**Fá#** (grau 6), com passagens rápidas ao **Mi** (grau 5) e raras notas abaixo do Lá. Quase todo
o movimento é por **graus conjuntos** (nota vizinha), com poucos saltos — o maior é normalmente
de **quarta** (grau 5 ao grau 1, ou 1 ao 4), aquele som "de hino".

### Seção 4.2 — Frases: pergunta e resposta
A estrofe se organiza em **duas frases de 4 compassos** que funcionam como **pergunta (A) e
resposta (A')**: começam parecido e terminam diferente — a primeira "abre" (para numa nota que
não é a tônica, geralmente o grau 2 ou 3, sobre o acorde de dominante), a segunda "fecha" (desce
até o grau 1, sobre a tônica). Entre uma frase e outra há uma **respiração** — um silêncio curto
onde o cantor toma fôlego.

### Seção 4.3 — O pico do refrão
O refrão sobe: a nota mais aguda da música inteira costuma cair **no primeiro ou segundo compasso
do refrão**, num tempo forte, sobre a palavra mais importante do texto ("mudou", "Jesus" — 
**confirme na sua letra**). Depois disso a melodia **desce gradualmente** de volta para a tônica
até o fim do refrão. Esse arco — sobe, atinge o pico cedo, desce devagar — é o desenho melódico
mais comum de refrão em música popular.

### Exemplo — estrofe com letra e graus (modelo)
```abc
X:1
M:4/4
L:1/8
Q:1/4=96
K:A
z2 "_1"E2 "_1"A2 "_1"A2 | "_2"B2 "_1"A2 "_6,"F,4 |
w: * Je-sus Cris-to mu-dou meu vi-ver,
"_1"E2 "_1"A2 "_1"A2 "_2"B2 | "_3"c2 "_2"B2 "_1"A4 |]
w: mui-to go-zo a mi-nha_al-ma tem.
```
> `E` aqui é o Mi grave (grau 5 abaixo da tônica), a anacruse; `F,` é o Fá# grave. Isto é um
> **modelo de contorno** — ajuste ritmo e alturas à sua gravação. O que deve permanecer: anacruse,
> movimento por graus conjuntos, frase 1 terminando "aberta", frase 2 terminando no grau 1.

### Atividade
Cante a **estrofe inteira** junto do modelo (Cantar junto — feedback por nota). Depois cante **só
o refrão**, prestando atenção em **onde está o pico** e respirando nos mesmos lugares do modelo.
`(áudio)`

---

## Aula 5 — A harmonia: como é criada

**Objetivo:** entender a progressão de acordes da música e a função de cada acorde.

### Seção 5.1 — Os acordes da casa
A música usa quase só o **campo harmônico de Lá maior** (curso de teoria, Aula 12):
**A (I)**, **D (IV)**, **E / E7 (V)**, e o **F#m (vi)** para dar cor. Bm (ii) pode aparecer como
alternativa ao D. Nada fora disso.

### Seção 5.2 — A progressão, parte por parte (modelo)
- **Estrofe** (8 compassos), tipicamente:
  `| A | A | D | E |  | A | D | E7 | A |`
  → funções: **I – I – IV – V** (frase 1, meia-cadência: para na tensão) ; **I – IV – V7 – I**
  (frase 2, cadência autêntica: resolve). É o esqueleto I–IV–V–I do curso de teoria, dividido nas
  duas frases.
- **Refrão** (8 compassos), tipicamente:
  `| A | F#m | D | E |  | A | F#m | D E7 | A |`
  → **I – vi – IV – V** repetido, com o F#m dando aquele contraste "mais sentido" logo depois da
  euforia do pico melódico. A última frase fecha com **E7 → A** (autêntica).

> **Confirme contra a sua gravação.** Algumas versões trocam o primeiro `D` da estrofe por `Bm`,
> ou fazem a estrofe inteira em `I–IV–V–I` sem o vi. A lógica funcional (tônica → subdominante →
> dominante → tônica; vi para contraste) se mantém.

### Seção 5.3 — Onde a música "respira" e "resolve"
Marque na partitura: **toda quebra de frase é uma cadência**. Fim da frase 1 da estrofe = **no E**
(meia-cadência, "vírgula" — por isso a música "quer continuar"). Fim da frase 2 e fim do refrão =
**E7 → A** (autêntica, "ponto final"). É essa alternância vírgula/ponto que dá forma à música
inteira. Sem o E7 puxando, o fim soaria frouxo (curso de teoria, Aula 15).

### Exemplo sonoro — player de progressão (recurso #3)
Toggle **só melodia / só harmonia / juntas**:
- Harmonia da estrofe: `A | A | D | E | A | D | E7 | A` (2 tempos onde há dois acordes num compasso).
- Melodia por cima: a da Aula 4.
- **"Só melodia"** é o modo padrão para quem quer estudar o canto sem a harmonia atrapalhar.

### Atividade
Escolha **uma** das duas:
(a) Toque no seu instrumento harmônico a **progressão da estrofe** (8 compassos), 2 batidas por
acorde; grave. `(áudio)`
(b) Ouça a música três vezes e **anote em que compasso entra o D e em que compasso entra o E** na
estrofe. `(none)`

### Quiz (tipo áudio)
1. Os acordes principais da música, em Lá maior, são: A–B–C#–D · **A (I), D (IV), E (V), F#m (vi)** · qualquer acorde
2. No fim da **primeira** frase da estrofe, a harmonia para no: I · IV · **V (meia-cadência)**
3. *(toca E→A e depois E7→A)* Qual é o que fecha as frases da música? E→A · **E7→A**
4. O F#m (vi) no refrão serve para: mudar de tom · **dar um contraste "mais sentido" depois do pico** · marcar o fim
5. Pensar a progressão como **I–IV–V–I** em vez de **A–D–E–A** serve para: tocar mais rápido · **poder transpor a música para outro tom facilmente** · nada, é igual

---

## Aula 6 — Ritmo harmônico e acompanhamento

**Objetivo:** entender quanto cada acorde dura e como o instrumento harmônico o realiza.

### Seção 6.1 — Ritmo harmônico
"Ritmo harmônico" é **a velocidade com que os acordes trocam**. Nesta música ele é **lento e
regular**: em geral **um acorde por compasso** (quatro tempos), acelerando para **dois por
compasso** só nas cadências (o `D E7` antes do A final). Ritmo harmônico lento = música
"assentada", fácil de acompanhar; trocas rápidas dariam agitação que não combina com o texto.

### Seção 6.2 — A levada de acompanhamento (violão / teclado)
Um padrão idiomático para 96 BPM, por compasso:
- **Baixo** (ou polegar do violão): a **fundamental do acorde no tempo 1**, às vezes a **quinta no
  tempo 3** ("baixo alternado").
- **Harmonia:** acordes nas **colcheias dos tempos 2, 3 e 4**, ou o padrão "campo" (tempo 1 baixo,
  2-e-3-e-4 acordes), deixando o tempo 1 "limpo" para o baixo aparecer.
- **Síncope de acompanhamento:** antecipar o acorde do próximo compasso no "e" do tempo 4 — dá
  aquele empurrãozinho para frente muito característico do gênero.

### Seção 6.3 — Piano e violão dividem funções
Quando há os dois: o **violão** costuma segurar a levada rítmica (o "motorzinho" de colcheias) e o
**piano** faz notas mais longas, contracantos nos vãos da melodia e reforça as cadências. Tocar
tudo junto, os dois cheios, "engorda" e tira espaço da voz — sobretudo com cantores mais velhos,
que precisam de espaço para respirar.

### Exemplo — levada em notação rítmica / slash (recurso a implementar)
```
| A            | D            | E7           | A            |
  ↓   x x x x    ↓   x x x x    ↓   x x x x    ↓   x x x x
  (baixo no 1, acordes nas colcheias 2–3–4; antecipa o próximo acorde no "e" do 4)
```

### Atividade
Grave **8 compassos de acompanhamento** da estrofe no seu instrumento harmônico, aplicando: baixo
no tempo 1, acordes nas colcheias, e pelo menos **uma antecipação sincopada** na quebra de frase.
`(áudio)`

---

## Aula 7 — Criando vozes (harmonia vocal)

**Objetivo:** construir uma segunda (e terceira) voz para a música.

### Seção 7.1 — A segunda voz por terças e sextas
O jeito mais direto de harmonizar uma melodia é cantar uma **terça abaixo** dela, usando **só
notas da escala de Lá maior** (por isso a terça às vezes é maior, às vezes menor — o ouvido aceita,
porque tudo pertence ao tom). Onde a terça abaixo soa "apertada" ou sai do âmbito confortável,
troca-se por uma **sexta abaixo** (que é a mesma nota, uma oitava acima — "abre" o acorde). A 2ª
voz assim **acompanha o contorno** da melodia: sobe quando ela sobe, desce quando ela desce.

### Seção 7.2 — Quando NÃO andar em paralelo
Dois cuidados que separam um arranjo amador de um bom:
- **Nas cadências**, em vez de a 2ª voz seguir a melodia em paralelo, deixe-a fazer **movimento
  contrário** ou **nota comum** — por exemplo, a melodia desce para o grau 1 e a 2ª voz **fica
  parada** no grau 3, ou **sobe** para o grau 1 uma oitava abaixo. Isso faz o acorde final "fechar"
  de verdade.
- **Evite as duas vozes na mesma nota** por muito tempo (uníssono) — perde-se o efeito de
  harmonia. Um cruzamento pontual tudo bem; sustentado, não.

### Seção 7.3 — A terceira voz e o baixo vocal
Uma **3ª voz** costuma fazer as **fundamentais dos acordes** (funciona quase como um baixo
cantado): sobre A canta Lá, sobre D canta Ré, sobre E canta Mi. É a voz mais fácil de decorar (só
muda quando o acorde muda) e a que mais "assenta" o conjunto. Para grupos com **vozes mais
velhas**, distribua com cuidado: não empurre ninguém para o agudo — muitas vezes vale **baixar o
tom da música inteira** (de Lá para Sol ou Fá) antes de brigar com o âmbito.

### Exemplo — duas vozes (recurso #7), refrão (modelo)
```abc
X:1
M:4/4
L:1/8
Q:1/4=96
K:A
V:1 name="Melodia"
V:2 name="2ª voz"
[V:1] "A" e2 e2 c2 A2 | "F#m" B2 A2 F4 |
[V:2] "A" c2 c2 A2 F2 | "F#m" A2 F2 D4 |
```
> Modelo: 2ª voz correndo uma 3ª/6ª abaixo. No compasso 2 (cadência da sub-frase) as duas descem,
> mas a 2ª voz para no Ré (fundamental do F#m menos a terça — ajuste conforme o acorde real).

### Atividade
Cante a **2ª voz do refrão** junto de uma gravação da melodia (Cantar junto, comparando com a voz
2). Onde a 2ª voz "brigar" com a melodia (uníssono longo ou nota fora do âmbito), **anote o
compasso** e proponha uma correção (terça vira sexta, ou movimento contrário). `(áudio)`

### Quiz (tipo áudio)
1. A forma mais direta de criar uma 2ª voz é cantar, usando só notas do tom: uma oitava abaixo · **uma terça (ou sexta) abaixo, acompanhando o contorno** · a mesma nota
2. Nas cadências, é melhor a 2ª voz: seguir a melodia em paralelo · **fazer nota comum ou movimento contrário** · parar de cantar
3. *(toca melodia sozinha e melodia + 2ª voz)* Na segunda, a 2ª voz está: acima da melodia · **abaixo, acompanhando o contorno** · na mesma nota
4. A 3ª voz "baixo vocal" normalmente canta: a melodia uma oitava abaixo · **as fundamentais dos acordes** · notas aleatórias
5. Com um grupo de vozes mais velhas, se o refrão está agudo demais, a primeira solução é: gritar mais · **baixar o tom da música toda** · cortar o refrão

---

## Aula 8 — Arranjo: juntando tudo

**Objetivo:** montar um mapa de arranjo completo da música e executá-lo.

### Seção 8.1 — A forma completa
Um arranjo de trabalho para esta música:
```
Intro (4 comp.) – Estrofe 1 (8) – Refrão (8) – Estrofe 2 (8) – Refrão (8) –
PARADA (1–2 tempos) – Refrão final (8) – Final (2)
```
- **Introdução:** os 4 últimos compassos da melodia sem canto, OU um *vamp* de `A | E | A | E`
  chamando a música. Já estabelece tom e andamento.
- **Parada:** a banda toda para, sobra só a voz (ou um prato de sustain), e volta no refrão final
  com dinâmica máxima. É o clímax do arranjo — combina com a virada de bateria da Aula 3.
- **Final:** último `E7 → A`, o A com **fermata** (segura), muitas vezes com um pequeno
  **ritardando** (desacelerando) no compasso anterior.

### Seção 8.2 — Dinâmica e quem entra quando
- **Estrofe 1:** voz + violão + baixo leve. Bateria contida (Aula 3). 2ª voz **não** entra ainda.
- **Refrão (1ª vez):** entra a bateria cheia, entra a **2ª voz**, o piano faz contracanto nos vãos.
- **Estrofe 2:** pode manter a bateria (mais movimento que a estrofe 1) — cresce em direção ao
  final.
- **Refrão final:** tudo, 3ª voz inclusa se houver, o pico da música.
- **Regra de ouro:** deixar **um elemento novo entrar a cada parte** dá sensação de a música
  "crescer" sem precisar tocar mais alto o tempo todo.

### Seção 8.3 — O mapa numa página
Escreva o arranjo como uma tabela que a banda inteira lê de relance: coluna por parte, linha por
instrumento/voz, célula dizendo o que cada um faz (ou "—" para "não toca"). É esse documento que
faz um ensaio render.

### Exemplo — partitura do refrão com seções, letra e 2 vozes (recursos #6 + #7 + marcas de ensaio)
```abc
X:1
M:4/4
L:1/8
Q:1/4=96
K:A
V:1 name="Melodia"
V:2 name="2ª voz"
%%text Refrão
[V:1] "A" e2 e2 c2 A2 | "F#m" B2 A2 F4 | "D" A2 B2 c2 A2 | "E7" B2 c2 B4 |
w: Je-sus mu-dou, trans-for-mou o meu ser,
[V:2] "A" c2 c2 A2 F2 | "F#m" A2 F2 D4 | "D" F2 G2 A2 F2 | "E7" G2 A2 G4 |
```
> Modelo — confirme letra e alturas contra a sua referência.

### Atividade — entrega final
Grave a **música inteira** no seu formato (voz + um instrumento no mínimo; mais vozes/instrumentos
se tiver), seguindo **o seu mapa de arranjo**: intro, dinâmica crescendo por parte, a parada antes
do último refrão, e o final com fermata. Anexe também o **mapa de arranjo** escrito (foto ou
texto). O professor devolve com **nota e comentários** sobre andamento, groove, afinação das
vozes e execução da forma. `(áudio)`

---

## Resumo de configuração (para o seed)

| Aula | Seções | Quiz | Atividade | Formato entrega | Depende de |
| --- | --- | --- | --- | --- | --- |
| 1. Origem | 3 | não | sim | none | — |
| 2. Andamento | 3 | não | sim | audio | #6 (letra no exemplo) |
| 3. Bateria e groove | 3 | sim (áudio) | sim | none | grade de percussão |
| 4. Melodia | 3 | não | sim | audio | #3 (só-melodia), #6 (letra) |
| 5. Harmonia | 3 | sim (áudio) | sim | audio/none | #3 (progressão + toggle) |
| 6. Ritmo harmônico | 3 | não | sim | audio | slash notation |
| 7. Vozes | 3 | sim (áudio) | sim | audio | #7 (múltiplas vozes) |
| 8. Arranjo | 3 | não | sim (final) | audio | #6, #7, marcas de ensaio |

Curso: 8 aulas · 24 seções · 3 quizzes (áudio) · 8 atividades (6 em áudio, 1 entrega final).

## O que precisa existir antes de virar seed
1. **#3** — acorde/progressão tocável + toggle "só melodia" (Aulas 4, 5).
2. **#6** — letra na partitura `w:` (Aulas 2, 4, 8).
3. **#7** — múltiplas vozes `V:` (Aulas 7, 8).
4. **Grade de percussão** + **slash notation** + **marcas de ensaio** (Aulas 3, 6, 8).
5. A **gravação de referência** e a **letra confirmada** do dono (Aula 1) — e a revisão de todos os
   `abc` "modelo" contra essa gravação.
