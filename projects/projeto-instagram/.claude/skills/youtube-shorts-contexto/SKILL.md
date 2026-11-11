---
name: youtube-shorts-contexto
description: Lente base de como o YouTube Shorts funciona de verdade (gramática de viralização, gancho nos primeiros segundos, retenção, tom casual/lo-fi, gatilhos de comentário, loops, cultura de internet BR) e o procedimento para montar o corpus de transcrições. Não analisa nada sozinha — é lida primeiro pelas skills youtube-shorts-analise-ganchos, -retencao, -storytelling e -vocabulario. Use também quando o usuário perguntar "como funciona o Shorts", "o que faz um short viralizar", "a régua do Shorts" ou pedir para rodar "todas as análises" de um criador.
---

# YouTube Shorts — Contexto (a lente)

Esta skill é a **régua** de todas as análises de transcrições de Shorts. Ela não produz análise. Quem analisa são as skills de critério, que leem este arquivo antes de começar. A ideia é julgar tudo pela lógica do feed vertical, e **não** pela de um texto formal, de uma redação ou de um vídeo longo.

## 1. Como o Shorts decide o que viraliza

O feed do Shorts é uma roleta. O espectador não escolheu o vídeo: ele caiu ali, com o polegar pronto para passar. O algoritmo testa o vídeo com um grupo pequeno e expande a distribuição conforme os sinais. Os que mais pesam:

| Sinal | O que significa | Como aparece na fala |
|---|---|---|
| **Taxa de "viu vs. passou"** | Quantos ficam depois do primeiro ~1–3 s | Gancho: a primeira frase tem que criar tensão, curiosidade ou identificação na hora |
| **Retenção média / % assistido** | Quanto do vídeo a pessoa vê | Ritmo, lacunas abertas, re-ganchos, nenhuma "gordura" |
| **Re-assistir / loop** | Vídeo assistido mais de 100% | Final que emenda no começo, payoff rápido, informação densa demais para uma vez só |
| **Engajamento** | Comentários, curtidas, compartilhamentos, salvamentos | Opinião polêmica, pergunta direta, "marca aquele amigo", erro proposital, dica que vale salvar |
| **Inscrição a partir do Short** | O Short converteu em canal | Identidade forte, série ("parte 2"), promessa de continuidade |

Consequências práticas:
- **Os primeiros segundos valem mais que todo o resto.** Um vídeo bom com abertura morna morre antes de alguém ver o conteúdo.
- **Cada frase precisa justificar a próxima.** Contexto, apresentação ("Oi gente, tudo bem? Hoje eu vou…") e introdução são custo, a não ser que eles próprios criem tensão.
- **Duração ideal é a menor que entrega o payoff.** 15–35 s favorece loop e % assistido; 45–60 s+ só se sustenta com re-ganchos.
- **Comentário é combustível.** Um vídeo que "pede" correção, discordância ou depoimento ganha distribuição.

## 2. A gramática do Shorts (o que é "bom" aqui)

**Gancho (0–3 s).** Tipos clássicos: afirmação contraintuitiva ou polêmica; pergunta direta ao espectador; promessa de resultado ("o exercício que…"); começar *in medias res*, no meio da ação ou da fala; número ou estatística chocante; identificação ("se você treina e…"); conflito ou erro ("para de fazer isso"); nome próprio ou autoridade; ambiente que já é cena (grito, barulho, discussão).

**Retenção (meio).** Lacunas de curiosidade ("mas o que poucos sabem é que…"), pattern interrupts (mudança de tom, voz, personagem ou assunto), contagem e progressão (repetições, passos, lista), cliffhanger antes do payoff, re-gancho por volta da metade, ritmo picado (frases curtas, sem respiro morto).

**Fechamento.** Payoff claro e rápido; frase final que conecta com a primeira (loop); CTA leve e nativo ("comenta aí", "parte 2?", "manda pra quem…"). CTA longo e institucional ("se inscreva, ative o sininho…") costuma derrubar retenção.

**Tom.** Casual, lo-fi, falado, como quem conta algo para um amigo. Um Short "imperfeito" e autêntico frequentemente vence o produzido. Repetição, gíria, palavrão e frase quebrada **não são defeitos aqui**: são marcadores de autenticidade e de ritmo. Só viram problema quando enrolam ou quebram a clareza.

**Cultura de internet BR.** Bordões, memes, referências a figuras da bolha (no fitness, por exemplo: atletas, coaches, "shape", "monstro", "bora"), humor autodepreciativo, zoeira com o público, "é sobre isso", "tankar", "cringe", gírias regionais, mistura de inglês na fala do nicho ("one more rep", "cutting", "bulking"). Isso cria pertencimento à tribo e gera comentário de quem é de dentro.

**Formatos recorrentes do Shorts.** Corte de podcast ou live; react; bastidor ou vlog sem roteiro; dica direta para a câmera; história pessoal ("um treino que mudou minha vida…"); curiosidade sobre terceiros (atleta, famoso); lista ("3 erros…"); desafio; tradução ou dublagem de conteúdo gringo. **Identifique o formato antes de julgar**: um corte de bastidor não tem gancho roteirizado, e isso é um dado, não uma falha.

## 3. Limites de uma transcrição (leia antes de concluir qualquer coisa)

- **Só existe o áudio falado.** Texto na tela, cortes, b-roll, legenda, música, expressão facial e o próprio título do vídeo **não estão na transcrição**. Muitos ganchos de Shorts são visuais ou estão no texto sobreposto. Nunca afirme que "o vídeo não tem gancho" só porque a fala não tem. Diga que "a fala não carrega o gancho; provavelmente está no visual ou no título".
- **Erros do Whisper.** Nomes próprios, jargão técnico e inglês saem distorcidos (ex.: "curto nordicul" = *nordic curl*; "Tom Pletsch" = provavelmente *Tom Platz*). Interprete pelo contexto, cite o trecho como está e, quando relevante, indique a leitura provável entre colchetes: `"curto nordicul" [nordic curl]`.
- **Pontuação e quebras não são do criador.** Não tire conclusão sobre "frases longas" apenas pela pontuação do Whisper.
- **Sem marcação de tempo.** Estime pelos dados: se o cabeçalho trouxer `palavras/s`, os primeiros N segundos ≈ N × palavras/s palavras. Sem duração, use **~2,5 palavras/s** (fala em PT-BR conversacional; fala acelerada chega a 3–3,5). Assim, os primeiros 3 s ≈ as 7–10 primeiras palavras.
- **Conteúdo que não é fala do criador.** Dublagem ou tradução de conteúdo gringo, falas de outras pessoas, ambiente de academia. Separe o que é voz autoral do que é material de terceiros, e diga isso.
- **Amostra pequena = conclusão cautelosa.** Com menos de ~8 vídeos, fale em "indícios" e não em "padrão". Diga quantos vídeos sustentam cada padrão (ex.: "3 de 5 vídeos").

## 4. Montar o corpus (procedimento comum a todas as análises)

O usuário pode entregar o material de dois jeitos:

**A) Texto colado no prompt.** Use-o direto. Se houver várias transcrições coladas, separe-as por vídeo: use os separadores que o usuário usou ou, na falta deles, mudanças evidentes de assunto. Numere os vídeos (VÍDEO 1, VÍDEO 2…).

**B) Uma pasta.** Rode o script que junta todas as transcrições num texto único, com cabeçalho por vídeo e metadados do `lista_shorts.csv` quando ele existir (título, duração, views, curtidas, palavras/s):

```bash
node .claude/skills/youtube-shorts-contexto/scripts/juntar-transcricoes.js "<pasta>"
```

- Para incluir subpastas, use `--recursivo`.
- Para gravar em arquivo em vez de imprimir (corpus grande), use `--saida "<pasta>/_corpus.txt"`.
- O script ignora arquivos `analise-*.txt` e `_corpus*`, e arquivos vazios.
- O caminho do script é relativo à raiz do projeto. Se a pasta atual for outra, use o caminho absoluto da skill.
- Se a pasta tiver vídeos sem `.txt`, avise o usuário. Ele pode transcrevê-los antes com a ferramenta `transcrever_videos` do MCP `video-transcricao`.

Com o corpus em mãos, **analise o conjunto**. O objetivo é o estilo recorrente do criador, não um vídeo isolado. Quando houver views no cabeçalho, use-as para comparar o que os vídeos de mais alcance fazem de diferente, mas lembre que views dependem também de visual, título e momento, não só da fala.

## 5. Regras de qualidade para qualquer análise

1. **Sempre com evidência.** Todo padrão vem com citação literal entre aspas e o número do vídeo: `"Um treino que mudou muita coisa pra mim…" (V3)`.
2. **Específico, nunca genérico.** Proibido "use ganchos fortes" ou "conte histórias". Diga *qual* gancho, *por que* funciona para *este* público e *como* replicar, com uma frase-modelo.
3. **Frequência explícita.** "Aparece em 4/6 vídeos" vale mais que "ele costuma".
4. **Julgue pela régua do Shorts** (seções 1–2), não pela norma culta.
5. **Separe o observado do inferido.** Use "a transcrição mostra…" para o observado e "provavelmente…" para o inferido.
6. **Termine com algo acionável**: fórmulas ou templates replicáveis extraídos do próprio criador, e pontos fracos com sugestão concreta de reescrita.

## 6. Rodar várias análises juntas

As skills de critério são independentes, e cada uma funciona sozinha. Se o usuário pedir mais de uma (ou "todas"), monte o corpus **uma vez só** e aplique cada skill na sequência, na ordem ganchos → retenção → storytelling → vocabulário. No fim, acrescente um **retrato-síntese** curto: como esse criador comunica, em 5–8 linhas, ligando as dimensões.

Se o objetivo for um artefato reutilizável para escrever copy na voz do criador, e não só um retrato, use a skill `youtube-shorts-analise-perfil-comunicacao`. Ela consolida as quatro análises num perfil de comunicação prescritivo, salvo em Markdown.
