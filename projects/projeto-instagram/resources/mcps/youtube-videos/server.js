#!/usr/bin/env node
// Servidor MCP (stdio, JSON-RPC por linha) sem dependências externas.
// Uso direto, sem cliente MCP: node server.js --username <conta> [--max-pages N]

import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { lerLista, mesclar, salvarLista } from './lista.js';
import { fetchVideos } from './youtube.js';

const PASTA = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = process.env.YOUTUBE_MCP_ROOT || path.resolve(PASTA, '..', '..', '..');
// Handle do YouTube (@nome) ou ID do canal (UC...).
const CONTA_VALIDA = /^(?:[A-Za-z0-9._-]{3,30}|UC[\w-]{22})$/;

const TOOL = {
  name: 'fetch_account_videos',
  description:
    'Busca, pela API pública do YouTube (sem login nem chave), todos os vídeos de um canal '
    + '(vídeos, Shorts e lives) com views, likes, data e duração, percorrendo o máximo de páginas possível, '
    + 'e salva/atualiza resources/videos/<conta>/lista.csv (mais novo primeiro). '
    + 'Erros de acesso são ignorados e o que foi obtido é salvo.',
  inputSchema: {
    type: 'object',
    properties: {
      username: { type: 'string', description: 'Handle do canal (com ou sem @), URL do canal ou ID UC...' },
      maxPages: { type: 'integer', minimum: 1, default: 50, description: 'Limite de páginas da listagem (100 vídeos por página)' },
    },
    required: ['username'],
  },
};

function normalizarConta(username) {
  const s = String(username || '').trim()
    .replace(/^https?:\/\/(?:www\.|m\.)?youtube\.com\//i, '')
    .replace(/^channel\//, '')
    .replace(/^@/, '')
    .replace(/[/?#].*$/, '');
  if (!CONTA_VALIDA.test(s)) throw new Error(`Conta do YouTube inválida: "${username}"`);
  // Handles não diferenciam maiúsculas; IDs de canal sim.
  return s.startsWith('UC') && s.length === 24 ? s : s.toLowerCase();
}

export async function atualizarLista(username, maxPages = 50) {
  const conta = normalizarConta(username);
  const arquivo = path.join(RAIZ, 'resources', 'videos', conta, 'lista.csv');
  // Lê antes de baixar para falhar cedo se o arquivo existente não for desta MCP.
  const existentes = await lerLista(arquivo);
  const conhecidos = new Set(existentes.map((v) => v.video_id));
  const { videos, erros, paginas, listados } = await fetchVideos(conta, { maxPages, conhecidos });
  const { linhas, novos } = mesclar(existentes, videos);
  const salvou = videos.length > 0 || existentes.length > 0;
  if (salvou) await salvarLista(arquivo, linhas);

  return [
    `Conta: ${conta}`,
    `Páginas lidas: ${paginas} (${listados} vídeos listados no canal)`,
    `Vídeos obtidos nesta execução: ${videos.length} (${novos} novos)`,
    `Total na lista: ${linhas.length}`,
    `Arquivo: ${salvou ? arquivo : '(nada salvo)'}`,
    ...(erros.length ? [`Erros ignorados (${erros.length}):`, ...erros.slice(0, 20).map((e) => `  - ${e}`)] : []),
    ...(erros.length > 20 ? [`  ... e mais ${erros.length - 20}`] : []),
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
            serverInfo: { name: 'youtube-videos', version: '1.0.0' },
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
