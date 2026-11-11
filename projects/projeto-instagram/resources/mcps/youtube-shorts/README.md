# MCP youtube-shorts

Lista todos os Shorts de um canal do YouTube, com visualizações e curtidas, usando só
chamadas HTTP públicas (API InnerTube `/youtubei/v1`, a mesma do site e do app).
Sem login, cookies, chave de API, Playwright ou Puppeteer. Sem dependências: Node.js 18+.

## Ferramenta

`fetch_account_shorts`

| argumento  | tipo    | descrição                                                    |
|------------|---------|--------------------------------------------------------------|
| `username` | string  | `@handle`, handle, URL do canal ou ID `UC...` (obrigatório)  |
| `maxPages` | integer | limite de páginas da listagem (padrão 200, ~60 shorts/página) |

Salva em `resources/shorts/<conta>/lista_shorts.csv` (conta em minúsculas, sem `@`).

## Colunas do CSV

`video_id, titulo, url, publicado_em, duracao_segundos, visualizacoes, curtidas, canal, descricao, atualizado_em`

## Como funciona

1. **Canal**: `navigation/resolve_url` converte o `@handle` no ID `UC...`.
2. **Lista**: a playlist de Shorts do canal (`UUSH...`), mais nova primeiro, paginada
   pelo cliente ANDROID até o fim. Alternativas: a mesma playlist pelo cliente WEB
   (só os primeiros 100) e a aba "Shorts" do canal.
3. **Detalhes** de cada short (3 em paralelo):
   - `reel/reel_item_watch` (player de Shorts): views, curtidas, data/hora exata, duração;
   - se o player pedir a verificação anti-bot ("Sign in to confirm you're not a bot"),
     a coleta segue pela página de exibição (`next`), que traz views, curtidas e a data
     (só o dia). Datas completas já salvas não são substituídas.
4. **Erros** de acesso são registrados no resumo e ignorados; o que foi obtido é salvo.
   Após 10 falhas seguidas, a coleta de detalhes para.

## Reexecução

- Shorts novos entram no início da lista; a lista fica ordenada por publicação (mais novo primeiro).
- Os já salvos têm views e curtidas atualizadas; os que não vierem (erro, removidos) são mantidos.
- Os que ainda estão sem curtidas são consultados primeiro.

## Uso

Direto pelo terminal:

```bash
node resources/mcps/youtube-shorts/server.js --username @FabricioPacholok
```

Como servidor MCP (stdio), por exemplo em `.mcp.json`:

```json
{
  "mcpServers": {
    "youtube-shorts": {
      "command": "node",
      "args": ["resources/mcps/youtube-shorts/server.js"]
    }
  }
}
```

## Variáveis de ambiente (opcionais)

| variável                  | padrão              | uso                                         |
|---------------------------|---------------------|---------------------------------------------|
| `YT_HL` / `YT_GL`         | `pt` / `BR`         | idioma/país (o YouTube traduz títulos conforme o idioma) |
| `YT_WEB_VERSION`          | `2.20251031.00.00`  | versão do cliente WEB                       |
| `YT_ANDROID_VERSION`      | `20.10.38`          | versão do cliente ANDROID                   |
| `YOUTUBE_SHORTS_MCP_ROOT` | raiz do projeto     | pasta que contém `resources/`               |
