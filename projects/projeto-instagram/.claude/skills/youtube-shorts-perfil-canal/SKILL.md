---
name: youtube-shorts-perfil-canal
description: Executa o pipeline completo de ponta a ponta para um canal do YouTube Shorts informado como parâmetro. Gera a spec a partir do template, lista os shorts, baixa os mais curtidos, transcreve, roda as 4 análises (ganchos, retenção, storytelling, vocabulário) e gera o perfil de comunicação, marcando cada passo na spec com data, hora e evidência. Uso: /youtube-shorts-perfil-canal @conta [quantidade] [idioma]. Use quando o usuário pedir "gere o perfil completo do canal X", "rode tudo para @conta", "pipeline completo", "analisa o canal X do zero" ou "faz o perfil de comunicação do @conta".
---

# Pipeline completo de perfil para um canal de YouTube Shorts

Orquestra os MCPs e as skills do projeto para **um canal informado como parâmetro**. O registro da execução fica numa spec em `.spec/perfil-<conta>/spec.md`.

## Parâmetros

Lidos dos argumentos da skill (`ARGUMENTS`) ou do pedido em linguagem natural:

| Parâmetro | Obrigatório | Padrão | Exemplo |
|---|---|---|---|
| `conta` | sim | — | `@fabriciopacholok`, `fabriciopacholok` ou a URL do canal |
| `quantidade` | não | `3` | `10` (quantos shorts mais curtidos baixar e transcrever) |
| `idioma` | não | detecção automática | `pt`, `en` |

- **Normalize `<conta>`:** minúsculas, sem `@`. É o nome da pasta que o MCP `youtube-shorts` cria em `resources/shorts/<conta>/`.
- **Sem conta:** pergunte qual canal antes de começar.
- **Ordem dos argumentos:** se vierem dois argumentos além da conta, o numérico é `quantidade` e o de duas letras é `idioma`.

## Registro de evidências (vale para todos os passos)

- Antes e depois de cada passo, pegue a hora real com `date '+%Y-%m-%d %H:%M:%S %z'`. Nunca invente horários.
- Ao concluir um passo, marque o item da spec com `[x]` e acrescente, logo abaixo, sub-itens com:
  - **Executado em:** início → fim (fuso).
  - **Ferramenta:** MCP ou skill e os parâmetros usados.
  - **Evidência:** o retorno resumido do MCP (contagens, avisos, erros) e os arquivos gerados, com tamanho e horário (`ls -la --time-style=full-iso`).
  - **Observação:** só quando houver desvio (arquivo já existente, reaproveitamento, aviso anti-bot, vídeo sem fala…).
- Se um passo falhar, deixe-o `[ ]`, registre o erro como evidência e decida:
  - **Erro parcial** (alguns vídeos): siga em frente.
  - **Erro bloqueante** (ex.: sem `GROQ_API_KEY`, nenhum vídeo baixado): pare e informe o usuário.

## Passo 1 — Preparar a spec

1. Se `.spec/perfil-<conta>/spec.md` **já existir**, reutilize-a. Itens já marcados `[x]` não são refeitos, a menos que o usuário peça.
2. Se não existir, copie `resources/templates/spec-perfil-influenciador.md` para `.spec/perfil-<conta>/spec.md` e então:
   - remova o comentário HTML do topo;
   - troque `{{conta}}` pela conta normalizada;
   - se `quantidade` ≠ 3, troque "Obter os 3 melhores shorts" por "Obter os `<quantidade>` melhores shorts";
   - no último item, acrescente: `no arquivo perfil-<conta>.md`;
   - deixe a seção **Observações** para preencher depois do Passo 2.

## Passo 2 — Fase 1: obtenção dos dados

1. **Listar shorts:** chame o MCP `youtube-shorts` → `fetch_account_shorts(username: "@<conta>")`. Evidência: páginas lidas, total de shorts, avisos, tamanho e horário do `lista_shorts.csv`.
2. **Preencher as Observações da spec**, olhando títulos e descrições do CSV:
   - idioma dos vídeos;
   - cortes com convidados ou podcast (é preciso separar a voz do criador);
   - conteúdo só visual ou musical (o perfil vai depender dos títulos e terá confiança baixa);
   - views muito baixas (a comparação de gancho × desempenho não diz nada).
   - Sem particularidades, escreva "Nenhuma particularidade identificada".
3. **Baixar os mais curtidos:** chame o MCP `youtube-shorts-top-video-downloads` → `download_top_shorts(csvPath: "<conta>", quantidade)`. Evidência: arquivos `.mp4` com curtidas, tamanho e se foram baixados agora ou já existiam.
4. **Transcrever:** chame o MCP `video-transcricao` → `transcrever_videos(caminho: "resources/shorts/<conta>", idioma)`. Evidência: transcritos agora / pulados / erros e os `.txt` gerados com tamanho.
   - Se alguma transcrição vier vazia ou só com ruído, registre isso. É o caso típico de vídeo só com música.

## Passo 3 — Fase 2: análises

Monte o corpus **uma vez**:

```bash
node .claude/skills/youtube-shorts-contexto/scripts/juntar-transcricoes.js "resources/shorts/<conta>"
```

Registre o resumo do corpus (nº de transcrições, palavras, metadados cruzados) na spec, logo acima dos itens da Fase 2.

Leia `.claude/skills/youtube-shorts-contexto/SKILL.md`. Depois, para cada skill, leia o `SKILL.md` dela e siga os passos de análise. Grave **com os nomes da spec**, em `resources/shorts/<conta>/`:

| Ordem | Skill | Arquivo |
|---|---|---|
| 1 | `youtube-shorts-analise-ganchos` | `youtube-shorts-analise-gancho.md` |
| 2 | `youtube-shorts-analise-retencao` | `youtube-shorts-analise-retencao.md` |
| 3 | `youtube-shorts-analise-storytelling` | `youtube-shorts-analise-storytelling.md` |
| 4 | `youtube-shorts-analise-vocabulario` | `youtube-shorts-analise-vocabulario.md` |

- Os nomes da spec prevalecem sobre o nome padrão de cada skill (`analise-*.md`).
- Se já existir uma análise com o nome padrão para o mesmo corpus, renomeie-a para o nome da spec em vez de duplicar, e registre isso em **Observação**.
- Coloque no topo de cada arquivo a linha `_Gerado com a skill <nome> em <data> (<fuso>)._`.

## Passo 4 — Perfil de comunicação

Leia `.claude/skills/youtube-shorts-analise-perfil-comunicacao/SKILL.md` e gere o perfil com base nas 4 análises. Salve em `resources/shorts/<conta>/perfil-<conta>.md`.

Evidência: tamanho, número de linhas, horário e a confiança declarada no cabeçalho do perfil.

## Passo 5 — Entrega

Na conversa, informe:

- o caminho da spec e do perfil;
- uma tabela curta com os 8 passos (✅/❌ e horário);
- o resumo da voz do criador (seção 1 do perfil) e a confiança;
- o que melhoraria o resultado (ex.: "rode de novo com quantidade 10").

Não faça commit.
