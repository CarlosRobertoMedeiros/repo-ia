// Extração e divisão do áudio com o ffmpeg empacotado pelo ffmpeg-static
// (binário próprio para Windows, macOS e Linux, baixado no npm install).

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

// ffmpeg: FFMPEG_PATH > binário do pacote ffmpeg-static > ffmpeg do PATH.
let ffmpegStatic = null;
try {
  ffmpegStatic = (await import('ffmpeg-static')).default;
} catch { /* pacote não instalado: tenta FFMPEG_PATH ou o PATH */ }
const FFMPEG = process.env.FFMPEG_PATH || ffmpegStatic || 'ffmpeg';

function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, ['-hide_banner', '-nostdin', ...args], { windowsHide: true });
    let err = '';
    p.stderr.on('data', (d) => {
      err += d;
      if (err.length > 2_000_000) err = err.slice(-1_000_000);
    });
    p.stdout.resume();
    p.on('error', (e) => reject(new Error(
      e.code === 'ENOENT' ? 'ffmpeg não encontrado (rode npm install na pasta do MCP ou defina FFMPEG_PATH)' : e.message,
    )));
    p.on('close', (code) => resolve({ code, stderr: err }));
  });
}

const resumoErro = (stderr) => stderr.trim().split(/\r?\n/).slice(-4).join(' | ').slice(0, 400);

// Duração (s) e presença de faixa de áudio, lidas do cabeçalho via "ffmpeg -i" (o ffmpeg-static não traz ffprobe).
export async function inspecionar(arquivo) {
  const { stderr } = await ffmpeg(['-i', arquivo]);
  const d = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const duracao = d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : 0;
  const temAudio = /Stream #\S+.*?: Audio:/.test(stderr);
  if (!d && !temAudio) throw new Error(`arquivo não reconhecido pelo ffmpeg: ${resumoErro(stderr)}`);
  return { duracao, temAudio };
}

// Áudio mono 16 kHz (a taxa que os modelos de fala usam), com filtro de banda de voz.
// 1ª opção: Opus em OGG (modo voip), padrão 24 kbit/s — ~10 MB por hora, fala nítida.
// Reserva: MP3 (bitrate um pouco maior), caso o build do ffmpeg não tenha libopus.
const formatos = (kbps) => [
  { ext: 'ogg', args: ['-c:a', 'libopus', '-b:a', `${kbps}k`, '-application', 'voip', '-f', 'ogg'] },
  { ext: 'mp3', args: ['-c:a', 'libmp3lame', '-b:a', `${Math.max(32, Math.ceil(kbps * 1.33 / 8) * 8)}k`, '-f', 'mp3'] },
];

export async function extrairAudio(video, pastaTemp, kbps = 24) {
  let ultimoErro = '';
  for (const fmt of formatos(kbps)) {
    const destino = path.join(pastaTemp, `audio.${fmt.ext}`);
    const { code, stderr } = await ffmpeg([
      '-y', '-i', video,
      '-map', '0:a:0', '-vn', '-sn', '-dn',
      '-ac', '1', '-ar', '16000',
      '-af', 'highpass=f=60,lowpass=f=7800',
      ...fmt.args, destino,
    ]);
    if (code === 0) {
      const { size } = await fs.stat(destino);
      if (size > 0) return { arquivo: destino, ext: fmt.ext, bytes: size };
    }
    ultimoErro = resumoErro(stderr);
    await fs.rm(destino, { force: true });
  }
  throw new Error(`falha ao extrair o áudio: ${ultimoErro}`);
}

// Trechos de silêncio (para cortar entre falas, não no meio de palavras).
async function silencios(audio) {
  const { stderr } = await ffmpeg(['-i', audio, '-af', 'silencedetect=noise=-35dB:d=0.35', '-f', 'null', '-']);
  const lista = [];
  let inicio = null;
  for (const linha of stderr.split(/\r?\n/)) {
    const s = linha.match(/silence_start:\s*(-?[\d.]+)/);
    if (s) inicio = Math.max(0, Number(s[1]));
    const e = linha.match(/silence_end:\s*([\d.]+)/);
    if (e && inicio !== null) {
      lista.push((inicio + Number(e[1])) / 2);
      inicio = null;
    }
  }
  return lista;
}

// Divide o áudio em partes que respeitam o limite de bytes e de duração por requisição.
// Os pontos de corte ficam no silêncio mais próximo (até 45 s antes) de cada corte ideal.
export async function dividirAudio(audio, { duracao, bytes, ext, pastaTemp, limiteBytes, maxSegundos }) {
  const porTamanho = Math.ceil(bytes / limiteBytes);
  const porDuracao = maxSegundos > 0 ? Math.ceil(duracao / maxSegundos) : 1;
  let partes = Math.max(1, porTamanho, porDuracao);
  if (partes === 1) return [audio];
  if (!(duracao > 0)) throw new Error('áudio acima do limite e sem duração legível para dividir');

  const pausas = await silencios(audio);
  for (let tentativa = 0; tentativa < 4; tentativa++, partes = Math.ceil(partes * 1.5)) {
    const alvo = duracao / partes;
    const cortes = [0];
    for (let k = 1; k < partes; k++) {
      const ideal = k * alvo;
      const candidatos = pausas.filter((p) => p <= ideal && p >= ideal - Math.min(45, alvo * 0.3) && p > cortes.at(-1) + 1);
      cortes.push(candidatos.length ? candidatos.at(-1) : ideal);
    }
    cortes.push(duracao + 1);

    const arquivos = [];
    let excedeu = false;
    for (let i = 0; i < cortes.length - 1; i++) {
      const destino = path.join(pastaTemp, `parte_${String(i + 1).padStart(3, '0')}.${ext}`);
      const { code, stderr } = await ffmpeg([
        '-y', '-i', audio, '-ss', cortes[i].toFixed(3), '-to', cortes[i + 1].toFixed(3),
        '-c', 'copy', '-map', '0:a:0', destino,
      ]);
      if (code !== 0) throw new Error(`falha ao dividir o áudio: ${resumoErro(stderr)}`);
      const { size } = await fs.stat(destino);
      if (size > limiteBytes) excedeu = true;
      if (size > 0) arquivos.push(destino);
    }
    if (!excedeu) return arquivos;
    await Promise.all(arquivos.map((a) => fs.rm(a, { force: true })));
  }
  throw new Error('não foi possível dividir o áudio abaixo do limite da API');
}
