// Cliente da API pública interna do YouTube (InnerTube, /youtubei/v1), a mesma
// que o site usa. Não exige login nem chave. A lista vem da playlist de uploads
// do canal (todos os tipos, do mais novo para o mais antigo); views, likes, data
// e duração vêm da chamada `player` de cada vídeo. Falhas são registradas em
// `erros` e a coleta segue com o que foi possível obter.

const API = 'https://www.youtube.com/youtubei/v1';
// Versão do cliente web; se o YouTube passar a recusá-la, sobrescreva por variável de ambiente.
const CLIENT_VERSION = process.env.YT_CLIENT_VERSION || '2.20251031.00.00';
const CONTEXTO = { client: { clientName: 'WEB', clientVersion: CLIENT_VERSION, hl: 'en', gl: 'US' } };
const HEADERS = {
  'content-type': 'application/json',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
  origin: 'https://www.youtube.com',
  referer: 'https://www.youtube.com/',
};
const CONCORRENCIA = 4;
const CHANNEL_ID = /^UC[\w-]{22}$/;
const VIDEO_ID = /^[\w-]{11}$/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (v) => (v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : '');
const limpa = (s) => (s || '').replace(/\s*\r?\n\s*/g, ' ').trim();

async function innertube(endpoint, corpo) {
  const res = await fetch(`${API}/${endpoint}?prettyPrint=false`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ context: CONTEXTO, ...corpo }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.error) throw new Error(`HTTP ${res.status}${data?.error?.message ? ` — ${data.error.message}` : ''}`);
  return data;
}

async function comRetentativa(fn, delayMs) {
  try {
    return await fn();
  } catch {
    await sleep(delayMs * 2);
    return fn();
  }
}

// Percorre o JSON inteiro; os nomes dos renderers mudam com frequência,
// então ids e tokens são procurados em qualquer profundidade.
function percorrer(o, f) {
  if (!o || typeof o !== 'object') return;
  f(o);
  for (const v of Object.values(o)) percorrer(v, f);
}

function extrairPagina(data) {
  const ids = [];
  let token = null;
  percorrer(data, (o) => {
    const id = o.playlistVideoRenderer?.videoId || o.lockupViewModel?.contentId
      || o.videoRenderer?.videoId || o.shortsLockupViewModel?.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId;
    // lockupViewModel também representa playlists (PL...); só ids de vídeo têm 11 caracteres.
    if (VIDEO_ID.test(id || '') && !ids.includes(id)) ids.push(id);
    if (o.continuationCommand?.token) token = o.continuationCommand.token;
  });
  return { ids, token };
}

// Aceita @handle, handle, URL do canal ou ID UC...
export async function resolverCanal(conta) {
  if (CHANNEL_ID.test(conta)) return conta;
  const url = /^https?:\/\//.test(conta) ? conta : `https://www.youtube.com/@${conta}`;
  const data = await innertube('navigation/resolve_url', { url });
  const id = data.endpoint?.browseEndpoint?.browseId;
  if (!CHANNEL_ID.test(id || '')) throw new Error(`canal não encontrado para "${conta}"`);
  return id;
}

// Lista ids percorrendo um browse paginado (playlist ou aba do canal).
async function listar(inicial, rotulo, estado, { maxPages, delayMs }) {
  let corpo = inicial;
  while (corpo && estado.paginas < maxPages) {
    if (estado.paginas) await sleep(delayMs);
    let data;
    try {
      data = await comRetentativa(() => innertube('browse', corpo), delayMs);
    } catch (e) {
      // Sem a página não há próximo token, então esta listagem termina aqui.
      estado.erros.push(`${rotulo}, página ${estado.paginas + 1}: ${e.message}`);
      return;
    }
    estado.paginas++;
    const { ids, token } = extrairPagina(data);
    ids.forEach((id) => estado.ids.add(id));
    corpo = token && ids.length ? { continuation: token } : null;
  }
}

// Fallback: abas Vídeos, Shorts e Ao vivo, com os params lidos da página do canal.
async function listarPorAbas(channelId, estado, opcoes) {
  let data;
  try {
    data = await innertube('browse', { browseId: channelId });
  } catch (e) {
    estado.erros.push(`abas do canal: ${e.message}`);
    return;
  }
  const abas = data.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
  for (const sufixo of ['/videos', '/shorts', '/streams']) {
    const ep = abas.map((t) => t.tabRenderer?.endpoint).find((e) => e?.commandMetadata?.webCommandMetadata?.url?.endsWith(sufixo));
    if (ep?.browseEndpoint?.params) {
      await listar({ browseId: channelId, params: ep.browseEndpoint.params }, `aba ${sufixo.slice(1)}`, estado, opcoes);
    }
  }
}

function normalizar(data, videoId) {
  const d = data.videoDetails;
  const m = data.microformat?.playerMicroformatRenderer;
  if (!d && !m) throw new Error(data.playabilityStatus?.reason || data.playabilityStatus?.status || 'sem dados');
  const publicado = m?.publishDate || m?.uploadDate;
  const ts = publicado ? Math.floor(Date.parse(publicado) / 1000) : '';
  const thumbs = m?.thumbnail?.thumbnails || d?.thumbnail?.thumbnails || [];
  let type = 'video';
  if (m?.liveBroadcastDetails || d?.isLiveContent) type = 'live';
  else if (m?.isShortsEligible) type = 'short';
  return {
    video_id: videoId,
    url: type === 'short' ? `https://www.youtube.com/shorts/${videoId}` : `https://www.youtube.com/watch?v=${videoId}`,
    type,
    title: limpa(d?.title || m?.title?.simpleText),
    published_at: ts ? new Date(ts * 1000).toISOString() : '',
    timestamp: ts,
    views: num(d?.viewCount ?? m?.viewCount),
    likes: num(m?.likeCount),
    duration: num(d?.lengthSeconds ?? m?.lengthSeconds),
    category: m?.category || '',
    description: limpa(d?.shortDescription || m?.description?.simpleText),
    thumbnail: thumbs.at(-1)?.url || '',
  };
}

async function detalhar(ids, erros, delayMs) {
  const videos = [];
  const fila = [...ids];
  async function trabalhador() {
    while (fila.length) {
      const id = fila.shift();
      try {
        const data = await comRetentativa(() => innertube('player', { videoId: id }), delayMs);
        const v = normalizar(data, id);
        if (v.timestamp) videos.push(v);
        else erros.push(`vídeo ${id}: sem data de publicação, ignorado`);
      } catch (e) {
        erros.push(`vídeo ${id}: ${e.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCORRENCIA }, trabalhador));
  return videos;
}

export async function fetchVideos(conta, { maxPages = 50, delayMs = 300 } = {}) {
  const estado = { ids: new Set(), erros: [], paginas: 0 };
  const resultado = (videos = []) => ({ videos, erros: estado.erros, paginas: estado.paginas });

  let channelId;
  try {
    channelId = await resolverCanal(conta);
  } catch (e) {
    estado.erros.push(`canal: ${e.message}`);
    return resultado();
  }

  // Playlist de uploads: UC... -> UU..., com todos os tipos de vídeo em ordem cronológica.
  const opcoes = { maxPages, delayMs };
  await listar({ browseId: `VLUU${channelId.slice(2)}` }, 'uploads', estado, opcoes);
  if (!estado.ids.size) await listarPorAbas(channelId, estado, opcoes);

  return resultado(await detalhar([...estado.ids], estado.erros, delayMs));
}
