---
name: youtube-shorts-analise-storytelling
description: Analisa o storytelling em transcrições de YouTube Shorts de um criador. Cobre arco da história, personagens e exemplos concretos, loops abertos e payoffs, estrutura de argumento (lista, jornada, antes/depois, problema-solução), batidas emocionais e o uso do específico versus o abstrato. Aceita transcrições coladas no prompt ou uma pasta de arquivos .txt. Use quando o usuário falar em "storytelling", "narrativa", "como ele conta histórias", "estrutura do vídeo", "arco", "roteiro", "jornada", "exemplos que ele usa" ou "como ele constrói o argumento".
---

# Análise de Storytelling — YouTube Shorts

Foco: **como a mensagem é construída**, ou seja, a forma da história ou do argumento do início ao fim.

## Passo 0 — Ler a lente (obrigatório)

Leia `.claude/skills/youtube-shorts-contexto/SKILL.md` inteiro antes de analisar. No Shorts, a história é comprimida: o arco inteiro cabe em 20–60 s, o "setup" é quase nulo e o payoff vem rápido. Julgue por essa régua, não pela de um conto ou de um vídeo longo.

## Passo 1 — Montar o corpus

Siga a seção 4 do contexto:
- **Texto colado:** separe e numere os vídeos.
- **Pasta:** rode `node .claude/skills/youtube-shorts-contexto/scripts/juntar-transcricoes.js "<pasta>"`.

## Passo 2 — Desmontar cada vídeo

Para cada transcrição, identifique:

1. **Formato** (bastidor, dica, história pessoal, curiosidade sobre terceiros, lista, dublagem…). Um vídeo sem narrativa (só ambiente) é registrado como tal e pesa pouco nos padrões.
2. **Estrutura**, escolhendo uma ou combinando:
   - Arco clássico curto: situação → conflito → virada → resolução
   - Problema → solução
   - Antes → depois / transformação
   - Jornada (pessoal ou de terceiro)
   - Lista / passos
   - Tese → prova → conclusão
   - Cena única (momento ao vivo, sem arco)
3. **Personagens:** quem aparece (o próprio criador, um ídolo do nicho, o público, um aluno) e que papel tem (mentor, herói, antagonista, exemplo).
4. **Loops abertos → payoffs:** cada pergunta implícita aberta e onde (e se) ela é fechada. Loop aberto sem payoff conta como falha. Payoff sem loop conta como oportunidade perdida.
5. **Batidas emocionais:** a sequência de emoções (ex.: curiosidade → admiração → superação → inspiração). Marque o pico.
6. **Específico × abstrato:** números, nomes, lugares, falas citadas, detalhes sensoriais ("tava aqui na minha orelha") contra generalidades ("treinar duro", "mudou muita coisa"). Indique a proporção e onde o abstrato enfraquece.
7. **Mensagem / moral:** a ideia que fica. Ela é dita ou mostrada?

## Passo 3 — Padrões do criador

- **Estruturas preferidas** (x/N) e formatos dominantes.
- **Elenco recorrente:** quem ele coloca nas histórias e com que função. Ele se coloca como herói, como aprendiz ou como narrador?
- **Assinatura emocional:** que emoção ele busca com mais frequência.
- **Uso de detalhe:** em que momentos ele fica concreto (e funciona) e onde fica genérico.
- **Disciplina de payoff:** ele fecha o que abre?
- **Storytelling × desempenho:** se houver views, compare estrutura e formato nos vídeos de mais alcance (com a ressalva de sempre).

## Passo 4 — Entregar

```
# Storytelling — <criador> (<N> vídeos)

## Resumo em 3 linhas

## Esqueleto por vídeo
| V | Formato | Estrutura | Personagens | Loop → Payoff | Pico emocional | Específico/abstrato |
|---|---|---|---|---|---|---|

## Padrões narrativos
<cada padrão com frequência e citações literais (Vn)>

## Específico vs. abstrato
<trechos concretos que funcionam × trechos genéricos, com reescrita mais concreta no estilo dele>

## Templates de roteiro do criador
<2–4 esqueletos replicáveis extraídos dos vídeos dele, ex.:
 "[Experiência com ídolo] → [detalhe sensorial] → [contagem/escalada] → [frase-bordão de fechamento]"
 com um exemplo preenchido em tema novo do mesmo nicho>

## Acionável
<o que manter, o que fechar (loops sem payoff), onde concretizar>
```

Regras:
- Evidência literal com número do vídeo. Marque erros do Whisper com `[leitura provável]`.
- Separe a voz autoral de conteúdo dublado, traduzido ou de terceiros.
- Se a entrada foi uma pasta, além de mostrar o relatório na conversa, grave-o em `<pasta>/analise-storytelling.md`.
