# MCP video-transcricao

Transcreve a fala de vídeos em texto com a API da Groq (modelos Whisper). Aceita um vídeo ou uma pasta inteira.
Para cada vídeo grava `<nome-do-vídeo>.txt` na mesma pasta, só com o texto falado: sem cabeçalho e sem metadados.

## Configuração

A configuração fica no `.env` da pasta do próprio MCP (`resources/mcps/video-transcricao/.env`), ao lado do
`server.js`, para o MCP ser autocontido. Só `GROQ_API_KEY` é obrigatória.
Toda a configuração da Groq fica nesse arquivo, que está no `.gitignore` e não vai para o git.

| Variável | Padrão | Para que serve |
|----------|--------|----------------|
| `GROQ_API_KEY` | — | Chave da API (`gsk_...`), criada em https://console.groq.com/keys |
| `GROQ_BASE_URL` | `https://api.groq.com/openai/v1` | Endpoint (só mude se usar proxy) |
| `GROQ_TRANSCRIBE_MODEL` | `whisper-large-v3` | Ou `whisper-large-v3-turbo` (mais rápido e barato) |
| `TRANSCRICAO_IDIOMA` | detecção automática | Idioma falado (`pt`, `en`...) |
| `TRANSCRICAO_TEMPERATURA` | `0` | 0 a 1; 0 é o mais fiel ao áudio |
| `TRANSCRICAO_PROMPT` | — | Vocabulário/nomes próprios para guiar a grafia |
| `TRANSCRICAO_AUDIO_KBPS` | `24` | Bitrate do áudio extraído (12 a 64) |
| `TRANSCRICAO_LIMITE_MB` | `24` | Tamanho máximo de cada arquivo enviado (até 25) |
| `TRANSCRICAO_MAX_SEGUNDOS` | `0` | Duração máxima de cada parte (0 = só o tamanho conta) |
| `TRANSCRICAO_TENTATIVAS` | `4` | Tentativas em falhas temporárias (429, 5xx, rede) |

- O `.env` é relido a cada chamada, então editar a chave não exige reiniciar o MCP.
- Valores do `.env` têm prioridade sobre variáveis de ambiente do sistema com o mesmo nome.
- Sem a chave, a ferramenta para logo e diz qual arquivo preencher.

## Ferramenta `transcrever_videos`

| Parâmetro   | Descrição |
|-------------|-----------|
| `caminho`   | Vídeo ou pasta (absoluto ou relativo à pasta atual / raiz do projeto). |
| `forcar`    | `true` refaz mesmo que o `.txt` já exista (padrão `false`). |
| `recursivo` | `true` inclui subpastas (padrão `false`). |
| `idioma`    | Código do idioma falado; tem prioridade sobre `TRANSCRICAO_IDIOMA`. |

- Vídeo com `.txt` já existente é pulado, seja numa pasta ou num vídeo avulso. Use `forcar` para refazer.
- Erro num vídeo (sem áudio, arquivo corrompido, falha da API) é registrado e os outros seguem.
  Erros que afetariam todos os vídeos (chave inválida, acesso negado, modelo inexistente) param o processo.
- Limite de taxa da Groq (429, inclusive o limite de segundos de áudio por hora): o MCP espera o tempo que a
  API indica (até 5 minutos) e tenta de novo. Se a espera for maior, aquele vídeo entra nos erros e você pode
  rodar de novo depois: os já transcritos são pulados.
- O `.txt` é gravado só no fim (arquivo temporário e depois renomeado), então nunca fica pela metade.

## Como o áudio é preparado

1. O `ffmpeg` vem do pacote `ffmpeg-static`, que traz um binário para Windows, macOS ou Linux no `npm install`.
   Não precisa instalar mais nada. `FFMPEG_PATH` tem prioridade, se estiver definido.
2. Só a faixa de áudio é extraída: mono, 16 kHz (a taxa que o Whisper usa internamente, recomendada pela Groq),
   filtro de banda de voz, Opus 24 kbit/s em OGG (cerca de 10 MB por hora de fala).
   Se o ffmpeg não tiver libopus, usa MP3.
3. A Groq aceita até 25 MB por upload direto. Áudios maiores que `TRANSCRICAO_LIMITE_MB` (ou mais longos que
   `TRANSCRICAO_MAX_SEGUNDOS`, se definido) são divididos em partes. Os cortes caem no silêncio mais próximo,
   para não cortar palavras, e o fim de cada parte segue como contexto (`prompt`) para a próxima.
   As partes são transcritas em ordem e unidas num único texto.
4. Os arquivos temporários ficam na pasta temporária do sistema e são apagados no fim.

## Uso direto (sem cliente MCP)

```bash
node server.js --caminho resources/shorts/fabriciopacholok --idioma pt
node server.js --caminho resources/shorts/fabriciopacholok/1_1L0VDzbiuYk.mp4 --forcar
```
