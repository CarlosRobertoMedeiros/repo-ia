// Cliente da API pública interna do YouTube (InnerTube, /youtubei/v1), a mesma
// usada pelo site e pelo app. Não exige login, cookies nem chave de API.
//
// - Lista: playlist de Shorts do canal (UC... -> UUSH...), mais novo primeiro.
//   O cliente ANDROID pagina a playlist inteira; o WEB só entrega os primeiros
//   100, então ele e a aba "Shorts" ficam como alternativas.
// - Detalhes: `reel/reel_item_watch` (o que o player de Shorts chama) traz
//   views, curtidas, data de publicação e duração de cada short.
// Falhas são registradas em `erros` e a coleta segue com o que foi obtido.

const API = 'https://www.youtube.com/youtubei/v1';

// Idioma/país das respostas. O YouTube traduz títulos automaticamente conforme o idioma,
// então o padrão é português do Brasil; o player sempre devolve o título original.
const HL = process.env.YT_HL || 'pt';
const GL = process.env.YT_GL || 'BR';
// Versões dos clientes; se o YouTube passar a recusá-las, sobrescreva por variável de ambiente.
const CLIENTES = {
  WEB: {
    client: { clientName: 'WEB', clientVersion: process.env.YT_WEB_VERSION || '2.20251031.00.00', hl: HL, gl: GL },
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',
  },
  ANDROID: {
    client: { clientName: 'ANDROID', clientVersion: process.env.YT_ANDROID_VERSION || '20.10.38', androidSdkVersion: 30, hl: HL, gl: GL },
    ua: `com.google.android.youtube/${process.env.YT_ANDROID_VERSION || '20.10.38'} (Linux; U; Android 11) gzip`,
  },
};
const REEL_PARAMS = 'CAUwAg%3D%3D';
const CONCORRENCIA = 3;
const CHANNEL_ID = /^UC[\w-]{22}$/;
const VIDEO_ID = /^[\w-]{11}$/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (v) => (v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : '');
const limpa = (s) => (s || '').replace(/\s*\r?\n\s*/g, ' ').trim();
const texto = (t) => t?.simpleText ?? t?.runs?.map((r) => r.text).join('') ?? t?.content ?? '';

class Bloqueio extends Error {}

async function innertube(endpoint, corpo, cliente = 'WEB') {
  const { client, ua } = CLIENTES[cliente];
  const res = await fetch(`${API}/${endpoint}?prettyPrint=false`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': ua,
      'accept-language': `${HL}-${GL},${HL};q=0.9`,
      origin: 'https://www.youtube.com',
      referer: 'https://www.youtube.com/',
    },
    body: JSON.stringify({ context: { client }, ...corpo }),
    signal: AbortSignal.timeout(30_000),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.error) throw new Error(`HTTP ${res.status}${data?.error?.message ? ` — ${data.error.message}` : ''}`);
  return data;
}

async function comRetentativa(fn, delayMs) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof Bloqueio) throw e;
    await sleep(delayMs * 3);
    return fn();
  }
}

// Os nomes dos renderers mudam com frequência; procura em qualquer profundidade.
function percorrer(o, f) {
  if (!o || typeof o !== 'object') return;
  f(o);
  for (const v of Object.values(o)) percorrer(v, f);
}

function extrairPagina(data) {
  const itens = [];
  const vistos = new Set();
  let token = null;
  percorrer(data, (o) => {
    let item = null;
    if (o.playlistVideoRenderer) {
      const r = o.playlistVideoRenderer;
      item = { video_id: r.videoId, titulo: texto(r.title), duracao_segundos: num(r.lengthSeconds) };
    } else if (o.shortsLockupViewModel) {
      const r = o.shortsLockupViewModel;
      item = { video_id: r.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId, titulo: texto(r.overlayMetadata?.primaryText) };
    } else if (o.reelItemRenderer) {
      item = { video_id: o.reelItemRenderer.videoId, titulo: texto(o.reelItemRenderer.headline) };
    }
    if (item && VIDEO_ID.test(item.video_id || '') && !vistos.has(item.video_id)) {
      vistos.add(item.video_id);
      itens.push(item);
    }
    const t = o.continuationCommand?.token || o.nextContinuationData?.continuation;
    if (t) token = t;
  });
  return { itens, token };
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

// Percorre um browse paginado e acumula os itens em `estado.itens` (Map, ordem preservada).
async function listar(inicial, cliente, rotulo, estado, { maxPages, delayMs }) {
  let corpo = inicial;
  let paginas = 0;
  while (corpo && paginas < maxPages) {
    if (paginas) await sleep(delayMs);
    let data;
    try {
      data = await comRetentativa(() => innertube('browse', corpo, cliente), delayMs);
    } catch (e) {
      // Sem a página não há próximo token, então esta listagem termina aqui.
      estado.erros.push(`${rotulo}, página ${paginas + 1}: ${e.message}`);
      break;
    }
    paginas++;
    const { itens, token } = extrairPagina(data);
    const antes = estado.itens.size;
    for (const it of itens) if (!estado.itens.has(it.video_id)) estado.itens.set(it.video_id, it);
    corpo = token && estado.itens.size > antes ? { continuation: token } : null;
  }
  estado.paginas += paginas;
}

async function listarShorts(channelId, estado, opcoes) {
  const playlist = { browseId: `VLUUSH${channelId.slice(2)}` };
  await listar(playlist, 'ANDROID', 'playlist de shorts (android)', estado, opcoes);
  if (estado.itens.size) return;
  await listar(playlist, 'WEB', 'playlist de shorts (web)', estado, opcoes);
  if (estado.itens.size) return;

  // Última alternativa: aba Shorts do canal, com os params lidos da página do canal.
  try {
    const data = await innertube('browse', { browseId: channelId });
    const abas = data.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
    const ep = abas.map((t) => t.tabRenderer?.endpoint).find((e) => e?.commandMetadata?.webCommandMetadata?.url?.endsWith('/shorts'));
    if (ep?.browseEndpoint?.params) {
      await listar({ browseId: channelId, params: ep.browseEndpoint.params }, 'WEB', 'aba shorts', estado, opcoes);
    } else {
      estado.erros.push('aba shorts: não encontrada no canal');
    }
  } catch (e) {
    estado.erros.push(`aba shorts: ${e.message}`);
  }
}

function normalizar(data, videoId) {
  const p = data.playerResponse || data;
  const d = p.videoDetails;
  const m = p.microformat?.playerMicroformatRenderer;
  const status = p.playabilityStatus?.status;
  if (status === 'LOGIN_REQUIRED' && !m) throw new Bloqueio(p.playabilityStatus?.reason || 'LOGIN_REQUIRED');
  if (!d && !m) throw new Error(p.playabilityStatus?.reason || status || 'sem dados');
  return {
    video_id: videoId,
    titulo: limpa(d?.title || texto(m?.title)),
    url: `https://www.youtube.com/shorts/${videoId}`,
    publicado_em: m?.publishDate || m?.uploadDate || '',
    duracao_segundos: num(d?.lengthSeconds ?? m?.lengthSeconds),
    visualizacoes: num(m?.viewCount ?? d?.viewCount),
    curtidas: num(m?.likeCount),
    canal: d?.author || m?.ownerChannelName || '',
    descricao: limpa(d?.shortDescription || texto(m?.description)),
  };
}

const MESES = {
  jan: 1, feb: 2, fev: 2, mar: 3, apr: 4, abr: 4, may: 5, mai: 5, jun: 6, jul: 7,
  aug: 8, ago: 8, sep: 9, set: 9, oct: 10, out: 10, nov: 11, dec: 12, dez: 12,
};
const inteiro = (s) => (/\d/.test(s || '') ? Number(String(s).replace(/\D/g, '')) : '');

// "17 de mar. de 2026" (pt) ou "Mar 17, 2026" / "Premiered Mar 17, 2026" (en) -> "2026-03-17"
function dataCurta(s) {
  const pt = /(\d{1,2}) de ([a-zç]{3})[a-zç]*\.? de (\d{4})/i.exec(s || '');
  const en = /([A-Za-z]{3})[a-z]* (\d{1,2}), (\d{4})/.exec(s || '');
  const [dia, mes, ano] = pt ? [pt[1], pt[2], pt[3]] : en ? [en[2], en[1], en[3]] : [];
  const m = MESES[(mes || '').toLowerCase()];
  if (!m) return '';
  return `${ano}-${String(m).padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

// Alternativa ao player, usada quando ele pede a verificação anti-bot:
// a página de exibição (`next`) continua pública e traz views exatas,
// curtidas e a data (só o dia). A duração continua a da listagem.
function normalizarNext(data, videoId) {
  let prim;
  let sec;
  percorrer(data.contents?.twoColumnWatchNextResults?.results, (o) => {
    prim ||= o.videoPrimaryInfoRenderer;
    sec ||= o.videoSecondaryInfoRenderer;
  });
  if (!prim) throw new Error('página do vídeo sem informações');

  // Os textos de acessibilidade do botão "Gostei" trazem o número completo
  // (o título do botão vem abreviado, ex.: "1,2 mil"). Há versões com e sem a
  // curtida do próprio visitante; sem ela é o menor número.
  const totais = [];
  percorrer(prim.videoActions, (o) => {
    if (!o.likeButtonViewModel) return;
    percorrer(o.likeButtonViewModel, (x) => {
      const a = x.accessibilityText;
      if (typeof a === 'string' && /\d/.test(a)) totais.push(inteiro(a));
    });
  });
  const curtidas = totais.length ? Math.min(...totais) : '';

  const vc = prim.viewCount?.videoViewCountRenderer;
  return {
    video_id: videoId,
    titulo: limpa(texto(prim.title)),
    url: `https://www.youtube.com/shorts/${videoId}`,
    publicado_em: dataCurta(texto(prim.dateText)),
    visualizacoes: num(vc?.originalViewCount) || inteiro(texto(vc?.viewCount)),
    curtidas,
    canal: texto(sec?.owner?.videoOwnerRenderer?.title),
    descricao: limpa(sec?.attributedDescription?.content || texto(sec?.description)),
  };
}

// Busca os detalhes com pouca concorrência. Primeiro pelo player de Shorts
// (dados completos); se ele pedir a verificação anti-bot, segue pela página
// de exibição. Se ela também falhar várias vezes seguidas, para e devolve o que já obteve.
async function detalhar(ids, erros, delayMs) {
  const detalhes = new Map();
  let proximo = 0;
  let bloqueado = false;
  let falhasSeguidas = 0;
  let desistiu = false;
  async function trabalhador() {
    while (!desistiu && proximo < ids.length) {
      const id = ids[proximo++];
      try {
        if (!bloqueado) {
          try {
            const data = await comRetentativa(() => innertube('reel/reel_item_watch', { playerRequest: { videoId: id }, params: REEL_PARAMS }), delayMs);
            detalhes.set(id, normalizar(data, id));
          } catch (e) {
            if (!(e instanceof Bloqueio)) throw e;
            bloqueado = true;
          }
        }
        if (!detalhes.has(id)) {
          const data = await comRetentativa(() => innertube('next', { videoId: id }), delayMs);
          detalhes.set(id, normalizarNext(data, id));
        }
        falhasSeguidas = 0;
      } catch (e) {
        erros.push(`short ${id}: ${e.message}`);
        if (++falhasSeguidas >= 10) desistiu = true;
      }
      await sleep(delayMs);
    }
  }
  await Promise.all(Array.from({ length: CONCORRENCIA }, trabalhador));
  if (bloqueado) {
    erros.push('O player do YouTube pediu verificação anti-bot no meio da coleta; os shorts seguintes vieram da página de exibição '
      + '(data só com o dia). Na próxima execução eles são atualizados pelo player, se ele estiver liberado.');
  }
  if (desistiu) {
    erros.push(`Muitas falhas seguidas; ${ids.length - detalhes.size} shorts ficaram sem detalhes. `
      + 'Rode novamente mais tarde: os que ainda estão sem curtidas são buscados primeiro.');
  }
  return detalhes;
}

// `completos`: ids que já têm curtidas na lista salva; os demais são detalhados primeiro,
// para que execuções repetidas completem a lista mesmo se a coleta for interrompida.
export async function fetchShorts(conta, { maxPages = 200, delayMs = 150, completos = new Set() } = {}) {
  const estado = { itens: new Map(), erros: [], paginas: 0 };
  const resultado = (shorts = [], detalhados = 0) => ({ shorts, erros: estado.erros, paginas: estado.paginas, listados: estado.itens.size, detalhados });

  let channelId;
  try {
    channelId = await resolverCanal(conta);
  } catch (e) {
    estado.erros.push(`canal: ${e.message}`);
    return resultado();
  }

  const opcoes = { maxPages, delayMs };
  await listarShorts(channelId, estado, opcoes);

  const ids = [...estado.itens.keys()];
  const fila = [...ids.filter((id) => !completos.has(id)), ...ids.filter((id) => completos.has(id))];
  const detalhes = await detalhar(fila, estado.erros, delayMs);

  // Ordem da listagem (mais novo primeiro); sem detalhes, fica o que veio da listagem.
  const shorts = ids.map((id) => {
    const base = estado.itens.get(id);
    const det = Object.fromEntries(Object.entries(detalhes.get(id) || {}).filter(([, v]) => v !== ""));
    return { ...base, titulo: limpa(base.titulo), url: `https://www.youtube.com/shorts/${id}`, ...det };
  });
  return resultado(shorts, detalhes.size);
}
