// Leitura, mesclagem e gravação de resources/shorts/<conta>/lista_shorts.csv.

import fs from 'node:fs/promises';
import path from 'node:path';

export const COLUNAS = [
  'video_id', 'titulo', 'url', 'publicado_em', 'duracao_segundos',
  'visualizacoes', 'curtidas', 'canal', 'descricao', 'atualizado_em',
];

function escapar(v) {
  const s = v === undefined || v === null ? '' : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

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

export async function lerLista(arquivo) {
  let texto;
  try {
    texto = await fs.readFile(arquivo, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
  const [cab, ...linhas] = parseCsv(texto.replace(/^﻿/, ''));
  if (!cab || cab[0] !== 'video_id') throw new Error(`${arquivo} existe mas não está no formato esperado (coluna video_id)`);
  return linhas.map((l) => Object.fromEntries(cab.map((c, i) => [c, l[i] ?? ''])));
}

// Junta a lista salva com o que veio agora:
// - shorts novos entram no início (a listagem já vem do mais novo para o mais antigo);
// - shorts já salvos têm os campos atualizados com os valores novos que vieram preenchidos;
// - shorts que não vieram nesta execução (erro, removidos) são mantidos.
// No fim, ordena por data de publicação (mais novo primeiro); quem não tem data
// herda a do vizinho anterior, para ficar na posição em que já estava.
export function mesclar(existentes, obtidos, agora = new Date().toISOString()) {
  const porId = new Map(existentes.map((v) => [v.video_id, v]));
  const novos = [];
  for (const s of obtidos) {
    const atual = porId.get(s.video_id);
    const preenchidos = Object.fromEntries(Object.entries(s).filter(([, v]) => v !== '' && v !== undefined));
    // Não troca uma data completa já salva por uma só com o dia.
    if (atual && /^\d{4}-\d\d-\d\d$/.test(preenchidos.publicado_em || '') && (atual.publicado_em || '').length > 10) {
      delete preenchidos.publicado_em;
    }
    if (atual) Object.assign(atual, preenchidos, { atualizado_em: agora });
    else novos.push({ ...preenchidos, atualizado_em: agora });
  }

  const base = [...novos, ...existentes];
  let ultima = '9999';
  const chaves = base.map((v) => {
    const p = v.publicado_em || '';
    let t = '';
    if (/^\d{4}-\d\d-\d\d$/.test(p)) {
      // Só o dia (veio da página de exibição): fica junto do vizinho se for o mesmo dia.
      t = ultima.startsWith(p) ? ultima : `${p}T23:59:59.999Z`;
    } else if (p && !Number.isNaN(Date.parse(p))) {
      t = new Date(p).toISOString();
    }
    if (t) ultima = t;
    return t || ultima;
  });
  const linhas = base
    .map((v, i) => ({ v, k: chaves[i] }))
    .sort((a, b) => (a.k < b.k ? 1 : a.k > b.k ? -1 : 0))
    .map((x) => x.v);
  return { linhas, novos: novos.length };
}

export async function salvarLista(arquivo, linhas) {
  await fs.mkdir(path.dirname(arquivo), { recursive: true });
  const corpo = [COLUNAS.join(','), ...linhas.map((v) => COLUNAS.map((c) => escapar(v[c])).join(','))].join('\r\n');
  // BOM para o Excel abrir acentos corretamente; grava em temporário e renomeia.
  const tmp = `${arquivo}.tmp`;
  await fs.writeFile(tmp, `﻿${corpo}\r\n`, 'utf8');
  await fs.rename(tmp, arquivo);
}
