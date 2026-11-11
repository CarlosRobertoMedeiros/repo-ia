// Resolve a URL direta do vídeo a partir do video_id e baixa o arquivo, sem login,
// cookies nem chave de API.
//
// Estratégia: endpoint público `youtubei/v1/player` (InnerTube) com clientes de app
// (Android VR, iOS, Android) que devolvem as URLs dos formatos já prontas, sem
// assinatura cifrada nem token de login. Cada cliente é tentado em ordem até um
// devolver um formato baixável.
// - Preferência: formato "muxed" (vídeo + áudio no mesmo .mp4).
// - Se não houver muxed e o ffmpeg estiver disponível, baixa o melhor vídeo .mp4 e o
//   melhor áudio .m4a e junta os dois sem recodificar.

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const API = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
const HL = process.env.YT_HL || 'pt';
const GL = process.env.YT_GL || 'BR';
const CHUNK = 10 * 1024 * 1024; // downloads em blocos evitam o throttling do googlevideo
// ffmpeg: FFMPEG_PATH > binário do pacote ffmpeg-static > ffmpeg do PATH.
let ffmpegStatic = null;
try {
  ffmpegStatic = (await import('ffmpeg-static')).default;
} catch { /* pacote ausente: usa o PATH */ }
const FFMPEG = process.env.FFMPEG_PATH || ffmpegStatic || 'ffmpeg';

// Versões dos clientes; se o YouTube passar a recusá-las, sobrescreva por variável de ambiente.
const VR = process.env.YT_ANDROID_VR_VERSION || '1.62.27';
const IOS = process.env.YT_IOS_VERSION || '20.10.4';
const AND = process.env.YT_ANDROID_VERSION || '20.10.38';
const CLIENTES = [
  {
    nome: 'ANDROID_VR',
    id: 28,
    client: { clientName: 'ANDROID_VR', clientVersion: VR, deviceMake: 'Oculus', deviceModel: 'Quest 3', androidSdkVersion: 32, osName: 'Android', osVersion: '12L', hl: HL, gl: GL },
    ua: `com.google.android.apps.youtube.vr.oculus/${VR} (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip`,
  },
  {
    nome: 'IOS',
    id: 5,
    client: { clientName: 'IOS', clientVersion: IOS, deviceMake: 'Apple', deviceModel: 'iPhone16,2', osName: 'iPhone', osVersion: '18.3.2.22D82', hl: HL, gl: GL },
    ua: `com.google.ios.youtube/${IOS} (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)`,
  },
  {
    nome: 'ANDROID',
    id: 3,
    client: { clientName: 'ANDROID', clientVersion: AND, androidSdkVersion: 30, osName: 'Android', osVersion: '11', hl: HL, gl: GL },
    ua: `com.google.android.youtube/${AND} (Linux; U; Android 11) gzip`,
  },
];

const altura = (f) => f.height || Number(/(\d+)p/.exec(f.qualityLabel || '')?.[1]) || 0;
const ehMp4 = (f) => /^video\/mp4/.test(f.mimeType || '');

async function player(videoId, c) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': c.ua,
      'accept-language': `${HL}-${GL},${HL};q=0.9`,
      'x-youtube-client-name': String(c.id),
      'x-youtube-client-version': c.client.clientVersion,
      origin: 'https://www.youtube.com',
    },
    body: JSON.stringify({ context: { client: c.client }, videoId, contentCheckOk: true, racyCheckOk: true }),
    signal: AbortSignal.timeout(30_000),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new Error(`HTTP ${res.status}`);
  const st = data.playabilityStatus;
  if (st?.status !== 'OK') throw new Error(`${st?.status || 'sem status'}${st?.reason ? ` — ${st.reason}` : ''}`);
  return data.streamingData || {};
}

function escolher(sd) {
  const comUrl = (l) => (l || []).filter((f) => f.url);
  const muxed = comUrl(sd.formats).filter(ehMp4).sort((a, b) => altura(b) - altura(a))[0];
  if (muxed) return { muxed };
  const adapt = comUrl(sd.adaptiveFormats);
  const video = adapt
    .filter((f) => ehMp4(f) && /avc1/.test(f.mimeType)) // H.264 para máxima compatibilidade
    .sort((a, b) => altura(b) - altura(a) || (b.bitrate || 0) - (a.bitrate || 0))[0]
    || adapt.filter(ehMp4).sort((a, b) => altura(b) - altura(a))[0];
  const audio = adapt.filter((f) => /^audio\/mp4/.test(f.mimeType || '')).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
  return video && audio ? { video, audio } : null;
}

// Tenta os clientes em ordem e devolve os formatos escolhidos + o cliente que os obteve.
export async function resolver(videoId) {
  const falhas = [];
  for (const c of CLIENTES) {
    try {
      const sel = escolher(await player(videoId, c));
      if (sel) return { ...sel, cliente: c };
      falhas.push(`${c.nome}: nenhum formato com URL direta`);
    } catch (e) {
      falhas.push(`${c.nome}: ${e.message}`);
    }
  }
  throw new Error(falhas.join('; '));
}

// Baixa uma URL do googlevideo para `destino`, em blocos (parâmetro `range`).
async function baixarUrl(formato, ua, destino) {
  const total = Number(formato.contentLength) || 0;
  const out = createWriteStream(destino);
  try {
    if (!total) {
      const res = await fetch(formato.url, { headers: { 'user-agent': ua }, signal: AbortSignal.timeout(300_000) });
      if (!res.ok || !res.body) throw new Error(`download HTTP ${res.status}`);
      await pipeline(Readable.fromWeb(res.body), out);
      return;
    }
    for (let ini = 0; ini < total; ini += CHUNK) {
      const fim = Math.min(ini + CHUNK, total) - 1;
      const u = new URL(formato.url);
      u.searchParams.set('range', `${ini}-${fim}`);
      const res = await fetch(u, { headers: { 'user-agent': ua }, signal: AbortSignal.timeout(120_000) });
      if (!res.ok || !res.body) throw new Error(`download HTTP ${res.status} (bytes ${ini}-${fim})`);
      await pipeline(Readable.fromWeb(res.body), out, { end: false });
    }
  } finally {
    await new Promise((r) => out.end(r));
  }
  const { size } = await fs.stat(destino);
  if (total && size !== total) throw new Error(`download incompleto (${size} de ${total} bytes)`);
}

function juntar(video, audio, destino) {
  return new Promise((ok, falha) => {
    const p = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-i', video, '-i', audio, '-c', 'copy', '-movflags', '+faststart', '-f', 'mp4', destino], { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err += d; });
    p.on('error', (e) => falha(new Error(e.code === 'ENOENT' ? 'sem formato muxed e ffmpeg não encontrado (defina FFMPEG_PATH)' : e.message)));
    p.on('close', (code) => (code === 0 ? ok() : falha(new Error(`ffmpeg saiu com código ${code}: ${err.trim().slice(0, 300)}`))));
  });
}

const remover = (...arqs) => Promise.all(arqs.map((a) => fs.rm(a, { force: true })));

// Resolve e baixa um short para `destino` (.mp4). Grava em .part e só renomeia no fim.
export async function baixarShort(videoId, destino) {
  const sel = await resolver(videoId);
  const ua = sel.cliente.ua;
  const tmp = `${destino}.part`;
  try {
    if (sel.muxed) {
      await baixarUrl(sel.muxed, ua, tmp);
      await fs.rename(tmp, destino);
      return { cliente: sel.cliente.nome, qualidade: sel.muxed.qualityLabel || `${altura(sel.muxed)}p`, tipo: 'muxed' };
    }
    const v = `${destino}.video.part`;
    const a = `${destino}.audio.part`;
    try {
      await baixarUrl(sel.video, ua, v);
      await baixarUrl(sel.audio, ua, a);
      await juntar(v, a, tmp);
      await fs.rename(tmp, destino);
    } finally {
      await remover(v, a);
    }
    return { cliente: sel.cliente.nome, qualidade: sel.video.qualityLabel || `${altura(sel.video)}p`, tipo: 'vídeo+áudio (ffmpeg)' };
  } finally {
    await remover(tmp);
  }
}
