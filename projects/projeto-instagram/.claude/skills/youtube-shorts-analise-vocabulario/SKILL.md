---
name: youtube-shorts-analise-vocabulario
description: Analisa o vocabulário e o jeito de falar em transcrições de YouTube Shorts de um criador. Cobre gírias, bordões, formas de tratamento, complexidade das frases, palavrões, jargão do nicho, inglês misturado, referências culturais e expressões recorrentes. Aceita transcrições coladas no prompt ou uma pasta de arquivos .txt. Use quando o usuário falar em "vocabulário", "como ele fala", "jeito de falar", "bordões", "gírias", "expressões", "linguagem", "tom de voz", "palavrões", "como ele chama o público" ou quiser "escrever como ele".
---

# Análise de Vocabulário — YouTube Shorts

Foco: **a voz**, ou seja, as palavras, expressões e construções que tornam a fala desse criador reconhecível.

## Passo 0 — Ler a lente (obrigatório)

Leia `.claude/skills/youtube-shorts-contexto/SKILL.md` inteiro antes de analisar. Pela régua do Shorts, gíria, palavrão, repetição e frase quebrada são marcadores de autenticidade e de pertencimento, não erros. E a pontuação vem do Whisper, não do criador.

## Passo 1 — Montar o corpus

Siga a seção 4 do contexto:
- **Texto colado:** separe e numere os vídeos.
- **Pasta:** rode `node .claude/skills/youtube-shorts-contexto/scripts/juntar-transcricoes.js "<pasta>"`.

Exclua da análise de voz as falas que não são do criador (conteúdo dublado, outras pessoas, ambiente), ou analise-as à parte e diga isso.

## Passo 2 — Levantamento

Para apoiar a contagem em corpus grandes, você pode contar termos com uma busca simples no texto do corpus (grep ou um script curto). Levante:

| Categoria | O que registrar |
|---|---|
| **Bordões / expressões-assinatura** | frases que se repetem entre vídeos ("Bora", "Vamos embora", "Cara") com contagem e vídeos |
| **Gírias** | gerais e da internet BR ("ferrou", "acabou com", "monstro", "shape") |
| **Jargão do nicho** | termos técnicos e como ele os usa: explica ou assume que o público sabe? |
| **Inglês misturado** | "one more rep", "bulking"… É natural do nicho ou é para dar status? |
| **Formas de tratamento** | como ele chama o público e os outros ("galera", "cara", "vocês", "você", "mano") e se fala com um ("você") ou com muitos ("vocês") |
| **Palavrões / intensificadores** | frequência e função (ênfase, humor, raiva, autenticidade) |
| **Marcadores de oralidade** | "tipo", "aí", "daí", "né", "ó", "assim", "poxa" e regionalismos ("daí" no lugar de "então" pode indicar Sul ou Paraná) |
| **Complexidade das frases** | frases curtas ou longas, coordenadas ou subordinadas, registro (coloquial ou formal). Lembre que a pontuação é do Whisper: avalie pela construção, não pelos pontos |
| **Discurso direto / imitação** | ele cita falas dos outros, imita vozes ou entonações? |
| **Referências culturais** | atletas, famosos, memes, eventos, marcas |
| **Pessoa gramatical** | eu (relato), você (conselho), nós (tribo), ele/ela (terceiros) |

## Passo 3 — Perfil da voz

- **Registro geral** em uma frase (ex.: "coloquial de academia, de parceiro de treino, com regionalismo sulista e inglês do bodybuilding").
- **Top expressões** ranqueadas por frequência, com os vídeos onde aparecem.
- **Função de cada traço:** o que cada marca faz pela comunicação (cria intimidade, autoridade, humor, energia, pertencimento à tribo).
- **Consistência:** a voz é a mesma em todos os vídeos ou muda por formato (ex.: dublagem formal × bastidor espontâneo)? Sinalize vídeos destoantes.
- **Voz × desempenho:** se houver views, veja se os vídeos de mais alcance são mais ou menos "na voz dele" (com a ressalva de sempre).

## Passo 4 — Entregar

```
# Vocabulário — <criador> (<N> vídeos)

## Resumo em 3 linhas
<registro, 3 marcas mais fortes, consistência>

## Bordões e expressões recorrentes
| Expressão | Freq. | Vídeos | Função | Exemplo literal |
|---|---|---|---|---|

## Gírias, jargão e inglês
## Tratamento e pessoa gramatical
## Palavrões e intensificadores
## Construção das frases
## Referências culturais

## Guia de voz (para escrever como ele)
- Use: <lista de palavras/expressões dele>
- Evite: <o que soaria falso nele, ex.: termos formais, "prezados">
- Estrutura típica de frase: <padrão + exemplo>
- Exemplo: <2–3 frases novas, de tema do nicho, escritas na voz dele>
```

Regras:
- Toda expressão com citação literal e número do vídeo. Marque erros do Whisper com `[leitura provável]`. Não conte como "palavra dele" algo que é claramente erro de transcrição.
- Com amostra pequena, trate repetições como indício e diga isso.
- Se a entrada foi uma pasta, além de mostrar o relatório na conversa, grave-o em `<pasta>/analise-vocabulario.md`.
