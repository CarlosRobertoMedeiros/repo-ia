// Cliente da API Graph oficial da Meta (Instagram Business Discovery).
// Lê dados públicos de contas Business/Creator usando o token de uma conta
// profissional sua (META_ACCESS_TOKEN). Paginação por cursor; falhas são
// registradas em `erros` e a coleta para ali, devolvendo o que foi obtido.

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v23.0';
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;
const PAGE_SIZE = 50;
const CAMPOS_MIDIA = [
  'id', 'caption', 'media_type', 'media_product_type', 'permalink',
  'thumbnail_url', 'timestamp', 'like_count', 'comments_count',
];
// Nem toda versão da API aceita view_count em business_discovery;
// se for recusado, a coleta repete a página sem ele.
const CAMPO_VIEWS = 'view_count';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (v) => (Number.isFinite(v) && v >= 0 ? v : '');
const limpa = (s) => (s || '').replace(/\s*\r?\n\s*/g, ' ').trim();

class ErroGraph extends Error {
  constructor(status, erro) {
    super(`HTTP ${status}${erro?.message ? ` — ${erro.message}` : ''}`);
    this.code = erro?.code;
  }
}

async function graph(caminho, params, token) {
  const url = `${GRAPH}/${caminho}?${new URLSearchParams(params)}`;
  // Token no cabeçalho para não aparecer em URLs e logs.
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.error) throw new ErroGraph(res.status, data?.error);
  return data;
}

// Descobre o ID da conta profissional do Instagram ligada ao token.
async function descobrirIgUserId(token) {
  const data = await graph('me/accounts', { fields: 'instagram_business_account', limit: '100' }, token);
  const id = data?.data?.find((p) => p.instagram_business_account)?.instagram_business_account?.id;
  if (!id) throw new Error('nenhuma Página do Facebook com conta profissional do Instagram ligada a este token');
  return id;
}

const ehVideo = (m) =>
  m?.media_type === 'VIDEO' || m?.media_product_type === 'REELS' || m?.media_product_type === 'IGTV';

function normalizar(m) {
  if (!ehVideo(m) || !m.permalink) return null;
  const shortcode = m.permalink.match(/\/(?:p|reel|reels|tv)\/([^/?#]+)/)?.[1];
  if (!shortcode) return null;
  const ts = m.timestamp ? Math.floor(Date.parse(m.timestamp) / 1000) : '';
  return {
    shortcode,
    url: m.permalink,
    type: (m.media_product_type || 'video').toLowerCase(),
    taken_at: ts ? new Date(ts * 1000).toISOString() : '',
    timestamp: ts,
    views: num(m.view_count),
    likes: num(m.like_count),
    comments: num(m.comments_count),
    duration: '',
    caption: limpa(m.caption),
    thumbnail: m.thumbnail_url || '',
  };
}

export async function fetchVideos(conta, { maxPages = 50, delayMs = 500 } = {}) {
  const videos = new Map();
  const erros = [];
  let paginas = 0;
  const resultado = () => ({ videos: [...videos.values()], erros, paginas });

  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    erros.push('configuração: defina META_ACCESS_TOKEN (veja .env.example)');
    return resultado();
  }

  let igUserId = process.env.META_IG_USER_ID;
  if (!igUserId) {
    try {
      igUserId = await descobrirIgUserId(token);
    } catch (e) {
      erros.push(`conta profissional: ${e.message}`);
      return resultado();
    }
  }

  let comViews = true;
  let cursor = null;
  while (paginas < maxPages) {
    if (paginas) await sleep(delayMs);
    let data;
    for (let tentativa = 1; tentativa <= 2 && !data; tentativa++) {
      const campos = comViews ? [...CAMPOS_MIDIA, CAMPO_VIEWS] : CAMPOS_MIDIA;
      const media = `media.limit(${PAGE_SIZE})${cursor ? `.after(${cursor})` : ''}{${campos.join(',')}}`;
      try {
        data = await graph(igUserId, { fields: `business_discovery.username(${conta}){id,username,${media}}` }, token);
      } catch (e) {
        // Código 100 = campo/parâmetro inválido: repete sem view_count.
        if (e.code === 100 && comViews) {
          comViews = false;
          erros.push(`views: campo ${CAMPO_VIEWS} não disponível nesta versão da API, coluna ficará vazia`);
          tentativa--;
          continue;
        }
        if (tentativa === 2) erros.push(`página ${paginas + 1}: ${e.message}`);
        else await sleep(delayMs * 2);
      }
    }
    // Sem a página não há próximo cursor, então a coleta termina aqui.
    if (!data) break;
    paginas++;
    const midias = data.business_discovery?.media;
    midias?.data?.forEach((m) => {
      const v = normalizar(m);
      if (v) videos.set(v.shortcode, v);
    });
    cursor = midias?.paging?.next ? midias.paging.cursors?.after : null;
    if (!cursor) break;
  }

  return resultado();
}
