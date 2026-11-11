// Cliente mínimo do endpoint de transcrição da Groq (compatível com o formato OpenAI),
// usando fetch/FormData nativos do Node 18+, sem SDK.
// POST {GROQ_BASE_URL}/audio/transcriptions  (padrão: https://api.groq.com/openai/v1)

import fs from 'node:fs/promises';
import path from 'node:path';

const MIME = { ogg: 'audio/ogg', mp3: 'audio/mpeg' };
const TIMEOUT_MS = 10 * 60 * 1000;
const ESPERA_MAX_MS = 5 * 60 * 1000; // teto de espera num 429 (limite de segundos de áudio por hora)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class ErroFatal extends Error {} // erro que afetaria todos os vídeos (ex.: chave inválida)

// "retry-after" em segundos, ou o tempo citado na mensagem da Groq ("Please try again in 1m23.5s").
function tempoDeEspera(resp, msg, tentativa) {
  const ra = Number(resp.headers.get('retry-after'));
  if (ra > 0) return ra * 1000;
  const m = msg.match(/try again in\s+(?:(\d+)h)?(?:(\d+)m(?!s))?(?:([\d.]+)s)?(?:([\d.]+)ms)?/i);
  if (m && (m[1] || m[2] || m[3] || m[4])) {
    return ((Number(m[1] || 0) * 3600) + (Number(m[2] || 0) * 60) + Number(m[3] || 0)) * 1000 + Number(m[4] || 0) + 500;
  }
  return 2000 * 2 ** tentativa;
}

export async function transcreverAudio(arquivo, cfg, prompt) {
  const dados = await fs.readFile(arquivo);
  const ext = path.extname(arquivo).slice(1).toLowerCase();

  let ultimo;
  for (let i = 0; i < cfg.tentativas; i++) {
    const form = new FormData();
    form.append('file', new Blob([dados], { type: MIME[ext] || 'application/octet-stream' }), path.basename(arquivo));
    form.append('model', cfg.modelo);
    form.append('response_format', 'text');
    form.append('temperature', String(cfg.temperatura));
    if (cfg.idioma) form.append('language', cfg.idioma);
    if (prompt) form.append('prompt', prompt);

    let resp;
    try {
      resp = await fetch(`${cfg.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfg.apiKey}` },
        body: form,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (e) {
      ultimo = new Error(`falha de rede com a Groq: ${e.cause?.message || e.message}`);
      await sleep(2000 * 2 ** i);
      continue;
    }

    const corpo = await resp.text();
    if (resp.ok) {
      // response_format=text devolve texto puro; se vier JSON, usa o campo "text".
      try {
        const j = JSON.parse(corpo);
        if (j && typeof j.text === 'string') return j.text;
      } catch { /* texto puro */ }
      return corpo;
    }

    let msg = corpo.slice(0, 300);
    let codigo = '';
    try {
      const e = JSON.parse(corpo).error || {};
      msg = e.message || msg;
      codigo = e.code || e.type || '';
    } catch { /* corpo não é JSON */ }

    if (resp.status === 401 || codigo === 'invalid_api_key') {
      throw new ErroFatal(`Groq recusou a chave (401): ${msg}. Verifique GROQ_API_KEY em resources/mcps/video-transcricao/.env.`);
    }
    if (resp.status === 403) {
      throw new ErroFatal(`Groq negou acesso (403): ${msg}. Verifique as permissões da chave/organização no console da Groq.`);
    }
    if (codigo === 'model_not_found' || codigo === 'model_decommissioned' || /model.*(not exist|not found|decommission)/i.test(msg)) {
      throw new ErroFatal(`modelo "${cfg.modelo}" indisponível na Groq: ${msg}. Ajuste GROQ_TRANSCRIBE_MODEL no .env.`);
    }

    ultimo = new Error(`Groq respondeu ${resp.status}${codigo ? ` (${codigo})` : ''}: ${msg}`);
    if (resp.status !== 429 && resp.status < 500) throw ultimo; // erro do pedido: não adianta repetir
    const espera = tempoDeEspera(resp, msg, i);
    if (espera > ESPERA_MAX_MS) throw ultimo;
    if (i < cfg.tentativas - 1) {
      console.error(`[video-transcricao] Groq ${resp.status}; nova tentativa em ${Math.ceil(espera / 1000)} s`);
      await sleep(espera);
    }
  }
  throw ultimo;
}
