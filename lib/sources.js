const RAW_SOURCES = [
  // ── Британские источники ──────────────────────────────────────────────────
  {
    id: 'bbc-europe',
    name: 'BBC News',
    homepage: 'https://www.bbc.com/news/world/europe',
    listUrls: ['https://www.bbc.com/news/world/europe'],
    // ИСПРАВЛЕНО: добавлен (?!live/) чтобы live-блоги (/news/live/...) не матчились
    articleUrl: /^https:\/\/www\.bbc\.(com|co\.uk)\/news\/(?!live\/)(?:articles\/)?[a-z0-9-]+/i
  },
  {
    id: 'guardian-europe',
    name: 'The Guardian',
    homepage: 'https://www.theguardian.com/world/europe-news',
    listUrls: ['https://www.theguardian.com/world/europe-news'],
    // OK: /world/YYYY/mmm/DD/ — live-блоги идут через /world/live/ и не матчатся
    articleUrl: /^https:\/\/www\.theguardian\.com\/[a-z-]+\/\d{4}\/[a-z]{3}\/\d{2}\//i
  },
  {
    id: 'sky-news',
    name: 'Sky News',
    homepage: 'https://news.sky.com/world',
    listUrls: ['https://news.sky.com/world'],
    // OK: /story/ достаточно специфично
    articleUrl: /^https:\/\/news\.sky\.com\/story\//i
  },
  {
    id: 'independent',
    name: 'The Independent',
    homepage: 'https://www.independent.co.uk/news/world/europe',
    listUrls: ['https://www.independent.co.uk/news/world/europe'],
    // OK: сервисные страницы /service/ не блокируются SERVICE_URL_RE, но
    // их заголовки фильтрует BAD_TITLE_RE или title слишком короткий
    articleUrl: /^https:\/\/www\.independent\.co\.uk\/.+\.html/i
  },
  {
    id: 'itv-news',
    name: 'ITV News',
    homepage: 'https://www.itv.com/news',
    listUrls: ['https://www.itv.com/news/world'],
    articleUrl: /^https:\/\/www\.itv\.com\/news\/.+/i
  },
  {
    id: 'channel4-news',
    name: 'Channel 4 News',
    homepage: 'https://www.channel4.com/news',
    listUrls: ['https://www.channel4.com/news'],
    articleUrl: /^https:\/\/www\.channel4\.com\/news\/.+/i
  },
  {
    id: 'financial-times',
    name: 'Financial Times',
    homepage: 'https://www.ft.com/world/europe',
    listUrls: ['https://www.ft.com/world/europe'],
    // ПРИМЕЧАНИЕ: FT за paywall — статьи открываются с редиректом на /login.
    // Дата из HTML статьи не извлекается. RSS FT не предоставляет публичный feed.
    // Источник оставлен: enrich упадёт, но список кандидатов из listUrl будет.
    // Если /api/news?source=financial-times всегда пустой — рассмотреть отключение.
    articleUrl: /^https:\/\/www\.ft\.com\/content\/[a-z0-9-]+/i
  },
  {
    id: 'politico-europe',
    name: 'POLITICO Europe',
    homepage: 'https://www.politico.eu/',
    listUrls: ['https://www.politico.eu/', 'https://www.politico.eu/news/'],
    articleUrl: /^https:\/\/www\.politico\.eu\/article\//i
  },

  // ── Общеевропейские медиа ─────────────────────────────────────────────────
  {
    id: 'euronews',
    name: 'Euronews',
    homepage: 'https://www.euronews.com/news/europe',
    listUrls: ['https://www.euronews.com/news/europe'],
    // ИСПРАВЛЕНО (ранее): добавлена поддержка категорий (/my-europe/, /business/, /green/ и др.)
    articleUrl: /^https:\/\/www\.euronews\.com\/(?:[a-z-]+\/)*\d{4}\/\d{2}\/\d{2}\//i
  },
  {
    id: 'euobserver',
    name: 'EUobserver',
    homepage: 'https://euobserver.com/',
    listUrls: ['https://euobserver.com/', 'https://euobserver.com/world'],
    articleUrl: /^https:\/\/euobserver\.com\/[a-z-]+\/\d+/i
  },
  {
    id: 'euractiv',
    name: 'Euractiv',
    homepage: 'https://www.euractiv.com/',
    listUrls: ['https://www.euractiv.com/'],
    // ИСПРАВЛЕНО: добавлены /brief/ и /analysis/ — Euractiv активно их использует
    articleUrl: /^https:\/\/www\.euractiv\.com\/(?:section\/.+\/news|brief|analysis)\//i
  },

  // ── Немецкоязычные источники ──────────────────────────────────────────────
  {
    id: 'dw',
    name: 'Deutsche Welle',
    homepage: 'https://www.dw.com/en/top-stories/s-9097',
    listUrls: ['https://www.dw.com/en/top-stories/s-9097'],
    // OK: /en/.../a-NNNN достаточно специфично
    articleUrl: /^https:\/\/www\.dw\.com\/en\/.+\/a-\d+/i
  },
  {
    id: 'tagesschau',
    name: 'tagesschau',
    homepage: 'https://www.tagesschau.de/',
    listUrls: ['https://www.tagesschau.de/'],
    // OK: /section/slug-NNN.html
    articleUrl: /^https:\/\/www\.tagesschau\.de\/[a-z-]+\/.+-\d+\.html/i
  },
  {
    id: 'spiegel',
    name: 'DER SPIEGEL',
    homepage: 'https://www.spiegel.de/international/europe/',
    listUrls: ['https://www.spiegel.de/international/europe/'],
    // OK: -a-UUID специфично
    articleUrl: /^https:\/\/www\.spiegel\.de\/.+-a-[a-z0-9-]+/i
  },
  {
    id: 'zeit',
    name: 'ZEIT Online',
    homepage: 'https://www.zeit.de/news',
    listUrls: ['https://www.zeit.de/news'],
    // ИСПРАВЛЕНО: добавлены /kultur/ и /international/ — там публикуются
    // материалы о Европе, которые раньше не попадали в ленту
    articleUrl: /^https:\/\/www\.zeit\.de\/(news|politik|gesellschaft|wirtschaft|kultur|international|europa)\/.+/i
  },
  {
    id: 'faz',
    name: 'FAZ',
    homepage: 'https://www.faz.net/aktuell/',
    listUrls: ['https://www.faz.net/aktuell/'],
    // OK: /aktuell/section/slug-NNNN.html
    articleUrl: /^https:\/\/www\.faz\.net\/aktuell\/.+-\d+\.html/i
  },
  {
    id: 'sueddeutsche',
    name: 'Süddeutsche Zeitung',
    homepage: 'https://www.sueddeutsche.de/',
    listUrls: ['https://www.sueddeutsche.de/'],
    // ИСПРАВЛЕНО: был .+ (слишком широкий, матчил разделы).
    // Реальный формат SZ: /section[/subsection]/slug-1.XXXXXXXX
    articleUrl: /^https:\/\/www\.sueddeutsche\.de\/[a-z][a-z0-9/-]+-1\.\d+/i
  },
  {
    id: 'welt',
    name: 'WELT',
    homepage: 'https://www.welt.de/',
    listUrls: ['https://www.welt.de/'],
    // ИСПРАВЛЕНО: добавлена поддержка /plusNNNNN/ (WELT+ статьи).
    // Ранее только /articleNNNNN/ — упускалась часть актуального контента.
    articleUrl: /^https:\/\/www\.welt\.de\/.+\/(?:article|plus)\d+\//i
  },
  {
    id: 'ntv',
    name: 'n-tv',
    homepage: 'https://www.n-tv.de/',
    listUrls: ['https://www.n-tv.de/'],
    // ИСПРАВЛЕНО: реальный формат n-tv — /section/Slug-articleNNNNNNNN.html
    // где «article» является частью слага, а не отдельным сегментом пути.
    // Старый regex /article\d+\.html требовал /article/ после /, что не соответствует реальности.
    articleUrl: /^https:\/\/www\.n-tv\.de\/.+article\d+\.html/i
  },

  // ── Австрия / Швейцария ───────────────────────────────────────────────────
  {
    id: 'orf',
    name: 'ORF',
    homepage: 'https://orf.at/',
    listUrls: ['https://orf.at/'],
    // ИСПРАВЛЕНО: добавлен поддомен news.orf.at — ORF использует его для
    // HTML-списков статей. RSS покрывает оба домена, но при HTML-парсинге
    // ссылки на news.orf.at/stories/... ранее отбрасывались.
    articleUrl: /^https:\/\/(?:news\.)?orf\.at\/stories\/\d+/i
  },
  {
    id: 'derstandard',
    name: 'DER STANDARD',
    homepage: 'https://www.derstandard.at/',
    listUrls: ['https://www.derstandard.at/'],
    // OK: /story/NNNN специфично
    articleUrl: /^https:\/\/www\.derstandard\.at\/story\/.+/i
  },
  {
    id: 'srf',
    name: 'SRF News',
    homepage: 'https://www.srf.ch/news',
    listUrls: ['https://www.srf.ch/news'],
    // OK: /news/ prefix отсекает /sport/, /kultur/
    articleUrl: /^https:\/\/www\.srf\.ch\/news\/.+/i
  },
  {
    id: 'swissinfo',
    name: 'SWI swissinfo.ch',
    homepage: 'https://www.swissinfo.ch/eng/',
    listUrls: ['https://www.swissinfo.ch/eng/'],
    articleUrl: /^https:\/\/www\.swissinfo\.ch\/eng\/.+/i
  },
  {
    id: 'nzz',
    name: 'NZZ',
    homepage: 'https://www.nzz.ch/english',
    listUrls: ['https://www.nzz.ch/english'],
    // OK: -ld. специфично для NZZ статей
    articleUrl: /^https:\/\/www\.nzz\.ch\/.+-ld\./i
  },

  // ── Французские источники ─────────────────────────────────────────────────
  {
    id: 'france24',
    name: 'France 24',
    homepage: 'https://www.france24.com/en/europe/',
    listUrls: ['https://www.france24.com/en/europe/'],
    // OK: /en/section/YYYYMMDD- специфично
    articleUrl: /^https:\/\/www\.france24\.com\/en\/[a-z]+\/\d{8}-.+/i
  },
  {
    id: 'rfi',
    name: 'RFI',
    homepage: 'https://www.rfi.fr/en/',
    listUrls: ['https://www.rfi.fr/en/'],
    // OK: /en/section/YYYYMMDD- специфично
    articleUrl: /^https:\/\/www\.rfi\.fr\/en\/[a-z-]+\/\d{8}-.+/i
  },
  {
    id: 'le-monde',
    name: 'Le Monde',
    homepage: 'https://www.lemonde.fr/en/',
    listUrls: ['https://www.lemonde.fr/en/'],
    // OK: /en/ + /article/YYYY/MM/DD/ — французская версия намеренно исключена
    articleUrl: /^https:\/\/www\.lemonde\.fr\/en\/[a-z-]+\/article\/\d{4}\/\d{2}\/\d{2}\//i
  },
  {
    id: 'franceinfo',
    name: 'franceinfo',
    homepage: 'https://www.francetvinfo.fr/',
    listUrls: ['https://www.francetvinfo.fr/'],
    articleUrl: /^https:\/\/www\.francetvinfo\.fr\/.+\.html/i
  },
  {
    id: 'lefigaro',
    name: 'Le Figaro',
    homepage: 'https://www.lefigaro.fr/',
    listUrls: ['https://www.lefigaro.fr/'],
    // OK: реальный формат Le Figaro — /section/YYYY/MM/DD/NNNNN-YYYYMMDDARTFIGnnn-slug.php
    // Regex /.+/YYYY/MM/DD/ корректно матчит этот формат.
    articleUrl: /^https:\/\/www\.lefigaro\.fr\/.+\/\d{4}\/\d{2}\/\d{2}\//i
  },
  {
    id: 'liberation',
    name: 'Libération',
    homepage: 'https://www.liberation.fr/',
    listUrls: ['https://www.liberation.fr/'],
    // OK: /section/.../YYYY/MM/DD/ специфично
    articleUrl: /^https:\/\/www\.liberation\.fr\/.+\/\d{4}\/\d{2}\/\d{2}\//i
  },

  // ── Испанские источники ───────────────────────────────────────────────────
  {
    id: 'elpais',
    name: 'EL PAÍS',
    homepage: 'https://english.elpais.com/',
    listUrls: ['https://english.elpais.com/'],
    // OK: /section/YYYY-MM-DD/ специфично
    articleUrl: /^https:\/\/english\.elpais\.com\/[a-z-]+\/\d{4}-\d{2}-\d{2}\//i
  },
  {
    id: 'elmundo',
    name: 'El Mundo',
    homepage: 'https://www.elmundo.es/',
    listUrls: ['https://www.elmundo.es/'],
    // OK: /section/YYYY/MM/DD/slug.html специфично
    articleUrl: /^https:\/\/www\.elmundo\.es\/.+\/\d{4}\/\d{2}\/\d{2}\/.+\.html/i
  },
  {
    id: 'rtve',
    name: 'RTVE Noticias',
    homepage: 'https://www.rtve.es/noticias/',
    listUrls: ['https://www.rtve.es/noticias/'],
    // OK: /noticias/YYYYMMDD/ специфично
    articleUrl: /^https:\/\/www\.rtve\.es\/noticias\/\d{8}\/.+/i
  },
  {
    id: 'lavanguardia',
    name: 'La Vanguardia',
    homepage: 'https://www.lavanguardia.com/',
    listUrls: ['https://www.lavanguardia.com/'],
    // OK: /section/YYYYMMDD/slug.html специфично
    articleUrl: /^https:\/\/www\.lavanguardia\.com\/.+\/\d{8}\/.+\.html/i
  },
  {
    id: 'publico-es',
    name: 'Público',
    homepage: 'https://www.publico.es/',
    listUrls: ['https://www.publico.es/'],
    articleUrl: /^https:\/\/www\.publico\.es\/.+\.html/i
  },

  // ── Итальянские источники ─────────────────────────────────────────────────
  {
    id: 'ansa',
    name: 'ANSA',
    homepage: 'https://www.ansa.it/english/',
    listUrls: ['https://www.ansa.it/english/'],
    // OK: /english/news/ специфично, пресс-релизы /english/press_releases/ не матчатся
    articleUrl: /^https:\/\/www\.ansa\.it\/english\/news\/.+\.html/i
  },
  {
    id: 'rainews',
    name: 'RaiNews',
    homepage: 'https://www.rainews.it/',
    listUrls: ['https://www.rainews.it/'],
    // ИСПРАВЛЕНО: добавлена опциональная группа (?:[a-z-]+/)? перед articoli/.
    // Ранее regex требовал обязательный префикс ([a-z]+/articoli/), но главная
    // страница rainews.it ссылается на /articoli/YYYY/MM/... без префикса.
    articleUrl: /^https:\/\/www\.rainews\.it\/(?:[a-z-]+\/)?articoli\/\d{4}\/\d{2}\//i
  },
  {
    id: 'corriere',
    name: 'Corriere della Sera',
    homepage: 'https://www.corriere.it/',
    listUrls: ['https://www.corriere.it/'],
    // OK: /section/DD_monthname_YY/ специфично
    articleUrl: /^https:\/\/www\.corriere\.it\/.+\/\d{2}_[a-z]+_\d{2}\//i
  },
  {
    id: 'repubblica',
    name: 'la Repubblica',
    homepage: 'https://www.repubblica.it/',
    listUrls: ['https://www.repubblica.it/'],
    // OK: /section/YYYY/MM/DD/ специфично
    articleUrl: /^https:\/\/www\.repubblica\.it\/.+\/\d{4}\/\d{2}\/\d{2}\//i
  },
  {
    id: 'ilpost',
    name: 'Il Post',
    homepage: 'https://www.ilpost.it/',
    listUrls: ['https://www.ilpost.it/'],
    // OK: /YYYY/MM/DD/ специфично
    articleUrl: /^https:\/\/www\.ilpost\.it\/\d{4}\/\d{2}\/\d{2}\//i
  },

  // ── Нидерланды / Бельгия ─────────────────────────────────────────────────
  {
    id: 'nos',
    name: 'NOS',
    homepage: 'https://nos.nl/nieuws',
    listUrls: ['https://nos.nl/nieuws'],
    // ИСПРАВЛЕНО: добавлена опциональная группа (?:[a-z0-9-]+/)? перед artikel/.
    // NOS Nieuwsuur и NOS op3 публикуют статьи по /nieuwsuur/artikel/NNN
    // и /op3/artikel/NNN — раньше они отбрасывались.
    articleUrl: /^https:\/\/nos\.nl\/(?:[a-z0-9-]+\/)?artikel\/\d+/i
  },
  {
    id: 'nu',
    name: 'NU.nl',
    homepage: 'https://www.nu.nl/net-binnen',
    listUrls: ['https://www.nu.nl/net-binnen'],
    // OK: /section/NNNN/ специфично
    articleUrl: /^https:\/\/www\.nu\.nl\/.+\/\d+\//i
  },
  {
    id: 'destandaard',
    name: 'De Standaard',
    homepage: 'https://www.standaard.be/',
    listUrls: ['https://www.standaard.be/'],
    // OK: homepage с pathname.length < 8 фильтруется isServiceUrl
    articleUrl: /^https:\/\/www\.standaard\.be\/.+/i
  },
  {
    id: 'brussels-times',
    name: 'The Brussels Times',
    homepage: 'https://www.brusselstimes.com/',
    listUrls: ['https://www.brusselstimes.com/'],
    // ИСПРАВЛЕНО: добавлена опциональная категория (?:[a-z-]+/)? перед цифровым ID.
    // The Brussels Times использует URL вида /belgium/12345/ и /europe/12345/
    // наряду со старым форматом /12345/.
    articleUrl: /^https:\/\/www\.brusselstimes\.com\/(?:[a-z-]+\/)?\d+\//i
  },
  {
    id: 'vrt',
    name: 'VRT NWS',
    homepage: 'https://www.vrt.be/vrtnws/nl/',
    listUrls: ['https://www.vrt.be/vrtnws/nl/'],
    // OK: /vrtnws/nl/ — только нидерландская версия, что соответствует listUrl
    articleUrl: /^https:\/\/www\.vrt\.be\/vrtnws\/nl\/\d{4}\/\d{2}\/\d{2}\//i
  },

  // ── Скандинавия ───────────────────────────────────────────────────────────
  {
    id: 'yle',
    name: 'Yle News',
    homepage: 'https://yle.fi/news',
    listUrls: ['https://yle.fi/news'],
    // OK: /a/NN-NNNN специфично
    articleUrl: /^https:\/\/yle\.fi\/a\/\d+-\d+/i
  },
  {
    id: 'nrk',
    name: 'NRK',
    homepage: 'https://www.nrk.no/nyheter/',
    listUrls: ['https://www.nrk.no/nyheter/'],
    // OK: /section/slug-N.N специфично (числовой суффикс с точкой)
    articleUrl: /^https:\/\/www\.nrk\.no\/[a-z0-9-]+\/.+-\d+\.\d+/i
  },
  {
    id: 'svt',
    name: 'SVT Nyheter',
    homepage: 'https://www.svt.se/nyheter/',
    listUrls: ['https://www.svt.se/nyheter/'],
    // OK: /nyheter/ prefix
    articleUrl: /^https:\/\/www\.svt\.se\/nyheter\/.+/i
  },
  {
    id: 'dr',
    name: 'DR Nyheder',
    homepage: 'https://www.dr.dk/nyheder',
    listUrls: ['https://www.dr.dk/nyheder'],
    // OK: /nyheder/ prefix
    articleUrl: /^https:\/\/www\.dr\.dk\/nyheder\/.+/i
  },



  // ── Кавказ / Центральная Азия ─────────────────────────────────────────────
  {
    id: 'civil-georgia',
    name: 'Civil Georgia',
    homepage: 'https://civil.ge',
    listUrls: ['https://civil.ge/'],
    // ПРИМЕЧАНИЕ: /archives/NNNNNN — формат статей Civil Georgia (не раздел!).
    // SERVICE_URL_RE исправлен чтобы /archives/<6+цифр> не блокировался.
    articleUrl: /^https:\/\/civil\.ge\/archives\/\d{5,}/i
  },
  {
    id: 'oc-media',
    name: 'OC Media',
    homepage: 'https://oc-media.org',
    listUrls: ['https://oc-media.org/'],
    // Покрывает Грузию, Армению, Азербайджан, Северный Кавказ
    articleUrl: /^https:\/\/oc-media\.org\/(?!features\/)[a-z0-9-]+\/$/i
  },
  {
    id: 'eurasianet',
    name: 'Eurasianet',
    homepage: 'https://eurasianet.org',
    listUrls: ['https://eurasianet.org/'],
    // Покрывает Грузию, Армению, Азербайджан, Казахстан, ЦА
    articleUrl: /^https:\/\/eurasianet\.org\/[a-z0-9-]{10,}/i
  },
  {
    id: 'rferl',
    name: 'RFE/RL',
    homepage: 'https://www.rferl.org',
    listUrls: ['https://www.rferl.org/news/'],
    // /a/slug/ID.html — стандартный формат RFE/RL
    articleUrl: /^https:\/\/www\.rferl\.org\/a\/[a-z0-9-]+\/\d+\.html/i
  },
  {
    id: 'evn-report',
    name: 'EVN Report',
    homepage: 'https://evnreport.com',
    listUrls: ['https://evnreport.com/'],
    // Армения — независимый аналитический медиа на английском
    articleUrl: /^https:\/\/evnreport\.com\/[a-z-]+\/[a-z0-9-]+\//i
  },
  {
    id: 'astana-times',
    name: 'The Astana Times',
    homepage: 'https://astanatimes.com',
    listUrls: ['https://astanatimes.com/'],
    // Казахстан — государственное англоязычное издание
    articleUrl: /^https:\/\/astanatimes\.com\/\d{4}\/\d{2}\/[a-z0-9-]+\//i
  },
  {
    id: 'azernews',
    name: 'AzerNews',
    homepage: 'https://azernews.az/en',
    listUrls: ['https://azernews.az/en/'],
    // Азербайджан — /en/section/ID/
    articleUrl: /^https:\/\/azernews\.az\/en\/[a-z]+\/\d+\//i
  },
  {
    id: 'jam-news',
    name: 'JAM News',
    homepage: 'https://jam-news.net',
    listUrls: ['https://jam-news.net/'],
    // Грузия / Армения / Азербайджан — независимое издание
    articleUrl: /^https:\/\/jam-news\.net\/[a-z0-9-]+-\d+\//i
  },

  // ── Сербия / Черногория ────────────────────────────────────────────────────
  {
    id: 'n1-serbia',
    name: 'N1 Serbia',
    homepage: 'https://n1info.rs/english',
    listUrls: ['https://n1info.rs/english/'],
    // Ведущий независимый телеканал Сербии, английская версия
    articleUrl: /^https:\/\/n1info\.rs\/english\/[a-z-]+\/[a-z0-9-]+\//i
  },
  {
    id: 'emerging-europe',
    name: 'Emerging Europe',
    homepage: 'https://emerging-europe.com',
    listUrls: ['https://emerging-europe.com/'],
    // Сербия, Черногория, вся ЦВЕ — деловые и политические новости
    articleUrl: /^https:\/\/emerging-europe\.com\/(?:news|analysis|opinion|business|tech)\/[a-z0-9-]+\//i
  },
  {
    id: 'total-montenegro',
    name: 'Total Montenegro News',
    homepage: 'https://www.total-montenegro-news.com',
    listUrls: ['https://www.total-montenegro-news.com/'],
    // Единственное регулярное англоязычное издание о Черногории
    articleUrl: /^https:\/\/www\.total-montenegro-news\.com\/[a-z-]+\/\d+-[a-z0-9-]+/i
  },

  // ── США ───────────────────────────────────────────────────────────────────
  {
    id: 'ap-world',
    name: 'AP News',
    homepage: 'https://apnews.com',
    listUrls: ['https://apnews.com/world-news'],
    // AP — /article/slug-hash или /article/hash
    articleUrl: /^https:\/\/apnews\.com\/article\/[a-z0-9-]+/i
  },
  {
    id: 'npr-world',
    name: 'NPR World',
    homepage: 'https://www.npr.org/sections/world',
    listUrls: ['https://www.npr.org/sections/world/'],
    // NPR — /YYYY/MM/DD/ID/slug
    articleUrl: /^https:\/\/www\.npr\.org\/\d{4}\/\d{2}\/\d{2}\/\d+\//i
  },

  // ── Латинская Америка ─────────────────────────────────────────────────────
  {
    id: 'mercopress',
    name: 'MercoPress',
    homepage: 'https://en.mercopress.com',
    listUrls: ['https://en.mercopress.com/'],
    // Покрывает Аргентину, Бразилию, Парагвай, Уругвай, Чили
    articleUrl: /^https:\/\/en\.mercopress\.com\/\d{4}\/\d{2}\/\d{2}\//i
  },
  {
    id: 'buenos-aires-herald',
    name: 'Buenos Aires Herald',
    homepage: 'https://buenosairesherald.com',
    listUrls: ['https://buenosairesherald.com/'],
    // Аргентина — старейшая англоязычная газета региона
    articleUrl: /^https:\/\/buenosairesherald\.com\/(?:article|[a-z-]+)\/[a-z0-9-]+/i
  },
  {
    id: 'brazilian-report',
    name: 'The Brazilian Report',
    homepage: 'https://brazilian.report',
    listUrls: ['https://brazilian.report/'],
    // Бразилия — /section/YYYY/MM/DD/slug/
    articleUrl: /^https:\/\/brazilian\.report\/[a-z-]+\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+\//i
  },

  // ── Европа (дополнительные страны) ────────────────────────────────────────
  {
    id: 'nltimes',
    name: 'NL Times',
    homepage: 'https://nltimes.nl',
    listUrls: ['https://nltimes.nl/'],
    // Нидерланды — /YYYY/MM/DD/slug
    articleUrl: /^https:\/\/nltimes\.nl\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+/i
  },
  {
    id: 'thelocal-es',
    name: 'The Local Spain',
    homepage: 'https://www.thelocal.es',
    listUrls: ['https://www.thelocal.es/'],
    // The Local — /YYYYMMDD/slug
    articleUrl: /^https:\/\/www\.thelocal\.es\/\d{8}\//i
  },
  {
    id: 'thelocal-fr',
    name: 'The Local France',
    homepage: 'https://www.thelocal.fr',
    listUrls: ['https://www.thelocal.fr/'],
    articleUrl: /^https:\/\/www\.thelocal\.fr\/\d{8}\//i
  },
  {
    id: 'thelocal-de',
    name: 'The Local Germany',
    homepage: 'https://www.thelocal.de',
    listUrls: ['https://www.thelocal.de/'],
    articleUrl: /^https:\/\/www\.thelocal\.de\/\d{8}\//i
  },
  {
    id: 'thelocal-se',
    name: 'The Local Sweden',
    homepage: 'https://www.thelocal.se',
    listUrls: ['https://www.thelocal.se/'],
    articleUrl: /^https:\/\/www\.thelocal\.se\/\d{8}\//i
  },
  {
    id: 'portugal-news',
    name: 'The Portugal News',
    homepage: 'https://www.theportugalnews.com',
    listUrls: ['https://www.theportugalnews.com/'],
    // /news/YYYY-MM-DD/section/ID
    articleUrl: /^https:\/\/www\.theportugalnews\.com\/news\/\d{4}-\d{2}-\d{2}\//i
  },
  {
    id: 'prague-morning',
    name: 'Prague Morning',
    homepage: 'https://praguemorning.cz',
    listUrls: ['https://praguemorning.cz/'],
    // Чехия — WordPress slug
    articleUrl: /^https:\/\/praguemorning\.cz\/[a-z0-9-]{10,}\//i
  },
  {
    id: 'romania-insider',
    name: 'Romania Insider',
    homepage: 'https://www.romania-insider.com',
    listUrls: ['https://www.romania-insider.com/'],
    // Румыния — slug-based
    articleUrl: /^https:\/\/www\.romania-insider\.com\/[a-z0-9-]+/i
  },
  {
    id: 'greek-reporter',
    name: 'Greek Reporter',
    homepage: 'https://greekreporter.com',
    listUrls: ['https://greekreporter.com/'],
    // Греция — /YYYY/MM/DD/slug/
    articleUrl: /^https:\/\/greekreporter\.com\/\d{4}\/\d{2}\/\d{2}\//i
  },
  {
    id: 'slovak-spectator',
    name: 'The Slovak Spectator',
    homepage: 'https://spectator.sme.sk',
    listUrls: ['https://spectator.sme.sk/'],
    // Словакия — /c/ID/slug.html
    articleUrl: /^https:\/\/spectator\.sme\.sk\/c\/\d+\//i
  },
  {
    id: 'total-croatia',
    name: 'Total Croatia News',
    homepage: 'https://www.total-croatia-news.com',
    listUrls: ['https://www.total-croatia-news.com/'],
    // Хорватия — /section/ID-slug
    articleUrl: /^https:\/\/www\.total-croatia-news\.com\/[a-z-]+\/\d+-[a-z0-9-]+/i
  },
  {
    id: 'kafkadesk',
    name: 'Kafkadesk',
    homepage: 'https://kafkadesk.org',
    listUrls: ['https://kafkadesk.org/'],
    // Польша, Чехия, Словакия, ЦВЕ — /YYYY/MM/DD/slug/
    articleUrl: /^https:\/\/kafkadesk\.org\/\d{4}\/\d{2}\/\d{2}\//i
  },

  // ── Прибалтика / Польша ───────────────────────────────────────────────────
  {
    id: 'err-estonia',
    name: 'ERR News',
    homepage: 'https://news.err.ee',
    listUrls: ['https://news.err.ee/news'],
    // OK: /NNNNNNNN/ numeric id специфично для ERR
    articleUrl: /^https:\/\/news\.err\.ee\/\d+\//i
  },
  {
    id: 'lrt-lithuania',
    name: 'LRT English',
    homepage: 'https://www.lrt.lt/en',
    listUrls: ['https://www.lrt.lt/en/news-in-english'],
    // OK: /news-in-english/N/... специфично
    articleUrl: /^https:\/\/www\.lrt\.lt\/en\/news-in-english\/\d+\//i
  },
  {
    id: 'lsm-latvia',
    name: 'LSM English',
    homepage: 'https://eng.lsm.lv',
    listUrls: ['https://eng.lsm.lv/'],
    // OK: /article/ специфично
    articleUrl: /^https:\/\/eng\.lsm\.lv\/article\//i
  },
  {
    id: 'notes-poland',
    name: 'Notes from Poland',
    homepage: 'https://notesfrompoland.com',
    listUrls: ['https://notesfrompoland.com/'],
    // OK: /YYYY/MM/DD/ специфично для WordPress
    articleUrl: /^https:\/\/notesfrompoland\.com\/\d{4}\/\d{2}\/\d{2}\//i
  },

  // ── Балканы ───────────────────────────────────────────────────────────────
  {
    id: 'balkan-insight',
    name: 'Balkan Insight',
    homepage: 'https://balkaninsight.com/news/',
    listUrls: ['https://balkaninsight.com/news/'],
    // OK: /YYYY/MM/DD/ специфично
    articleUrl: /^https:\/\/balkaninsight\.com\/\d{4}\/\d{2}\/\d{2}\//i
  },
  {
    id: 'index-hr',
    name: 'Index.hr',
    homepage: 'https://www.index.hr/vijesti',
    listUrls: ['https://www.index.hr/vijesti'],
    // OK: /vijesti/clanak/ специфично
    articleUrl: /^https:\/\/www\.index\.hr\/vijesti\/clanak\//i
  }
];


// ── Политики определения даты ─────────────────────────────────────────────

const DEFAULT_DATE_POLICY = {
  summary: 'article page metadata first; list <time>; URL date as fallback',
  listDateSelectors: ['time[datetime]', '[datetime]'],
  articleDateSelectors: [],
  articleTextSelectors: [],
  alwaysCheckArticleDate: false
};

const DATE_POLICIES = {
  'bbc-europe': {
    summary: 'no stable date in URL; fetch article and read metadata/time element',
    articleDateSelectors: ['meta[property="article:published_time"]', 'meta[name="datePublished"]', 'time[datetime]']
  },
  'guardian-europe': {
    summary: 'URL gives day only; fetch article for exact Guardian timestamp',
    articleTextSelectors: ['article time', '[data-gu-name="meta"] time'],
    alwaysCheckArticleDate: true
  },
  'sky-news': {
    summary: 'story URL has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  independent: {
    summary: 'article page metadata/time is authoritative; URL date is not guaranteed',
    articleDateSelectors: ['meta[property="article:published_time"]', 'meta[name="article:published_time"]', 'time[datetime]']
  },
  'itv-news': {
    summary: 'article page timestamp required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  'channel4-news': {
    summary: 'article page timestamp required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  'financial-times': {
    // ПРИМЕЧАНИЕ: FT за paywall — enrich вернёт страницу авторизации без даты.
    // RSS FT не является публичным. Источник останется в ленте только если
    // listUrl отдаёт заголовки в HTML (иногда отдаёт частично).
    summary: 'paywall source; article metadata required but often blocked; no public RSS',
    articleDateSelectors: ['meta[property="article:published_time"]', 'meta[name="article:published_time"]', 'time[datetime]']
  },
  'politico-europe': {
    summary: 'WordPress-style article metadata and visible time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  euronews: {
    summary: 'URL gives day; article page has exact "Published on DD/MM/YYYY - HH:mm GMT+offset"',
    articleTextSelectors: ['article time', '[class*="date"]', '[class*="published"]'],
    alwaysCheckArticleDate: true
  },
  euobserver: {
    summary: 'article page date required; URL id has no date precision',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  euractiv: {
    summary: 'WordPress-style article metadata/time; briefs and analysis also use article:published_time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="parsely-pub-date"]']
  },
  dw: {
    summary: 'DW URL has article id only; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  tagesschau: {
    summary: 'German visible timestamp/"Stand" plus metadata',
    articleTextSelectors: ['time', '[class*="date"]', '[class*="stand"]'],
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  spiegel: {
    summary: 'article metadata required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  zeit: {
    summary: 'article metadata/time required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  faz: {
    summary: 'article metadata/time required; URL id is not enough',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  sueddeutsche: {
    summary: 'article metadata/time required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  welt: {
    summary: 'article metadata/time required; both /article/ and /plus/ URLs covered',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  ntv: {
    summary: 'article metadata or German visible timestamp; slug contains "article" as infix',
    articleTextSelectors: ['time', '[class*="date"]'],
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  orf: {
    summary: 'article metadata/time required; covers both orf.at and news.orf.at',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  derstandard: {
    summary: 'article metadata/time required; story URL id has no date',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  srf: {
    summary: 'article metadata/time required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  swissinfo: {
    summary: 'article metadata/time required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  nzz: {
    summary: 'article metadata/time required; ld id is not a date',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  france24: {
    summary: 'URL gives day (YYYYMMDD); fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  rfi: {
    summary: 'URL gives day (YYYYMMDD); fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'le-monde': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'meta[name="date"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  franceinfo: {
    summary: 'article metadata/time required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  lefigaro: {
    summary: 'URL gives day (/YYYY/MM/DD/); fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  liberation: {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  elpais: {
    summary: 'URL gives day (YYYY-MM-DD); fetch article metadata/time for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'meta[name="date"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  elmundo: {
    summary: 'URL gives day; fetch article metadata/time for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  rtve: {
    summary: 'URL gives day (YYYYMMDD); fetch article metadata/time for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]'],
    alwaysCheckArticleDate: true
  },
  lavanguardia: {
    summary: 'URL gives day (YYYYMMDD); fetch article metadata/time for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'publico-es': {
    summary: 'article metadata/time required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  ansa: {
    summary: 'article metadata/time required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  rainews: {
    summary: 'URL gives month/day; fetch article metadata for exact time; covers /articoli/ and /prefix/articoli/',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  corriere: {
    summary: 'URL gives date in dd_mmm_yy format; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]'],
    alwaysCheckArticleDate: true
  },
  repubblica: {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  ilpost: {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  nos: {
    summary: 'article id URL has no date; covers /artikel/ and /program/artikel/; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  nu: {
    summary: 'article URL id has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  destandaard: {
    summary: 'article metadata/time required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'brussels-times': {
    summary: 'numeric-id URL may be prefixed with category; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  vrt: {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  yle: {
    summary: 'article id URL has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  nrk: {
    summary: 'article metadata/time required; URL numeric suffix is not a date',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  svt: {
    summary: 'article metadata/time required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  dr: {
    summary: 'article metadata/time required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'civil-georgia': {
    summary: 'article id URL has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'oc-media': {
    summary: 'WordPress; URL slug has no date; fetch article metadata',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  eurasianet: {
    summary: 'URL slug has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  rferl: {
    summary: 'URL has numeric article id; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'evn-report': {
    summary: 'WordPress; URL has no date; fetch article metadata',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  'astana-times': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  azernews: {
    summary: 'URL id has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'jam-news': {
    summary: 'URL slug has numeric suffix but no date; fetch article metadata',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  'n1-serbia': {
    summary: 'URL slug has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'emerging-europe': {
    summary: 'URL slug has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'total-montenegro': {
    summary: 'URL has numeric id but no date; fetch article metadata',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  'ap-world': {
    summary: 'AP article URL has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'npr-world': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  mercopress: {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'buenos-aires-herald': {
    summary: 'URL slug has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'brazilian-report': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  nltimes: {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'thelocal-es': {
    summary: 'URL gives day (YYYYMMDD); fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'thelocal-fr': {
    summary: 'URL gives day (YYYYMMDD); fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'thelocal-de': {
    summary: 'URL gives day (YYYYMMDD); fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'thelocal-se': {
    summary: 'URL gives day (YYYYMMDD); fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'portugal-news': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'prague-morning': {
    summary: 'WordPress; URL slug has no date; fetch article metadata',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  'romania-insider': {
    summary: 'URL slug has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'greek-reporter': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'slovak-spectator': {
    summary: 'URL has numeric id but no date; fetch article metadata',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'total-croatia': {
    summary: 'URL has numeric id but no date; fetch article metadata',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  kafkadesk: {
    summary: 'WordPress; URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'err-estonia': {
    summary: 'article metadata/time required; numeric id URL has no date',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'lrt-lithuania': {
    summary: 'article metadata/time required; URL id has no date',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'lsm-latvia': {
    summary: 'article metadata/time required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'notes-poland': {
    summary: 'WordPress; URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'balkan-insight': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'index-hr': {
    summary: 'article metadata/time required; URL has no reliable date',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  }
};


// ── RSS-ленты ─────────────────────────────────────────────────────────────

const FEED_URLS = {
  'bbc-europe':      ['https://feeds.bbci.co.uk/news/world/europe/rss.xml'],
  'guardian-europe': ['https://www.theguardian.com/world/europe-news/rss', 'https://www.theguardian.com/world/rss'],
  'sky-news':        ['https://feeds.skynews.com/feeds/rss/world.xml', 'https://feeds.skynews.com/feeds/rss/home.xml'],
  'politico-europe': ['https://www.politico.eu/feed/'],
  euronews:          ['https://www.euronews.com/rss?format=mrss&level=theme&name=news'],
  euobserver:        ['https://euobserver.com/rss'],
  // ИСПРАВЛЕНО: добавлен feed для briefs (/brief/) — ранее был только /feed/
  euractiv:          ['https://www.euractiv.com/feed/', 'https://www.euractiv.com/brief/feed/'],
  dw:                ['https://rss.dw.com/rdf/rss-en-all'],
  tagesschau:        ['https://www.tagesschau.de/infoservices/alle-meldungen-100~rss2.xml'],
  // ИСПРАВЛЕНО: WELT — добавлен RSS; SPIEGEL — добавлен RSS (ранее оба отсутствовали)
  spiegel:           ['https://www.spiegel.de/schlagzeilen/index.rss'],
  welt:              ['https://www.welt.de/feeds/latest.rss'],
  // ИСПРАВЛЕНО: n-tv — добавлен RSS (ранее отсутствовал)
  ntv:               ['https://www.n-tv.de/rss'],
  zeit:              ['https://newsfeed.zeit.de/news/index'],
  faz:               ['https://www.faz.net/rss/aktuell'],
  sueddeutsche:      ['https://rss.sueddeutsche.de/rss/Alles'],
  orf:               ['https://rss.orf.at/news.xml'],
  derstandard:       ['https://www.derstandard.at/rss'],
  srf:               ['https://www.srf.ch/news/bnf/rss/1646'],
  swissinfo:         ['https://www.swissinfo.ch/eng/feed/'],
  // ИСПРАВЛЕНО: NZZ — добавлен RSS (ранее отсутствовал)
  nzz:               ['https://www.nzz.ch/recent.rss'],
  france24:          ['https://www.france24.com/en/rss'],
  rfi:               ['https://www.rfi.fr/en/rss'],
  'le-monde':        ['https://www.lemonde.fr/rss/une.xml'],
  franceinfo:        ['https://www.francetvinfo.fr/titres.rss'],
  lefigaro:          ['https://www.lefigaro.fr/rss/figaro_actualites.xml'],
  // ИСПРАВЛЕНО: liberation — добавлен RSS (ранее отсутствовал)
  liberation:        ['https://www.liberation.fr/arc/outboundfeeds/rss-all/'],
  elpais:            ['https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada'],
  // ИСПРАВЛЕНО: elmundo, lavanguardia, publico-es — добавлены RSS (ранее отсутствовали)
  elmundo:           ['https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml'],
  lavanguardia:      ['https://www.lavanguardia.com/rss/home.xml'],
  'publico-es':      ['https://www.publico.es/rss'],
  rtve:              ['https://api2.rtve.es/rss/temas_noticias.xml'],
  // ИСПРАВЛЕНО: corriere, repubblica — добавлены RSS (ранее отсутствовали)
  corriere:          ['https://xml2.corriereobjects.it/rss/homepage.xml'],
  repubblica:        ['https://www.repubblica.it/rss/homepage/rss2.0.xml'],
  ansa:              ['https://www.ansa.it/sito/ansait_rss.xml'],
  ilpost:            ['https://www.ilpost.it/feed/'],
  nos:               ['https://feeds.nos.nl/nosnieuwsalgemeen'],
  nu:                ['https://www.nu.nl/rss/Algemeen'],
  // ИСПРАВЛЕНО: destandaard — добавлен RSS (ранее отсутствовал)
  destandaard:       ['https://www.standaard.be/rss/section/8f693cea-dfe8-11e2-a6f3-00144feab49a'],
  'brussels-times':  ['https://www.brusselstimes.com/feed'],
  // ИСПРАВЛЕНО: vrt — добавлен RSS (ранее отсутствовал)
  vrt:               ['https://www.vrt.be/vrtnu/feedbacknews.atom'],
  yle:               ['https://yle.fi/rss/uutiset/tuoreimmat'],
  nrk:               ['https://www.nrk.no/nyheter/siste.rss'],
  svt:               ['https://www.svt.se/nyheter/rss.xml'],
  // ИСПРАВЛЕНО: dr — добавлен RSS (ранее отсутствовал)
  dr:                ['https://www.dr.dk/nyheder/service/feeds/allenyheder'],
  // Кавказ / ЦА
  'civil-georgia':     ['https://civil.ge/feed/'],
  'oc-media':          ['https://oc-media.org/feed/'],
  eurasianet:          ['https://eurasianet.org/rss.xml'],
  rferl:               ['https://www.rferl.org/api/eprkynpb-nqiqpe/20/1/0/0'],
  'evn-report':        ['https://evnreport.com/feed/'],
  'astana-times':      ['https://astanatimes.com/feed/'],
  azernews:            ['https://azernews.az/rss/'],
  'jam-news':          ['https://jam-news.net/feed/'],
  // Сербия / Черногория
  'n1-serbia':         ['https://n1info.rs/feed/'],
  'emerging-europe':   ['https://emerging-europe.com/feed/'],
  'total-montenegro':  ['https://www.total-montenegro-news.com/feed/'],
  // США
  'ap-world':          ['https://rsshub.app/apnews/topics/world-news'],
  'npr-world':         ['https://feeds.npr.org/1004/rss.xml'],
  // Латинская Америка
  mercopress:          ['https://en.mercopress.com/rss.xml'],
  'buenos-aires-herald': ['https://buenosairesherald.com/feed'],
  'brazilian-report':  ['https://brazilian.report/feed/'],
  // Европа дополнительная
  nltimes:             ['https://nltimes.nl/rss.xml'],
  'thelocal-es':       ['https://feeds.thelocal.com/rss/es'],
  'thelocal-fr':       ['https://feeds.thelocal.com/rss/fr'],
  'thelocal-de':       ['https://feeds.thelocal.com/rss/de'],
  'thelocal-se':       ['https://feeds.thelocal.com/rss/se'],
  'portugal-news':     ['https://www.theportugalnews.com/rss'],
  'prague-morning':    ['https://praguemorning.cz/feed/'],
  'romania-insider':   ['https://www.romania-insider.com/feed'],
  'greek-reporter':    ['https://greekreporter.com/feed/'],
  'slovak-spectator':  ['https://spectator.sme.sk/rss/'],
  'total-croatia':     ['https://www.total-croatia-news.com/feed/'],
  kafkadesk:           ['https://kafkadesk.org/feed/'],
  'err-estonia':   ['https://news.err.ee/rss'],
  'lrt-lithuania': ['https://www.lrt.lt/en/rss'],
  'lsm-latvia':    ['https://eng.lsm.lv/rss/'],
  'notes-poland':  ['https://notesfrompoland.com/feed/'],
  'balkan-insight':  ['https://balkaninsight.com/feed/'],
  'index-hr':        ['https://www.index.hr/rss/vijesti']
};


export const SOURCES = RAW_SOURCES.map((source) => ({
  ...source,
  feedUrls: FEED_URLS[source.id] || [],
  datePolicy: {
    ...DEFAULT_DATE_POLICY,
    ...(DATE_POLICIES[source.id] || {})
  }
}));
