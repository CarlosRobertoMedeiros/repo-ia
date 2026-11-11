---
name: youtube-shorts-analise-ganchos
description: Analisa os ganchos (os primeiros segundos) de transcrições de YouTube Shorts de um criador. Classifica o tipo de gancho, explica por que trava o scroll e mapeia os padrões de abertura que ele repete. Aceita transcrições coladas no prompt ou uma pasta de arquivos .txt. Use quando o usuário falar em "ganchos", "hook", "aberturas", "como ele começa os vídeos", "primeiros segundos", "o que trava o scroll" ou "início dos shorts".
---

# Análise de Ganchos — YouTube Shorts

Foco: **só a abertura** de cada vídeo, cerca de 0–3 s (e até ~5 s quando o gancho se estende). O resto do vídeo só entra para verificar se o gancho foi cumprido.

## Passo 0 — Ler a lente (obrigatório)

Leia `.claude/skills/youtube-shorts-contexto/SKILL.md` inteiro antes de analisar. Ele define a régua do Shorts, os limites da transcrição (gancho visual ausente, erros do Whisper, estimativa de tempo) e o procedimento do corpus.

## Passo 1 — Montar o corpus

Siga a seção 4 do contexto:
- **Texto colado:** separe e numere os vídeos.
- **Pasta:** rode `node .claude/skills/youtube-shorts-contexto/scripts/juntar-transcricoes.js "<pasta>"`.

## Passo 2 — Recortar a abertura de cada vídeo

Para cada vídeo, isole:
- **Gancho (≈0–3 s):** as primeiras ~3 × palavras/s palavras. Sem esse dado, as primeiras 7–10 palavras.
- **Extensão (≈3–5 s):** a frase seguinte, que confirma ou desperdiça o gancho.

Registre também o título (se o cabeçalho trouxer). No Shorts o título aparece pouco, mas o texto na tela costuma repeti-lo. Considere-o como o possível gancho visual quando a fala abre fraca.

## Passo 3 — Classificar cada gancho

Atribua um **tipo principal** e, se houver, um secundário:

| Tipo | Marca na fala |
|---|---|
| Contraintuitivo / polêmico | contradiz o senso comum do nicho |
| Pergunta direta | "Você sabia…?", "Por que você…?" |
| Promessa / resultado | "O exercício que…", "Como eu…" |
| História pessoal | "Um treino que mudou…", "Quando eu…" |
| Autoridade / nome próprio | abre com atleta, famoso, especialista |
| Curiosidade sobre terceiros | "O que poucos sabem sobre X…" |
| Número / dado | estatística, quantidade, ranking |
| Identificação / chamada | "Se você treina e…", "Pra quem…" |
| Erro / alerta | "Para de…", "Você tá fazendo errado…" |
| *In medias res* / ambiente | começa no meio da ação, da conversa ou de um grito |
| Apresentação / morno | "Oi gente", "Bem, hoje eu trouxe…": abre com custo e sem tensão |
| Sem gancho falado | corte de bastidor ou ambiente; o gancho deve estar no visual ou no título |

Para cada um, dê uma **nota de força de 1 a 5** pela régua do Shorts: ele cria tensão ou curiosidade imediata? É específico? Fala com o público do nicho? Diga em uma frase **por que trava (ou não trava) o scroll**.

## Passo 4 — Mapear os padrões do criador

Com todos os vídeos classificados:
- **Distribuição de tipos:** quantos de cada tipo, com o tipo dominante.
- **Fórmulas de abertura repetidas:** estruturas que se repetem, mesmo com palavras diferentes (ex.: `[Nome de atleta] + [conquista] + "mas o que poucos sabem…"`).
- **Palavras de largada:** as primeiras palavras recorrentes ("Bora", "Cara", "Olha", "Bem, hoje…").
- **Gancho × desempenho:** se houver views, compare os tipos de gancho dos vídeos de mais e de menos alcance, sempre com a ressalva de que views também dependem do visual e do título.
- **Promessa cumprida?** O resto do vídeo entrega o que o gancho prometeu, ou é isca?

## Passo 5 — Entregar

Formato do relatório (Markdown):

```
# Ganchos — <criador> (<N> vídeos)

## Resumo em 3 linhas
<tipo dominante, força média, principal acerto e principal fraqueza>

## Gancho por vídeo
| V | Abertura (literal) | Tipo | Força | Por que trava / não trava |
|---|---|---|---|---|

## Padrões de abertura
<cada padrão com frequência (x/N) e 1–2 citações literais>

## O que funciona (replicar)
<fórmulas extraídas do criador, cada uma com template preenchível + exemplo dele>

## O que enfraquece (corrigir)
<abertura fraca citada → reescrita sugerida no estilo e no vocabulário dele>
```

Regras:
- Cite sempre o trecho literal com o número do vídeo. Marque erros do Whisper com `[leitura provável]`.
- As reescritas devem soar como o criador falaria (mesmo tom e mesmas gírias), não como copy de agência.
- Se a entrada foi uma pasta, além de mostrar o relatório na conversa, grave-o em `<pasta>/analise-ganchos.md`.
