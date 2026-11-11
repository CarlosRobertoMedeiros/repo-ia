// Localiza e lê o CSV de shorts gerado pelo MCP youtube-shorts (lista_shorts.csv),
// identifica a conta e ordena os shorts por curtidas.

import fs from 'node:fs/promises';
import path from 'node:path';

const NOME_PADRAO = 'lista_shorts.csv';
// Nomes aceitos para cada coluna (o MCP youtube-shorts grava "curtidas").
const COL_ID = ['video_id', 'id', 'videoid'];
const COL_LIKES = ['likes', 'curtidas', 'like_count', 'likecount'];

function parseCsv(texto) {
  const linhas = [];
  let campo = '';
  let linha = [];
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; } else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ',') { linha.push(campo); campo = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      linha.push(campo); linhas.push(linha); linha = []; campo = '';
    } else campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas.filter((l) => l.some((v) => v !== ''));
}

async function tipo(p) {
  try {
    const s = await fs.stat(p);
    return s.isDirectory() ? 'dir' : s.isFile() ? 'file' : null;
  } catch {
    return null;
  }
}

// Dentro de uma pasta: lista_shorts.csv, ou o único .csv que houver.
async function csvDaPasta(dir) {
  const padrao = path.join(dir, NOME_PADRAO);
  if (await tipo(padrao) === 'file') return padrao;
  const csvs = (await fs.readdir(dir)).filter((f) => f.toLowerCase().endsWith('.csv'));
  if (csvs.length === 1) return path.join(dir, csvs[0]);
  if (csvs.length > 1) throw new Error(`A pasta ${dir} tem vários CSVs (${csvs.join(', ')}); informe o arquivo.`);
  return null;
}

// Aceita: caminho absoluto ou relativo (à pasta atual ou à raiz do projeto) de um CSV,
// uma pasta que contenha o CSV, ou apenas o nome da conta (resources/shorts/<conta>/).
export async function localizarCsv(entrada, raiz) {
  const bruto = String(entrada || '').trim().replace(/^["']|["']$/g, '');
  if (!bruto) throw new Error('Informe o caminho do CSV (ou da pasta da conta).');

  const candidatos = path.isAbsolute(bruto)
    ? [bruto]
    : [path.resolve(process.cwd(), bruto), path.resolve(raiz, bruto)];
  const conta = bruto.replace(/^@/, '');
  if (/^[\w.-]+$/.test(conta)) candidatos.push(path.join(raiz, 'resources', 'shorts', conta.toLowerCase()), path.join(raiz, 'resources', 'shorts', conta));

  for (const c of candidatos) {
    const t = await tipo(c);
    if (t === 'file') return c;
    if (t === 'dir') {
      const f = await csvDaPasta(c);
      if (f) return f;
    }
  }
  throw new Error(`CSV não encontrado para "${bruto}". Tentativas: ${[...new Set(candidatos)].join(' | ')}`);
}

const numero = (v) => {
  const s = String(v ?? '').trim();
  if (!/\d/.test(s)) return null;
  return Number(s.replace(/\D/g, ''));
};

// Lê o CSV e devolve a conta (nome da pasta do CSV), a pasta de destino
// e os shorts ordenados por curtidas (desc). Visualizações não entram na ordenação;
// empates mantêm a ordem do CSV e shorts sem curtidas vão para o fim.
export async function lerShortsOrdenados(arquivo) {
  const texto = (await fs.readFile(arquivo, 'utf8')).replace(/^﻿/, '');
  const [cab, ...linhas] = parseCsv(texto);
  if (!cab) throw new Error(`${arquivo} está vazio.`);
  const nomes = cab.map((c) => c.trim().toLowerCase());
  const iId = nomes.findIndex((c) => COL_ID.includes(c));
  const iLikes = nomes.findIndex((c) => COL_LIKES.includes(c));
  if (iId < 0) throw new Error(`${arquivo} não tem a coluna video_id.`);
  if (iLikes < 0) throw new Error(`${arquivo} não tem a coluna de curtidas (likes/curtidas).`);
  const iCanal = nomes.indexOf('canal');

  const vistos = new Set();
  const shorts = [];
  for (const l of linhas) {
    const id = (l[iId] || '').trim();
    if (!/^[\w-]{11}$/.test(id) || vistos.has(id)) continue;
    vistos.add(id);
    shorts.push({ video_id: id, likes: numero(l[iLikes]), canal: iCanal >= 0 ? l[iCanal] || '' : '' });
  }
  shorts.sort((a, b) => (b.likes ?? -1) - (a.likes ?? -1));

  const pasta = path.dirname(arquivo);
  return { conta: path.basename(pasta), pasta, shorts, canal: shorts.find((s) => s.canal)?.canal || '' };
}
