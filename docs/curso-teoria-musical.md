# Curso: "Teoria Musical na Prática — para quem já toca de ouvido"

> Conteúdo real para o plugin `academy`. Será instalado como seed
> (`src/plugins/academy/seeds/teoria-musical.ts`) depois que os recursos #2 (questão áudio) e #3
> (acorde/progressão tocável) existirem — ver `docs/academy-recursos-musicais.md`.
> Enquanto isso, este documento é a fonte da verdade do conteúdo.

## Ficha do curso

| Campo | Valor |
| --- | --- |
| `title` | Teoria Musical na Prática — para quem já toca de ouvido |
| `slug` | `teoria-musical-na-pratica` |
| `status` | `public` |
| `publiclyListed` | `true` |
| `description` | Um caminho sem pressa da pulsação ao acorde de dominante. Você vai ouvir, cantar, bater o tempo e reconhecer o que já toca — agora com nome. Sem partitura difícil: tudo por som, por dó-móvel e por músicas que você conhece. |

**Público:** músico adulto ou idoso que toca/canta de ouvido e nunca estudou teoria.
**Método:** dó-móvel; ouvir e cantar antes de nomear; partitura só como apoio; frases curtas;
botão "aumentar texto" e leitura por voz sempre disponíveis.
**Ênfases (pedido do dono):** ritmo, intervalos, harmonia funcional básica.

**Requisitos por aula (padrão):**
- Toda seção: `readTextEnabled` (marcar como lida).
- Quiz: `quizEnabled` onde indicado, `quizPassThresholdPercent: 70`, `quizMaxAttempts: 3`.
- Atividade: `activityEnabled` onde indicado; `deliverableFormat: "none"` salvo quando o texto
  disser `(áudio)` — aí é `"audio"` e o professor revisa com nota.

**Convenção de notação nos exemplos:** ABC com `L:1/8`, cabeçalho `M:`/`Q:`/`K:` explícito.
`c` = Dó#5 em `K:A` (armadura). Os exemplos usam Lá maior sempre que possível para preparar o
curso da música "Jesus Cristo mudou meu viver".

---

# MÓDULO 1 — O tempo e o ritmo

## Aula 1 — Pulso, andamento e BPM

**Objetivo:** sentir a pulsação constante de uma música e descrever sua velocidade.

### Seção 1.1 — O que é pulso
O pulso é a batida regular que você sente numa música — é o que faz o pé bater sozinho no chão.
Ele não muda de tamanho: é sempre o mesmo espaço de tempo, do começo ao fim (salvo quando a
música desacelera de propósito). Toda a teoria do ritmo é sobre **encaixar sons dentro desse pulso**.
Ouça o exemplo e bata o pulso com a mão na perna. Não pense em nota nenhuma ainda — só a batida.

### Seção 1.2 — Andamento: do lento ao rápido (BPM)
Andamento é a **velocidade do pulso**. A gente mede em **BPM** (batidas por minuto): 60 BPM é uma
batida por segundo, como o ponteiro do relógio; 120 BPM é o dobro. Uma balada fica por volta de
60–75; um louvor animado, 100–130; um trecho corrido passa de 140. Ouça as três faixas de
metrônomo (60, 90, 120) e cante "Parabéns pra você" junto de cada uma — a mesma música, três
sensações.

### Seção 1.3 — Tempo forte e tempo fraco
Dentro do pulso, algumas batidas soam **mais fortes** que outras. Conte "**UM** dois **UM** dois"
numa marcha, ou "**UM** dois três" numa valsa. Esse acento que se repete é o que organiza o pulso
em grupos — e é disso que a próxima aula trata (compasso).

### Exemplo sonoro
```abc
X:1
M:4/4
L:1/4
Q:1/4=90
K:A
A A A A | A A A A |
```
Metrônomo humano: quatro semínimas por compasso, a 90 BPM. A primeira de cada grupo é o tempo forte.

### Atividade
Ouça três gravações curtas (materiais da aula). Para cada uma: bata o pulso com a mão e diga se o
andamento está **mais perto de 60, de 90 ou de 120 BPM**. Marque como concluída quando tiver feito
as três. `(none)`

### Quiz (tipo áudio)
1. *(toca 8 batidas a ~72 BPM)* Este andamento está mais perto de: **72** · 120 · 160
2. *(toca 8 batidas a ~132 BPM)* Mais perto de: 60 · 90 · **132**
3. Se o pulso é 60 BPM, quanto tempo dura uma batida? Meio segundo · **Um segundo** · Dois segundos
4. *(toca uma valsa)* O acento se repete a cada: 2 tempos · **3 tempos** · 4 tempos

---

## Aula 2 — Compasso: 2/4, 3/4, 4/4 e 6/8

**Objetivo:** reconhecer em quantos tempos a música se organiza e o que a fração de compasso diz.

### Seção 2.1 — O acento métrico agrupa o pulso
Quando você conta "UM dois UM dois", está sentindo compassos de **2**. "UM dois três" é compasso
de **3** (valsa). "UM dois três quatro" é compasso de **4** — o mais comum na música popular e nos
louvores. O primeiro tempo é sempre o mais forte; o compasso de 4 tem um acento secundário, mais
leve, no tempo 3.

### Seção 2.2 — Lendo a fração: 4/4, 3/4, 2/4
A fração no início da partitura tem dois números. O **de cima** diz **quantos tempos** há no
compasso. O **de baixo** diz **qual figura vale um tempo** (4 = semínima, 8 = colcheia). Então
`3/4` é "três semínimas por compasso"; `4/4` é "quatro semínimas por compasso". Você vai ver `4/4`
escrito às vezes como um "C".

### Seção 2.3 — Compasso composto: 6/8
Em `6/8` você conta seis colcheias, mas **sente dois pulsos grandes**, cada um dividido em três
("UM-da-da dois-da-da"). É o balanço de muitas canções de embalar e de parte do repertório
gospel. A diferença para `3/4` (que também tem seis colcheias) é onde cai o acento: `3/4` acentua
de duas em duas colcheias; `6/8`, de três em três.

### Exemplo sonoro
```abc
X:1
M:3/4
L:1/4
Q:1/4=120
K:A
"valsa" A A A | A A A |
```
```abc
X:1
M:6/8
L:1/8
Q:3/8=80
K:A
"6/8" A A A A A A | A2 A2 A2 |
```

### Atividade
Ouça quatro trechos. Classifique cada um como **2, 3, 4** ou **6/8**, contando junto até o acento
forte voltar. `(none)`

### Quiz (tipo áudio)
1. *(toca trecho em 3)* Compasso: 2/4 · **3/4** · 4/4
2. *(toca trecho em 4)* Compasso: **4/4** · 3/4 · 6/8
3. Em `2/4`, o número de baixo (4) significa: dois compassos · **a semínima vale um tempo** · dois instrumentos
4. *(toca trecho em 6/8)* Você sente: 6 pulsos iguais · **2 pulsos divididos em 3** · 3 pulsos divididos em 2
5. `3/4` e `6/8` têm o mesmo número de colcheias. O que muda? O andamento · **onde cai o acento** · a tonalidade

---

## Aula 3 — Figuras e valores: da semibreve à semicolcheia

**Objetivo:** saber quanto cada figura dura em relação ao pulso.

### Seção 3.1 — A árvore de divisão
Toda figura é o dobro ou a metade da vizinha. A **semibreve** dura 4 tempos (num compasso 4/4,
ocupa o compasso inteiro). A **mínima** é metade: 2 tempos. A **semínima**, 1 tempo. A **colcheia**,
meio tempo (duas por tempo). A **semicolcheia**, um quarto de tempo (quatro por tempo). Cante
"**tá**" para semínima, "**tá-á**" para mínima, "**ti-ti**" para duas colcheias, "**ti-ri-ti-ri**"
para quatro semicolcheias.

### Seção 3.2 — O ponto de aumento
Um ponto ao lado da figura **soma metade do valor dela**. Semínima pontuada = 1 tempo + meio =
1½ tempo. É o ritmo de "**tá---ti**" que aparece no começo de tanta melodia (inclusive na que
vamos estudar no outro curso).

### Seção 3.3 — A ligadura de valor
Uma ligadura curva unindo **duas notas da mesma altura** soma as durações numa nota só, que
atravessa a barra de compasso. Serve para prolongar um som além do fim do compasso.

### Exemplo sonoro
```abc
X:1
M:4/4
L:1/8
Q:1/4=84
K:A
A4 A2 A2 | A3 A A2 A2 | A2 A2 A A A A | A8 |
```
Compasso 1: mínima + duas colcheias. Compasso 2: semínima pontuada + colcheia + duas colcheias.
Compasso 3: colcheias e semicolcheias. Compasso 4: semibreve.

### Atividade
Leitura rítmica: toque a partitura acima em loop lento e **bata cada figura com a palma**,
falando "tá / tá-á / ti-ti / ti-ri-ti-ri". Repita até acertar o compasso 2 sem hesitar. `(none)`

### Quiz
1. Quantas colcheias cabem numa semínima? Uma · **Duas** · Quatro
2. A semínima pontuada dura: 1 tempo · **1 tempo e meio** · 2 tempos
3. Num compasso 4/4, a semibreve ocupa: um tempo · dois tempos · **o compasso inteiro**
4. Uma ligadura de valor une duas notas: de alturas diferentes · **da mesma altura, somando a duração** · em compassos diferentes só na leitura

---

## Aula 4 — Subdivisão, síncope e levada

**Objetivo:** sentir o que acontece **entre** os pulsos e reconhecer o acento deslocado.

### Seção 4.1 — Colcheias retas e colcheias em "swing"
Duas colcheias podem ser **iguais** ("ti-ti", cada uma com metade exata do tempo) ou **desiguais**
("tiii-ti", a primeira mais longa) — o chamado *swing* ou *suingue*. Muita música gospel, blues e
samba usa colcheias com algum grau de swing. Ouça a mesma frase das duas formas.

### Seção 4.2 — Contratempo
O contratempo é o "**e**" da contagem "1 **e** 2 **e**" — a metade fraca do tempo. Bater palma só
nos contratempos, enquanto o pé marca os tempos, é o exercício que destrava o suingue.

### Seção 4.3 — Síncope
Síncope é quando um som **começa numa parte fraca e se prolonga sobre a parte forte seguinte**,
"roubando" o acento. É o que dá o balanço em "cka-**tchá**". Na prática, quase toda linha de
melodia popular tem pelo menos uma síncope.

### Exemplo sonoro
```abc
X:1
M:4/4
L:1/8
Q:1/4=96
K:A
A2 A2 A2 A2 | A A A A A A A A | A2 A4 A2 | A A2 A2 A2 A |
```
Compasso 1: colcheias retas. Compasso 3: **síncope** (colcheia + semínima ligada ao tempo forte).

### Atividade
Com a gravação tocando: (a) marque os **tempos** com o pé; (b) bata palma só nos **contratempos**
por 8 compassos; (c) cante a melodia sincopada do exemplo junto do modelo. Marque como concluída
quando conseguir manter (b) sem perder o (a). `(none)`

### Quiz (tipo áudio)
1. *(toca frase reta e frase com swing)* Qual está em swing? A primeira · **A segunda**
2. O contratempo é: o tempo forte · **a metade fraca do tempo (o "e")** · o último compasso
3. *(toca frase sincopada)* O que caracteriza a síncope? Tocar mais rápido · **um som começar no fraco e segurar sobre o forte** · parar no meio do compasso
4. *(toca duas frases)* Qual tem síncope? **A primeira** · A segunda

---

## Aula 5 — Como a bateria organiza o tempo

**Objetivo:** identificar de ouvido a função de cada peça da bateria dentro do groove.

### Seção 5.1 — As três funções básicas
Numa levada de música popular: o **bumbo** (grave, "bum") costuma marcar os tempos fortes, em
especial o **1**; a **caixa** (seca, "tá") marca o **contratempo do compasso** — nos tempos **2 e
4** num 4/4, o chamado *backbeat*; o **chimbal** (ou prato de condução) toca a **subdivisão**,
mantendo as colcheias correndo para todo mundo se guiar.

### Seção 5.2 — Backbeat: o coração do groove
Bater palma nos tempos **2 e 4** de um louvor animado é literalmente imitar a caixa. É esse acento
regular no "meio" do compasso que faz a música "andar". Quando a caixa muda para **1 e 3**, a
sensação vira de marcha; quando ela sai e volta só na metade da velocidade, é o *meio-tempo*.

### Seção 5.3 — Viradas e dinâmica
Nas quebras de frase (a cada 4 ou 8 compassos) a bateria faz uma **virada** — um pequeno solo de
1 ou 2 tempos que "anuncia" a próxima parte. E a bateria muda de **densidade**: mais leve na
estrofe (só chimbal e bumbo), cheia no refrão (prato aberto, caixa forte).

### Exemplo
Grade de bateria (recurso a implementar; enquanto isso, loop de áudio):
```
tempo:     1  e  2  e  3  e  4  e
chimbal:   x  x  x  x  x  x  x  x
caixa:     .  .  o  .  .  .  o  .
bumbo:     o  .  .  .  o  x  .  .
```

### Atividade
Ouça três levadas. Para cada uma, diga: a caixa está em **2 e 4** ou em **1 e 3**? O chimbal está
em **colcheias** ou mais aberto/espaçado? `(none)`

### Quiz (tipo áudio)
1. *(toca groove com backbeat em 2 e 4)* A caixa está em: 1 e 3 · **2 e 4** · todos os tempos
2. A peça que normalmente mantém a subdivisão (as colcheias correndo) é: o bumbo · a caixa · **o chimbal**
3. *(toca groove em meio-tempo)* Comparado ao anterior, a caixa: dobrou de velocidade · **espaçou, tocando na metade da frequência** · sumiu
4. Uma "virada" de bateria serve para: acelerar a música · **anunciar a mudança de parte, nas quebras de frase** · afinar os tambores

---

# MÓDULO 2 — Altura e intervalos

## Aula 6 — Altura, as sete notas e a oitava

**Objetivo:** situar-se entre grave e agudo e cantar a escala com dó-móvel.

### Seção 6.1 — Grave e agudo
Altura é o quão **grave** (som "gordo", corda solta do baixo) ou **agudo** (som "fino", assobio) é
uma nota. Fisicamente é a velocidade da vibração — mais rápido, mais agudo. Cante a nota mais
grave que você alcança e depois a mais aguda: esse é o seu **âmbito** vocal.

### Seção 6.2 — Os sete nomes e a repetição
As notas se chamam **Dó, Ré, Mi, Fá, Sol, Lá, Si** e depois **repetem** — o Dó seguinte é "o mesmo
som, mais agudo". Essa distância de um nome até a próxima repetição dele é a **oitava**. Duas notas
a uma oitava de distância soam tão parecidas que a gente dá o mesmo nome.

### Seção 6.3 — Dó-móvel: a escala é um molde
Neste curso usamos **dó-móvel**: "Dó" não é uma nota fixa, é o **primeiro grau** da escala em que a
música está. Em Lá maior, quem faz o papel de "Dó" é o **Lá**. O que importa é a **sequência de
distâncias** entre os graus — o molde — não os nomes absolutos. Cante "Dó Ré Mi Fá Sol Lá Si Dó"
subindo e descendo, várias vezes, no seu tom confortável.

### Exemplo sonoro
```abc
X:1
M:4/4
L:1/4
Q:1/4=76
K:A
"_1"A "_2"B "_3"c "_4"d | "_5"e "_6"f "_7"g "_8"a | a g f e | d c B A |
```
Escala de Lá maior, com os **graus** (1 a 8) escritos sob cada nota.

### Atividade
Cante a escala ascendente e descendente três vezes junto do exemplo (Cantar junto). Depois cante
**só os graus 1–3–5–8** (o "esqueleto" do acorde, que volta no Módulo 3). `(áudio)`

### Quiz
1. A distância de um Dó até o próximo Dó chama-se: quinta · **oitava** · compasso
2. Em dó-móvel, "Dó" é: sempre a tecla branca central do piano · **o primeiro grau da escala da música** · a nota mais grave da voz
3. Em Lá maior, quem faz o papel de grau 1 ("Dó")? Dó · **Lá** · Sol

---

## Aula 7 — Tom, semitom e a escala maior

**Objetivo:** construir uma escala maior pela fórmula de tons e semitons.

### Seção 7.1 — A menor distância: o semitom
**Semitom** é a menor distância entre duas notas na música ocidental — no piano, uma tecla e a
**imediatamente** seguinte (incluindo as pretas). **Tom** é o dobro: duas teclas de distância.
Entre **Mi e Fá** e entre **Si e Dó** há só **semitom** (não existe tecla preta entre eles); entre
todos os outros nomes vizinhos há um **tom**.

### Seção 7.2 — A fórmula da escala maior
Toda escala maior segue o mesmo molde de distâncias, do grau 1 ao 8:
**Tom – Tom – semitom – Tom – Tom – Tom – semitom.**
Comece em qualquer nota, siga essa receita e você tem uma escala maior. Comece no **Lá** e a
receita obriga a usar **Fá#, Dó# e Sol#** — por isso Lá maior "tem três sustenidos".

### Seção 7.3 — Por que isso importa
O molde é o que dá à escala maior seu som "alegre/resolvido". Os dois semitons — entre 3–4 e entre
7–8 — são os pontos de "encaixe" da escala: o **7 para o 8** (a "sensível" puxando para a tônica) é
o efeito que a harmonia funcional inteira explora.

### Exemplo sonoro
```abc
X:1
M:4/4
L:1/4
Q:1/4=72
K:A
"_T"A "_T"B "_st"c | "_T"d "_T"e "_T"f | "_st"g a2 |
```
Escala de Lá maior anotada com **T** (tom) e **st** (semitom) entre os graus.

### Atividade
No teclado do editor, monte a escala de **Ré maior** aplicando a fórmula T–T–st–T–T–T–st a partir
do Ré. Confira: você deve ter usado **Fá#** e **Dó#**. `(none)`

### Quiz (tipo áudio quando indicado)
1. Entre **Mi e Fá** há: um tom · **um semitom** · um tom e meio
2. A fórmula da escala maior é: st–T–T–st–T–T–T · **T–T–st–T–T–T–st** · T–st–T–st–T–st–T
3. *(toca uma escala maior e uma com o 3º grau abaixado)* Qual é a maior? **A primeira** · A segunda
4. Os dois semitons da escala maior estão entre os graus: 1–2 e 5–6 · **3–4 e 7–8** · 2–3 e 6–7

---

## Aula 8 — Intervalos: número e qualidade

**Objetivo:** nomear a distância entre duas notas e começar a reconhecê-la de ouvido.

### Seção 8.1 — O número: conte os nomes, incluindo as pontas
O **número** do intervalo é quantos graus ele abrange, contando a nota de partida e a de chegada.
De Dó a Mi: Dó(1) Ré(2) Mi(3) → **terça**. De Dó a Sol → **quinta**. De uma nota até ela mesma →
**uníssono**; até a oitava repetição → **oitava**.

### Seção 8.2 — A qualidade: maior, menor, justa
O número não basta: uma terça pode ser **maior** (Dó–Mi, dois tons) ou **menor** (Ré–Fá, tom e
meio). As **segundas, terças, sextas e sétimas** vêm em maior/menor. As **quartas, quintas e
oitavas** são **justas** (não têm versão "maior"), com uma exceção famosa: a quarta aumentada /
quinta diminuta, o **trítono** (Aula 10).

### Seção 8.3 — Intervalos a partir do grau 1
Da tônica para cada grau da escala maior, você tem: 2ª maior (1→2), **3ª maior** (1→3), **4ª justa**
(1→4), **5ª justa** (1→5), 6ª maior (1→6), 7ª maior (1→7), **8ª justa** (1→8). Toque cada um a
partir do Lá, primeiro **melódico** (uma nota depois da outra) e depois **harmônico** (as duas
juntas).

### Exemplo sonoro
```abc
X:1
M:4/4
L:1/4
Q:1/4=72
K:A
"_2M"A B | "_3M"A c | "_4J"A d | "_5J"A e | "_6M"A f | "_7M"A g | "_8"A a |
```

### Atividade
Use o **treinador de intervalos** (bloco `academy.ear-trainer`, modo `interval`, tônicas A/D/E,
conjunto 2M/3m/3M/4J/5J/6M, direção ascendente): faça **10 rodadas** e anote seu acerto. `(none)`

### Quiz (tipo áudio) — carro-chefe do módulo
1. De Dó a Mi (contando Dó–Ré–Mi) o intervalo é uma: segunda · **terça** · quarta
2. *(toca Lá→Dó#, melódico)* **3ª maior** · 4ª justa · 5ª justa
3. *(toca Lá+Mi juntas)* 3ª maior · **5ª justa** · 6ª maior
4. *(toca Lá→Fá#, melódico)* 5ª justa · **6ª maior** · 3ª menor
5. Quais intervalos são chamados "justos" (sem versão maior/menor)? 2ª, 3ª e 6ª · **4ª, 5ª e 8ª** · todos
6. *(toca Lá→Ré, melódico)* 3ª maior · **4ª justa** · 5ª justa

---

## Aula 9 — Reconhecer intervalos por músicas-referência

**Objetivo:** ancorar cada intervalo numa melodia que você já conhece.

### Seção 9.1 — A técnica da âncora
O jeito mais rápido de aprender a ouvir intervalo é associar cada um ao **começo de uma música**.
Quando ouvir um salto e não souber o nome, cante a música-âncora daquele salto e compare.

### Seção 9.2 — Tabela de âncoras (ascendentes)
| Intervalo | Música-âncora (primeiras duas notas) |
| --- | --- |
| 2ª maior | "Parabéns pra vo**cê**" (pa-ra) |
| 3ª maior | "Atirei o **pau** no gato" (a-ti) |
| 4ª justa | "**Noi**te feliz" / abertura de muitos hinos |
| 5ª justa | Tema de "Also sprach Zarathustra" (2001) / "**Twinkle** twinkle" (2ª→3ª nota é 5ª… use "Parabéns" da 4ª pra 5ª sílaba) |
| 6ª maior | "**My** Bonnie lies over the ocean" |
| 8ª justa | "**Some**where over the rainbow" (Some-where) |

> Ajuste as âncoras para músicas do repertório dos seus alunos — o importante é que sejam
> automáticas para eles.

### Seção 9.3 — Descendentes também
Intervalos descendo têm outras âncoras: 3ª maior descendo = "**Do**-ré-mi" ao contrário; 4ª justa
descendo = "O **Cra**vo brigou com a rosa"; 5ª justa descendo = "**Fli**ntstones".

### Atividade
Para cada um dos 7 intervalos da Aula 8, escreva **uma música que você conhece** que comece com
ele (pode ser diferente da tabela). `(none)`

### Quiz (tipo áudio)
1. *(toca uma 3ª maior ascendente)* Qual âncora combina? **"Atirei o pau no gato"** · "Parabéns pra você" · "My Bonnie"
2. *(toca uma 8ª ascendente)* Âncora: "Noite feliz" · **"Somewhere over the rainbow"** · "Atirei o pau no gato"
3. *(toca uma 2ª maior)* Âncora: "My Bonnie" · **"Parabéns pra você"** · "Zarathustra"
4. *(toca uma 5ª justa)* Âncora: "Atirei o pau no gato" · **"Zarathustra / 2001"** · "Cravo brigou com a rosa"

---

## Aula 10 — Consonância, dissonância e o trítono

**Objetivo:** separar de ouvido os intervalos "de repouso" dos "de tensão".

### Seção 10.1 — Repouso e tensão
Alguns intervalos soam **estáveis, resolvidos** — dá para parar neles: 3ªs, 6ªs, 5ªs justas,
oitavas, uníssono (as **consonâncias**). Outros soam **instáveis, pedindo continuação**: 2ªs, 7ªs
e o trítono (as **dissonâncias**). Não é questão de "feio" ou "bonito" — a música usa a tensão de
propósito, para depois resolver.

### Seção 10.2 — O trítono
Trítono é a distância de **três tons** (quarta aumentada / quinta diminuta) — de Fá a Si, por
exemplo. É o intervalo mais tenso da música tonal, apelidado no passado de "o diabo na música".
Ele é o **motor do acorde de dominante** (Aula 15): quando você ouve o trítono, seu ouvido já
espera a resolução.

### Seção 10.3 — A resolução
A tensão resolve por **movimento de semitom em direção contrária**: no trítono Fá–Si, o Fá desce
para Mi e o Si sobe para Dó — os dois "se fecham" numa terça (ou sexta). É esse gesto, repetido
milhões de vezes, que o final "V–I" produz.

### Exemplo sonoro
```abc
X:1
M:4/4
L:1/2
Q:1/4=66
K:C
[FB] [Ec] | [DG]2 |
```
O trítono Fá–Si (harmônico) resolvendo em Mi–Dó, e depois um acorde de repouso.

### Atividade
Ouça oito pares de notas (harmônicos). Para cada um, escreva **"repouso"** ou **"tensão"**. Depois
confira com o professor. `(none)`

### Quiz (tipo áudio)
1. *(toca uma 3ª maior harmônica)* Repouso ou tensão? **Repouso** · Tensão
2. *(toca uma 7ª maior harmônica)* **Tensão** · Repouso
3. *(toca um trítono)* **Tensão** · Repouso
4. O trítono tem: dois tons · **três tons** · quatro tons
5. A tensão do trítono normalmente resolve por: salto de quinta · **movimento de semitom em direções contrárias** · repetição da mesma nota

---

# MÓDULO 3 — Harmonia funcional

## Aula 11 — O acorde: a tríade

**Objetivo:** construir e reconhecer tríades maiores e menores.

### Seção 11.1 — Empilhando terças
Um acorde básico (**tríade**) são **três notas empilhadas em terças**: a **fundamental** (dá o
nome ao acorde), a **terça** acima dela, e a **quinta**. Em dó-móvel a partir do grau 1: graus
**1–3–5**. É o "esqueleto 1–3–5" que você já cantou na Aula 6.

### Seção 11.2 — Maior ou menor: a terça decide
Se a distância da fundamental à terça é uma **3ª maior** (dois tons), o acorde é **maior** — som
"aberto, alegre". Se é uma **3ª menor** (tom e meio), o acorde é **menor** — som "fechado,
melancólico". A quinta (justa) é a mesma nos dois. Ou seja: **mexer só na nota do meio** troca o
caráter do acorde inteiro.

### Seção 11.3 — Os acordes de Lá maior que você mais vai usar
- **A** (Lá maior): Lá – Dó# – Mi
- **D** (Ré maior): Ré – Fá# – Lá
- **E** (Mi maior): Mi – Sol# – Si
São o I, o IV e o V de Lá maior — a próxima aula mostra o porquê dos nomes.

### Exemplo sonoro
```abc
X:1
M:4/4
L:1/2
Q:1/4=66
K:A
"A"[A,CE] "D"[D,FA] | "E"[E,GB] "A"[A,CE] |
```
(As três tríades tocadas — recurso de acorde tocável.)

### Atividade
No seu instrumento, toque **A**, depois **D**, depois **E**, depois **A** de novo, ouvindo bem a
nota do meio de cada um. Grave 20 segundos. `(áudio)`

### Quiz (tipo áudio quando indicado)
1. Uma tríade é formada pelos graus: 1–2–3 · **1–3–5** · 1–4–5
2. O que diferencia um acorde maior de um menor? A quinta · **a terça (a nota do meio)** · a fundamental
3. *(toca uma tríade maior e uma menor)* Qual é a menor? A primeira · **A segunda**
4. O acorde de Ré maior (D) tem as notas: Ré–Fá–Lá · **Ré–Fá#–Lá** · Ré–Fá#–Lá#

---

## Aula 12 — O campo harmônico de Lá maior

**Objetivo:** conhecer os sete acordes que "nascem" da escala e suas funções.

### Seção 12.1 — Um acorde sobre cada grau
Se você empilha terças **usando só as notas da escala de Lá maior**, sai um acorde diferente sobre
cada grau:

| Grau | Acorde | Qualidade | Número romano |
| --- | --- | --- | --- |
| 1 | A | maior | **I** |
| 2 | Bm | menor | ii |
| 3 | C#m | menor | iii |
| 4 | D | maior | **IV** |
| 5 | E | maior | **V** |
| 6 | F#m | menor | vi |
| 7 | G#°  | diminuto | vii° |

Maiúscula = maior, minúscula = menor. Esses são os acordes "da casa" em Lá maior; 90% do
repertório popular em Lá usa só eles.

### Seção 12.2 — Três funções
Cada acorde cumpre um dos três papéis:
- **Tônica (repouso):** I, e com menos peso vi e iii. É "casa".
- **Subdominante (afastamento):** IV e ii. "Saiu de casa, mas sem tensão."
- **Dominante (tensão):** V e vii°. "Puxa de volta para a tônica."

A música respira indo **tônica → subdominante → dominante → tônica**, em muitas variações.

### Seção 12.3 — Por que os números romanos
Pensar em **I–IV–V** em vez de **A–D–E** deixa a progressão **transportável**: a mesma sequência
em Sol maior é G–C–D. Você aprende a função uma vez e aplica em qualquer tom.

### Exemplo sonoro
Player de progressão (recurso #3): tocar os sete acordes em ordem, cada um 2 tempos, dizendo o
nome e o número romano.

### Atividade
Escreva os **sete acordes de Sol maior** com seus números romanos, seguindo a mesma tabela
(dica: Sol maior tem **um sustenido**, o Fá#). `(none)`

### Quiz
1. Em Lá maior, o acorde do grau IV é: **Ré maior (D)** · Ré menor · Mi maior
2. A função do acorde V (dominante) é: dar repouso · afastar de casa sem tensão · **criar tensão que puxa para a tônica**
3. Pensar em "I–IV–V" em vez de "A–D–E" serve para: soar mais bonito · **poder transportar a progressão para qualquer tom** · tocar mais rápido
4. Em Lá maior, Bm e C#m são acordes: maiores · **menores** · diminutos
5. Qual grupo é função de tônica (repouso)? ii e IV · **I e vi** · V e vii°

---

## Aula 13 — A cadência: como a música respira

**Objetivo:** ouvir e nomear os finais de frase mais comuns.

### Seção 13.1 — Cadência é pontuação
Cadência é o **jeito como uma frase musical termina** — o equivalente ao ponto final, à vírgula ou
às reticências. As três principais:
- **Autêntica (V → I):** o "ponto final". Máxima resolução. É como quase todo hino acaba.
- **Plagal (IV → I):** o "amém" das igrejas. Resolução mais suave, sem a tensão do V.
- **Suspensiva / meia-cadência (… → V):** termina **no** V. É a "vírgula": a frase para, mas o
  ouvido sabe que vem mais.
- **Deceptiva (V → vi):** o "quase". O V prepara o I e no último instante vai para o vi — surpresa.

### Seção 13.2 — O ciclo I–IV–V–I
Toque, em Lá: **A (I) – D (IV) – E (V) – A (I)**, dois tempos cada. Você acabou de tocar o
esqueleto harmônico de milhares de músicas. Sinta: o D "abre", o E "aperta", o A "resolve".

### Seção 13.3 — Ouvir "parou na tensão" x "parou no repouso"
Treine isto: alguém toca uma progressão curta e **para**. Se parou soando "aberto, pedindo mais",
parou no **V** (meia-cadência). Se parou soando "acabou", chegou no **I**.

### Exemplo sonoro
Player de progressão com **toggle só-melodia / só-harmonia / juntas** (recurso #3):
- Harmonia: `A | D | E | A`
- Melodia (grau) por cima: `1 1 | 2 3 | 2 2 | 1 -`

### Atividade
Ouça seis progressões curtas. Para cada uma, diga se terminou **no repouso (I)** ou **na tensão
(V)**. Depois, cante a **tônica de Lá** logo após cada uma parar — você vai sentir que é fácil
depois do I e "esquisito" depois do V. `(áudio)`

### Quiz (tipo áudio)
1. *(toca V→I em Lá)* Que cadência é essa? **Autêntica** · Plagal · Deceptiva
2. *(toca IV→I)* **Plagal ("amém")** · Autêntica · Suspensiva
3. *(toca uma frase que termina no V)* Ela terminou: no repouso · **na tensão (meia-cadência)**
4. *(toca V→vi)* O que aconteceu? Resolveu normal · **foi para o vi em vez do I (deceptiva)** · mudou de tom
5. No ciclo I–IV–V–I em Lá, o acorde que "resolve" é: D · E · **A**

---

## Aula 14 — Progressões comuns e o loop de quatro acordes

**Objetivo:** reconhecer de ouvido os loops mais usados na música popular.

### Seção 14.1 — O loop I–V–vi–IV
Em Lá: **A – E – F#m – D**, repetindo. É, sem exagero, a progressão de centenas de sucessos pop e
de louvor. Como é um **loop** (volta ao começo sem cadência forte), ela dá sensação de "seguir
girando".

### Seção 14.2 — A variante vi–IV–I–V
Os mesmos quatro acordes começando pelo vi: **F#m – D – A – E**. Soa um pouco mais "melancólica no
início, resolvida no fim". Muitas músicas alternam as duas ordens entre estrofe e refrão.

### Seção 14.3 — O blues de 12 compassos em Lá
Forma fixa de 12 compassos usando só **I, IV, V** (A, D, E):
```
| A | A | A | A |
| D | D | A | A |
| E | D | A | E |
```
É a base do blues, do rock and roll e de muito gospel antigo.

### Exemplo sonoro
Player de progressão: o loop `A–E–F#m–D` (2 tempos cada) e depois o blues de 12 compassos.

### Atividade
Ouça três trechos. Identifique qual usa **I–V–vi–IV**, qual usa **blues de 12 compassos** e qual
usa **I–IV–V–I** simples. `(none)`

### Quiz (tipo áudio)
1. *(toca I–V–vi–IV em loop)* Em Lá, esses acordes são: **A–E–F#m–D** · A–D–E–A · A–Bm–C#m–D
2. O que faz o "loop de 4 acordes" dar sensação de girar sem parar? Ele acelera · **não tem uma cadência forte de encerramento, volta ao começo** · muda de tom a cada volta
3. O blues de 12 compassos usa quais funções? Só I e vi · **I, IV e V** · todos os sete acordes do campo
4. *(toca vi–IV–I–V)* Essa progressão é: uma cadência plagal · **a variante do loop de 4 acordes começando pelo vi** · um blues

---

## Aula 15 — A sétima da dominante (V7)

**Objetivo:** ouvir a diferença entre o V simples e o V7 e entender por que o V7 "puxa" mais.

### Seção 15.1 — Adicionando a quarta nota
Se em cima da tríade do V (E: Mi–Sol#–Si) você empilha **mais uma terça**, chega no **Ré** — e
tem o **E7** (Mi–Sol#–Si–Ré), o **acorde de sétima da dominante**. Essa nota extra é a **sétima
menor** contada da fundamental.

### Seção 15.2 — O trítono escondido
Dentro do E7, entre **Sol# e Ré**, mora um **trítono** (Aula 10). É ele que dá ao E7 aquela
"coceira" muito maior que a do E simples. E ele resolve do jeito clássico: **Sol# sobe para Lá**,
**Ré desce para Dó#** — as duas notas se fecham exatamente nas notas do acorde de **A**.

### Seção 15.3 — Onde se usa
O V7 aparece principalmente **logo antes da volta para a tônica**, no fim das frases e da música
inteira. Trocar o V por V7 nesse ponto é o tempero harmônico mais básico e mais usado que existe.

### Exemplo sonoro
```abc
X:1
M:4/4
L:1/2
Q:1/4=63
K:A
"E"[E,GB] "A"[A,CE] | "E7"[E,GBd] "A"[A,CE] |
```
(Primeiro E→A, depois E7→A — ouça a diferença de "puxão".)

### Atividade
No instrumento, toque **E → A** e depois **E7 → A**, alternando. Descreva em uma frase o que a
sétima acrescenta. Grave o exemplo. `(áudio)`

### Quiz (tipo áudio)
1. O E7 é o acorde E com uma nota a mais: uma terça abaixo · **uma sétima acima da fundamental (o Ré)** · a mesma nota dobrada
2. *(toca E e depois E7)* Qual tem mais tensão / "puxa" mais para a tônica? E simples · **E7**
3. O que existe dentro do E7 e não dentro do E simples? Uma oitava · **um trítono (entre Sol# e Ré)** · uma quinta justa
4. O V7 costuma aparecer: no comecinho da música · **logo antes da volta para a tônica** · só em música instrumental
5. *(toca uma tríade e um acorde com sétima)* Qual tem a sétima? **A primeira** · A segunda

---

# MÓDULO 4 — Juntando tudo

## Aula 16 — Melodia sobre harmonia

**Objetivo:** entender por que certas notas da melodia "caem bem" em cada acorde.

### Seção 16.1 — Notas do acorde x notas de passagem
Quando a melodia está sobre o acorde **A** (Lá–Dó#–Mi), as notas **Lá, Dó# e Mi** soam
"apoiadas" — são **notas do acorde**. As outras (Si, Ré, Fá#, Sol#) soam como "de caminho": a
melodia passa por elas rapidamente, geralmente em parte fraca do tempo, indo de uma nota do
acorde para outra. São as **notas de passagem** e **bordaduras**.

### Seção 16.2 — A regra prática
Nos **tempos fortes**, a melodia bem-comportada tende a estar numa **nota do acorde** daquele
momento. Nas partes fracas, ela pode "enfeitar" com notas de fora. Compositores quebram isso de
propósito (é o que gera as "notas de tensão" expressivas), mas o padrão base é esse.

### Seção 16.3 — Ouvindo isso na prática
Toque o acorde A parado e cante o grau 1, depois o 2, depois o 3. O 1 e o 3 "encaixam"; o 2 fica
"pendurado", querendo cair para o 1 ou subir para o 3. Esse "querer resolver" da nota de passagem
é a mesma força da cadência, só que na melodia.

### Exemplo sonoro
```abc
X:1
M:4/4
L:1/8
Q:1/4=80
K:A
"A" A2 B c2 A | "D" d2 c B2 A | "E" B2 c d2 B | "A" c2 B A4 |
```
Sobre A: Lá e Dó# nos tempos fortes (nota de acorde), Si de passagem. Sobre D: Ré e Fá#(=`d`,`f`
seria; aqui `d`) apoiados.

### Atividade
Na partitura acima, **circule as notas que caem no tempo forte** e verifique se cada uma pertence
ao acorde escrito em cima. `(none)`

### Quiz
1. Sobre o acorde A (Lá–Dó#–Mi), qual nota é "de passagem" (não pertence ao acorde)? Lá · **Si** · Mi
2. Melodias bem-comportadas tendem a colocar, nos tempos fortes: notas de fora do acorde · **notas do acorde** · sempre a fundamental
3. Uma nota de passagem geralmente aparece: num tempo forte, sustentada · **numa parte fraca, de caminho entre duas notas do acorde** · só no fim da frase

---

## Aula 17 — Forma musical

**Objetivo:** mapear as partes de uma música e como elas se repetem.

### Seção 17.1 — As partes com nome
- **Introdução:** prepara o clima, muitas vezes com os acordes do refrão sem canto.
- **Estrofe (verso):** conta a "história", letra que muda a cada repetição, melodia mais contida.
- **Refrão:** a parte que se repete igual, melodia no ponto mais alto, é o que todo mundo lembra.
- **Ponte:** aparece uma vez, contrasta (outra harmonia ou região da voz), leva ao último refrão.
- **Coda / final:** o encerramento — pode ser uma repetição do refrão sumindo, ou um acorde longo.

### Seção 17.2 — Repetição e casas
Na partitura, `:|` manda **repetir**. Quando a repetição termina diferente, usa-se **casa 1** e
**casa 2**: na primeira vez você toca a casa 1; na volta, pula direto para a casa 2.

### Seção 17.3 — O mapa de forma
Escrever a forma como uma linha de letras ajuda a ensaiar: por exemplo
**Intro – A – A – B – A – B – B – Coda** (A = estrofe, B = refrão). É assim que a Aula 8 do curso
da música organiza o arranjo.

### Exemplo
Mapa de forma de um louvor típico:
`Intro(4) – Estrofe(8) – Refrão(8) – Estrofe(8) – Refrão(8) – Ponte(4) – Refrão(8) – Refrão(8) – Final(2)`

### Atividade
Escolha uma música que você toca. Escreva o **mapa de forma** dela com os nomes das partes e
quantos compassos cada uma tem. `(none)`

### Quiz
1. A parte que se repete igual, com a melodia mais alta e "grudenta", é: a estrofe · **o refrão** · a ponte
2. A ponte serve para: repetir o refrão · **trazer um contraste, uma vez, antes do último refrão** · afinar a banda
3. "Casa 1" e "casa 2" servem para: tocar mais alto · **terminar a repetição de dois jeitos diferentes** · trocar de tom

---

## Aula 18 — Lendo uma lead sheet

**Objetivo:** tocar a partir de uma folha com melodia + cifras.

### Seção 18.1 — O que é uma lead sheet
É o formato mínimo de uma música: **a melodia escrita na pauta** e as **cifras dos acordes acima**.
Não diz qual levada tocar nem como distribuir as notas do acorde — isso fica a critério de quem
toca. É como circula a maior parte do repertório popular e de igreja.

### Seção 18.2 — Como se lê, na prática
1. Veja o **tom** (armadura de clave) e a **fórmula de compasso**.
2. Passe o olho pelas **cifras**: elas já te dão a harmonia inteira (e, com o Módulo 3, a função de
   cada uma).
3. A **melodia** te dá o ritmo e o contorno do canto.
4. Junte: mão esquerda/baixo faz a fundamental da cifra, mão direita/harmonia preenche, a voz faz
   a melodia.

### Seção 18.3 — Cifras além da tríade
`A` = Lá maior. `A7` = com sétima (dominante). `Am` = menor. `D/F#` = acorde de Ré com Fá# no
baixo. `Asus4` = a terça trocada pela quarta (aquele "segura e resolve"). Você não precisa de
todas agora — reconhecer `X`, `Xm` e `X7` já cobre a maioria dos louvores.

### Exemplo (lead sheet de 8 compassos, Lá maior)
```abc
X:1
M:4/4
L:1/8
Q:1/4=92
K:A
"A" E2 A2 A2 B2 | "D" c2 B2 A4 | "E" B2 B2 c2 d2 | "E7" c4 B4 |
"A" E2 A2 A2 B2 | "D" c2 B2 A2 F2 | "E7" B2 A2 G2 B2 | "A" A8 |]
```

### Atividade
Toque a lead sheet acima: **cifras no instrumento harmônico + melodia cantada ou num instrumento
melódico**. Grave uma passada completa. `(áudio)`

### Quiz
1. Numa lead sheet, o que **não** está escrito e fica por conta de quem toca? A melodia · As cifras · **A levada / o arranjo**
2. A cifra `A7` significa: Lá menor · **Lá maior com sétima (dominante)** · Lá com quarta
3. `D/F#` quer dizer: dois acordes ao mesmo tempo · **acorde de Ré com Fá# no baixo** · Ré diminuto
4. O primeiro passo ao pegar uma lead sheet nova é olhar: o número de páginas · **o tom e a fórmula de compasso** · a última nota

---

## Aula 19 — Análise guiada do começo ao fim

**Objetivo:** aplicar tudo — descrever uma música inteira com o vocabulário do curso.

### Seção 19.1 — O roteiro de análise
Para qualquer música, responda nesta ordem:
1. **Tom e compasso.** Qual a tônica? Maior ou menor? Quantos tempos por compasso?
2. **Andamento e caráter.** BPM aproximado; a bateria marca o backbeat onde?
3. **Forma.** Mapa de partes (Intro / Estrofe / Refrão / …).
4. **Harmonia.** As cifras de cada parte, traduzidas para números romanos e funções. Que cadência
   fecha cada frase?
5. **Melodia.** Qual o âmbito? Move-se por graus conjuntos ou por saltos? Onde está o pico? As
   notas dos tempos fortes são do acorde?

### Seção 19.2 — Exemplo resolvido (resumo)
"Música simples em Lá maior, 4/4, ~92 BPM, backbeat em 2 e 4. Forma Intro–A–B–A–B–B. Estrofe:
`I – IV – V7 – I` (cadência autêntica). Refrão: `I – vi – IV – V` (loop, meia-cadência antes de
repetir). Melodia com âmbito de sexta, quase toda por graus conjuntos, pico no grau 5 no começo do
refrão; tempos fortes sobre notas do acorde."

### Seção 19.3 — Para onde ir agora
O próximo passo natural é o curso **"Jesus Cristo mudou meu viver"**, que faz exatamente essa
análise, em detalhe, numa música só — e ainda mostra como criar a segunda voz e montar o arranjo.

### Atividade — entrega final
Escolha **uma música que você toca ou canta**. Escreva a análise completa seguindo o roteiro da
Seção 19.1 (tom, compasso, andamento, forma, harmonia em números romanos, melodia). Entregue em
texto. O professor devolve com **nota e comentários**. `(texto — deliverableFormat: "text")`

---

## Resumo de configuração (para o seed)

| Aula | Seções | Quiz | Atividade | Formato entrega |
| --- | --- | --- | --- | --- |
| 1 | 3 | sim (áudio) | sim | none |
| 2 | 3 | sim (áudio) | sim | none |
| 3 | 3 | sim | sim | none |
| 4 | 3 | sim (áudio) | sim | none |
| 5 | 3 | sim (áudio) | sim | none |
| 6 | 3 | sim | sim | audio |
| 7 | 3 | sim (áudio parcial) | sim | none |
| 8 | 3 | sim (áudio) | sim | none |
| 9 | 3 | sim (áudio) | sim | none |
| 10 | 3 | sim (áudio) | sim | none |
| 11 | 3 | sim (áudio parcial) | sim | audio |
| 12 | 3 | sim | sim | none |
| 13 | 3 | sim (áudio) | sim | audio |
| 14 | 3 | sim (áudio) | sim | none |
| 15 | 3 | sim (áudio) | sim | audio |
| 16 | 3 | sim | sim | none |
| 17 | 3 | sim | sim | none |
| 18 | 3 | sim | sim | audio |
| 19 | 3 | não | sim (final) | text |

Curso: 19 aulas · 57 seções · ~70 perguntas (boa parte tipo áudio) · 19 atividades.
