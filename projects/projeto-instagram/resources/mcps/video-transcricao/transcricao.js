// Lógica principal: resolve o caminho (vídeo ou pasta), extrai o áudio, divide se preciso,
// transcreve e grava <nome-do-vídeo>.txt ao lado do vídeo.

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { inspecionar, extrairAudio, dividirAudio } from './audio.js';
import { transcreverAudio, ErroFatal } from './groq.js';
import { configuracao, exigirChave } from './env.js';

export const EXTENSOES_VIDEO = new Set([
  '.mp4', '.m4v', '.mov', '.mkv', '.webm', '.avi', '.wmv', '.flv', '.mpg', '.mpeg',
  '.3gp', '.3g2', '.ts', '.mts', '.m2ts', '.ogv', '.vob', '.f4v',
]);

// A Groq aceita até 25 MB por arquivo enviado direto (TRANSCRICAO_LIMITE_MB, padrão 24, deixa margem
// para o envelope multipart). Acima disso o áudio é dividido em partes.
// O "prompt" do Whisper aceita no máximo 224 tokens: ~600 caracteres ficam com folga.
const PROMPT_MAX_CHARS = 600;

function montarPrompt(fixo, anterior) {
  const base = (fixo || '').slice(0, PROMPT_MAX_CHARS);
  const sobra = PROMPT_MAX_CHARS - base.length - 1;
  let contexto = sobra > 50 && anterior ? anterior.slice(-sobra) : '';
  if (contexto && anterior.length > sobra) contexto = contexto.replace(/^\S*\s/, ''); // não começa no meio de palavra
  return [base, contexto].filter(Boolean).join(' ') || undefined;
}

async function existe(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function resolverCaminho(caminho, raiz) {
  if (!caminho || typeof caminho !== 'string') throw new Error('informe "caminho" (um vídeo ou uma pasta).');
  const limpo = caminho.trim().replace(/^["']|["']$/g, '');
  const candidatos = path.isAbsolute(limpo) ? [limpo] : [path.resolve(process.cwd(), limpo), path.resolve(raiz, limpo)];
  for (const c of candidatos) if (await existe(c)) return c;
  throw new Error(`caminho não encontrado: ${candidatos.join(' | ')}`);
}

async function listarVideos(pasta, recursivo) {
  const saida = [];
  const entradas = await fs.readdir(pasta, { withFileTypes: true });
  for (const e of entradas.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))) {
    const p = path.join(pasta, e.name);
    if (e.isDirectory()) {
      if (recursivo && e.name !== 'node_modules' && !e.name.startsWith('.')) saida.push(...await listarVideos(p, true));
    } else if (e.isFile() && EXTENSOES_VIDEO.has(path.extname(e.name).toLowerCase())) {
      saida.push(p);
    }
  }
  return saida;
}

const arquivoTexto = (video) => path.join(path.dirname(video), `${path.parse(video).name}.txt`);

// Só o texto falado: espaços normalizados, sem linhas vazias repetidas.
function limpar(texto) {
  return texto
    .replace(/\r\n?/g, '\n')
    .split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function transcreverVideo(video, cfg) {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'video-transcricao-'));
  try {
    const { duracao, temAudio } = await inspecionar(video);
    if (!temAudio) throw new Error('o vídeo não tem faixa de áudio');

    const audio = await extrairAudio(video, temp, cfg.audioKbps);
    const partes = await dividirAudio(audio.arquivo, {
      duracao, bytes: audio.bytes, ext: audio.ext, pastaTemp: temp,
      limiteBytes: Math.floor(cfg.limiteMB * 1024 * 1024), maxSegundos: cfg.maxSegundos,
    });

    const textos = [];
    for (const parte of partes) {
      // TRANSCRICAO_PROMPT (vocabulário/estilo) + o fim do trecho anterior, para manter continuidade entre partes.
      const prompt = montarPrompt(cfg.prompt, textos.join(' '));
      textos.push(limpar(await transcreverAudio(parte, cfg, prompt)));
    }
    return {
      texto: limpar(textos.filter(Boolean).join(' ')),
      duracao,
      partes: partes.length,
      audioKB: Math.round(audio.bytes / 1024),
      formato: audio.ext,
    };
  } finally {
    await fs.rm(temp, { recursive: true, force: true }).catch(() => {});
  }
}

const fmtDur = (s) => {
  s = Math.round(s || 0);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h}h${String(m).padStart(2, '0')}m${String(r).padStart(2, '0')}s` : `${m}m${String(r).padStart(2, '0')}s`;
};

export async function transcrever({ caminho, forcar = false, recursivo = false, idioma } = {}, { raiz, pastaEnv, progresso } = {}) {
  const cfg = configuracao(pastaEnv);
  exigirChave(cfg);
  if (idioma) cfg.idioma = String(idioma).trim().toLowerCase();

  const alvo = await resolverCaminho(caminho, raiz);
  const ehPasta = (await fs.stat(alvo)).isDirectory();
  const videos = ehPasta ? await listarVideos(alvo, Boolean(recursivo)) : [alvo];
  if (!videos.length) {
    return `Nenhum vídeo encontrado em ${alvo}${recursivo ? ' (incluindo subpastas)' : ' (use recursivo=true para incluir subpastas)'}.`;
  }

  const feitos = [];
  const pulados = [];
  const erros = [];
  let interrompido = null;
  const rel = (p) => (ehPasta ? path.relative(alvo, p) : path.basename(p));

  for (const [i, video] of videos.entries()) {
    const txt = arquivoTexto(video);
    progresso?.(i, videos.length, rel(video));
    if (!forcar && await existe(txt)) {
      pulados.push(rel(video));
      continue;
    }
    try {
      const r = await transcreverVideo(video, cfg);
      const tmp = `${txt}.${process.pid}.tmp`;
      await fs.writeFile(tmp, r.texto ? `${r.texto}\n` : '', 'utf8');
      await fs.rename(tmp, txt);
      feitos.push(`${rel(video)} -> ${path.basename(txt)} (${fmtDur(r.duracao)}, áudio ${r.audioKB} KB ${r.formato}`
        + `${r.partes > 1 ? `, ${r.partes} partes` : ''}${r.texto ? '' : ', sem fala detectada'})`);
    } catch (e) {
      erros.push(`${rel(video)}: ${e.message}`);
      if (e instanceof ErroFatal) {
        interrompido = e.message;
        break;
      }
    }
  }
  progresso?.(videos.length, videos.length, 'concluído');

  const restantes = videos.length - feitos.length - pulados.length - erros.length;
  return [
    `${ehPasta ? 'Pasta' : 'Vídeo'}: ${alvo}`,
    `Modelo: ${cfg.modelo}${cfg.idioma ? ` | Idioma: ${cfg.idioma}` : ''} | Vídeos: ${videos.length}`,
    `Transcritos agora: ${feitos.length}`,
    ...feitos.map((x) => `  - ${x}`),
    ...(pulados.length ? [`Já transcritos (pulados; use forcar=true para refazer): ${pulados.length}`, ...pulados.map((x) => `  - ${x}`)] : []),
    ...(erros.length ? [`Erros ignorados (${erros.length}):`, ...erros.map((x) => `  - ${x}`)] : []),
    ...(interrompido ? [`Processo interrompido: erro que afetaria todos os vídeos. Não processados: ${restantes}.`] : []),
  ].join('\n');
}
