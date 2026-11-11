#!/usr/bin/env node
// Servidor MCP (stdio, JSON-RPC por linha) sem SDK.
// Uso direto, sem cliente MCP: node server.js --caminho <vídeo|pasta> [--forcar] [--recursivo] [--idioma pt]

import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { transcrever } from './transcricao.js';

const PASTA = path.dirname(fileURLToPath(import.meta.url));
// resources/mcps/video-transcricao -> raiz do projeto (pasta que contém resources/), base dos caminhos relativos
const RAIZ = process.env.VIDEO_TRANSCRICAO_MCP_ROOT || path.resolve(PASTA, '..', '..', '..');
// O .env (chave da Groq e ajustes da transcrição) fica na pasta do próprio MCP, ao lado deste arquivo.
const PASTA_ENV = PASTA;

const TOOL = {
  name: 'transcrever_videos',
  description:
    'Transcreve em texto a fala de um vídeo ou de todos os vídeos de uma pasta, usando a API da Groq (Whisper) '
    + '(chave GROQ_API_KEY em resources/mcps/video-transcricao/.env). Extrai antes só o áudio (mono 16 kHz, Opus) e, se ele '
    + 'passar do limite da API, divide em partes nos silêncios. Para cada vídeo grava <nome-do-vídeo>.txt na mesma '
    + 'pasta, só com o texto falado. Vídeos que já têm .txt são pulados (forcar=true refaz); erros num vídeo são '
    + 'registrados e os demais seguem.',
  inputSchema: {
    type: 'object',
    properties: {
      caminho: {
        type: 'string',
        description: 'Arquivo de vídeo ou pasta de vídeos (absoluto ou relativo à pasta atual/raiz do projeto).',
      },
      forcar: { type: 'boolean', default: false, description: 'Refaz a transcrição mesmo se o .txt já existir.' },
      recursivo: { type: 'boolean', default: false, description: 'Numa pasta, inclui também as subpastas.' },
      idioma: {
        type: 'string',
        description: 'Código ISO-639-1 do idioma falado (ex.: pt, en, es). Opcional: sem ele a API detecta sozinha.',
      },
    },
    required: ['caminho'],
  },
};

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
            serverInfo: { name: 'video-transcricao', version: '1.0.0' },
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
        const token = params?._meta?.progressToken;
        const progresso = (feito, total, item) => {
          console.error(`[video-transcricao] ${feito}/${total} ${item}`);
          if (token !== undefined) {
            enviar({ method: 'notifications/progress', params: { progressToken: token, progress: feito, total, message: item } });
          }
        };
        try {
          const texto = await transcrever(params.arguments || {}, { raiz: RAIZ, pastaEnv: PASTA_ENV, progresso });
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
const iCaminho = args.indexOf('--caminho');
if (iCaminho >= 0) {
  const iIdioma = args.indexOf('--idioma');
  transcrever(
    {
      caminho: args[iCaminho + 1],
      forcar: args.includes('--forcar'),
      recursivo: args.includes('--recursivo'),
      idioma: iIdioma >= 0 ? args[iIdioma + 1] : undefined,
    },
    { raiz: RAIZ, pastaEnv: PASTA_ENV, progresso: (f, t, item) => console.error(`${f}/${t} ${item}`) },
  )
    .then((t) => console.log(t))
    .catch((e) => { console.error(`Erro: ${e.message}`); process.exitCode = 1; });
} else {
  iniciarServidor();
}
