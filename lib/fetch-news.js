import * as cheerio from 'cheerio';
import { SOURCES } from './sources.js';

function envNumber(name, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = process.env[name];
  const parsed = raw === undefined || raw === '' ? fallback : Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function envBoolean(name, fallback = false) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(raw).toLowerCase());
}

function positiveInt(value, fallback, { min = 1, max = 300 } = {}) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

const DEFAULT_TIMEOUT_MS = envNumber('FETCH_TIMEOUT_MS', 10000, { min: 1000, max: 30000 });
const DEFAULT_LIMIT = envNumber('NEWS_LIMIT', 120, { min: 1, max: 300 });
const DEFAULT_MAX_ITEMS_PER_SOURCE = envNumber('MAX_ITEMS_PER_SOURCE', 10, { min: 1, max: 50 });
const DEFAULT_CONCURRENCY = envNumber('SOURCE_CONCURRENCY', 5, { min: 1, max: 10 });
const DEFAULT_SOURCE_LIMIT = envNumber('SOURCE_LIMIT', 25, { min: 1, max: 60 });
const DEFAULT_MAX_ITEM_AGE_HOURS = envNumber('MAX_ITEM_AGE_HOURS', 24, { min: 1, max: 168 });
const DEFAULT_DATE_ENRICH_LIMIT_PER_SOURCE = envNumber('DATE_ENRICH_LIMIT_PER_SOURCE', 12, { min: 0, max: 30 });
const DEFAULT_ARTICLE_FETCH_CONCURRENCY = envNumber('ARTICLE_FETCH_CONCURRENCY', 3, { min: 1, max: 6 });
const INCLUDE_UNDATED_ITEMS = envBoolean('INCLUDE_UNDATED_ITEMS', false);
const ALLOW_MODIFIED_DATES = envBoolean('ALLOW_MODIFIED_DATES', false);
const USE_FEEDS = envBoolean('USE_FEEDS', true);

const USER_AGENT = process.env.NEWSBOT_USER_AGENT ||
  'EU-News-Dashboard/1.0 (+https://example.com; contact: admin@example.com)';

// ИСПРАВЛЕНО: добавлены «service» (Independent /service/cookie-policy.html)
// и «live» как самостоятельный сегмент (BBC /news/live/..., Guardian /world/live/...).
// «live» здесь именно сегмент пути, а не префикс слова — live-blog или live-stream
// тоже попадут, что желательно: live-блоги не являются статьями.
// ИСПРАВЛЕНО: archive(?!\/\d{6,}) и archives(?!\/\d{6,}) — исключение для civil.ge,
// где /archives/NNNNNN (6+ цифр) является форматом статей, не разделом архива.
const SERVICE_URL_RE = /(?:^|\/)(?:about|contacts?|contact-us|kontakt|kontakte|contatti|contacto|privacy|privacy-policy|datenschutz|confidentialite|mentions-legales|cookie|cookies|terms|terms-and-conditions|conditions|newsletter|subscribe|subscription|subscriptions|abonnieren|abo|login|log-in|sign-in|signin|register|account|profile|advertising|jobs|careers|work-for-us|help|faq|customer-service|press|media-kit|impressum|masthead|authors?|contributors?|topics?|tags?|search|rss|feeds?|sitemap|archive(?!\/\d{6,})|archives(?!\/\d{6,})|apps?|video|videos|podcasts?|radio|live(?:-[a-z]+)?|live-tv|weather|sport|sports|service)(?:\/|$|[?#])/i;
const BAD_TITLE_RE = /\b(?:contact|contacts|contact us|kontakt|kontakte|contatti|contacto|about us|about the|privacy|datenschutz|confidentialité|cookie|cookies|terms|conditions|newsletter|subscribe|subscription|abonnieren|sign in|log in|login|register|account|advertising|jobs|careers|help|faq|press office|media kit|rss|sitemap|archive|all topics|all sections|customer service|download our app)\b/i;
const TOO_GENERIC_TITLE_RE = /^(?:home|news|world|europe|uk|france|germany|italy|spain|politics|business|economy|culture|sport|sports|weather|live|video|videos|podcast|podcasts|search|menu|more|latest|latest news|breaking news|read more|show more|view all|see all)$/i;

const DEFAULT_ARTICLE_DATE_SELECTORS = [
  'meta[property="article:published_time"]',
  'meta[property="og:published_time"]',
  'meta[name="article:published_time"]',
  'meta[name="pubdate"]',
  'meta[name="publishdate"]',
  'meta[name="publish-date"]',
  'meta[name="date"]',
  'meta[name="dc.date"]',
  'meta[name="DC.date"]',
  'meta[name="DC.Date"]',
  'meta[name="cXenseParse:recs:publishtime"]',
  'meta[name="sailthru.date"]',
  'meta[name="parsely-pub-date"]',
  'meta[name="parsely-page"]',
  'meta[itemprop="datePublished"]',
  'meta[itemprop="dateCreated"]',
  'meta[property="datePublished"]',
  'time[datetime]',
  '[datetime]'
];

const MONTHS = {
  jan: 1, january: 1, janvier: 1, enero: 1, gennaio: 1, januar: 1, januari: 1,
  feb: 2, february: 2, fevrier: 2, février: 2, febrero: 2, febbraio: 2, februar: 2, februari: 2,
  mar: 3, march: 3, mars: 3, marzo: 3, märz: 3, maerz: 3, maart: 3,
  apr: 4, april: 4, avril: 4, abril: 4, aprile: 4,
  may: 5, mai: 5, mayo: 5, maggio: 5, mei: 5,
  jun: 6, june: 6, juin: 6, junio: 6, giugno: 6, juni: 6,
  jul: 7, july: 7, juillet: 7, julio: 7, luglio: 7, juli: 7,
  aug: 8, august: 8, aout: 8, août: 8, agosto: 8,
  sep: 9, sept: 9, september: 9, septembre: 9, septiembre: 9, settembre: 9,
  oct: 10, october: 10, octobre: 10, octubre: 10, ottobre: 10, oktober: 10,
  nov: 11, november: 11, novembre: 11, noviembre: 11,
  dec: 12, december: 12, decembre: 12, décembre: 12, diciembre: 12, dicembre: 12, dezember: 12
};

const TZ_OFFSETS_MINUTES = {
  UTC: 0, GMT: 0,
  BST: 60,
  WET: 0, WEST: 60,
  CET: 60, CEST: 120,
  EET: 120, EEST: 180,
  MSK: 180
};

function cleanText(value = '') {
  return String(value)
    .replace(/\s+/g, ' ')
    // Убираем мусорные префиксы из заголовков (Euronews и похожие):
    // "Feb 8, 2026 - ", "Updated: ", "Breaking: ", "12:30 PM - "
    .replace(/^(?:[A-Z][a-z]{1,8}\s+\d{1,2},?\s+\d{4}|Updated:?|Breaking:?|\d{1,2}:\d{2}\s*[AP]M)\s*[-–—:]\s*/i, '')
    .replace(/^[\s\-–—:|]+|[\s\-–—:|]+$/g, '')
    .trim();
}

function stripTracking(url) {
  const parsed = new URL(url);
  const removable = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id',
    'fbclid', 'gclid', 'mc_cid', 'mc_eid', 'CMP', 'cid', 'ito'
  ];
  removable.forEach((key) => parsed.searchParams.delete(key));
  parsed.hash = '';
  return parsed.toString();
}

function dateResult(iso, source, precision = 'exact') {
  if (!iso) return null;
  return { iso, source, precision };
}

function toIsoDate(value) {
  if (!value) return null;
  const normalized = String(value).trim();
  if (!normalized) return null;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function buildIsoFromParts({ year, month, day, hour = 0, minute = 0, second = 0, tz = 'UTC' }) {
  const offsetMinutes = parseTimezoneOffset(tz);
  const utcMs = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  const adjusted = new Date(utcMs - offsetMinutes * 60 * 1000);
  if (Number.isNaN(adjusted.getTime())) return null;
  return adjusted.toISOString();
}

function parseTimezoneOffset(value = 'UTC') {
  const clean = String(value).trim().toUpperCase().replace(/\s/g, '');
  if (Object.prototype.hasOwnProperty.call(TZ_OFFSETS_MINUTES, clean)) return TZ_OFFSETS_MINUTES[clean];

  const gmtMatch = clean.match(/^(?:GMT|UTC)?([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (gmtMatch) {
    const [, sign, hh, mm = '0'] = gmtMatch;
    const total = Number(hh) * 60 + Number(mm);
    return sign === '+' ? total : -total;
  }

  return 0;
}

function monthNumber(name) {
  if (!name) return null;
  const key = String(name).toLowerCase().replace('.', '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return MONTHS[key] || null;
}

function parseDateFromUrl(url) {
  const patterns = [
    { re: /\/(20\d{2})\/(\d{2})\/(\d{2})(?:\/|$)/, type: 'ymd-slash' },
    { re: /\/(20\d{2})-(\d{2})-(\d{2})(?:\/|$)/, type: 'ymd-dash' },
    { re: /\/(20\d{2})(\d{2})(\d{2})(?:\/|[-_])/, type: 'ymd-compact' }
  ];

  for (const { re, type } of patterns) {
    const match = url.match(re);
    if (!match) continue;
    const [, year, month, day] = match;
    return dateResult(buildIsoFromParts({ year, month, day }), `url:${type}`, 'date-only');
  }

  const corriereMatch = url.match(/\/(\d{2})_([a-z]{3})_(\d{2})(?:\/|$)/i);
  if (corriereMatch) {
    const [, day, monthName, yearSuffix] = corriereMatch;
    const month = monthNumber(monthName);
    if (month) {
      return dateResult(buildIsoFromParts({ year: `20${yearSuffix}`, month, day }), 'url:dd_mmm_yy', 'date-only');
    }
  }

  return null;
}

function extractDateFromSelector($, selector) {
  const node = $(selector).first();
  if (!node.length) return null;

  const value = node.attr('content') || node.attr('datetime') || node.attr('data-date') || node.attr('data-timestamp') || node.text();
  const iso = parseDateString(value) || toIsoDate(value);
  return iso ? dateResult(iso, `selector:${selector}`, 'exact') : null;
}

function getMetaDate($, source) {
  const selectors = [
    ...(source.datePolicy?.articleDateSelectors || []),
    ...DEFAULT_ARTICLE_DATE_SELECTORS
  ];

  for (const selector of selectors) {
    const result = extractDateFromSelector($, selector);
    if (result) return result;
  }

  return null;
}

function findDateInJsonLdValue(value) {
  if (!value || typeof value !== 'object') return null;

  const preferredDate = value.datePublished || value.dateCreated || value.uploadDate;
  const preferredIso = parseDateString(preferredDate) || toIsoDate(preferredDate);
  if (preferredIso) return dateResult(preferredIso, 'json-ld', 'exact');

  if (ALLOW_MODIFIED_DATES) {
    const modifiedIso = parseDateString(value.dateModified) || toIsoDate(value.dateModified);
    if (modifiedIso) return dateResult(modifiedIso, 'json-ld:dateModified', 'exact');
  }

  const graph = Array.isArray(value['@graph']) ? value['@graph'] : [];
  for (const item of graph) {
    const result = findDateInJsonLdValue(item);
    if (result) return result;
  }

  for (const key of ['mainEntity', 'mainEntityOfPage', 'article', 'newsArticle']) {
    const nested = value[key];
    if (nested && typeof nested === 'object') {
      const result = findDateInJsonLdValue(nested);
      if (result) return result;
    }
  }

  return null;
}

function getJsonLdDate($) {
  const scripts = $('script[type="application/ld+json"]').toArray();

  for (const script of scripts) {
    const raw = $(script).contents().text();
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const values = Array.isArray(parsed) ? parsed : [parsed];
      for (const value of values) {
        const result = findDateInJsonLdValue(value);
        if (result) return result;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function parseDateString(value) {
  if (!value) return null;
  const text = cleanText(value);
  if (!text) return null;

  const direct = toIsoDate(text);
  if (direct) return direct;

  const numericWithTimezone = text.match(/(?:published|updated|stand|date)?\D*(\d{1,2})[./-](\d{1,2})[./-](20\d{2})\D+(\d{1,2})[:.](\d{2})(?:\D*(GMT|UTC|CET|CEST|BST|EET|EEST|[+-]\d{1,2}:?\d{0,2}|GMT[+-]\d{1,2}))?/i);
  if (numericWithTimezone) {
    const [, day, month, year, hour, minute, tz = 'UTC'] = numericWithTimezone;
    return buildIsoFromParts({ year, month, day, hour, minute, tz });
  }

  const isoLoose = text.match(/(20\d{2})-(\d{2})-(\d{2})[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(Z|GMT|UTC|CET|CEST|BST|EET|EEST|[+-]\d{1,2}:?\d{0,2}))?/i);
  if (isoLoose) {
    const [, year, month, day, hour, minute, second = '0', tz = 'UTC'] = isoLoose;
    return buildIsoFromParts({ year, month, day, hour, minute, second, tz });
  }

  const namedMonth = text.match(/(?:mon|tue|wed|thu|fri|sat|sun|lun|mar|mer|jeu|ven|sam|dim|mo|di|mi|do|fr|sa|so)?\.?\s*(\d{1,2})\s+([A-Za-zÀ-ÿ.]+)\s+(20\d{2})\s+(\d{1,2})[.:](\d{2})(?:\s*(GMT|UTC|CET|CEST|BST|EET|EEST|[+-]\d{1,2}:?\d{0,2}))?/i);
  if (namedMonth) {
    const [, day, monthName, year, hour, minute, tz = 'UTC'] = namedMonth;
    const month = monthNumber(monthName);
    if (month) return buildIsoFromParts({ year, month, day, hour, minute, tz });
  }

  const euronewsStyle = text.match(/published\s*on\s*(\d{1,2})\/(\d{1,2})\/(20\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*(GMT[+-]\d{1,2}|UTC[+-]\d{1,2}|CET|CEST|BST)?/i);
  if (euronewsStyle) {
    const [, day, month, year, hour, minute, tz = 'UTC'] = euronewsStyle;
    return buildIsoFromParts({ year, month, day, hour, minute, tz });
  }

  return null;
}

function getVisibleArticleDate($, source) {
  const dateTextSelectors = [
    ...(source.datePolicy?.articleTextSelectors || []),
    'main time',
    'article time',
    '[data-testid*="timestamp"]',
    '[class*="date"]',
    '[class*="time"]',
    '[class*="published"]',
    '[class*="timestamp"]'
  ];

  for (const selector of dateTextSelectors) {
    const nodes = $(selector).slice(0, 12).toArray();
    for (const node of nodes) {
      const text = cleanText($(node).attr('datetime') || $(node).attr('content') || $(node).text());
      const iso = parseDateString(text);
      if (iso) return dateResult(iso, `text:${selector}`, 'exact');
    }
  }

  const bodyText = cleanText($('body').find('p, span, div, time, li, h1, h2, h3').toArray()
    .map((el) => $(el).text().trim())
    .filter(Boolean)
    .join(' ')).slice(0, 12000);
  const patterns = [
    /(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\s+[A-Za-z]+\s+20\d{2}\s+\d{1,2}[.:]\d{2}\s+(?:GMT|BST|CET|CEST|EET|EEST)/i,
    /Published\s*on\s*\d{1,2}\/\d{1,2}\/20\d{2}\s*-\s*\d{1,2}:\d{2}\s*(?:GMT[+-]\d{1,2}|UTC[+-]\d{1,2}|CET|CEST|BST)?/i,
    /Stand:\s*\d{1,2}\.\d{1,2}\.20\d{2}\s+\d{1,2}:\d{2}\s*Uhr/i,
    /\d{1,2}\.\d{1,2}\.20\d{2}\s+\d{1,2}:\d{2}\s*Uhr/i,
    /\d{1,2}\/\d{1,2}\/20\d{2}\s*-\s*\d{1,2}:\d{2}\s*(?:GMT[+-]\d{1,2}|UTC[+-]\d{1,2}|CET|CEST|BST)?/i
  ];

  for (const pattern of patterns) {
    const match = bodyText.match(pattern);
    if (!match) continue;
    const iso = parseDateString(match[0]);
    if (iso) return dateResult(iso, 'text:article-body-regex', 'exact');
  }

  return null;
}

function getDocumentDate($, source, url) {
  return getMetaDate($, source) || getJsonLdDate($) || getVisibleArticleDate($, source) || parseDateFromUrl(url);
}

function findLocalDate($, anchor, url, source) {
  const parent = $(anchor).closest('article, li, [data-testid], [class*="card"], [class*="article"], [class*="story"], [class*="teaser"], [class*="item"], [class*="post"]');

  const listSelectors = [
    ...(source.datePolicy?.listDateSelectors || []),
    'time[datetime]',
    '[datetime]',
    '[data-date]',
    '[data-timestamp]',
    '[class*="date"]',
    '[class*="time"]'
  ];

  for (const selector of listSelectors) {
    const node = parent.find(selector).first();
    if (!node.length) continue;
    const value = node.attr('datetime') || node.attr('content') || node.attr('data-date') || node.attr('data-timestamp') || node.text();
    const iso = parseDateString(value) || toIsoDate(value);
    if (iso) return dateResult(iso, `list:${selector}`, 'exact');
  }

  const anchorValue = $(anchor).attr('data-date') || $(anchor).attr('data-timestamp');
  const anchorIso = parseDateString(anchorValue) || toIsoDate(anchorValue);
  if (anchorIso) return dateResult(anchorIso, 'list:a-data-date', 'exact');

  return parseDateFromUrl(url);
}

function isServiceUrl(url) {
  const parsed = new URL(url);
  if (SERVICE_URL_RE.test(parsed.pathname + parsed.search)) return true;
  if (parsed.pathname === '/' || parsed.pathname.length < 8) return true;
  return false;
}

function isProbablyBadTitle(title) {
  const normalized = cleanText(title);
  if (!normalized) return true;
  if (normalized.length < 14 || normalized.length > 240) return true;
  if (TOO_GENERIC_TITLE_RE.test(normalized)) return true;
  if (BAD_TITLE_RE.test(normalized)) return true;
  if (/^[A-Z\s]{3,}$/.test(normalized) && normalized.split(' ').length <= 4) return true;
  if ((normalized.match(/[|]/g) || []).length > 2) return true;
  return false;
}

function getTitleCandidates($, anchor) {
  const $anchor = $(anchor);
  const closestArticle = $anchor.closest('article');
  const closestCard = $anchor.closest('li, [data-testid], [class*="card"], [class*="article"], [class*="story"], [class*="teaser"], [class*="item"], [class*="post"]');

  return [
    cleanText($anchor.attr('aria-label')),
    cleanText($anchor.attr('title')),
    cleanText($anchor.find('h1, h2, h3').first().text()),
    closestArticle.length ? cleanText(closestArticle.find('h1, h2, h3').first().text()) : '',
    closestCard.length ? cleanText(closestCard.find('h1, h2, h3').first().text()) : '',
    cleanText($anchor.text())
  ].filter(Boolean);
}

function chooseBestTitle($, anchor) {
  const candidates = getTitleCandidates($, anchor);
  const good = candidates.find((candidate) => !isProbablyBadTitle(candidate));
  return good || null;
}

function isFreshEnough(isoDate) {
  if (!isoDate) return INCLUDE_UNDATED_ITEMS;

  const dateMs = new Date(isoDate).getTime();
  if (Number.isNaN(dateMs)) return false;

  const now = Date.now();
  const maxAgeMs = DEFAULT_MAX_ITEM_AGE_HOURS * 60 * 60 * 1000;
  const maxFutureSkewMs = 6 * 60 * 60 * 1000;

  if (dateMs > now + maxFutureSkewMs) return false;
  if (now - dateMs > maxAgeMs) return false;

  return true;
}

function getFeedNodeText($, node, selectors) {
  for (const selector of selectors) {
    const value = cleanText($(node).find(selector).first().text() || $(node).find(selector).first().attr('href'));
    if (value) return value;
  }
  return '';
}

function getFeedNodeLink($, node) {
  const hrefLink = cleanText($(node).find('link[href]').first().attr('href'));
  if (hrefLink) return hrefLink;

  const textLink = cleanText($(node).find('link').first().text());
  if (textLink) return textLink;

  const guidLink = cleanText($(node).find('guid').first().text());
  if (/^https?:\/\//i.test(guidLink)) return guidLink;

  return '';
}

function extractCandidatesFromFeed(xml, source, feedUrl) {
  const $ = cheerio.load(xml, { xmlMode: true });
  const nodes = $('item, entry').toArray();
  const results = [];
  const seenUrls = new Set();

  for (const node of nodes) {
    const rawTitle = getFeedNodeText($, node, ['title']);
    const title = cleanText(rawTitle.replace(/<!\[CDATA\[|\]\]>/g, ''));
    if (isProbablyBadTitle(title)) continue;

    let url;
    try {
      const rawLink = getFeedNodeLink($, node);
      if (!rawLink) continue;
      url = stripTracking(new URL(rawLink, feedUrl).toString());
    } catch {
      continue;
    }

    if (!source.articleUrl.test(url)) continue;
    if (isServiceUrl(url)) continue;
    if (seenUrls.has(url)) continue;

    const dateText = getFeedNodeText($, node, ['pubDate', 'published', 'updated', 'dc\\:date', 'date', 'created']);
    const publishedAt = parseDateString(dateText) || toIsoDate(dateText);

    seenUrls.add(url);
    results.push({
      title,
      source: source.name,
      sourceId: source.id,
      url,
      publishedAt: publishedAt || null,
      fetchedAt: new Date().toISOString(),
      dateSource: publishedAt ? 'feed' : null,
      datePrecision: publishedAt ? 'exact' : null,
      datePolicy: source.datePolicy?.summary || 'feed/list/article metadata'
    });
  }

  return results;
}

function extractCandidatesFromHtml(html, source, listUrl) {
  const $ = cheerio.load(html);
  $('script, style, noscript, svg, form, nav, footer, header').remove();

  const results = [];
  const seenUrls = new Set();

  $('a[href]').each((_, anchor) => {
    const href = $(anchor).attr('href');
    if (!href) return;

    let url;
    try {
      url = stripTracking(new URL(href, listUrl).toString());
    } catch {
      return;
    }

    if (!source.articleUrl.test(url)) return;
    if (isServiceUrl(url)) return;
    if (seenUrls.has(url)) return;

    const title = chooseBestTitle($, anchor);
    if (!title) return;

    const localDate = findLocalDate($, anchor, url, source);

    seenUrls.add(url);
    results.push({
      title,
      source: source.name,
      sourceId: source.id,
      url,
      publishedAt: localDate?.iso || null,
      fetchedAt: new Date().toISOString(),
      dateSource: localDate?.source || null,
      datePrecision: localDate?.precision || null,
      datePolicy: source.datePolicy?.summary || 'generic article metadata + URL/date fallback'
    });
  });

  return results;
}

async function fetchWithTimeout(url, timeoutMs = DEFAULT_TIMEOUT_MS, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const accept = options.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
  const requireHtml = options.requireHtml !== false;

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': accept,
        'Accept-Language': 'en,ru;q=0.8,*;q=0.5'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = response.headers.get('content-type') || '';
    if (requireHtml && !contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFeedWithTimeout(url) {
  return fetchWithTimeout(url, DEFAULT_TIMEOUT_MS, {
    requireHtml: false,
    accept: 'application/rss+xml,application/atom+xml,application/xml,text/xml,*/*;q=0.8'
  });
}

function shouldEnrichArticleDate(item, source) {
  if (!item.publishedAt) return true;
  if (item.datePrecision === 'date-only') return true;
  if (source.datePolicy?.alwaysCheckArticleDate === true) return true;
  return false;
}

async function enrichItemWithArticleDate(item, source, retryCount = 0) {
  if (!shouldEnrichArticleDate(item, source)) return item;

  try {
    const timeoutMs = Math.round(DEFAULT_TIMEOUT_MS * (1 + retryCount * 0.5));
    const html = await fetchWithTimeout(item.url, timeoutMs);
    const $ = cheerio.load(html);
    const articleDate = getDocumentDate($, source, item.url);

    if (!articleDate) return { ...item, articleDateError: 'No article date found' };

    return {
      ...item,
      publishedAt: articleDate.iso,
      dateSource: articleDate.source,
      datePrecision: articleDate.precision
    };
  } catch (error) {
    if (retryCount === 0 && error?.name === 'AbortError') {
      return enrichItemWithArticleDate(item, source, 1);
    }
    return { ...item, articleDateError: error.message };
  }
}

function dedupeItems(items) {
  const byUrl = new Map();
  for (const item of items) {
    if (!item.title || !item.url) continue;
    const existing = byUrl.get(item.url);
    if (!existing) {
      byUrl.set(item.url, item);
      continue;
    }

    const currentHasExact = item.datePrecision === 'exact';
    const existingHasExact = existing.datePrecision === 'exact';
    if ((currentHasExact && !existingHasExact) || (item.publishedAt && !existing.publishedAt)) {
      byUrl.set(item.url, item);
    }
  }

  return [...byUrl.values()].sort((a, b) => {
    const ad = new Date(a.publishedAt || 0).getTime();
    const bd = new Date(b.publishedAt || 0).getTime();
    return bd - ad;
  });
}

async function mapLimit(items, limit, worker) {
  if (!Array.isArray(items) || items.length === 0) return [];

  // items.length is guaranteed to be >= 1 by the early return above.
  const safeLimit = positiveInt(limit, 1, { min: 1, max: items.length });
  const results = [];
  let index = 0;

  async function run() {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }

  const workers = Array.from({ length: Math.min(safeLimit, items.length) }, run);
  await Promise.allSettled(workers);
  return results.filter(Boolean);
}

async function fetchSource(source) {
  const sourceItems = [];
  const errors = [];

  if (USE_FEEDS && Array.isArray(source.feedUrls)) {
    for (const feedUrl of source.feedUrls) {
      try {
        const xml = await fetchFeedWithTimeout(feedUrl);
        sourceItems.push(...extractCandidatesFromFeed(xml, source, feedUrl));
      } catch (error) {
        errors.push({ source: source.name, url: feedUrl, kind: 'feed', message: error.message });
      }
    }
  }

  for (const listUrl of source.listUrls) {
    try {
      const html = await fetchWithTimeout(listUrl);
      sourceItems.push(...extractCandidatesFromHtml(html, source, listUrl));
    } catch (error) {
      errors.push({ source: source.name, url: listUrl, kind: 'html-list', message: error.message });
    }
  }

  const candidates = dedupeItems(sourceItems).slice(0, DEFAULT_MAX_ITEMS_PER_SOURCE * 4);
  const exactFresh = candidates.filter((item) => item.datePrecision === 'exact' && isFreshEnough(item.publishedAt));
  const needsEnrich = candidates
    .filter((item) => shouldEnrichArticleDate(item, source))
    .filter((item) => !item.publishedAt || isFreshEnough(item.publishedAt))
    .filter((item) => item.datePrecision !== 'exact')
    .slice(0, DEFAULT_DATE_ENRICH_LIMIT_PER_SOURCE);

  const enriched = await mapLimit(needsEnrich, DEFAULT_ARTICLE_FETCH_CONCURRENCY, (item) => enrichItemWithArticleDate(item, source));

  const keptItems = dedupeItems([...exactFresh, ...enriched])
    .filter((item) => isFreshEnough(item.publishedAt))
    .slice(0, DEFAULT_MAX_ITEMS_PER_SOURCE);

  const stats = {
    source: source.name,
    id: source.id,
    datePolicy: source.datePolicy?.summary || 'generic article metadata + URL/date fallback',
    candidates: candidates.length,
    exactOnList: candidates.filter((item) => item.datePrecision === 'exact').length,
    dateOnlyOnListOrUrl: candidates.filter((item) => item.datePrecision === 'date-only').length,
    missingDate: candidates.filter((item) => !item.publishedAt).length,
    articleDateChecked: needsEnrich.length,
    articleDateResolved: enriched.filter((item) => item.datePrecision === 'exact').length,
    kept: keptItems.length,
    rejectedUndatedAfterEnrich: enriched.filter((item) => !item.publishedAt).length,
    rejectedStale: dedupeItems([...exactFresh, ...enriched]).filter((item) => item.publishedAt && !isFreshEnough(item.publishedAt)).length,
    feedUrls: Array.isArray(source.feedUrls) ? source.feedUrls.length : 0,
    errors: errors.length
  };

  return { source: source.name, items: keptItems, errors, stats };
}

export async function collectNews(options = {}) {
  const limit = positiveInt(options.limit, DEFAULT_LIMIT, { min: 1, max: 300 });
  const sourceFilter = options.source ? String(options.source).toLowerCase() : null;
  const debug = options.debug === true || options.debug === '1' || options.debug === 'true';

  const selectedSources = sourceFilter
    ? SOURCES.filter((source) => source.id === sourceFilter || source.name.toLowerCase().includes(sourceFilter))
    : SOURCES.slice(0, Math.min(DEFAULT_SOURCE_LIMIT, SOURCES.length));

  const startedAt = new Date().toISOString();
  const sourceResults = await mapLimit(selectedSources, DEFAULT_CONCURRENCY, fetchSource);

  const items = dedupeItems(sourceResults.flatMap((result) => result.items)).slice(0, limit).map((item) => ({
    title: item.title,
    source: item.source,
    publishedAt: item.publishedAt,
    url: item.url,
    dateSource: debug ? item.dateSource : undefined
  }));

  const errors = sourceResults.flatMap((result) => result.errors || []);
  const sourceStats = sourceResults.map((result) => result.stats).filter(Boolean);

  return {
    items,
    meta: {
      startedAt,
      generatedAt: new Date().toISOString(),
      sourceCount: selectedSources.length,
      itemCount: items.length,
      maxItemAgeHours: DEFAULT_MAX_ITEM_AGE_HOURS,
      includeUndatedItems: INCLUDE_UNDATED_ITEMS,
      allowModifiedDates: ALLOW_MODIFIED_DATES,
      useFeeds: USE_FEEDS,
      dateEnrichLimitPerSource: DEFAULT_DATE_ENRICH_LIMIT_PER_SOURCE,
      articleFetchConcurrency: DEFAULT_ARTICLE_FETCH_CONCURRENCY,
      errorCount: errors.length,
      errors: debug || process.env.INCLUDE_FETCH_ERRORS === 'true' ? errors.slice(0, 100) : undefined,
      sourceStats: debug ? sourceStats : undefined
    }
  };
}
