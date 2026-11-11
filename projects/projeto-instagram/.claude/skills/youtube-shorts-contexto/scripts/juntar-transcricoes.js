#!/usr/bin/env node
// Junta todas as transcrições (.txt) de uma pasta num único texto, com um
// cabeçalho por vídeo. Se houver um CSV na pasta com coluna video_id (ex.:
// lista_shorts.csv), cruza pelo nome do arquivo (ex.: 1_<video_id>.txt) e
// acrescenta título, duração, visualizações e curtidas.
//
// Uso:
//   node juntar-transcricoes.js <pasta> [--recursivo] [--saida arquivo.txt]
//
// Sem --saida, escreve no stdout.

const fs = require('fs');
const path = require('path');

function args() {
  const a = process.argv.slice(2);
  const out = { pasta: null, recursivo: false, saida: null };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--recursivo') out.recursivo = true;
    else if (a[i] === '--saida') out.saida = a[++i];
    else if (!out.pasta) out.pasta = a[i];
  }
  if (!out.pasta) {
    console.error('Uso: node juntar-transcricoes.js <pasta> [--recursivo] [--saida arquivo.txt]');
    process.exit(1);
  }
  return out;
}

function listar(dir, recursivo, ext) {
  let res = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && recursivo) res = res.concat(listar(p, recursivo, ext));
    else if (e.isFile() && e.name.toLowerCase().endsWith(ext)) res.push(p);
  }
  return res;
}

// Parser de CSV simples com suporte a aspas, vírgulas e quebras de linha em campos.
function parseCsv(texto) {
  texto = texto.replace(/^﻿/, '');
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
      linha.push(campo); campo = '';
      if (linha.some((x) => x !== '')) linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  if (campo !== '' || linha.length) { linha.push(campo); linhas.push(linha); }
  if (!linhas.length) return [];
  const cab = linhas[0].map((h) => h.trim());
  return linhas.slice(1).map((l) => Object.fromEntries(cab.map((h, i) => [h, l[i] ?? ''])));
}

function metadados(arquivosCsv) {
  const mapa = new Map();
  for (const csv of arquivosCsv) {
    try {
      for (const r of parseCsv(fs.readFileSync(csv, 'utf8'))) {
        if (r.video_id) mapa.set(r.video_id, r);
      }
    } catch (_) { /* CSV ilegível: ignora */ }
  }
  return mapa;
}

function ordemNatural(a, b) {
  return path.basename(a).localeCompare(path.basename(b), undefined, { numeric: true });
}

function main() {
  const { pasta, recursivo, saida } = args();
  const dir = path.resolve(pasta);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`Pasta não encontrada: ${dir}`);
    process.exit(1);
  }
  const saidaAbs = saida ? path.resolve(saida) : null;
  const txts = listar(dir, recursivo, '.txt')
    .filter((f) => f !== saidaAbs && !path.basename(f).startsWith('analise-') && !path.basename(f).startsWith('_corpus'))
    .sort(ordemNatural);
  const meta = metadados(listar(dir, recursivo, '.csv'));

  const blocos = [];
  let totalPalavras = 0, vazios = 0;
  txts.forEach((f, i) => {
    const texto = fs.readFileSync(f, 'utf8').replace(/\s+/g, ' ').trim();
    if (!texto) { vazios++; return; }
    const nome = path.basename(f, '.txt');
    const id = nome.replace(/^\d+_/, '');
    const m = meta.get(id) || meta.get(nome);
    const palavras = texto.split(' ').length;
    totalPalavras += palavras;
    const cab = [`VÍDEO ${blocos.length + 1}`, `arquivo: ${path.relative(dir, f)}`];
    if (m) {
      if (m.titulo) cab.push(`título: ${m.titulo}`);
      if (m.duracao_segundos) cab.push(`duração: ${m.duracao_segundos}s`);
      if (m.visualizacoes) cab.push(`views: ${m.visualizacoes}`);
      if (m.curtidas) cab.push(`curtidas: ${m.curtidas}`);
      if (m.publicado_em) cab.push(`publicado: ${m.publicado_em.slice(0, 10)}`);
    }
    cab.push(`palavras: ${palavras}`);
    const dur = m && Number(m.duracao_segundos);
    if (dur > 0) cab.push(`palavras/s: ${(palavras / dur).toFixed(2)}`);
    blocos.push(`=== ${cab.join(' | ')} ===\n${texto}`);
  });

  const resumo = `### CORPUS: ${blocos.length} transcrições de ${dir} | ${totalPalavras} palavras` +
    (vazios ? ` | ${vazios} arquivo(s) vazio(s) ignorado(s)` : '') +
    (meta.size ? ' | metadados do CSV cruzados por video_id' : ' | sem CSV de metadados') + ' ###';
  const saidaTexto = [resumo, ...blocos].join('\n\n') + '\n';

  if (saidaAbs) {
    fs.writeFileSync(saidaAbs, saidaTexto, 'utf8');
    console.log(`${resumo}\nGravado em: ${saidaAbs}`);
  } else {
    process.stdout.write(saidaTexto);
  }
}

main();
