// Leitura, mesclagem e gravação de resources/videos/<conta>/lista.csv.

import fs from 'node:fs/promises';
import path from 'node:path';

export const COLUNAS = [
  'shortcode', 'url', 'type', 'taken_at', 'timestamp', 'views', 'likes',
  'comments', 'duration', 'caption', 'thumbnail', 'updated_at',
];
// Campos que mudam entre execuções e são atualizados em vídeos já listados.
const METRICAS = ['views', 'likes', 'comments', 'caption', 'thumbnail', 'updated_at'];

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
  return linhas.map((l) => Object.fromEntries(cabecalho.map((col, i) => [col, l[i] ?? ''])));
}

// Merge por shortcode: mantém os vídeos já salvos, atualiza as métricas dos que
// vieram de novo e insere os novos; o resultado fica do mais novo para o mais antigo.
export function mesclar(existentes, baixados, agora = new Date()) {
  const porShortcode = new Map(existentes.map((v) => [v.shortcode, v]));
  const updated_at = agora.toISOString();
  let novos = 0;
  for (const v of baixados) {
    const linha = { ...v, updated_at };
    const atual = porShortcode.get(v.shortcode);
    if (atual) {
      for (const k of METRICAS) if (linha[k] !== '' && linha[k] !== undefined) atual[k] = linha[k];
    } else {
      porShortcode.set(v.shortcode, linha);
      novos++;
    }
  }
  const linhas = [...porShortcode.values()]
    .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
  return { linhas, novos };
}

export async function salvarLista(arquivo, linhas) {
  await fs.mkdir(path.dirname(arquivo), { recursive: true });
  const corpo = [COLUNAS.join(','), ...linhas.map((l) => COLUNAS.map((c) => escapa(l[c])).join(','))];
  // BOM para o Excel abrir acentos corretamente.
  await fs.writeFile(arquivo, '﻿' + corpo.join('\r\n') + '\r\n', 'utf8');
}
