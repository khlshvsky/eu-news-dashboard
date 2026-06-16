const API_URL = '/api/news';
const AUTO_REFRESH_MS = 10 * 60 * 1000;
const USE_MOCK_DATA = new URLSearchParams(window.location.search).has('mock');

const fallbackNews = [
  {
    title: 'EU leaders discuss new defence funding package ahead of summit',
    source: 'Politico Europe',
    publishedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    url: 'https://www.politico.eu/'
  },
  {
    title: 'French government faces pressure over budget vote',
    source: 'France 24',
    publishedAt: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
    url: 'https://www.france24.com/en/'
  }
];

let allNews = [];


let translationCache = {};   // url → translated title
let translateMode = false;   // current toggle state
let translatePending = false; // debounce flag
let isLoading = false;

const elements = {
  feedList: document.querySelector('#feedList'),
  template: document.querySelector('#newsItemTemplate'),
  searchInput: document.querySelector('#searchInput'),
  translateToggle: document.querySelector('#translateToggle'),
  sourceFilter: document.querySelector('#sourceFilter'),
  timeFilter: document.querySelector('#timeFilter'),
  refreshBtn: document.querySelector('#refreshBtn'),
  totalCount: document.querySelector('#totalCount'),
  sourceCount: document.querySelector('#sourceCount'),
  visibleCount: document.querySelector('#visibleCount'),
  emptyState: document.querySelector('#emptyState'),
  statusDot: document.querySelector('#statusDot'),
  statusLabel: document.querySelector('#statusLabel'),
  lastUpdated: document.querySelector('#lastUpdated')
};

function normalizeItem(item) {
  return {
    title: String(item?.title || '').trim(),
    source: String(item?.source || 'Unknown').trim(),
    publishedAt: item?.publishedAt || item?.date || item?.pubDate || null,
    url: String(item?.url || item?.link || '').trim()
  };
}

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function sanitizeItems(items) {
  return items
    .map(normalizeItem)
    .filter((item) => item.title.length >= 8 && isValidHttpUrl(item.url));
}

function sortByDateDesc(items) {
  return [...items].sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });
}

function buildApiUrl({ force = false } = {}) {
  const url = new URL(API_URL, window.location.origin);
  if (force) url.searchParams.set('force', '1');
  url.searchParams.set('_', String(Date.now()));
  return url.toString();
}

async function loadNews(options = {}) {
  if (isLoading) return;
  isLoading = true;
  elements.refreshBtn.disabled = true;
  elements.refreshBtn.textContent = 'Обновляю…';
  setStatus('loading', 'Обновляю данные');

  try {
    const response = await fetch(buildApiUrl(options), { cache: 'no-store' });
    if (!response.ok) throw new Error(`API returned ${response.status}`);

    const payload = await response.json();
    const items = Array.isArray(payload) ? payload : payload.items;
    if (!Array.isArray(items)) throw new Error('Invalid API payload');

    allNews = sortByDateDesc(sanitizeItems(items));
    if (translateMode) {
      const visible = getFilteredNews();
      await ensureTranslations(visible.map(i => ({ url: i.url, title: i.title })));
    }

    if (allNews.length === 0) {
      setStatus('ok', 'Свежих новостей нет');
    } else {
      setStatus('ok', 'Данные из API');
    }
  } catch (error) {
    console.error('News API error:', error);

    if (USE_MOCK_DATA) {
      allNews = sortByDateDesc(sanitizeItems(fallbackNews));
      setStatus('error', 'Моковые данные');
    } else {
      allNews = [];
      setStatus('error', 'Ошибка API');
      setEmptyState('Не удалось загрузить новости', 'Проверьте /api/health, /api/news и логи Vercel. Тестовые заголовки в проде больше не показываются.');
    }
  } finally {
    updateSourceFilter();
    renderFeed();
    isLoading = false;
    elements.refreshBtn.disabled = false;
    elements.refreshBtn.textContent = 'Обновить';
  }
}

function setStatus(type, label) {
  elements.statusDot.className = 'status-dot';
  if (type === 'ok') elements.statusDot.classList.add('is-ok');
  if (type === 'error') elements.statusDot.classList.add('is-error');

  elements.statusLabel.textContent = label;
  elements.lastUpdated.textContent = `Обновлено: ${formatDateTime(new Date().toISOString())}`;
}

function setEmptyState(title, text) {
  const titleNode = elements.emptyState.querySelector('strong');
  const textNode = elements.emptyState.querySelector('p');
  if (titleNode) titleNode.textContent = title;
  if (textNode) textNode.textContent = text;
}

function updateSourceFilter() {
  const selected = elements.sourceFilter.value;
  const sources = [...new Set(allNews.map((item) => item.source))].sort((a, b) => a.localeCompare(b));

  elements.sourceFilter.innerHTML = '<option value="all">Все источники</option>';
  for (const source of sources) {
    const option = document.createElement('option');
    option.value = source;
    option.textContent = source;
    elements.sourceFilter.append(option);
  }

  elements.sourceFilter.value = sources.includes(selected) ? selected : 'all';
}

function getFilteredNews() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const source = elements.sourceFilter.value;
  const hours = elements.timeFilter.value;
  const now = Date.now();

  return allNews.filter((item) => {
    const matchesQuery = !query || `${item.title} ${item.source}`.toLowerCase().includes(query);
    const matchesSource = source === 'all' || item.source === source;
    const itemTime = item.publishedAt ? new Date(item.publishedAt).getTime() : NaN;
    const matchesTime = hours === 'all' || (!Number.isNaN(itemTime) && now - itemTime <= Number(hours) * 60 * 60 * 1000);
    return matchesQuery && matchesSource && matchesTime;
  });
}

// ── Translation ──────────────────────────────────────────────────────────────

const BATCH_SIZE = 50;

async function translateBatch(items) {
  // items = [{url, title}, ...], translates via Claude API
  const toTranslate = items.filter(i => !translationCache[i.url]);
  if (!toTranslate.length) return;

  const numbered = toTranslate.map((item, idx) => `${idx + 1}. ${item.title}`).join('\n');
  const prompt = `Переведи на русский язык следующие новостные заголовки. Верни ТОЛЬКО JSON-объект вида {"1": "перевод", "2": "перевод", ...} без пояснений и обёрток:\n\n${numbered}`;

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const map = JSON.parse(clean);
    toTranslate.forEach((item, idx) => {
      const t = map[String(idx + 1)];
      if (t) translationCache[item.url] = t;
    });
  } catch (e) {
    console.warn('Translation error:', e);
  }
}

async function ensureTranslations(items) {
  const needed = items.filter(i => !translationCache[i.url]);
  if (!needed.length) return;

  // show loading indicator on toggle RU label
  const labels = document.querySelectorAll('.toggle-lang');
  const ruLabel = labels[labels.length - 1];
  if (ruLabel) ruLabel.textContent = '…';

  const batches = [];
  for (let i = 0; i < needed.length; i += BATCH_SIZE) {
    batches.push(translateBatch(needed.slice(i, i + BATCH_SIZE)));
  }
  await Promise.all(batches);

  if (ruLabel) ruLabel.textContent = 'RU';
  renderFeed();
}

function getTitle(item) {
  if (translateMode && translationCache[item.url]) return translationCache[item.url];
  return item.title;
}

function getVisibleItems() {
  const headlines = elements.feedList.querySelectorAll('.headline');
  const visible = [];
  const vBottom = window.innerHeight + window.scrollY + 200; // +200px запас
  headlines.forEach(el => {
    if (el.getBoundingClientRect().top + window.scrollY < vBottom) {
      const url = el.href;
      const item = getFilteredNews().find(i => i.url === url);
      if (item) visible.push(item);
    }
  });
  return visible;
}


const SOURCE_OWNERSHIP = {
  'The Guardian':               'private',
  'Sky News':                   'private',
  'The Independent':            'private',
  'Channel 4 News':             'state',
  'Euronews':                   'private',
  'Deutsche Welle':             'state',
  'France 24':                  'state',
  'Le Monde':                   'private',
  'AP News':                    'private',
  'NL Times':                   'private',
  'The Local France':           'private',
  'The Local Sweden':           'private',
  'The Portugal News':          'private',
  'Prague Morning':             'private',
  'Greek Reporter':             'private',
  'ERR News':                   'state',
  'LRT English':                'state',
  'LSM English':                'state',
  'Notes from Poland':          'private',
  'BBC World News':             'state',
  'The Hill':                   'private',
  'The Straits Times':          'mixed',
  'The Japan Times':            'private',
  'Middle East Eye':            'private',
  'The Moscow Times':           'private',
  'The Irish Times':            'private',
  'CBC News':                   'state',
  'Global News':                'private',
  'Al Jazeera':                 'state',
  'CBS News':                   'private',
  'Radio Prague International': 'state',
  'Daily News Hungary':         'private',
  'eKathimerini':               'private',
  'Ukrinform':                  'state',
  'Kyiv Independent':           'private',
  'The Kyiv Post':              'private',
  'Interfax Ukraine':           'private',
  'Arab News':                  'mixed',
  'Hurriyet Daily News':        'private',
  'TASS':                       'state',
  'South China Morning Post':   'mixed',
  'The Washington Times':        'private',
  'The Brussels Times':         'private',
  'Cyprus Mail':                'private',
  'Delfi English':              'private',
  'The European Conservative':  'private',
};

function renderFeed() {
  const filteredNews = getFilteredNews();
  elements.feedList.innerHTML = '';

  for (const item of filteredNews) {
    const node = elements.template.content.cloneNode(true);
    const article = node.querySelector('.news-item');
    const source = node.querySelector('.source');
    const time = node.querySelector('time');
    const headline = node.querySelector('.headline');

    source.textContent = item.source;
    const ownerType = SOURCE_OWNERSHIP[item.source];
    if (ownerType) {
      const badge = document.createElement('span');
      badge.className = `ownership-badge ownership-${ownerType}`;
      badge.textContent = ownerType === 'state' ? 'Государственный' : ownerType === 'mixed' ? 'Частично государственный' : 'Частный';
      source.appendChild(badge);
    }
    time.textContent = formatDateTime(item.publishedAt);
    if (item.publishedAt) {
      time.dateTime = item.publishedAt;
    } else {
      time.removeAttribute('datetime');
    }

    headline.textContent = getTitle(item);
    headline.href = item.url;
    headline.setAttribute('aria-label', `${getTitle(item)}. Источник: ${item.source}`);

    article.dataset.source = item.source;
    elements.feedList.append(node);
  }

  const uniqueSources = new Set(allNews.map((item) => item.source));
  elements.totalCount.textContent = allNews.length;
  elements.sourceCount.textContent = uniqueSources.size;
  elements.visibleCount.textContent = `${filteredNews.length} показано`;

  if (allNews.length === 0) {
    setEmptyState('Свежих новостей нет', 'Backend не нашёл материалов за выбранный период или API недоступен.');
  } else {
    setEmptyState('Ничего не найдено', 'Попробуйте убрать фильтры или изменить поисковый запрос.');
  }

  elements.emptyState.hidden = filteredNews.length > 0;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Дата неизвестна';

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Belgrade'
  }).format(date);
}

function debounce(fn, delay = 180) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

elements.searchInput.addEventListener('input', debounce(renderFeed));
elements.sourceFilter.addEventListener('change', renderFeed);
elements.timeFilter.addEventListener('change', renderFeed);
elements.refreshBtn.addEventListener('click', () => loadNews({ force: true }));
elements.translateToggle.addEventListener('change', async (e) => {
  translateMode = e.target.checked;
  if (translateMode) {
    renderFeed();
    // Сначала переводим видимые
    const visible = getVisibleItems();
    await ensureTranslations(visible.map(i => ({ url: i.url, title: i.title })));
    // Потом фоном остальные
    const all = getFilteredNews();
    ensureTranslations(all.map(i => ({ url: i.url, title: i.title })));
  } else {
    renderFeed();
  }
});

// При скролле подгружаем переводы для новых видимых статей
let scrollTimer;
window.addEventListener('scroll', () => {
  if (!translateMode) return;
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    const visible = getVisibleItems();
    const needed = visible.filter(i => !translationCache[i.url]);
    if (needed.length) ensureTranslations(needed.map(i => ({ url: i.url, title: i.title })));
  }, 300);
});

loadNews();
setInterval(loadNews, AUTO_REFRESH_MS);
