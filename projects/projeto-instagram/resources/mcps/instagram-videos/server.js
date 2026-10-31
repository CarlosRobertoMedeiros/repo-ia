#!/usr/bin/env node
// Servidor MCP (stdio, JSON-RPC por linha) sem dependências externas.
// Uso direto, sem cliente MCP: node server.js --username <conta> [--max-pages N]

import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { lerLista, mesclar, salvarLista } from './lista.js';

const PASTA = path.dirname(fileURLToPath(import.meta.url));
// Carrega META_ACCESS_TOKEN etc. de .env, se existir (antes de importar meta.js).
try {
  process.loadEnvFile(path.join(PASTA, '.env'));
} catch {
  // sem .env: usa só as variáveis de ambiente
}
const { fetchVideos } = await import('./meta.js');

const RAIZ = process.env.INSTAGRAM_MCP_ROOT || path.resolve(PASTA, '..', '..', '..');
const USERNAME_VALIDO = /^[A-Za-z0-9._]{1,30}$/;

const TOOL = {
  name: 'fetch_account_videos',
  description:
    'Busca, pela API Graph oficial da Meta (Business Discovery), os vídeos de uma conta Business/Creator '
    + 'do Instagram com likes (e views, quando a API fornecer), percorrendo o máximo de páginas possível, '
    + 'e salva/atualiza resources/videos/<conta>/lista.csv '
    + '(mais novo primeiro). Erros de acesso são ignorados e o que foi obtido é salvo.',
  inputSchema: {
    type: 'object',
    properties: {
      username: { type: 'string', description: 'Nome de usuário do Instagram, com ou sem @' },
      maxPages: { type: 'integer', minimum: 1, default: 50, description: 'Limite total de páginas a percorrer' },
    },
    required: ['username'],
  },
};

export async function atualizarLista(username, maxPages = 50) {
  const conta = String(username || '').replace(/^@/, '').trim();
  if (!USERNAME_VALIDO.test(conta)) throw new Error(`Nome de usuário inválido: "${conta}"`);

  const arquivo = path.join(RAIZ, 'resources', 'videos', conta, 'lista.csv');
  const { videos, erros, paginas } = await fetchVideos(conta, { maxPages });
  const existentes = await lerLista(arquivo);
  const { linhas, novos } = mesclar(existentes, videos);
  const salvou = videos.length > 0 || existentes.length > 0;
  if (salvou) await salvarLista(arquivo, linhas);

  return [
    `Conta: ${conta}`,
    `Páginas lidas: ${paginas}`,
    `Vídeos obtidos nesta execução: ${videos.length} (${novos} novos)`,
    `Total na lista: ${linhas.length}`,
    `Arquivo: ${salvou ? arquivo : '(nada salvo)'}`,
    ...(erros.length ? ['Erros ignorados:', ...erros.map((e) => `  - ${e}`)] : []),
  ].join('\n');
}

function iniciarServidor() {
  const enviar = (msg) => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', ...msg }) + '\n');

  async function tratar(msg) {
    const { id, method, params } = msg;
    switch (method) {
      case 'initialize':
        return enviar({
          id,
          result: {
            protocolVersion: params?.protocolVersion || '2025-06-18',
            capabilities: { tools: {} },
            serverInfo: { name: 'instagram-videos', version: '3.0.0' },
          },
        });
      case 'ping':
        return enviar({ id, result: {} });
      case 'tools/list':
        return enviar({ id, result: { tools: [TOOL] } });
      case 'tools/call': {
        if (params?.name !== TOOL.name) {
          return enviar({ id, error: { code: -32602, message: `Ferramenta desconhecida: ${params?.name}` } });
        }
        try {
          const texto = await atualizarLista(params.arguments?.username, params.arguments?.maxPages);
          return enviar({ id, result: { content: [{ type: 'text', text: texto }] } });
        } catch (e) {
          return enviar({ id, result: { content: [{ type: 'text', text: `Erro: ${e.message}` }], isError: true } });
        }
      }
      default:
        // Notificações (sem id) não recebem resposta.
        if (id !== undefined) enviar({ id, error: { code: -32601, message: `Método não suportado: ${method}` } });
    }
  }

  readline.createInterface({ input: process.stdin }).on('line', (linha) => {
    if (!linha.trim()) return;
    let msg;
    try {
      msg = JSON.parse(linha);
    } catch {
      return enviar({ id: null, error: { code: -32700, message: 'JSON inválido' } });
    }
    tratar(msg).catch((e) => console.error(e));
  });
}

const argUser = process.argv.indexOf('--username');
if (argUser > -1) {
  const argPages = process.argv.indexOf('--max-pages');
  atualizarLista(process.argv[argUser + 1], argPages > -1 ? Number(process.argv[argPages + 1]) : 50)
    .then((t) => console.log(t))
    .catch((e) => { console.error(`Erro: ${e.message}`); process.exitCode = 1; });
} else {
  iniciarServidor();
}
