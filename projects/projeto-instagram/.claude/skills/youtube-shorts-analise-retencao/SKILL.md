---
name: youtube-shorts-analise-retencao
description: Analisa a retenção em transcrições de YouTube Shorts de um criador. Cobre pattern interrupts, lacunas de curiosidade, cliffhangers, re-gancho no meio, mudança de ritmo, gatilhos de engajamento/comentário e o loop ou CTA de fechamento. Aceita transcrições coladas no prompt ou uma pasta de arquivos .txt. Use quando o usuário falar em "retenção", "o que segura a pessoa", "ritmo", "pattern interrupt", "curiosidade", "cliffhanger", "loop", "CTA", "final do vídeo", "engajamento" ou "por que as pessoas assistem até o fim".
---

# Análise de Retenção — YouTube Shorts

Foco: o que acontece **depois do gancho**, isto é, o que faz a pessoa continuar assistindo, comentar e reassistir.

## Passo 0 — Ler a lente (obrigatório)

Leia `.claude/skills/youtube-shorts-contexto/SKILL.md` inteiro antes de analisar. Lembre especialmente que cortes, mudanças visuais e texto na tela não aparecem na transcrição, então muitos pattern interrupts reais são invisíveis aqui.

## Passo 1 — Montar o corpus

Siga a seção 4 do contexto:
- **Texto colado:** separe e numere os vídeos.
- **Pasta:** rode `node .claude/skills/youtube-shorts-contexto/scripts/juntar-transcricoes.js "<pasta>"`.

## Passo 2 — Mapear a curva de cada vídeo

Divida cada transcrição em três terços (abertura, meio e fechamento). Use `palavras/s` para converter posições em segundos aproximados. Em cada trecho, marque:

| Mecanismo | O que procurar na fala |
|---|---|
| **Lacuna de curiosidade** | informação prometida e adiada ("mas o que poucos sabem…", "e aí aconteceu…") |
| **Pattern interrupt** | troca de voz ou personagem, imitação, citação em discurso direto, mudança brusca de tom, de assunto ou de idioma, onomatopeia, grito |
| **Re-gancho no meio** | nova promessa ou virada por volta de 40–60% do vídeo ("agora imagina…", "só que…") |
| **Cliffhanger** | tensão logo antes do payoff (contagem, "e aí…", suspense) |
| **Progressão / contagem** | números subindo, passos, lista, escalada ("10… 19… 20") |
| **Mudança de ritmo** | frases curtas em sequência, repetição rítmica, aceleração |
| **Gordura** | trechos que repetem sem acrescentar, explicação longa, contexto que não cria tensão. Aponte onde o espectador provavelmente passa |
| **Gatilho de comentário** | opinião polêmica, pergunta ao público, erro proposital, afirmação que o nicho vai querer corrigir, chamada "comenta aí" |
| **Gatilho de compartilhamento / salvamento** | dica útil, "manda pra quem…", humor de identificação |
| **Fechamento** | payoff claro? Loop (a última frase emenda na primeira)? CTA nativo ou institucional? Final abrupto (bom para loop) ou arrastado? |

## Passo 3 — Padrões do criador

- **Mecanismos assinatura:** quais ele usa com frequência (x/N), com citações.
- **Onde perde a pessoa:** os pontos de gordura que se repetem.
- **Como ele fecha:** distribuição dos tipos de final (loop, CTA, punchline, corte seco, sem fechamento).
- **Duração × densidade:** com duração e palavras/s, compare os vídeos curtos com os longos. Os longos têm re-ganchos que sustentam a duração?
- **Retenção × desempenho:** se houver views, diga o que os vídeos de mais alcance têm a mais (com a ressalva de sempre).

## Passo 4 — Entregar

```
# Retenção — <criador> (<N> vídeos)

## Resumo em 3 linhas

## Curva por vídeo
| V | Duração | Mecanismos no meio | Re-gancho? | Gordura | Fechamento | Nota retenção (1–5) |
|---|---|---|---|---|---|---|

## Mecanismos assinatura
<cada um com frequência + citações literais (Vn)>

## Gatilhos de engajamento
<o que provoca comentário, compartilhamento e salvamento, com exemplos; e onde ele deixa de pedir engajamento>

## Fechamentos e loops
<padrão de final + exemplo de como transformar um final dele em loop>

## Acionável
- Replicar: <fórmulas de retenção dele em template>
- Cortar: <trechos de gordura citados → versão enxuta>
- Adicionar: <onde caberia re-gancho ou CTA, com frase-modelo no estilo dele>
```

Regras:
- Evidência literal com número do vídeo em todo padrão. Marque erros do Whisper com `[leitura provável]`.
- Não penalize a ausência de interrupt visual: diga "não há interrupt na fala".
- Se a entrada foi uma pasta, além de mostrar o relatório na conversa, grave-o em `<pasta>/analise-retencao.md`.
