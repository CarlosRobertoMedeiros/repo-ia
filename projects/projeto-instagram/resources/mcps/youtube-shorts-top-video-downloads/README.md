# MCP youtube-shorts-top-video-downloads

Lê o `lista_shorts.csv` gerado pelo MCP `youtube-shorts`, ordena os shorts por curtidas
(coluna `curtidas` ou `likes`, do mais curtido para o menos; visualizações não contam) e baixa
os N primeiros para a pasta do próprio CSV (pasta da conta).

## Ferramenta `download_top_shorts`

| Parâmetro    | Descrição |
|--------------|-----------|
| `csvPath`    | Caminho do CSV (absoluto ou relativo à pasta atual / raiz do projeto), a pasta que o contém, ou só o nome da conta (`resources/shorts/<conta>/lista_shorts.csv`). |
| `quantidade` | Quantos shorts baixar, começando pelo mais curtido. |

- A conta é o nome da pasta onde o CSV está; os vídeos são salvos nessa mesma pasta.
- Nome dos arquivos: `<ordem>_<video_id>.mp4` (o mais curtido é `1_...`).
- Arquivos que já existem são mantidos (não baixa de novo).
- Erros em um vídeo são registrados e o processo segue com os demais.

## Como a URL do vídeo é resolvida

O CSV só tem o `video_id`. A URL direta vem do endpoint público
`https://www.youtube.com/youtubei/v1/player` (InnerTube), sem login, cookies nem chave,
tentando os clientes Android VR, iOS e Android, nessa ordem, até um devolver formatos com URL direta.

- Preferência pelo formato com vídeo e áudio juntos (normalmente 360p).
- Se só houver vídeo e áudio separados, eles são baixados e juntados com o `ffmpeg`
  O ffmpeg vem do pacote `ffmpeg-static` (instalado pelo `npm install`); `FFMPEG_PATH` tem prioridade.

Variáveis opcionais: `YT_ANDROID_VR_VERSION`, `YT_IOS_VERSION`, `YT_ANDROID_VERSION`
(versões dos clientes), `YT_HL`/`YT_GL` (idioma/país), `YOUTUBE_SHORTS_MCP_ROOT` (raiz do projeto).

## Uso direto (sem cliente MCP)

```bash
node server.js --csv resources/shorts/marcioatalla/lista_shorts.csv --quantidade 5
```
