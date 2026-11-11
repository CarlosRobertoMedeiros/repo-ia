// Leitura do .env da pasta do próprio MCP (resources/mcps/video-transcricao/.env), sem dependências.
// A configuração fica junto do código que a usa: o MCP é autocontido e não depende da raiz do projeto.
// O arquivo é relido a cada chamada, então dá para editar a chave sem reiniciar o MCP.

import fs from 'node:fs';
import path from 'node:path';

export function lerEnv(arquivo) {
  let texto;
  try {
    texto = fs.readFileSync(arquivo, 'utf8');
  } catch {
    return {};
  }
  const vars = {};
  for (let linha of texto.replace(/^﻿/, '').split(/\r?\n/)) {
    linha = linha.trim();
    if (!linha || linha.startsWith('#')) continue;
    const m = linha.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_.-]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let valor = m[2].trim();
    const aspas = valor[0];
    if ((aspas === '"' || aspas === "'" || aspas === '`') && valor.lastIndexOf(aspas) > 0) {
      valor = valor.slice(1, valor.lastIndexOf(aspas));
      if (aspas === '"') valor = valor.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\"/g, '"');
    } else {
      valor = valor.replace(/\s+#.*$/, '').trim(); // comentário no fim da linha
    }
    vars[m[1]] = valor;
  }
  return vars;
}

const numero = (v, padrao, { min = -Infinity, max = Infinity } = {}) => {
  if (v === '' || v === undefined) return padrao;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : padrao;
};

// Valores do .env têm prioridade; variáveis do sistema servem de reserva.
export function configuracao(pastaEnv) {
  const arquivo = path.join(pastaEnv, '.env');
  const env = lerEnv(arquivo);
  const get = (k) => String(env[k] ?? process.env[k] ?? '').trim();
  return {
    arquivoEnv: arquivo,
    // Acesso à API
    apiKey: get('GROQ_API_KEY'),
    baseUrl: (get('GROQ_BASE_URL') || 'https://api.groq.com/openai/v1').replace(/\/+$/, ''),
    // Transcrição
    modelo: get('GROQ_TRANSCRIBE_MODEL') || 'whisper-large-v3',
    idioma: get('TRANSCRICAO_IDIOMA').toLowerCase(),
    temperatura: numero(get('TRANSCRICAO_TEMPERATURA'), 0, { min: 0, max: 1 }),
    prompt: get('TRANSCRICAO_PROMPT'),
    // Áudio enviado
    audioKbps: Math.round(numero(get('TRANSCRICAO_AUDIO_KBPS'), 24, { min: 12, max: 64 })),
    limiteMB: numero(get('TRANSCRICAO_LIMITE_MB'), 24, { min: 1, max: 25 }),
    maxSegundos: numero(get('TRANSCRICAO_MAX_SEGUNDOS'), 0, { min: 0 }),
    // Resiliência
    tentativas: Math.round(numero(get('TRANSCRICAO_TENTATIVAS'), 4, { min: 1, max: 10 })),
  };
}

export function exigirChave(cfg) {
  if (cfg.apiKey && !/^(gsk_\.\.\.|sua[_-]?chave.*|<.*>)$/i.test(cfg.apiKey)) return;
  throw new Error(
    'Chave da Groq não configurada. '
    + `Preencha GROQ_API_KEY no arquivo ${cfg.arquivoEnv}:\n`
    + '  GROQ_API_KEY=gsk_...\n'
    + '(gere a chave em https://console.groq.com/keys). Nenhum vídeo foi processado.',
  );
}
