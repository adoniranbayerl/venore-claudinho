<!--
FORMATO DE AUTORIA DE CURSO DA ACADEMY
=====================================
Este arquivo é a FONTE DA VERDADE do curso. Você edita aqui; depois o Claude
converte para um pacote `manifest.json` (.zip) e importa por /admin/academy →
"Importar curso". Nada de seed: a partir de agora todo curso entra por pacote.

Como o arquivo é lido:
- O bloco YAML abaixo (entre ---) define o curso: title, description, slug,
  status (draft | restricted | public), publiclyListed.
- `## Aula N — Título` abre uma aula. A ordem das aulas no arquivo é a ordem no curso.
- Dentro de uma aula, estas seções fixas (cada uma opcional):
  - `### Seções`     → o texto lido da aula, uma subseção por `#### Título`.
  - `### Exemplos`   → partituras tocáveis (bloco ```abc), uma por `#### Título`.
  - `### Atividades` → entregas do aluno (lista numerada).
  - `### Quiz`       → perguntas (lista numerada, alternativas com `- [ ]` / `- [x]`).
- Requisitos para concluir a aula são derivados automaticamente: tem `### Seções`
  → exige ler o texto; tem `### Quiz` → exige quiz (nota mínima 70%, até 3
  tentativas); tem `### Atividades` → exige enviar a atividade.
- Blocos especiais dentro de uma subseção de `### Seções` (vão logo após o texto):
    ```drum-grid
    style: groove-funk        # backbeat | marcha | meio-tempo | levada-cheia | groove-funk | estrofe-corinho | virada-fim-de-frase
    bpm: 80
    bars: 2
    caption: ...
    ```
    ```progression
    chords: A D E7:2 A:2      # ":n" = n tempos nesse acorde
    key: A
    bpm: 80
    beatsPerChord: 4
    caption: ...
    ```
    ```notation                # partitura embutida no texto (com ou sem "Cantar junto")
    caption: ...
    singAlong: yes             # yes | no
    ---
    X:1
    ...ABC...
    ```
    ```youtube                 # vídeo do YouTube que toca embutido na página
    title: Nome da gravação
    url: https://www.youtube.com/watch?v=XXXXXXXXXXX
    description: Uma ou duas linhas sobre o que ouvir nessa gravação.
    ```
- Exemplo tocável: subtítulo `#### Título`, uma linha `Legenda: ...`, e um bloco ```abc.
- Pergunta de quiz tipo ouvido: depois das alternativas, um bloco ```abc-prompt
  com o ABC do "ouça isto". (Alternativas com áudio: um bloco ```abc-options com
  uma linha ABC por alternativa, ou `-` para alternativa sem áudio.)
- ABC: notação https://abcnotation.com. `w:` = letra (um `_` por nota ligada),
  `Q:1/4=80` = andamento, `V:1`/`V:2` = vozes.
-->

---
title: Jesus Cristo mudou meu viver — anatomia da música
description: Uma música só, do começo ao fim — de onde ela vem, em que andamento anda, como a bateria segura o groove, como a melodia se move, como a harmonia é construída e como criar a segunda voz e o arranjo. Em Lá maior. Os exemplos de partitura são um modelo — ajuste à sua gravação de referência.
slug: jesus-cristo-mudou-meu-viver
status: public
publiclyListed: true
---

# Jesus Cristo mudou meu viver — anatomia da música

> A melodia e a 2ª voz dos exemplos são um **modelo** plausível em Lá maior,
> transcrito dos MusicXML "Voz" e "Arranjo Violão". Ajuste contra a sua gravação
> de referência (Aula 1). A melodia da Aula 5 sai do MusicXML "Voz": Lá maior,
> 4/4, ♩=80, 9 compassos = o refrão inteiro.
>
> Convenções de apresentação de melodia: sempre **por partes** (uma frase por
> exemplo), sempre em **dois andamentos** (80 real + 70 treino), sempre com a
> **letra na pauta** (`w:`), evidenciando colcheia × mínima, os tempos e as pausas.

---

## Aula 1 — A origem da música

### Seções

#### De onde vem a música

**"Jesus Cristo mudou meu viver"** é uma adaptação **em português** da canção norte-americana **"What a Difference You've Made in My Life"**, composta por **Archie Jordan** e lançada em 1977.

Embora a composição original não tenha sido escrita como uma canção explicitamente cristã, sua letra possui um caráter **ambíguo**, permitindo diferentes interpretações para o "you" a quem o narrador se dirige. Essa abertura possibilitou sua apropriação pelo meio cristão.

Em 1977, a música foi gravada pelo cantor de country **Ronnie Milsap**, alcançando o primeiro lugar nas paradas de música country. No mesmo período, **Amy Grant** gravou a canção dentro do circuito da música cristã contemporânea, contribuindo para sua circulação e popularização entre o público evangélico norte-americano.

No Brasil, o **Conjunto Som Maior** gravou a canção no LP *Mais de Cristo*. A principal diferença está na adaptação da letra: enquanto a versão original mantém indefinido quem provocou a transformação na vida do narrador, a versão brasileira coloca **Jesus Cristo explicitamente no centro do testemunho**, identificando-o como a razão da mudança.

A trajetória da música é um exemplo de como uma composição pode atravessar diferentes contextos culturais e religiosos, adquirindo novos significados sem deixar de ser reconhecida como a mesma canção.

**Fontes para aprofundamento**

- **Memória dos Batistas** — história do Conjunto Som Maior e da gravação brasileira: *O Conjunto Som Maior — Memória e História*.
- **Sandro Baggio** — análise da origem e adaptação da canção: *Jesus Cristo mudou meu viver!*
- **Wikipedia** — histórico, composição e versões da canção: *Jesus Cristo Mudou Meu Viver*.
- **Spotify** — discografia do Conjunto Som Maior, incluindo o álbum *Mais de Cristo* (1980).

#### Como ela circula no Brasil

No uso das igrejas, a música passou a se comportar como um **corinho**: aprendida de ouvido, cantada sem partitura, com diferentes versões e pequenas variações de letra convivendo. A tonalidade também pode mudar de acordo com a comunidade, os músicos e a tessitura de quem canta.

A gravação brasileira do **Conjunto Som Maior** tornou-se uma importante referência para a circulação da canção no Brasil. Posteriormente, ela foi regravada por diferentes intérpretes, como **Aline Barros** e **Mara Maravilha**, preservando a estrutura básica, mas apresentando pequenas diferenças na letra, nas repetições e nos arranjos.

Também existem releituras posteriores, como a do **Ministério Jovem**, que apresenta alterações em determinados trechos e nos créditos de adaptação. Isso mostra que a música continuou sendo reinterpretada mesmo depois de consolidada no repertório cristão brasileiro.

Essa característica é importante para entender a música como **corinho**: sua identidade não depende apenas de uma partitura ou de uma gravação específica, mas também da forma como ela é transmitida e apropriada pelas comunidades.

#### Como o texto se comporta

A letra é construída como um **testemunho pessoal em primeira pessoa**. O narrador parte de uma experiência de transformação — “Jesus Cristo mudou meu viver” — e, a partir dela, apresenta suas consequências: a vida ganha luz, o coração encontra paz e o perdão passa a fazer parte dessa nova experiência.

O texto também trabalha com **repetição e contraste**. Há um “antes”, marcado pelas ilusões, e um “agora”, marcado pela transformação. A afirmação inicial é retomada várias vezes e funciona como a ideia central que organiza todo o testemunho.

Na parte final, o testemunho deixa de ser apenas uma experiência individual e se torna uma **declaração pública**: aquilo que aconteceu com o narrador é anunciado “a toda gente”. A estrutura pode ser entendida, portanto, como:

**experiência → transformação → testemunho → afirmação final.**

#### A letra

Formalmente, a canção pode ser organizada em **refrão e duas estrofes**, embora as estrofes tenham comportamentos diferentes. O refrão apresenta e reafirma a ideia central; a primeira estrofe desenvolve a transformação interior; a segunda explica o contraste entre o passado e o presente e conduz ao testemunho.

**Refrão**

> Jesus Cristo mudou meu viver
>
> Jesus Cristo mudou meu viver
>
> É a luz que ilumina meu ser
>
> Sim, Jesus Cristo mudou meu viver

O refrão apresenta a **tese central da canção**: Jesus Cristo transformou a vida do narrador. A primeira frase é repetida integralmente, criando ênfase e facilitando a memorização. A terceira linha desenvolve a afirmação por meio da metáfora da **luz**, enquanto a última linha retoma a frase inicial.

O “**Sim**” funciona como elemento de **confirmação**. Assim, o movimento interno é:

**afirmação → repetição → desenvolvimento → confirmação.**

---

**Estrofe 1**

> Diferente hoje é o meu coração
>
> Diferente hoje é o meu coração
>
> Cristo deu-me paz e perdão
>
> Sim, diferente hoje é o meu coração

A primeira estrofe repete praticamente a mesma estrutura do refrão, **incluindo a melodia**. A diferença está no foco: o refrão fala da **mudança da vida**; aqui, a transformação é localizada no **coração**.

A palavra “**hoje**” introduz explicitamente a dimensão temporal da experiência. Existe um antes implícito e um presente transformado. “Paz” e “perdão” aparecem como **consequências concretas** dessa transformação.

Temos novamente:

**afirmação → repetição → consequência → confirmação.**

---

**Estrofe 2**

> O amor só conhecia em canções
>
> Que falavam de ilusões
>
> Mas tudo agora é diferente
>
> Isto falo à toda gente
>
> Pois Cristo deu-me Seu amor

Aqui a construção muda. Não há mais a repetição imediata das duas primeiras linhas. A letra passa a desenvolver uma pequena **narrativa de contraste**.

O narrador olha para o passado — “só conhecia” — e o associa às “ilusões”. Em seguida aparece o marcador de oposição, **“Mas”**, que introduz o presente transformado: “tudo agora é diferente”.

A penúltima linha produz uma mudança importante: o testemunho deixa de ser apenas interior e passa a ser **público** — “falo à toda gente”. A última linha explica a causa dessa transformação: **Cristo deu seu amor**.

O movimento é:

**passado → contraste → presente → testemunho → causa.**

---

**Refrão — variação final**

> Jesus Cristo mudou meu viver
>
> Jesus Cristo mudou meu viver
>
> É a luz que ilumina meu ser
>
> Sim, Jesus Cristo mudou
>
> Ele mudou meu viver

Na segunda aparição, o refrão sofre uma pequena **variação textual**. A frase final deixa de ser repetida exatamente como antes e é dividida em duas unidades:

**“Jesus Cristo mudou / Ele mudou meu viver.”**

Essa alteração mantém a ideia do refrão, mas cria uma **expansão e intensificação da afirmação final**. A repetição deixa de ser apenas literal e passa a funcionar como uma espécie de confirmação enfática.

#### Escute

Três gravações para comparar. Ouça cada uma inteira antes de ler as perguntas
mais abaixo — a ideia é perceber com o ouvido, não confirmar o que já se espera.

```youtube
title: Conjunto Som Maior — Mais de Cristo
url: https://www.youtube.com/watch?v=nhAVc3ic21A
description: A gravação que fixou a canção no Brasil. É a referência de forma, andamento e letra para quase todas as versões que vieram depois — repare no arranjo enxuto e no canto sem pressa.
```

```youtube
title: Aline Barros
url: https://www.youtube.com/watch?v=K58URLdUjLA
description: Versão posterior que mantém a estrutura e a letra tradicionais, mas muda a interpretação, o arranjo e o número de repetições. Compare o peso da banda e a condução da voz com a do Som Maior.
```

```youtube
title: Pablo Simplício
url: https://www.youtube.com/watch?v=oXiUKqnK3nk
description: Releitura mais recente. Ouça como mudanças de instrumentação, dinâmica e levada modificam a percepção da mesma composição sem descaracterizá-la.
```

**O que ouvir?**

Ao comparar as três gravações, tente identificar:

- O que permanece igual nas três versões?
- O que muda entre elas?
- Como o andamento e o ritmo alteram a percepção da música?
- Quais instrumentos aparecem em cada gravação?
- Como cada intérprete conduz a melodia?
- O que acontece com a dinâmica e a intensidade?
- Em quais momentos a música parece mais adequada para o canto congregacional?

A proposta não é escolher qual versão é “melhor”, mas perceber **como uma mesma composição pode assumir diferentes formas através do arranjo e da interpretação**.


### Atividades

1. **Comparar duas versões** — entrega: texto
   Ouça duas gravações diferentes. **Em texto**, anote três diferenças concretas: como andamento, tom, levada, letra do refrão, número de repetições, arranjos, etc.

2. **Interpretação** — entrega: texto
   **Em texto**: escreva três (3) frases sobre o que você sente ou pensa quando ouve essa música.

### Quiz

1. Qual é a origem da canção "Jesus Cristo mudou meu viver"?
   - [ ] Um pagode brasileiro
   - [x] É a versão em português de uma canção norte-americana de 1977
   - [ ] Um hino da Reforma

2. O título original em inglês é:
   - [x] "What a Difference You've Made in My Life"
   - [ ] "Amazing Grace"
   - [ ] "Shine, Jesus, Shine"

3. A música do original é de:
   - [x] Archie Jordan
   - [ ] John Newton
   - [ ] Adoniran Barbosa

4. Sobre a letra ORIGINAL em inglês:
   - [ ] Fala explicitamente de Jesus
   - [x] Não menciona Deus nem Jesus
   - [ ] É um salmo

5. A primeira gravação brasileira foi de:
   - [x] Conjunto Som Maior
   - [ ] Aline Barros
   - [ ] Padre Marcelo

6. Por que existem "várias versões de letra"?
   - [ ] Erro de impressão
   - [x] A música passou a circular como corinho e foi sendo adaptada
   - [ ] Disputa autoral

7. A intenção da música é:
   - [ ] Falar sobre como a vida é difícil
   - [x] Ser testemunho de como Jesus transforma nossa vida
   - [ ] Dizer que o amor é ilusão

8. Nas igrejas, a música inspira a:
   - [x] Refletir sobre a vida com Jesus
   - [ ] Ser prospero financeiramente
   - [ ] Uma ária de ópera

9. Qual é a principal diferença entre a versão original e a adaptação brasileira?
   - [ ] Pergunta e resposta jurídica
   - [ ] Não tem forma
   - [x] Afirma → repete → arremata com "Sim, …"

10. Qual é uma característica importante da estrutura da letra de "Jesus Cristo mudou meu viver"?
   - [ ] A versão brasileira mudou completamente a melodia
   - [x] A versão brasileira identifica explicitamente Jesus Cristo como aquele que transforma a vida
   - [ ] A versão brasileira foi composta originalmente no Brasil

---

## Aula 2 — A letra: versos, sílabas e sentido

### Seções

#### Os três blocos de texto

A música tem um **refrão**, que carrega o tema principal, e **duas estrofes**. Esses três trechos de letra se apoiam sobre **dois materiais melódicos**, que vamos chamar de **Bloco A** e **Bloco B**. Vale separar duas ideias que costumam ser confundidas: **refrão e estrofe são funções dentro da forma** (o que cada parte faz na música); **Bloco A e Bloco B identificam o material melódico** (que melodia está tocando ali).

- **Bloco A — Refrão:** "Jesus Cristo mudou meu viver" (×2) / "É a Luz que ilumina meu ser" / "Sim, Jesus Cristo mudou meu viver".
- **Bloco A — Estrofe 1:** "Diferente, hoje é o meu coração" (×2) / "Cristo deu-me paz e perdão" / "Sim, diferente hoje é o meu coração".
- **Bloco B — Estrofe 2:** "O amor só conhecia em canções / Que falavam de ilusões / Tudo agora é diferente / Isto falo a toda a gente / Pois, Cristo deu-me seu Amor".

O **Bloco A** aparece duas vezes, com letras diferentes: no refrão e na Estrofe 1. A melodia é a mesma; o que muda é a **função do texto** — o refrão declara a ideia central, a estrofe a desenvolve. Já o **Bloco B** traz uma melodia diferente e funciona como **contraste**: é onde a música "conta" alguma coisa antes de o refrão voltar a confirmar.

Ou seja: uma estrofe pode usar exatamente a mesma melodia do refrão. Não dá para deduzir o material melódico só pelo nome da parte.

#### O pulso: onde a letra se apoia

Antes de encaixar a letra, é preciso sentir o **pulso**. A música está em **compasso quaternário (4/4)**: quatro tempos que se repetem.

**1 — 2 — 3 — 4**

O groove da bateria marca esse ciclo (detalhado na Aula 4):

- **Bumbo:** no tempo 1 e no "e" do tempo 2.
- **Caixa:** nos tempos 2 e 4 (o *backbeat*).
- **Chimbal:** subdividindo — "1 e 2 e 3 e 4 e".

```drum-grid
style: estrofe-corinho
bpm: 80
bars: 2
caption: O pulso 4/4 da música — conte "1 — 2 — 3 — 4": caixa nos tempos 2 e 4, bumbo no 1 e no "e" do 2.
```

A letra **não começa no tempo 1**. Logo na entrada, "**Je-sus**" soa **antes** do primeiro tempo do compasso. Isso é a **anacruse**: uma ou mais notas que vêm antes do primeiro tempo forte, funcionando como impulso para o compasso começar.

Dá para imaginar a entrada assim:

**[ 1 — 2 — Je — sus ] | [ Cris — to … ]**

"Je-sus" prepara; quando o tempo 1 chega, "**Cris**-to" já continua a frase. Por isso, ao analisar a letra, não basta dizer "'Je' = tempo 1". A pergunta certa é: **em que parte do compasso cada sílaba cai?**

#### Sílaba tônica e prosódia musical

Toda palavra tem uma **sílaba tônica** — a que é dita mais forte na fala:

- Je-**sus**
- **Cris**-to
- mu-**dou**
- meu vi-**ver**

Essas sílabas fortes **não precisam** cair todas em tempo forte da música. A melodia pode colocar uma tônica numa subdivisão fraca de propósito, para criar movimento e antecipação. O que interessa é a **relação** entre a acentuação da palavra e a acentuação da melodia — isso se chama **prosódia musical**. Quando as duas brigam demais (uma tônica importante sempre num ponto fraco, uma palavra "esticada" no lugar errado), a frase soa torta; quando conversam, o texto "canta sozinho".

Vale também olhar as **rimas**: "viver" / "ser" fecham as linhas do Bloco A; "coração" / "perdão" fecham as da Estrofe 1. A rima ajuda a marcar onde uma frase termina.

O olhar desta aula, resumido:

**sílabas → acentuação da palavra → posição no compasso.**

Na Aula 3 a gente coloca essas sílabas sobre a contagem "1 e 2 e 3 e 4 e" e vê exatamente onde cada uma cai.

#### A forma: afirma, repete, arremata

As quatro linhas do refrão (Bloco A) fazem sempre o mesmo desenho: **afirma** (linha 1) → **repete igual** (linha 2, para fixar) → **desenvolve** (linha 3, a consequência: "É a Luz…") → **arremata** (linha 4: "**Sim**, Jesus Cristo mudou meu viver" — a linha 1 de volta, agora confirmada).

A **Estrofe 1** usa o mesmo Bloco A e o mesmo desenho — só troca o conteúdo: a transformação agora é do coração, e as consequências são paz e perdão.

A **Estrofe 2** usa o **Bloco B**. São cinco linhas mais curtas, de caráter narrativo: parte do passado ("canções", "ilusões"), marca a virada ("tudo agora é diferente") e termina apontando a causa ("Cristo deu-me seu Amor").

O mapa da letra, então:

**Refrão (Bloco A) → Estrofe 1 (Bloco A) → Estrofe 2 (Bloco B) → Refrão (Bloco A)**

### Exemplos

#### A anacruse: "Je-sus" antes do tempo 1 — 80 BPM

Legenda: As duas notas de "Je-sus" caem ANTES da barra de compasso (a anacruse). O tempo 1 chega com "Cris". Repare que as tônicas "sus", "dou" e "ver" caem em pontos de apoio da melodia.

```abc
X:1
M:4/4
L:1/8
Q:1/4=80
K:A
z4 A,2 B,2 | CCC C2 B,A,E- | E4 z4 |]
w: Je-sus Cris-to mu-dou meu vi-ver _
```

#### A mesma entrada, devagar — 60 BPM

Legenda: Bem lento, para localizar cada sílaba dentro do compasso: onde está o "1", onde entra "Cris", onde a voz sustenta em "vi-VER".

```abc
X:1
M:4/4
L:1/8
Q:1/4=60
K:A
z4 A,2 B,2 | CCC C2 B,A,E- | E4 z4 |]
w: Je-sus Cris-to mu-dou meu vi-ver _
```

### Atividades

1. **Marcar as tônicas** — entrega: texto
   Escreva as quatro linhas do Refrão e destaque (maiúscula ou sublinhado) a sílaba TÔNICA de cada palavra importante. Depois faça o mesmo com a Estrofe 2. Entregue em texto.

2. **Ler em voz alta no ritmo da fala** — entrega: áudio
   Grave você LENDO (não cantando) o Refrão e a Estrofe 2, no ritmo natural da fala, batendo palma nas sílabas tônicas. Depois compare esse ritmo com a música e observe onde a melodia mantém ou modifica a acentuação natural da fala.

### Quiz

1. Quantos blocos de letra a música tem?
   - [ ] Um só
   - [x] Três (Refrão, Estrofe 1 e Estrofe 2)
   - [ ] Sete

2. A primeira linha do Refrão é:
   - [ ] "Diferente, hoje é o meu coração"
   - [x] "Jesus Cristo mudou meu viver"
   - [ ] "O amor só conhecia em canções"

3. Quantos materiais melódicos principais podemos identificar nesses três blocos de texto?
   - [ ] Um só
   - [x] Dois: Bloco A e Bloco B
   - [ ] Três, um para cada bloco de letra

4. O Refrão e a Estrofe 1:
   - [ ] Têm materiais melódicos completamente diferentes
   - [x] Usam o mesmo material melódico, o Bloco A
   - [ ] São ambos parte do Bloco B

5. "ver" e "ser" no fim das linhas formam:
   - [ ] Uma aliteração
   - [x] Uma rima
   - [ ] Um hiato

6. No canto, uma relação importante a observar é:
   - [ ] A primeira sílaba de cada palavra com o tempo forte
   - [x] A relação entre a sílaba tônica e o acento da melodia
   - [ ] Sempre uma vogal com o tempo forte

7. As tônicas principais de "Jesus Cristo mudou meu viver" são:
   - [ ] Je / Cris / meu
   - [x] sus / dou / ver
   - [ ] todas iguais

8. Se a sílaba tônica entra em conflito com o acento musical, isso:
   - [ ] É sempre um erro
   - [x] Pode produzir um problema de prosódia e merece ser analisado
   - [ ] Não pode ser percebido pelo ouvinte

9. A Estrofe 2 ("O amor só conhecia em canções") utiliza:
   - [ ] O mesmo material melódico do Bloco A
   - [x] O Bloco B, criando contraste
   - [ ] Nenhum material melódico definido

10. O que a distinção entre "refrão/estrofe" e "Bloco A/Bloco B" nos ajuda a perceber?
    - [ ] Que cada estrofe precisa ter uma melodia diferente
    - [x] Que a função textual e o material melódico são coisas diferentes
    - [ ] Que refrão e estrofe são sempre musicalmente idênticos

---

## Aula 3 — Andamento e caráter

### Seções

#### O que é andamento (BPM)

**Andamento** é a velocidade do pulso — quantas batidas por minuto (BPM). É a primeira decisão de quem vai reger a música, porque tudo o mais (fraseado, respiração, levada da bateria) se ajusta a ela.

Na Aula 2 a gente sentiu o pulso "1 — 2 — 3 — 4". Agora damos um número a esse pulso. Uma referência prática:

- **60 BPM** = uma batida por segundo (o ponteiro dos segundos do relógio).
- **80 BPM** = um pouco mais rápido que isso — dá para bater palma confortavelmente em todos os quatro tempos, sem correr e sem arrastar.
- **120 BPM** = ritmo de marcha, "andando rápido".

#### Definir o BPM desta música

A partitura de referência (o MusicXML "Voz") traz **♩ = 80 BPM** — a semínima vale 80 por minuto. É um andamento **moderado e marcado**: nem balada (arrastaria), nem corrido (perderia a solenidade de um testemunho). Na prática, as gravações que você ouviu na Aula 1 variam entre uns **76 e 88 BPM** — o Som Maior mais contido, versões mais recentes um pouco à frente. Vamos usar **80** como referência de trabalho, sabendo que essa é uma escolha, não uma obrigação.

#### Contagem de entrada e anacruse

Antes de a música começar, quem conduz dá **um compasso de contagem** — conta "1, 2, 3, 4" em voz alta (ou com a mão) já no andamento exato, para todo mundo entrar junto. É por isso que o "Cantar junto" desta plataforma sempre toca quatro cliques antes: é a mesma contagem.

E aqui volta a **anacruse** da Aula 2: as duas sílabas "**Je-sus**" caem **antes** do primeiro tempo forte, ainda sobre o acorde de dominante (E, ver Aula 6). O tempo 1 só chega com "**Cris**" (de "Cristo"), já sobre a tônica (A). Na hora de contar, isso significa deixar o espaço: a voz entra ainda no "3 e 4" da contagem, não no "1".

#### Como o andamento muda a mensagem

O andamento não é só técnico — ele **muda o que a letra comunica**. Cante a primeira frase três vezes:

- **a 70 BPM:** soa reflexiva, íntima, quase uma oração falada.
- **a 80 BPM (o da partitura):** firme e celebrativa — um testemunho dito com convicção.
- **a 96 BPM:** começa a soar apressada; a palavra "não respira", as notas longas encolhem.

Nenhum está "errado". Escolher o andamento é **uma decisão de interpretação**, e ela depende de para que serve aquele momento: abertura de culto, ministração, encerramento. A mesma música pode ser lenta numa hora e firme em outra.

### Exemplos

#### A 1ª frase com a anacruse — 80 BPM (andamento da partitura)

Legenda: Duas semínimas (Lá–Si) antes do tempo 1; o tempo 1 chega com "Cris". Depois a corrida de colcheias e a nota longa em "vi-VER".

```abc
X:1
M:4/4
L:1/8
Q:1/4=80
K:A
z4 A,2 B,2 | CCC C2 B,A,E- | E4 z4 |]
w: Je-sus Cris-to mu-dou meu vi-ver _
```

#### A mesma frase — 70 BPM (treino)

Legenda: A mesma entrada, mais devagar, para praticar sem correr a anacruse.

```abc
X:1
M:4/4
L:1/8
Q:1/4=70
K:A
z4 A,2 B,2 | CCC C2 B,A,E- | E4 z4 |]
w: Je-sus Cris-to mu-dou meu vi-ver _
```

### Atividades

1. **Cantar a anacruse no tempo** — entrega: áudio
   Cante "Je-sus Cristo mudou" junto do metrônomo a 80 BPM, entrando na anacruse depois da contagem. Grave.

2. **Testar três andamentos** — entrega: áudio
   Grave a primeira frase três vezes: ~70, ~80 e ~96 BPM. Em texto, diga qual você escolheria para a sua igreja e por quê.

### Quiz

1. O andamento da partitura desta música é:
   - [ ] ~60 BPM
   - [x] ~80 BPM
   - [ ] ~130 BPM

2. A 80 BPM, a sensação é:
   - [ ] Arrastada
   - [x] Firme e celebrativa
   - [ ] Apressada demais

3. "Compasso de contagem" antes de começar serve para:
   - [x] Todos entrarem juntos no andamento certo
   - [ ] Afinar os instrumentos
   - [ ] Marcar o fim

4. A anacruse desta música são as sílabas:
   - [ ] "mu-dou"
   - [x] "Je-sus", caindo antes do primeiro tempo forte
   - [ ] "vi-ver"

5. O primeiro tempo forte (tempo 1) chega junto com:
   - [ ] "Je-"
   - [x] "Cris-" (de "Cristo")
   - [ ] "-ver"

6. A anacruse acontece harmonicamente sobre:
   - [ ] A tônica (A)
   - [x] A dominante (E)
   - [ ] A subdominante (D)

7. A 96 BPM, o problema é:
   - [ ] Fica reflexiva demais
   - [x] A palavra não "respira"
   - [ ] Ninguém consegue bater palma

8. Escolher o andamento é:
   - [ ] Um detalhe sem importância
   - [x] Uma decisão de interpretação que muda a mensagem
   - [ ] Fixado pela partitura, imutável

9. Ouça: este andamento está mais perto de
   - [ ] 70 BPM
   - [x] 80 BPM
   - [ ] 110 BPM
   ```abc-prompt
   X:1
   M:4/4
   L:1/4
   Q:1/4=80
   K:C
   c c c c | c c c c |
   ```

10. Ouça a frase com anacruse: as duas primeiras notas caem antes ou depois do primeiro tempo forte?
    - [x] Antes
    - [ ] Depois
    ```abc-prompt
    X:1
    M:4/4
    L:1/8
    Q:1/4=80
    K:A
    z4 A,2 B,2 | CCC C2 B,A,E- | E4 z4 |]
    ```

---

## Aula 4 — A bateria e o groove

### Seções

#### As três peças que interessam

Uma bateria tem muitas peças, mas para entender a levada desta música bastam três:

- **Bumbo** (o pé): som grave, "bum". Marca o **peso** da levada, geralmente perto do tempo 1.
- **Caixa** (a mão): som seco e estalado, "tá". Faz o **backbeat** — o acento nos tempos 2 e 4, que a congregação imita batendo palma.
- **Chimbal / prato de condução:** som agudo e curto, "ts". Faz a **subdivisão** — mantém o tique-taque contínuo que dá o "andar" da música.

A relação entre esses três é o que a gente chama de **groove**: não é tocar mais notas, é onde exatamente cada golpe cai.

#### A levada base — groove funk (gospel)

O andamento (80 BPM) e o caráter celebrativo pedem uma **levada groovada, de pegada gospel/funk** — não um rock reto e quadrado. Os três elementos, agora com mais detalhe:

- **Chimbal:** **semicolcheias** contínuas (o dobro da velocidade da colcheia) — é o "motor" que dá o balanço miúdo.
- **Caixa:** *backbeat* nos tempos **2 e 4**, com **notas fantasma** — toques bem fracos na semicolcheia logo antes de cada backbeat, que "engordam" o groove sem virar acento.
- **Bumbo:** **sincopado** — além do tempo **1**, ele pega a "a" do 1, o "e" do 2 e o "e" do 3. São essas notas fora do tempo forte que "empurram" a levada para a frente.

```drum-grid
style: groove-funk
bpm: 80
bars: 2
caption: Groove funk (gospel) — a levada "cheia", que costuma servir para o refrão.
```

#### Grooves por parte da música

A bateria **não toca igual o tempo todo** — ela **sinaliza a forma da música**. Quem ouve, mesmo sem perceber, sabe que "chegou o refrão" porque a levada encheu. É uma ferramenta de arranjo tão forte quanto a harmonia.

Uma distribuição de trabalho, das partes mais leves para as mais cheias:

- **Introdução / interlúdio (arranjo de violão):** bateria **fora**, ou só o chimbal fechado marcando bem discreto. Deixa o violão sozinho.
- **Estrofe:** levada **contida** — chimbal em colcheias (não semicolcheias), caixa só no tempo **4**, bumbo no 1 e no "e" do 2. Menos densidade = mais espaço para a letra "que conta".
- **Refrão:** a levada **cheia** (o groove funk acima) — chimbal em semicolcheias, caixa em 2 e 4, bumbo denso. É o contraste que faz o refrão "abrir".
- **Refrão final (depois da parada):** igual ao refrão, com o **chimbal aberto no tempo 1** e tudo no volume máximo — o ponto mais alto da música.

Repare que a diferença entre estrofe e refrão é quase só **densidade do chimbal e presença da caixa** — não é preciso mudar tudo para a forma ficar clara.

```drum-grid
style: estrofe-corinho
bpm: 80
bars: 2
caption: Estrofe — levada contida: chimbal em colcheias, caixa só no 4, bumbo no 1 e no "e" do 2.
```

#### Viradas (fills): anunciar a mudança

A **virada** (ou *fill*) é um pequeno desvio da levada — a bateria "quebra" o padrão por um ou dois tempos — que funciona como um aviso: **"vem coisa nova"**. Sem ela, a troca de estrofe para refrão pega a congregação desprevenida.

Em geral a virada cai **nos dois últimos tempos de um compasso**, logo antes da parte nova. Nesta música:

- **Da estrofe para o refrão:** uma virada de **1 compasso** — a caixa corre em semicolcheias nos tempos 3 e 4, e o bumbo marca forte o "1" do refrão, junto com o prato.
- **Antes do refrão final:** a **parada** (*break*) — a banda inteira para por 1–2 tempos, sobra só a voz ou um prato, e volta com tudo. É o recurso mais dramático do arranjo (ver Aula 10).

Regra prática: **virada curta e clara vale mais que virada longa e enfeitada**. A função dela é fazer a banda e a congregação **chegarem juntas** na parte nova — não mostrar habilidade.

```drum-grid
style: virada-fim-de-frase
bpm: 80
bars: 1
caption: Virada de fim de frase: caixa em semicolcheias nos tempos 3–4, bumbo forte no 1 seguinte.
```

### Atividades

1. **Bater o backbeat e trocar de levada** — entrega: texto
   Com a gravação tocando: bata palma no backbeat (2 e 4) por uma estrofe e um refrão sem errar. Em texto, descreva o que a bateria faz de diferente entre a estrofe e o refrão, e onde entra a virada.

2. **Cantar os grooves com a boca** — entrega: áudio
   Grave você marcando com a boca ("bum" no bumbo, "tá" na caixa, "ts" no chimbal): 4 compassos da levada de estrofe, uma virada de 1 compasso, e 4 compassos da levada de refrão.

### Quiz

1. Numa levada com backbeat, a caixa está tocando em:
   - [ ] 1 e 3
   - [x] 2 e 4
   - [ ] Todos os tempos

2. A peça que dá o "balanço" funk, correndo miúdo o tempo todo, é:
   - [ ] O bumbo
   - [ ] A caixa
   - [x] O chimbal em semicolcheias

3. Na ESTROFE, a levada de trabalho é:
   - [ ] A mais cheia possível
   - [x] Contida — chimbal em colcheias, caixa só no 4
   - [ ] Igual ao refrão

4. No REFRÃO, a levada é:
   - [x] A cheia (groove funk)
   - [ ] Só bumbo
   - [ ] Sem bateria

5. Durante o interlúdio de violão, a bateria costuma:
   - [ ] Tocar o mais forte possível
   - [x] Ficar fora, ou só um chimbal bem discreto
   - [ ] Fazer um solo

6. Uma "virada" (fill) costuma cair:
   - [ ] No tempo 1
   - [x] Nos dois últimos tempos de um compasso, anunciando a parte nova
   - [ ] No meio de toda frase

7. A virada da estrofe para o refrão serve para:
   - [ ] Corrigir o andamento
   - [x] A banda e a congregação chegarem juntas no refrão
   - [ ] Dar um solo longo

8. A "parada" antes do refrão final é:
   - [x] A banda toda parando 1–2 tempos e voltando com tudo
   - [ ] Um erro de ensaio
   - [ ] O fim da música

9. No refrão final, o chimbal costuma:
   - [ ] Sumir
   - [x] Abrir no tempo 1
   - [ ] Ficar mais lento

10. Ouça o groove: a caixa está em 1 e 3 ou em 2 e 4?
    - [ ] 1 e 3
    - [x] 2 e 4
    ```abc-prompt
    X:1
    M:4/4
    L:1/8
    K:C
    z2 c2 z2 c2 | z2 c2 z2 c2 |
    ```

---

## Aula 5 — A melodia, frase a frase

### Seções

#### O que é "melodia" aqui

Melodia é a **sequência de notas que a voz canta** — a linha que fica na cabeça. Nesta aula olhamos a melodia do **refrão** (o Bloco A da Aula 2), que é a linha que a partitura de referência traz. Três coisas para observar em qualquer melodia: o **âmbito** (da nota mais grave à mais aguda), o **contorno** (sobe, desce, fica parada) e o **pico** (o ponto mais alto, quase sempre o momento de maior tensão do texto).

#### Âmbito, contorno e o pico

A melodia vai da tônica **Lá** grave até o **Mi agudo** — cerca de **uma oitava e um pouco**. É um âmbito confortável para a maioria das vozes; só o Mi agudo pode apertar (ver Aula 9).

O movimento é quase todo por **graus conjuntos** — de uma nota para a vizinha, sem saltos. Isso torna a melodia fácil de cantar de ouvido. Os poucos saltos maiores são: a **quarta** "de hino" (grau 5 → grau 1) e a subida ao **Mi agudo** no começo da 3ª frase.

Esse Mi agudo é o **pico da música**, e ele cai exatamente sobre "É a **Luz**" — a palavra-chave do texto. Melodia e letra apontam para o mesmo lugar. Depois do pico a melodia **desce** de volta, e o fecho pousa no **grau 5** (Mi médio), que **não é a tônica**. Terminar fora da tônica deixa a frase "no ar" — é por isso que o refrão pede para ser repetido, e por isso a música toda gira em torno dele.

#### Colcheia, mínima, tempos e pausas

Antes de cantar, três coisas para o olho e o ouvido:

- **Colcheias** (♪) carregam as sílabas rápidas ("Cris-to-mu-", "i-lu-mi-"). São a "corrida" da frase — sílabas leves, que passam depressa.
- **Mínimas** (𝅗𝅥) e a **semínima pontuada** do compasso 7 são as **notas longas**. Elas caem sempre numa sílaba tônica ("vi-**ver**", "meu **ser**"), e é onde a voz **sustenta** e a frase respira. Segure essas notas o valor inteiro — encurtá-las é o erro mais comum de quem canta de ouvido.
- As **pausas** entre as frases são **respirações escritas**. Não são "buraco" nem tempo perdido — são parte do fraseado. Respire nelas, e não no meio da frase anterior.

Regra de leitura: onde tem **nota longa**, ali é ponto de apoio (sílaba forte); onde tem **corrida de colcheias**, as sílabas são de passagem.

#### As quatro frases

O refrão são **quatro frases** com o mesmo esqueleto rítmico, mas finais diferentes — é a variação dos finais que dá forma:

1. **"Jesus Cristo mudou meu viver"** — sobe da tônica até o Mi médio e termina **aberta** (não resolve).
2. **"Jesus Cristo mudou meu viver"** — repete o contorno, mas agora **desce e fecha no Lá** (grau 1, a tônica).
3. **"É a Luz que ilumina meu ser"** — **sobe ao pico** (Mi agudo) logo no começo e começa a descer.
4. **"Sim, Jesus Cristo mudou meu viver"** — desce do agudo até o fecho no **grau 5**, com um pequeno **melisma** em "vi-**ver**" (duas notas numa sílaba só, Fá♯ → Mi).

Estude uma frase de cada vez, nos exemplos abaixo — primeiro a 70 BPM, depois a 80.

### Exemplos

#### Frase 1 — "Jesus Cristo mudou meu viver" — 80 BPM

Legenda: Anacruse Lá–Si ("Je-sus"), corrida de colcheias em "Cris-to-mu-", e a nota longa em "vi-VER" atravessando para o compasso seguinte, com pausa (respiração) depois.

```abc
X:1
M:4/4
L:1/8
Q:1/4=80
K:A
z4 A,2 B,2 | CCC C2 B,A,E- | E4 z4 |]
w: Je-sus Cris-to mu-dou meu vi-ver _
```

#### Frase 1 — 70 BPM (treino)

Legenda: A mesma frase, mais devagar — sinta a diferença entre as colcheias rápidas e a nota longa em "ver".

```abc
X:1
M:4/4
L:1/8
Q:1/4=70
K:A
z4 A,2 B,2 | CCC C2 B,A,E- | E4 z4 |]
w: Je-sus Cris-to mu-dou meu vi-ver _
```

#### Frase 2 — repete e fecha no Lá — 80 BPM

Legenda: Mesmo texto, contorno parecido, mas agora a frase DESCE e pousa no Lá (grau 1). Compare o fim desta com o fim da frase 1.

```abc
X:1
M:4/4
L:1/8
Q:1/4=80
K:A
z4 z2 C E | FFF F2 E D A- | A4 z4 |]
w: Je-sus Cris-to mu-dou meu vi-ver _
```

#### Frase 2 — 70 BPM (treino)

Legenda: A mesma, devagar.

```abc
X:1
M:4/4
L:1/8
Q:1/4=70
K:A
z4 z2 C E | FFF F2 E D A- | A4 z4 |]
w: Je-sus Cris-to mu-dou meu vi-ver _
```

#### Frase 3 — o pico, "É a Luz que ilumina meu ser" — 80 BPM

Legenda: Sobe ao Mi AGUDO logo no começo ("É a LUZ") — o ponto mais alto da música — e começa a descer. Note a semínima pontuada e as colcheias de "i-lu-mi-na".

```abc
X:1
M:4/4
L:1/8
Q:1/4=80
K:A
z4 z2 A B | c2 ccc d e A- | A4 z4 |]
w: É a Luz que~i-lu-mi-na meu ser _
```

#### Frase 3 — 70 BPM (treino)

Legenda: A subida ao pico, devagar, para acertar a afinação do Mi agudo sem forçar.

```abc
X:1
M:4/4
L:1/8
Q:1/4=70
K:A
z4 z2 A B | c2 ccc d e A- | A4 z4 |]
w: É a Luz que~i-lu-mi-na meu ser _
```

#### Frase 4 — o fecho, "Sim, Jesus Cristo mudou meu viver" — 80 BPM

Legenda: Desce do agudo até o fecho no GRAU 5 (Mi médio, não a tônica). "vi-VER" tem um pequeno melisma (Fá♯ → Mi) — duas notas na mesma sílaba.

```abc
X:1
M:4/4
L:1/8
Q:1/4=80
K:A
A B c3 E A c | d d c A3 F2 | E8 |]
w: Sim, Je-sus Cris-to mu-dou meu vi-ver _ _
```

#### Frase 4 — 70 BPM (treino)

Legenda: O fecho, devagar — segure o Mi final e ouça que ele "não resolve", puxando a repetição.

```abc
X:1
M:4/4
L:1/8
Q:1/4=70
K:A
A B c3 E A c | d d c A3 F2 | E8 |]
w: Sim, Je-sus Cris-to mu-dou meu vi-ver _ _
```

#### O refrão inteiro, com a letra — 80 BPM (referência)

Legenda: As quatro frases seguidas, uma vez, com a letra do Refrão A. Use os exemplos por frase acima para estudar; este é só para ouvir o conjunto.

```abc
X:1
M:4/4
L:1/8
Q:1/4=80
K:A
z4 A,2 B,2 | CCC C2 B,A,E- | E4 z2 C E | FFF F2 E D A- | A4 z2 A B | c2 ccc d e A- | A B c3 E A c | d d c A3 F2 | E8 |]
w: Je-sus Cris-to mu-dou meu vi-ver _ Je-sus Cris-to mu-dou meu vi-ver _ É a Luz que~i-lu-mi-na meu ser _ Sim, Je-sus Cris-to mu-dou meu vi-ver _
```

### Atividades

1. **Cantar frase a frase (80 e 70)** — entrega: áudio
   Cante cada uma das quatro frases junto do modelo, primeiro a 70 BPM e depois a 80 ("Cantar junto" — feedback por nota). Preste atenção em respirar nas pausas e sustentar as notas longas. Grave a versão a 80.

2. **Marcar longas, corridas e respirações** — entrega: texto
   Em texto: para cada frase, diga onde estão as notas LONGAS (sílaba e palavra), onde está a CORRIDA de colcheias, e onde você RESPIRA. Depois diga em que sílaba cai o pico da música.

### Quiz

1. A linha melódica que a partitura traz é a do:
   - [ ] Estrofe
   - [x] Refrão
   - [ ] Contracanto do baixo

2. O pico (nota mais aguda) da música cai sobre a palavra:
   - [ ] "viver"
   - [x] "Luz" (no "É a Luz")
   - [ ] "Jesus"

3. A melodia se move principalmente por:
   - [ ] Saltos grandes
   - [x] Graus conjuntos (notas vizinhas)
   - [ ] Repetição da mesma nota

4. As colcheias em "Cris-to-mu-" são:
   - [ ] As notas longas da frase
   - [x] A "corrida" — sílabas rápidas e leves
   - [ ] Pausas

5. As notas longas (mínimas) caem sempre:
   - [ ] Numa sílaba fraca
   - [x] Numa sílaba tônica, onde a voz sustenta
   - [ ] No meio de uma palavra

6. As pausas entre as frases são:
   - [ ] Erro da partitura
   - [x] Respirações escritas — parte do fraseado
   - [ ] Para o instrumento solar

7. A frase 1 termina:
   - [ ] Fechada, na tônica
   - [x] Aberta (não na tônica)
   - [ ] No pico

8. A frase 2, comparada à 1:
   - [ ] É totalmente diferente
   - [x] Repete o contorno mas fecha no Lá (grau 1)
   - [ ] É mais aguda

9. O fecho da música (frase 4) pousa no:
   - [ ] Grau 1 (tônica, resolvido)
   - [x] Grau 5 (aberto — "pede" a repetição)
   - [ ] Grau 7

10. Ouça: a frase começa por uma nota grave ou pelo pico agudo?
    - [ ] Grave
    - [x] Pelo pico (agudo)
    ```abc-prompt
    X:1
    M:4/4
    L:1/8
    Q:1/4=80
    K:A
    z4 z2 A B | cccc de A2 |
    ```

---

## Aula 6 — A harmonia: como é criada

### Seções

#### O que é harmonia

Enquanto a melodia é uma nota de cada vez, a **harmonia** são **várias notas soando juntas** — os **acordes** que o violão, o teclado ou o coro sustentam por baixo da melodia. A harmonia dá "chão" para a voz: é ela que faz a mesma nota cantada soar alegre, tensa ou triste, dependendo do acorde que está embaixo.

Um **acorde** é, na forma mais simples, três notas empilhadas de três em três (uma **tríade**). Cada acorde recebe o nome da sua nota mais grave: o acorde de **Lá maior** (A) tem Lá–Dó♯–Mi.

#### O campo harmônico de Lá maior

Numa tonalidade, existe um conjunto de acordes "da casa" — os que se formam usando só as notas da escala. Isso se chama **campo harmônico**. Cada acorde ganha um número romano pela sua posição na escala:

- **A** = grau **I** (a tônica, o "repouso")
- **D** = grau **IV** (a subdivisão, "abre")
- **E** (ou **E7**) = grau **V** (a dominante, "aperta", pede para voltar ao I)
- **F#m** = grau **vi** (o relativo menor, usado "para dar cor")

Esta música usa quase só **I, IV e V** (mais o vi de vez em quando). Bm (grau ii) aparece em algumas versões no lugar do D. É uma harmonia de **três ou quatro acordes de propósito**: assim a congregação acompanha sem ensaio, e dá para transpor para qualquer tom só trocando as letras.

#### A progressão do refrão (uma versão de trabalho)

**Progressão** é a sequência de acordes ao longo do tempo. Sobre as quatro frases do refrão, uma harmonização simples e comum (um acorde por compasso, salvo indicação):

`| (E na anacruse) | A | D | A | E |  | A | D | E7 | A |`

- **Frase 1** sai da **anacruse em E** (dominante) e cai em **A** no tempo 1; passa por **D** e termina "aberta" em **E** — uma **meia-cadência**.
- **Frase 2** refaz o caminho e fecha **E7 → A** — uma **cadência autêntica** (V → I), o "ponto final".
- **Frases 3–4** costumam repetir o mesmo trajeto, com o **E7 → A** final "amarrando" tudo.

**Confirme contra a sua gravação** — a distribuição exata dos acordes varia bastante de versão para versão.

#### Onde a música respira e resolve

Toda quebra de frase é uma **cadência** — o jeito como a harmonia "pontua" o texto:

- **Meia-cadência** (termina no V): é uma **vírgula**. A frase parou, mas a ideia continua. É o fim da frase 1.
- **Cadência autêntica** (V → I): é um **ponto final**. A frase fechou. É o fim das frases 2 e 4.

É a alternância vírgula / ponto que dá forma à música — do mesmo jeito que a pontuação organiza um parágrafo.

O detalhe fino: a **melodia** fecha no **grau 5** (Mi), não na tônica. Então, mesmo com o acorde de **A** (I) embaixo no último compasso, o ouvido não sente repouso total — a nota cantada está "puxando" para outro lugar. Harmonia resolvida + melodia aberta = a sensação exata de "quero cantar de novo".

### Exemplos

#### Progressão do refrão (tocável)

Legenda: E (anacruse) → A → D → A → E (abre) / A → D → E7 → A (resolve). Ouça o D "abrir", o E "apertar", o A "assentar".

```abc
X:1
M:4/4
L:1/1
Q:1/4=80
K:A
"E"[E,GB] | "A"[A,CE] | "D"[D,FA] | "A"[A,CE] | "E"[E,GB] | "A"[A,CE] | "D"[D,FA] | "E7"[E,GBd] | "A"[A,CE] |
```

### Atividades

1. **Tocar a progressão do refrão** — entrega: áudio
   Toque no seu instrumento harmônico a progressão do refrão (as duas linhas), 4 tempos por acorde. Grave.

2. **Achar D e E de ouvido** — entrega: texto
   Ouça a música três vezes e, em texto, anote em que sílaba do refrão entra o D e em que sílaba entra o E. Compare com o modelo desta aula.

### Quiz

1. Os acordes principais da música, em Lá maior, são:
   - [ ] A–B–C#–D
   - [x] A (I), D (IV), E (V), F#m (vi)
   - [ ] Qualquer acorde

2. A harmonia é de poucos acordes porque:
   - [ ] O compositor não sabia mais
   - [x] Assim a congregação acompanha sem ensaio
   - [ ] É uma regra da partitura

3. A anacruse ("Je-sus") acontece sobre:
   - [ ] A (tônica)
   - [x] E (dominante)
   - [ ] F#m

4. A frase 1 do refrão termina numa:
   - [ ] Cadência autêntica
   - [x] Meia-cadência (para no V)
   - [ ] Cadência plagal

5. A cadência que "fecha" (ponto final) é:
   - [ ] A → D
   - [x] E7 → A (autêntica)
   - [ ] D → E

6. Mesmo com o acorde de A no fim, a música soa "não resolvida" porque:
   - [ ] O baixista erra
   - [x] A MELODIA fecha no grau 5 (Mi), não na tônica
   - [ ] O andamento cai

7. Pensar a progressão como I–IV–V em vez de A–D–E serve para:
   - [ ] Tocar mais rápido
   - [x] Transpor a música para outro tom facilmente
   - [ ] Nada, é igual

8. Algumas versões trocam o D por:
   - [x] Bm (ii)
   - [ ] G (bVII)
   - [ ] C#m (iii)

9. Ouça: esta progressão termina resolvida (na tônica) ou aberta (na dominante)?
   - [ ] Resolvida
   - [x] Aberta
   ```abc-prompt
   X:1
   M:4/4
   L:1/2
   Q:1/4=100
   K:A
   "A"[A,CE] "D"[D,FA] | "E"[E,GB]2 |
   ```

10. Ouça: a cadência final é A→D→A ou E7→A?
    - [ ] A→D→A
    - [x] E7→A
    ```abc-prompt
    X:1
    M:4/4
    L:1/2
    Q:1/4=100
    K:A
    "D"[D,FA] "E7"[E,GBd] | "A"[A,CE]2 |
    ```

---

## Aula 7 — Rearmonização: o arranjo de violão

### Seções

#### O que é rearmonizar

**Rearmonizar** é trocar os acordes que vão embaixo de uma melodia **sem mudar a melodia**. A mesma linha do refrão que na Aula 6 andava em **A–D–E** pode ganhar acordes "mais coloridos" — com sétima, com o baixo caminhando por semitom, com um acorde de passagem no meio. O ouvido continua reconhecendo a música (a melodia é a mesma), mas ela soa "mais trabalhada", mais adulta. É exatamente o que o **arranjo de violão** desta música faz.

Pré-requisito: só faz sentido depois da Aula 6. Rearmonização é uma **variação** da harmonia simples — para variar, é preciso primeiro ter a versão simples firme no ouvido.

#### Dois ingredientes: sétimas e baixo que anda

**Acorde com sétima:** é a tríade da Aula 6 mais uma quarta nota empilhada (mais uma terça acima). O **Dmaj7** é o D (Ré–Fá♯–Lá) com o Dó♯ por cima; o **Amaj7** é o A com o Sol♯. Mesma função da tríade, som mais "aberto" e suave.

**Baixo cromático:** em vez de o baixo pular de acorde em acorde, ele **sobe quase de semitom em semitom**. Um baixo que anda assim "puxa" a música para a frente e disfarça a troca de acorde — a sensação de "arranjo" vem muito daí.

#### A progressão do arranjo de violão

O arranjo (violão clássico, 8 compassos sobre a melodia do refrão), um acorde por compasso:

`A(add9) → C#m7 → Dmaj7 → D#°7 → A/F#m → F#m → Dmaj7 → Amaj7`

- **Sétimas e cores:** o `D` da Aula 6 virou **Dmaj7**; o `A` final virou **Amaj7**; entrou um **C#m7** onde antes era só A ou E.
- **Baixo caminhando:** **Lá → Dó♯ → Ré → Ré♯ → (Mi) → Fá♯**. O **Ré♯°7** (um acorde diminuto) é um **acorde de passagem** — não tem função própria, existe só para ligar o Ré ao Mi por semitom. Acordes de passagem são a "cola" da rearmonização.

#### Quando usar (e quando não)

Este arranjo funciona bem como **interlúdio**: os 8 compassos tocados **sem canto**, entre um refrão e outro, para a música "respirar" e preparar a volta.

Ele **não** é a melhor escolha para acompanhar a congregação cantando. Os acordes com sétima e o baixo andando **tiram firmeza** de quem canta de ouvido — a pessoa precisa de um chão estável, não de um tapete que se move. 

Regra prática: **congregação cantando → harmonia simples da Aula 6. Instrumental sozinho → pode rearmonizar à vontade.**

### Exemplos

#### A rearmonização, com a melodia por cima — 80 BPM

Legenda: A MESMA melodia do refrão (Aula 5), agora com os acordes do arranjo de violão. Ouça as sétimas e o baixo caminhando. Comparação direta com a Aula 6.

```abc
X:1
M:4/4
L:1/8
Q:1/4=80
K:A
z4 "E"A,2 B,2 | "A"CCC C2 B,A,E- | "C#m7"E4 z2 C E | "Dmaj7"FFF F2 E D A- | "D#o7"A4 z2 A B | "A"c2 c c "F#m"c d e A- | "F#m"A B c3 E A c | "Dmaj7"d d c A3 "Amaj7"F2 | "Amaj7"E8 |]
w: Je-sus Cris-to mu-dou meu vi-ver _ Je-sus Cris-to mu-dou meu vi-ver _ É a Luz que~i-lu-mi-na meu ser _ Sim, Je-sus Cris-to mu-dou meu vi-ver _
```

#### Só os acordes do arranjo (tocável) — 80 BPM

Legenda: Um acorde por compasso. Repare no baixo subindo Lá → Dó♯ → Ré → Ré♯ → Fá♯.

```abc
X:1
M:4/4
L:1/1
Q:1/4=80
K:A
"A(add9)"[A,CEB] | "C#m7"[C,EGB] | "Dmaj7"[D,FAc] | "D#o7"[^D,FA=c] | "F#m"[F,Ac] | "F#m"[F,Ac] | "Dmaj7"[D,FAc] | "Amaj7"[A,C^GB] |
```

### Atividades

1. **Tocar as duas harmonias em sequência** — entrega: áudio
   Grave: primeiro o refrão com a harmonia simples da Aula 6, depois o mesmo refrão com os acordes do arranjo de violão. A melodia (cantada ou tocada) é a mesma nas duas.

2. **Marcar o baixo do arranjo** — entrega: texto
   Em texto: escreva a nota do BAIXO de cada um dos 8 compassos do arranjo (Lá, Dó♯, Ré, …) e diga em que compasso está o acorde de passagem.

### Quiz

1. "Rearmonizar" é:
   - [ ] Mudar a melodia
   - [x] Trocar os acordes embaixo da melodia sem mudar a melodia
   - [ ] Mudar a letra

2. No arranjo de violão, o acorde de D vira:
   - [ ] Dm
   - [x] Dmaj7
   - [ ] D7

3. O baixo do arranjo, ao longo dos primeiros compassos:
   - [ ] Fica parado no Lá
   - [x] Sobe quase de semitom em semitom (Lá–Dó♯–Ré–Ré♯–Fá♯)
   - [ ] Pula uma oitava

4. O Ré♯°7 (D#°7) no arranjo é:
   - [ ] A tônica
   - [x] Um acorde de passagem, só para ligar o Ré ao Mi
   - [ ] O acorde final

5. A melodia, na rearmonização:
   - [ ] Muda junto com os acordes
   - [x] Continua exatamente a mesma
   - [ ] Some

6. O melhor uso deste arranjo é:
   - [ ] Acompanhar a congregação cantando
   - [x] Interlúdio instrumental, sem canto, entre refrões
   - [ ] Substituir a melodia

7. Por que ele NÃO é ideal para acompanhar quem canta de ouvido?
   - [ ] É muito alto
   - [x] As sétimas e o baixo andando tiram firmeza de quem canta
   - [ ] É rápido demais

8. A regra prática é:
   - [ ] Rearmonizar sempre
   - [x] Congregação cantando → harmonia simples; instrumental sozinho → pode rearmonizar
   - [ ] Nunca usar sétimas

9. O acorde final do arranjo é:
   - [ ] A (tríade simples)
   - [x] Amaj7
   - [ ] E7

10. Ouça as duas versões: qual soa "mais trabalhada"?
    - [ ] A primeira (tríades simples)
    - [x] A segunda (com sétimas e baixo caminhando)
    ```abc-prompt
    X:1
    M:4/4
    L:1/2
    Q:1/4=80
    K:A
    "A"[A,CE] "D"[D,FA] | "Dmaj7"[D,FAc] "Amaj7"[A,C^GB] |
    ```

---

## Aula 8 — Ritmo harmônico e acompanhamento

### Seções

#### Ritmo harmônico

Já vimos o ritmo da melodia (Aula 5) e o da bateria (Aula 4). Falta o **ritmo harmônico**: **a velocidade com que os acordes trocam**.

Nesta música ele é **lento e regular** — em geral **um acorde por compasso**, acelerando para **dois por compasso** só nas cadências (o `D E7` antes do A, na virada de frase). Ritmo harmônico lento deixa a música **"assentada"**: dá tempo de o ouvido absorver cada acorde, e é fácil de acompanhar sem ensaio. Músicas com acorde trocando a cada tempo (ou mais) soam agitadas e exigem um instrumentista mais treinado — o oposto do que esta peça quer.

#### O que é "acompanhar"

Acompanhar é tocar a harmonia (Aula 6) **com um ritmo e uma textura** — não é só apertar o acorde e deixar soпрando. Um bom acompanhamento tem três camadas:

- **Baixo:** a nota grave. Toca a **fundamental do acorde no tempo 1**, e às vezes a **quinta no tempo 3** (o "baixo alternado", aquele "bum-… -bum" do violão).
- **Harmonia:** o acorde em si, tocado em **colcheias nos tempos 2, 3 e 4**, deixando o tempo 1 "limpo" para o baixo aparecer.
- **Síncope de acompanhamento:** antecipar o acorde do próximo compasso no **"e" do tempo 4**. É o empurrãozinho para a frente típico do gênero — a mesma ideia da anacruse, agora na harmonia.

#### Piano e violão dividem funções

Quando há os dois instrumentos, eles **não** devem tocar a mesma coisa:

- O **violão** segura a **levada rítmica** — o "motorzinho" de colcheias, sempre presente.
- O **piano** faz o contrário: **notas mais longas**, contracantos nos vãos da melodia (os lugares onde a voz respira) e reforço nas cadências.

Tocar os dois cheios ao mesmo tempo "engorda" o som e **tira espaço da voz** — um problema real com cantores mais velhos, que precisam de silêncio para respirar. A regra de ouro da Aula 10 ("um elemento novo por parte") começa aqui: nem todo mundo toca o tempo todo.

### Exemplos

#### Levada de acompanhamento (representada) — 80 BPM

Legenda: Baixo (nota grave) no tempo 1, acordes nas colcheias 2–3–4. No 2º compasso, o acorde seguinte é antecipado no "e" do 4.

```abc
X:1
M:4/4
L:1/8
Q:1/4=80
K:A
V:1
V:2
[V:1] z2 [CE]2 [CE][CE] [CE]2 | z2 [CE]2 [CE][CE] [CE][CE] |
[V:2] A,4 E,4 | A,4 E,4 |
```

### Atividades

1. **Gravar 8 compassos de acompanhamento** — entrega: áudio
   Grave 8 compassos de acompanhamento do refrão no seu instrumento harmônico, aplicando: baixo no tempo 1, acordes nas colcheias, e pelo menos uma antecipação sincopada na quebra de frase.

2. **Descrever a divisão piano/violão** — entrega: texto
   Em texto: se você tivesse piano e violão juntos nesta música, o que cada um faria em cada parte (interlúdio, estrofe, refrão)? Onde cada um "abre espaço" para a voz?

### Quiz

1. "Ritmo harmônico" é:
   - [ ] A velocidade da melodia
   - [x] A velocidade com que os acordes trocam
   - [ ] O andamento da bateria

2. Nesta música, o ritmo harmônico é em geral:
   - [x] Um acorde por compasso
   - [ ] Um acorde por tempo
   - [ ] Dois acordes por tempo

3. Ele acelera para dois acordes por compasso:
   - [ ] Na introdução
   - [x] Só nas cadências (o D E7 antes do A)
   - [ ] O tempo todo

4. Ritmo harmônico lento deixa a música:
   - [ ] Agitada
   - [x] "Assentada", fácil de acompanhar
   - [ ] Difícil de cantar

5. Na levada, o tempo 1 costuma ser reservado para:
   - [ ] Os acordes cheios
   - [x] O baixo (fundamental do acorde)
   - [ ] Uma pausa total

6. "Baixo alternado" é o baixo tocando:
   - [ ] Só a fundamental o tempo todo
   - [x] Fundamental no 1 e quinta no 3
   - [ ] Notas aleatórias

7. "Síncope de acompanhamento" é:
   - [ ] Parar de tocar no meio
   - [x] Antecipar o acorde do próximo compasso no "e" do tempo 4
   - [ ] Tocar mais devagar

8. Com piano e violão juntos, o violão costuma:
   - [ ] Fazer notas longas e contracantos
   - [x] Segurar a levada rítmica de colcheias
   - [ ] Ficar em silêncio

9. Tocar piano e violão os dois cheios, com cantores mais velhos:
   - [ ] Ajuda a voz
   - [x] Tira espaço da voz para respirar
   - [ ] Não faz diferença

10. Ouça a levada: o baixo aparece mais no tempo 1 ou no tempo 4?
    - [x] No tempo 1
    - [ ] No tempo 4
    ```abc-prompt
    X:1
    M:4/4
    L:1/8
    K:A
    A,4 z2 [CE]2 | A,4 z2 [CE]2 |
    ```

---

## Aula 9 — Criando vozes (harmonia vocal)

### Seções

#### O que é "criar uma voz"

Até aqui só cantamos a melodia. **Harmonia vocal** é ter duas ou mais pessoas cantando **notas diferentes ao mesmo tempo**, formando acordes com a própria voz. A linha principal (a melodia da Aula 5) continua sendo a **1ª voz**; as outras são a **2ª voz**, a **3ª voz** etc.

O segredo é que a 2ª voz **não é uma melodia nova** — ela é uma "sombra" da melodia, andando junto, um pouco abaixo.

#### A segunda voz por terças e sextas

O jeito mais direto de criar uma 2ª voz é cantar uma **terça abaixo** da melodia, nota por nota, usando **só notas da escala de Lá maior**. Como todas as notas vêm da escala, a terça sai às vezes maior, às vezes menor — e o ouvido aceita, porque tudo pertence ao tom.

Uma **terça** é o intervalo de "Dó a Mi" — pule uma nota da escala. Cantar "uma terça abaixo" é cantar sempre a nota que está dois degraus abaixo da melodia na escala.

Onde a terça abaixo fica "apertada" (muito perto da melodia) ou cai grave demais para a voz, troca-se por uma **sexta abaixo** — que é a mesma ideia invertida, e soa mais "aberta". Alternando terça e sexta, a 2ª voz **acompanha o contorno** da melodia sem nunca brigar com ela.

Abaixo, a frase "É a Luz que ilumina meu ser": primeiro as **duas vozes juntas** (só para ouvir o efeito), depois **cada voz separada** para você cantar junto.

```notation
caption: As duas vozes juntas — alterne "Tudo" / "Melodia" / "2a voz" no botão Ouvir.
singAlong: no
---
X:1
M:4/4
L:1/8
Q:1/4=80
K:A
V:1 name="Melodia"
V:2 name="2a voz"
[V:1] z4 z2 A B | c2 c c c d e A2 |
[V:2] z4 z2 F ^G | A2 A A A B c F2 |
w: É a Luz que~i-lu-mi-na meu ser
```

```notation
caption: Cante a MELODIA (voz de cima).
singAlong: yes
---
X:1
M:4/4
L:1/8
Q:1/4=80
K:A
z4 z2 A B | c2 c c c d e A2 |
w: É a Luz que~i-lu-mi-na meu ser
```

```notation
caption: Cante a 2ª VOZ (uma terça abaixo da melodia).
singAlong: yes
---
X:1
M:4/4
L:1/8
Q:1/4=80
K:A
z4 z2 F ^G | A2 A A A B c F2 |
w: É a Luz que~i-lu-mi-na meu ser
```

#### Quando NÃO andar em paralelo

Seguir a melodia sempre a uma terça abaixo se chama **movimento paralelo**, e funciona 90% do tempo. Mas dois momentos pedem outra coisa — é o que separa um arranjo amador de um bom:

- **Nas cadências** (os fins de frase da Aula 6), em vez de descer junto com a melodia, a 2ª voz faz **movimento contrário** (a melodia desce, a 2ª voz sobe) ou **nota comum** (a 2ª voz fica parada enquanto a melodia se move). Isso faz o acorde final "fechar" com muito mais força.
- **Evite as duas vozes na mesma nota** (uníssono) por muito tempo — nesse trecho não há harmonia nenhuma, e o ouvinte sente que "uma voz sumiu".

```notation
caption: Movimento contrário na cadência: a melodia desce até o Lá, a 2ª voz sobe — o acorde "fecha".
singAlong: no
---
X:1
M:4/4
L:1/4
Q:1/4=80
K:A
V:1 name="Melodia"
V:2 name="2a voz"
[V:1] "E7"c B "A"A2 |
[V:2] "E7"G, A, "A"C2 |
```

#### A terceira voz e o âmbito

Uma **3ª voz** raramente acompanha o contorno — ela costuma cantar as **fundamentais dos acordes** (Aula 6), quase um baixo cantado: sobre o acorde A canta Lá, sobre D canta Ré, sobre E canta Mi. É a voz **mais fácil de decorar** (só muda quando o acorde muda) e a que mais "assenta" o conjunto, porque reforça a harmonia pela raiz.

Sobre **âmbito** (a Aula 5): cada voz tem uma faixa confortável. Se o pico da música — o Mi agudo do "É a Luz" — aperta o grupo, **a primeira solução é baixar o tom da música inteira** (de Lá para Sol ou Fá), nunca empurrar um cantor para um agudo forçado. Transpor é fácil quando a harmonia está pensada em números romanos (I–IV–V), como na Aula 6.

### Atividades

1. **Cantar a 2ª voz do trecho** — entrega: áudio
   Cante a 2ª voz do trecho do refrão junto de uma gravação da melodia ("Cantar junto", comparando com a voz 2). Onde ela "brigar" com a melodia, anote o compasso e proponha uma correção.

2. **Escrever a 3ª voz** — entrega: texto
   Em texto: escreva a linha da 3ª voz (baixo vocal) para o refrão — só as fundamentais dos acordes, um valor por acorde, seguindo a progressão da Aula 6.

### Quiz

1. A forma mais direta de criar uma 2ª voz é cantar, usando só notas do tom:
   - [ ] Uma oitava abaixo
   - [x] Uma terça (ou sexta) abaixo, acompanhando o contorno
   - [ ] A mesma nota

2. A 2ª voz por terças usa terças "às vezes maiores, às vezes menores" porque:
   - [ ] É um erro comum
   - [x] Todas as notas pertencem à escala do tom
   - [ ] A melodia muda de tom o tempo todo

3. Onde a terça abaixo fica "apertada", troca-se por:
   - [ ] Uma segunda abaixo
   - [x] Uma sexta abaixo
   - [ ] Uníssono

4. Nas cadências, é melhor a 2ª voz:
   - [ ] Seguir a melodia em paralelo
   - [x] Fazer nota comum ou movimento contrário
   - [ ] Parar de cantar

5. Duas vozes na mesma nota por muito tempo:
   - [ ] É o ideal
   - [x] Perde o efeito de harmonia (soa uníssono)
   - [ ] Cria um acorde de sétima

6. "Movimento contrário" na cadência é:
   - [ ] As duas vozes descem juntas
   - [x] Uma sobe enquanto a outra desce
   - [ ] As duas ficam paradas

7. A 3ª voz ("baixo vocal") normalmente canta:
   - [ ] A melodia uma oitava abaixo
   - [x] As fundamentais dos acordes
   - [ ] Notas aleatórias graves

8. Por que a 3ª voz é a mais fácil de decorar?
   - [x] Só muda quando o acorde muda
   - [ ] Canta a melodia toda
   - [ ] Não tem letra

9. Se o pico (Mi agudo do "É a Luz") aperta o grupo, a primeira solução é:
   - [ ] Gritar mais
   - [x] Baixar o tom da música toda
   - [ ] Cortar a frase 3

10. Ouça melodia + 2ª voz: a 2ª voz está acima ou abaixo da melodia?
    - [ ] Acima
    - [x] Abaixo
    ```abc-prompt
    X:1
    M:4/4
    L:1/4
    Q:1/4=80
    K:A
    V:1
    V:2
    [V:1] e e c A |
    [V:2] c c A F |
    ```

---

## Aula 10 — Arranjo: juntando tudo

### Seções

#### O que é "arranjo"

**Arranjo** é a soma de todas as decisões das aulas anteriores numa peça só: qual andamento (Aula 3), qual levada de bateria em cada parte (Aula 4), qual harmonia — simples ou rearmonizada (Aulas 6 e 7), quantas vozes (Aula 9), e — o que esta aula acrescenta — **em que ordem as partes acontecem** e **quem entra quando**. Duas bandas com os mesmos músicos e a mesma música soam completamente diferentes por causa do arranjo.

#### A forma completa com as repetições

A música tem três blocos de letra (Aula 2) sobre dois materiais melódicos. **Forma** é a ordem em que eles aparecem, incluindo as repetições. Um mapa de trabalho:

`Interlúdio de violão (8) – Estrofe (…) – Refrão A (9) – Refrão A (9) – Interlúdio de violão (8) – Refrão B (9) – Refrão B (9) – PARADA (1–2 tempos) – Refrão A final (9) – Final (fermata)`

- **Interlúdio:** os 8 compassos do arranjo de violão da Aula 7, **sem canto** — abre a música e "respira" entre os blocos.
- Cada **Refrão** é cantado **duas vezes** seguidas, porque é curto (9 compassos) e a repetição fixa a mensagem.
- **Parada** (o *break* da Aula 4): a banda toda para, sobra só a voz (ou um prato), e volta no Refrão A final com tudo. É o clímax — funciona porque contrasta com a densidade de tudo que veio antes.
- **Final:** o último `E7 → A`, com o A em **fermata** (segurado além do valor) e um pequeno **ritardando** (desacelerando) no compasso anterior.

#### Dinâmica e quem entra quando

**Dinâmica** é o volume e a densidade ao longo da música. O truque não é tocar tudo forte — é **fazer a música crescer aos poucos**, adicionando elementos:

- **Interlúdio inicial:** só violão (arranjo rearmonizado). Sem bateria, ou chimbal bem discreto.
- **Estrofe:** voz + violão + baixo leve. Bateria contida (a levada de estrofe da Aula 4). A 2ª voz **não** entra ainda.
- **Refrão A (1ª vez):** entra a **bateria cheia** (groove funk) e entra a **2ª voz**.
- **Refrão B:** mantém tudo; o piano acrescenta contracanto nos vãos da melodia.
- **Refrão A final:** tudo, com a **3ª voz** se houver — o ponto mais alto da música.

**Regra de ouro:** deixar **um elemento novo entrar a cada parte** dá a sensação de a música "crescer" sem que ninguém precise tocar mais alto o tempo todo. Se tudo entra no começo, não sobra para onde ir.

#### O mapa numa página

Escreva o arranjo como uma **tabela** que a banda inteira lê de relance: uma **coluna por parte** (Interlúdio, Estrofe, Refrão A…), uma **linha por instrumento/voz** (Voz, 2ª voz, Violão, Baixo, Bateria, Piano), e cada célula dizendo o que aquele elemento faz naquela parte — ou "**—**" para "não toca". É esse documento, e não a memória de cada um, que faz um ensaio render.

### Exemplos

#### Interlúdio de violão (acordes) — 80 BPM

Legenda: Os 8 compassos do arranjo rearmonizado (Aula 7), tocados sem canto entre os blocos.

```abc
X:1
M:4/4
L:1/1
Q:1/4=80
K:A
"A(add9)"[A,CEB] | "C#m7"[C,EGB] | "Dmaj7"[D,FAc] | "D#o7"[^D,FA=c] | "F#m"[F,Ac] | "F#m"[F,Ac] | "Dmaj7"[D,FAc] | "Amaj7"[A,C^GB] |
```

### Atividades

1. **Gravar a música inteira (entrega principal)** — entrega: áudio
   Grave a música inteira no seu formato (voz + um instrumento no mínimo), seguindo o seu mapa: interlúdio de violão, estrofe contida, refrões (cada um 2×), a parada antes do refrão final e o final com fermata. Anexe o mapa de arranjo escrito (foto ou texto).

2. **Escrever o mapa de arranjo** — entrega: texto
   Em texto: monte a tabela do arranjo — uma coluna por parte (Interlúdio, Estrofe, Refrão A, Refrão A, Interlúdio, Refrão B, Refrão B, Parada, Refrão A final, Final) e uma linha por elemento (Voz, 2ª voz, 3ª voz, Violão, Baixo, Bateria, Piano). Preencha o que cada um faz, ou "—".

### Quiz

1. O interlúdio de violão, no arranjo, é:
   - [ ] Um solo de bateria
   - [x] Os 8 compassos do arranjo rearmonizado, sem canto, entre os blocos
   - [ ] A introdução cantada

2. Cada refrão, no mapa de trabalho, é cantado:
   - [ ] Uma vez
   - [x] Duas vezes seguidas
   - [ ] Cinco vezes

3. A "parada" antes do refrão final é:
   - [x] A banda toda parando 1–2 tempos e voltando com tudo
   - [ ] Um erro de ensaio
   - [ ] O fim da música

4. No final, o acorde de A leva:
   - [ ] Um staccato curto
   - [x] Uma fermata, com ritardando no compasso anterior
   - [ ] Uma síncope

5. Na Estrofe, a 2ª voz:
   - [ ] Já entra desde o começo
   - [x] Não entra ainda
   - [ ] Substitui a melodia

6. A 2ª voz normalmente entra:
   - [ ] No interlúdio inicial
   - [x] No primeiro Refrão A
   - [ ] Só no final

7. A "regra de ouro" da dinâmica é:
   - [ ] Tocar tudo forte desde o início
   - [x] Deixar um elemento novo entrar a cada parte
   - [ ] Nunca mudar nada

8. Refrão A e Refrão B, na melodia:
   - [ ] São linhas diferentes
   - [x] São a mesma linha, só muda a letra
   - [ ] Um é instrumental

9. O mapa de arranjo serve para:
   - [ ] Impressionar a plateia
   - [x] A banda inteira ler de relance quem faz o quê em cada parte
   - [ ] Cronometrar a música

10. Ouça a frase 3 do refrão: ela sobe ao agudo (o pico) ou fica na região grave?
    - [x] Sobe ao agudo (pico)
    - [ ] Fica grave
    ```abc-prompt
    X:1
    M:4/4
    L:1/8
    Q:1/4=80
    K:A
    z4 z2 A B | cccc de A2 |
    ```
