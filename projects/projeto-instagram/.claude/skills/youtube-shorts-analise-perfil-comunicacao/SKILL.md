---
name: youtube-shorts-analise-perfil-comunicacao
description: Sintetiza as análises de YouTube Shorts de um criador (ganchos, retenção, storytelling, vocabulário) num único "perfil de comunicação" em Markdown. O perfil é prescritivo e autossuficiente, feito para ser entregue a uma IA junto com uma copy para reescrevê-la na voz daquele influenciador. Aceita no prompt as análises prontas ou só as transcrições brutas; nesse caso, faz as análises antes e roda de ponta a ponta. Use quando o usuário pedir para "criar/gerar o perfil de comunicação", "consolidar a análise", "juntar as análises num perfil", "perfil de voz", "guia de estilo do influenciador", "manual de voz", "escrever como ele", "copy no estilo de <criador>" ou qualquer artefato que permita escrever no estilo de alguém.
---

# Perfil de Comunicação — YouTube Shorts (síntese)

Esta é a etapa final do conjunto de skills de Shorts. Ela junta as dimensões analisadas num **único arquivo Markdown**, que é um *manual de voz* do criador.

O perfil não é um relatório para ler e esquecer. Ele será colado numa conversa nova, junto com uma copy qualquer, para uma IA reescrever o texto na voz do criador. Por isso, o perfil precisa ser:

- **Prescritivo:** regras no imperativo ("Abra com…", "Nunca use…"), e não observações ("ele costuma…").
- **Autossuficiente:** funciona sem as transcrições, sem as outras skills e sem esta conversa. Tudo o que a IA leitora precisa para acertar o tom tem que estar dentro do arquivo.
- **Ancorado:** toda regra é calibrada por citações literais do criador.

## Passo 0 — Carregar a lente (obrigatório)

Leia `.claude/skills/youtube-shorts-contexto/SKILL.md` inteiro antes de sintetizar. Ele define a régua do Shorts (gancho, retenção, loop, tom lo-fi, cultura BR) e os limites da transcrição (sem visual, erros do Whisper, conteúdo de terceiros, amostra pequena). Julgue e escreva as regras por essa régua.

O leitor final do perfil **não terá** essa skill. Então a lente que importa para *este* criador precisa ir embutida no próprio perfil, nas seções e nos porquês.

## Passo 1 — Identificar o tipo de input

O input vem no prompt, de um destes jeitos:

**A) Análises prontas** (as saídas de `youtube-shorts-analise-ganchos`, `-retencao`, `-storytelling` e `-vocabulario`, ou textos equivalentes).
- Vá direto para o Passo 3.
- Se faltar alguma dimensão, complete-a a partir das citações presentes nas outras análises, quando der. Caso contrário, marque a seção do perfil como `⚠ dimensão não analisada` e siga.

**B) Transcrições brutas** (uma ou várias coladas).
- Faça o Passo 2 e depois o Passo 3.

**Variações aceitas:**
- Se o usuário apontar uma **pasta**, monte o corpus com o script da seção 4 do contexto: `node .claude/skills/youtube-shorts-contexto/scripts/juntar-transcricoes.js "<pasta>"`.
- Se a pasta já tiver `analise-*.md`, use esses arquivos como input do tipo A.
- Se vierem análises **e** transcrições, use as análises como base e as transcrições para conferir as citações e as frequências.

## Passo 2 — Produzir as análises (só no input B)

Separe e numere os vídeos (V1, V2…). Depois analise as quatro dimensões:

- Se os arquivos das skills de análise existirem em `.claude/skills/youtube-shorts-analise-{ganchos,retencao,storytelling,vocabulario}/SKILL.md`, leia-os e siga os passos de análise de cada um. **Não** grave os relatórios individuais, a menos que o usuário peça.
- Se não existirem, use o roteiro mínimo abaixo:
  - **Ganchos:** primeiras ~7–10 palavras de cada vídeo (≈3 s). Registre tipo de gancho, força (1–5) e fórmula de abertura.
  - **Retenção:** lacunas de curiosidade, pattern interrupts na fala, re-gancho no meio, progressão ou contagem, gordura, gatilhos de comentário, tipo de fechamento (loop, CTA, punchline, corte seco).
  - **Storytelling:** formato, estrutura (arco, problema→solução, jornada, lista, cena única), personagens e papéis, loops abertos e payoffs, pico emocional, proporção de específico versus abstrato.
  - **Vocabulário:** bordões com contagem, gírias, jargão do nicho, inglês misturado, formas de tratamento, pessoa gramatical, palavrões, marcadores de oralidade e regionalismos, tamanho e construção das frases, referências culturais.

**Regra de consistência (o que define o perfil):**

| Frequência no corpus | Classificação | Uso no perfil |
|---|---|---|
| Aparece em ≥50% dos vídeos, ou em ≥3 vídeos | **Assinatura** | Vira regra ("sempre", "prefira") |
| Aparece em 2 vídeos | **Tendência** | Vira recomendação ("pode", "quando couber") |
| Aparece 1 vez | **Acidente** | Fica fora das regras. Pode ir no banco de exemplos se for muito ilustrativo, marcado como pontual |

- **Fala que não é do criador** (dublagem ou tradução de conteúdo gringo, outras pessoas, som ambiente) não conta para a voz. Registre à parte, se for relevante para o formato.
- **Erros do Whisper** não viram "palavra dele". Cite o trecho literal com `[leitura provável]`.
- **Amostra com menos de ~8 vídeos:** gere o perfil mesmo assim, mas declare o nível de confiança no cabeçalho e trate quase tudo como tendência.

## Passo 3 — Sintetizar

1. **Inventário:** liste todos os traços de todas as dimensões, cada um com frequência (x/N) e citações.
2. **Resolver sobreposições:** um traço que aparece em várias análises (ex.: "Bora" como bordão em vocabulário *e* como fechamento em retenção) entra **uma vez só**, na seção onde ele é mais forte e mais acionável. Nas outras seções, no máximo uma remissão ("ver Vocabulário → bordões").
   - Critério de onde colocar: onde ele muda mais o texto reescrito. O que define *como começar* vai em Gancho. O que define *qual palavra usar* vai em Vocabulário. O que define *a ordem das ideias* vai em Estrutura. O que define *o ritmo e o final* vai em Retenção.
3. **Priorizar a assinatura diferencial:** ordene os traços pelo quanto eles distinguem *este* criador dos outros do mesmo nicho. Traço genérico do Shorts (ex.: "frases curtas") só entra se ele o usa de um jeito específico, e aí descreva esse jeito. O que todo criador faz não identifica a voz.
4. **Converter em regras:** cada traço vira regra imperativa com **porquê** (o efeito no público ou na retenção) e **âncora** (citação literal com Vn).
5. **Definir o que evitar:** derive os anti-padrões do contraste com a voz real em três eixos:
   - **Registro:** formalidade, tom institucional, "copy de agência", emojis ou estruturas que ele não usa.
   - **Palavra:** termos que soariam falsos na boca dele, com o substituto que ele usaria.
   - **Ritmo:** frases longas e subordinadas, introdução antes do gancho, CTA institucional, fechamento arrastado.
   - Sempre que possível, contraste: ❌ como ficaria errado → ✅ como ele diria.
6. **Separar observado de inferido:** regra baseada só em inferência (ex.: gancho visual que a transcrição não mostra) leva a marca `(inferido)`.

## Passo 4 — Escrever o arquivo

**Nome e local:**
- Use o nome que o usuário der no prompt.
- Sem nome, salve como `perfil-comunicacao-<criador>.md` no diretório atual, com `<criador>` em kebab-case e sem acentos.
- Ao final, informe o caminho completo onde salvou.

**Siga o template abaixo à risca.** A ordem e os títulos das seções são fixos, porque outras conversas vão depender deles.
- Toda seção de análise (2 a 6) traz âncoras literais.
- Escreva para um leitor que **nunca viu o criador**.

````markdown
# Perfil de Comunicação — <Nome do criador>

> **Para a IA que vai usar este perfil:** este documento descreve a voz de <criador> em YouTube Shorts. Use-o para reescrever qualquer copy como se ele estivesse falando para a câmera num Short de 15–60 s. Siga as regras; as citações entre aspas são falas reais dele e servem para calibrar o tom. Não copie as citações literalmente na copy nova, a menos que seja um bordão listado como reutilizável.

**Base:** <N> vídeos analisados · nicho: <nicho> · confiança: <alta/média/baixa — motivo> · gerado em <data>

## 1. Resumo da voz
<3–5 frases: quem ele soa ser para o público (parceiro de treino, professor, amigo zoeiro…), registro, energia, a marca que mais diferencia. Termine com uma frase "Em uma linha: …">

## 2. Princípios da voz
<5–8 regras curtas, em ordem de importância. Cada uma:>
1. **<Regra imperativa>.** *Por quê:* <efeito no público/retenção>. *Âncora:* "<citação>" (Vn)

## 3. Gancho / abertura
- **Fórmulas de abertura dele** (com frequência x/N):
  - `<template preenchível>` — ex.: "<citação literal>" (Vn)
- **Regras:** <como abrir; o que precisa estar nos primeiros ~3 s (~7–10 palavras)>
- **Nunca abra com:** <aberturas que fogem dele> — ❌ "<exemplo errado>" → ✅ "<como ele diria>"

## 4. Vocabulário e tom
- **Registro:** <descrição + âncora>
- **Bordões e expressões-assinatura:**
  | Expressão | Quando usar | Freq. | Âncora |
  |---|---|---|---|
- **Gírias, jargão do nicho e inglês:** <lista, com como ele os usa — explica ou assume?>
- **Tratamento e pessoa gramatical:** <como chama o público; eu/você/vocês/nós>
- **Palavrões e intensificadores:** <frequência e função; se não usa, diga "não use">
- **Construção da frase:** <tamanho, coordenação, marcadores de oralidade/regionalismos> — âncora
- **Evitar:**
  | ❌ Não use | ✅ Use no lugar | Por quê |
  |---|---|---|

## 5. Estrutura narrativa
- **Estruturas preferidas** (x/N): <esqueleto em setas> — âncora
- **Elenco:** <quem aparece nas histórias e em que papel; como ele se posiciona>
- **Concretude:** <como ele usa o específico — números, nomes, detalhes sensoriais> — âncora
- **Loops e payoffs:** <como abre e fecha curiosidade>
- **Batida emocional típica:** <sequência de emoções>

## 6. Retenção e ritmo
- **Mecanismos de retenção dele:** <lista com âncoras>
- **Ritmo:** <velocidade, frases curtas/longas, repetição rítmica, contagem>
- **Fechamento:** <tipo de final + CTA nativo ou ausência dele> — âncora
- **Evitar no ritmo:** <introdução antes do gancho, CTA institucional, explicação longa…>

## 7. Banco de exemplos literais
<10–20 citações curtas agrupadas por função (abertura, virada, detalhe concreto, incentivo, fechamento…), cada uma com Vn. Erros do Whisper marcados com [leitura provável]. Traços pontuais marcados "(pontual)".>

## 8. Como aplicar a uma copy
**Passo a passo:**
1. Extraia da copy original a **mensagem central** e o **único payoff** (o que a pessoa ganha). Descarte o resto.
2. Escolha uma **fórmula de abertura** da seção 3 e escreva os primeiros ~3 s com ela.
3. Monte o meio com uma **estrutura** da seção 5, trocando abstrações por um detalhe concreto (número, nome, cena).
4. Insira os **mecanismos de retenção** da seção 6 (no mínimo uma lacuna ou virada no meio).
5. Passe o texto pelo **vocabulário** da seção 4: troque palavras da lista "Evitar", coloque o tratamento certo e no máximo <n> bordões (sem forçar).
6. Feche no **estilo de fechamento** dele.
7. Leia em voz alta: tem que soar falado, caber em <faixa de duração> s (≈ <palavras/s> palavras/s) e passar no checklist abaixo.

**Formato de entrega da reescrita:** texto falado, pronto para gravar (sem marcações de roteiro, a menos que pedido), seguido de 1 sugestão de texto na tela para o gancho.

**Checklist de conformidade:**
- [ ] Os primeiros ~3 s usam uma fórmula da seção 3 e criam tensão ou curiosidade?
- [ ] Nada de apresentação ou contexto antes do gancho?
- [ ] Há pelo menos um detalhe concreto (número, nome, cena)?
- [ ] Tratamento e pessoa gramatical batem com a seção 4?
- [ ] Nenhuma palavra ou estrutura da lista "Evitar"?
- [ ] Bordões usados com naturalidade, sem excesso?
- [ ] Ritmo e fechamento batem com a seção 6?
- [ ] Soaria plausível lado a lado com as citações do banco de exemplos?
- [ ] <itens específicos deste criador, derivados dos princípios da seção 2>
````

## Regras de qualidade

- **Prescritivo sempre.** Escreva "Abra com uma pergunta de incentivo", nunca "ele tende a abrir com…". As observações viram regras com porquê.
- **Uma âncora no mínimo por regra**, literal, com Vn. Sem âncora, a regra sai ou fica marcada `(inferido)`.
- **Cada traço uma vez só**, no lugar mais forte (Passo 3.2).
- **Diferencial antes do genérico.** Se uma regra serviria para qualquer criador do nicho, reescreva-a até ficar específica ou corte-a.
- **Autossuficiência:** antes de salvar, releia fingindo ser uma IA numa conversa nova. Se alguma regra depende de algo que não está no arquivo (uma análise, "ver transcrição", um termo não explicado), corrija.
- **Preencha todos os placeholders** do template (`<n>`, faixa de duração, palavras/s etc.) com os valores do corpus. Sem dados, use o padrão do Shorts (20–45 s, ~2,5 palavras/s) e indique isso.
- **Honestidade de amostra:** a confiança declarada no cabeçalho tem que bater com N e com a regra de consistência.

## Entrega

1. Grave o arquivo (Passo 4).
2. Na conversa, informe o **caminho completo** e mostre um resumo curto: o resumo da voz (seção 1), os 3 princípios mais fortes e o nível de confiança.
3. Não cole o perfil inteiro na conversa, a menos que o usuário peça.
4. Se a amostra for pequena ou faltar alguma dimensão, diga o que melhoraria o perfil (ex.: "transcrever mais 5–10 vídeos").
