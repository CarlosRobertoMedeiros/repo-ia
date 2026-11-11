#!/usr/bin/env node
// Servidor MCP (stdio, JSON-RPC por linha) sem dependências externas.
// Uso direto, sem cliente MCP: node server.js --username <conta> [--max-pages N]

import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { lerLista, mesclar, salvarLista } from './lista.js';
import { fetchShorts } from './youtube.js';

const PASTA = path.dirname(fileURLToPath(import.meta.url));
// resources/mcps/youtube-shorts -> raiz do projeto (pasta que contém resources/)
const RAIZ = process.env.YOUTUBE_SHORTS_MCP_ROOT || path.resolve(PASTA, '..', '..', '..');
// Handle do YouTube (@nome) ou ID do canal (UC...).
const CONTA_VALIDA = /^(?:[A-Za-z0-9._-]{3,30}|UC[\w-]{22})$/;

const TOOL = {
  name: 'fetch_account_shorts',
  description:
    'Busca, pela API pública do YouTube (sem login, cookies nem chave), todos os Shorts de um canal '
    + 'com título, data de publicação, duração, visualizações e curtidas, percorrendo o máximo de páginas possível, '
    + 'e salva/atualiza resources/shorts/<conta>/lista_shorts.csv (mais novo primeiro; novos entram no início). '
    + 'Erros de acesso são ignorados e o que foi obtido é salvo.',
  inputSchema: {
    type: 'object',
    properties: {
      username: { type: 'string', description: 'Handle do canal (com ou sem @), URL do canal ou ID UC...' },
      maxPages: { type: 'integer', minimum: 1, default: 200, description: 'Limite de páginas da listagem (~60 shorts por página)' },
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
  return /^UC[\w-]{22}$/.test(s) ? s : s.toLowerCase();
}

export async function atualizarLista(username, maxPages = 200) {
  const conta = normalizarConta(username);
  const arquivo = path.join(RAIZ, 'resources', 'shorts', conta, 'lista_shorts.csv');
  // Lê antes de baixar para falhar cedo se o arquivo existente não for desta MCP.
  const existentes = await lerLista(arquivo);
  const completos = new Set(existentes.filter((v) => v.curtidas !== '').map((v) => v.video_id));
  const { shorts, erros, paginas, listados, detalhados } = await fetchShorts(conta, { maxPages, completos });
  const { linhas, novos } = mesclar(existentes, shorts);
  const salvou = shorts.length > 0 || existentes.length > 0;
  if (salvou) await salvarLista(arquivo, linhas);

  return [
    `Conta: ${conta}`,
    `Páginas lidas: ${paginas} (${listados} shorts listados no canal)`,
    `Shorts com views/curtidas nesta execução: ${detalhados} de ${shorts.length} (${novos} novos na lista)`,
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
            serverInfo: { name: 'youtube-shorts', version: '1.0.0' },
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
          const { username, maxPages } = params.arguments || {};
          const texto = await atualizarLista(username, maxPages);
          return enviar({ id, result: { content: [{ type: 'text', text: texto }] } });
        } catch (e) {
          return enviar({ id, result: { content: [{ type: 'text', text: `Erro: ${e.message}` }], isError: true } });
        }
      }
      default:
        // Notificações (sem id) não têm resposta.
        if (id !== undefined) enviar({ id, error: { code: -32601, message: `Método não suportado: ${method}` } });
    }
  }

  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (linha) => {
    if (!linha.trim()) return;
    let msg;
    try {
      msg = JSON.parse(linha);
    } catch {
      return enviar({ id: null, error: { code: -32700, message: 'JSON inválido' } });
    }
    tratar(msg).catch((e) => msg.id !== undefined && enviar({ id: msg.id, error: { code: -32603, message: e.message } }));
  });
}

const args = process.argv.slice(2);
const iUser = args.indexOf('--username');
if (iUser >= 0) {
  const iPages = args.indexOf('--max-pages');
  atualizarLista(args[iUser + 1], iPages >= 0 ? Number(args[iPages + 1]) : undefined)
    .then((t) => console.log(t))
    .catch((e) => { console.error(`Erro: ${e.message}`); process.exitCode = 1; });
} else {
  iniciarServidor();
}
