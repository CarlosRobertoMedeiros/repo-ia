#!/usr/bin/env node
// Servidor MCP (stdio, JSON-RPC por linha) sem dependências externas.
// Uso direto, sem cliente MCP: node server.js --csv <caminho> --quantidade N

import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { localizarCsv, lerShortsOrdenados } from './csv.js';
import { baixarShort } from './youtube.js';

const PASTA = path.dirname(fileURLToPath(import.meta.url));
// resources/mcps/youtube-shorts-top-video-downloads -> raiz do projeto (pasta que contém resources/)
const RAIZ = process.env.YOUTUBE_SHORTS_MCP_ROOT || path.resolve(PASTA, '..', '..', '..');
const DELAY_MS = 500;

const TOOL = {
  name: 'download_top_shorts',
  description:
    'Lê o CSV de shorts de um canal do YouTube (gerado pelo MCP youtube-shorts), ordena pelas curtidas '
    + '(mais curtido primeiro; visualizações são ignoradas) e baixa os N primeiros, resolvendo a URL do vídeo '
    + 'online a partir do video_id, sem login, cookies nem tokens. Os arquivos ficam na pasta do CSV (pasta da conta) '
    + 'com o nome <ordem>_<video_id>.mp4. Vídeos com erro são ignorados e os demais seguem.',
  inputSchema: {
    type: 'object',
    properties: {
      csvPath: {
        type: 'string',
        description: 'Caminho do CSV (absoluto ou relativo à pasta atual/raiz do projeto), a pasta que o contém, '
          + 'ou só o nome da conta (procura em resources/shorts/<conta>/lista_shorts.csv).',
      },
      quantidade: { type: 'integer', minimum: 1, description: 'Quantos shorts baixar, a partir do mais curtido.' },
    },
    required: ['csvPath', 'quantidade'],
  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function existeComConteudo(arquivo) {
  try {
    return (await fs.stat(arquivo)).size > 0;
  } catch {
    return false;
  }
}

export async function baixarTop(csvPath, quantidade) {
  const n = Number(quantidade);
  if (!Number.isInteger(n) || n < 1) throw new Error('quantidade deve ser um inteiro maior ou igual a 1.');

  const arquivo = await localizarCsv(csvPath, RAIZ);
  const { conta, pasta, shorts, canal } = await lerShortsOrdenados(arquivo);
  if (!shorts.length) throw new Error(`Nenhum video_id válido em ${arquivo}.`);

  const alvo = shorts.slice(0, n);
  const ok = [];
  const existentes = [];
  const erros = [];
  for (const [i, s] of alvo.entries()) {
    const ordem = i + 1;
    const nome = `${ordem}_${s.video_id}.mp4`;
    const destino = path.join(pasta, nome);
    const curt = s.likes ?? 'sem dados de';
    if (await existeComConteudo(destino)) {
      existentes.push(`${nome} (${curt} curtidas)`);
      continue;
    }
    try {
      const info = await baixarShort(s.video_id, destino);
      ok.push(`${nome} (${curt} curtidas, ${info.qualidade}, ${info.tipo}, via ${info.cliente})`);
    } catch (e) {
      erros.push(`${ordem}_${s.video_id}: ${e.message}`);
    }
    if (i < alvo.length - 1) await sleep(DELAY_MS);
  }

  return [
    `Conta: ${conta}${canal ? ` (${canal})` : ''}`,
    `CSV: ${arquivo}`,
    `Pasta de destino: ${pasta}`,
    `Solicitados: ${n} | Disponíveis no CSV: ${shorts.length} | Processados: ${alvo.length}`,
    `Baixados agora: ${ok.length}`,
    ...ok.map((x) => `  - ${x}`),
    ...(existentes.length ? [`Já existiam (mantidos): ${existentes.length}`, ...existentes.map((x) => `  - ${x}`)] : []),
    ...(erros.length ? [`Erros ignorados (${erros.length}):`, ...erros.map((x) => `  - ${x}`)] : []),
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
            serverInfo: { name: 'youtube-shorts-top-video-downloads', version: '1.0.0' },
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
          const { csvPath, quantidade } = params.arguments || {};
          const texto = await baixarTop(csvPath, quantidade);
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
const iCsv = args.indexOf('--csv');
if (iCsv >= 0) {
  const iQtd = args.indexOf('--quantidade');
  baixarTop(args[iCsv + 1], iQtd >= 0 ? Number(args[iQtd + 1]) : NaN)
    .then((t) => console.log(t))
    .catch((e) => { console.error(`Erro: ${e.message}`); process.exitCode = 1; });
} else {
  iniciarServidor();
}
