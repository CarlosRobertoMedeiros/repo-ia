// Leitura, mesclagem e gravação de resources/videos/<conta>/lista.csv.

import fs from 'node:fs/promises';
import path from 'node:path';

export const COLUNAS = [
  'video_id', 'url', 'type', 'title', 'published_at', 'timestamp', 'views', 'likes',
  'duration', 'category', 'description', 'thumbnail', 'updated_at',
];
// Campos que mudam entre execuções e são atualizados em vídeos já listados.
const METRICAS = ['views', 'likes', 'title', 'description', 'thumbnail', 'updated_at'];

function escapa(valor) {
  const s = String(valor ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function parseCsv(texto) {
  const linhas = [];
  let campo = '', linha = [], aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ',') { linha.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      linha.push(campo); linhas.push(linha); linha = []; campo = '';
    } else campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas.filter((l) => l.some((v) => v !== ''));
}

export async function lerLista(arquivo) {
  let texto;
  try {
    texto = await fs.readFile(arquivo, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
  const [cabecalho, ...linhas] = parseCsv(texto.replace(/^﻿/, ''));
  if (!cabecalho) return [];
  if (!cabecalho.includes('video_id')) {
    throw new Error(`${arquivo} não é uma lista do YouTube (sem coluna video_id); renomeie ou remova o arquivo`);
  }
  return linhas.map((l) => Object.fromEntries(cabecalho.map((col, i) => [col, l[i] ?? ''])));
}

// Merge por video_id: mantém os vídeos já salvos, atualiza as métricas dos que
// vieram de novo e insere os novos; o resultado fica do mais novo para o mais antigo.
export function mesclar(existentes, baixados, agora = new Date()) {
  const porId = new Map(existentes.map((v) => [v.video_id, v]));
  const updated_at = agora.toISOString();
  let novos = 0;
  for (const v of baixados) {
    const linha = { ...v, updated_at };
    const atual = porId.get(v.video_id);
    if (atual) {
      for (const k of METRICAS) if (linha[k] !== '' && linha[k] !== undefined) atual[k] = linha[k];
    } else {
      porId.set(v.video_id, linha);
      novos++;
    }
  }
  const linhas = [...porId.values()]
    .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
  return { linhas, novos };
}

export async function salvarLista(arquivo, linhas) {
  await fs.mkdir(path.dirname(arquivo), { recursive: true });
  const corpo = [COLUNAS.join(','), ...linhas.map((l) => COLUNAS.map((c) => escapa(l[c])).join(','))];
  // BOM para o Excel abrir acentos corretamente.
  await fs.writeFile(arquivo, '﻿' + corpo.join('\r\n') + '\r\n', 'utf8');
}
