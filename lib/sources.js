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
    id: 'channel4-news',
    name: 'Channel 4 News',
    homepage: 'https://www.channel4.com/news',
    listUrls: ['https://www.channel4.com/news'],
    articleUrl: /^https:\/\/www\.channel4\.com\/news\/.+/i
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

  // ── Немецкоязычные источники ──────────────────────────────────────────────
  {
    id: 'dw',
    name: 'Deutsche Welle',
    homepage: 'https://www.dw.com/en/top-stories/s-9097',
    listUrls: ['https://www.dw.com/en/top-stories/s-9097'],
    // OK: /en/.../a-NNNN достаточно специфично
    articleUrl: /^https:\/\/www\.dw\.com\/en\/.+\/a-\d+/i
  },

  // ── Австрия / Швейцария ───────────────────────────────────────────────────
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
    // Статьи: /eng/section/title/NNNNNNN — числовой ID >=5 цифр обязателен
    // /eng/about-us/, /eng/the-swiss-community/, /eng/debates/ — исключены
    articleUrl: /^https:\/\/www\.swissinfo\.ch\/eng\/(?!about-us\/|the-swiss-community\/|debates\/)[a-z][a-z0-9-]+\/.+\/\d{5,}/i
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
    id: 'le-monde',
    name: 'Le Monde',
    homepage: 'https://www.lemonde.fr/en/',
    listUrls: ['https://www.lemonde.fr/en/'],
    // OK: /en/ + /article/YYYY/MM/DD/ — французская версия намеренно исключена
    articleUrl: /^https:\/\/www\.lemonde\.fr\/en\/[a-z-]+\/article\/\d{4}\/\d{2}\/\d{2}\//i
  },

  // ── Испанские источники ───────────────────────────────────────────────────

  // ── Итальянские источники ─────────────────────────────────────────────────

  // ── Нидерланды / Бельгия ─────────────────────────────────────────────────

  // ── Скандинавия ───────────────────────────────────────────────────────────



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
    listUrls: ['https://www.rferl.org/'],  // /news/ даёт 404
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

  // ── Сербия / Черногория ────────────────────────────────────────────────────
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
    listUrls: [],  // HTML таймаутит; используем только RSS
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
    articleUrl: /^https:\/\/buenosairesherald\.com\/(?!autor\/)(?:article\/)?[a-z-]+\/[a-z0-9-]+/i
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


  // ── Глобальные новостные агентства ───────────────────────────────────────
  {
    id: 'reuters-world',
    name: 'Reuters',
    homepage: 'https://www.reuters.com/world',
    listUrls: ['https://www.reuters.com/world/'],
    articleUrl: /^https:\/\/www\.reuters\.com\/world\/[a-z-]+\/[a-z0-9-]+-\d{4}-\d{2}-\d{2}\//i
  },
  {
    id: 'bbc-world',
    name: 'BBC World News',
    homepage: 'https://www.bbc.com/news/world',
    listUrls: ['https://www.bbc.com/news/world'],
    articleUrl: /^https:\/\/www\.bbc\.(com|co\.uk)\/news\/(?!live\/)(?:articles\/)?[a-z0-9-]+/i
  },
  {
    id: 'foreign-policy',
    name: 'Foreign Policy',
    homepage: 'https://foreignpolicy.com',
    listUrls: ['https://foreignpolicy.com/'],
    articleUrl: /^https:\/\/foreignpolicy\.com\/\d{4}\/\d{2}\/\d{2}\//i
  },

  // ── США ───────────────────────────────────────────────────────────────────
  {
    id: 'the-hill',
    name: 'The Hill',
    homepage: 'https://thehill.com/international',
    listUrls: ['https://thehill.com/international/'],
    articleUrl: /^https:\/\/thehill\.com\/[a-z-]+\/[a-z0-9-]+\/\d+-[a-z0-9-]+\//i
  },

  // ── Азия / Тихоокеанский регион ───────────────────────────────────────────
  {
    id: 'straits-times',
    name: 'The Straits Times',
    homepage: 'https://www.straitstimes.com/world',
    listUrls: ['https://www.straitstimes.com/world'],
    articleUrl: /^https:\/\/www\.straitstimes\.com\/[a-z-]+\/[a-z0-9-]+/i
  },
  {
    id: 'japan-times',
    name: 'The Japan Times',
    homepage: 'https://www.japantimes.co.jp/news',
    listUrls: ['https://www.japantimes.co.jp/news/'],
    articleUrl: /^https:\/\/www\.japantimes\.co\.jp\/news\/\d{4}\/\d{2}\/\d{2}\//i
  },

  // ── Ближний Восток ────────────────────────────────────────────────────────
  {
    id: 'middle-east-eye',
    name: 'Middle East Eye',
    homepage: 'https://www.middleeasteye.net',
    listUrls: ['https://www.middleeasteye.net/'],
    articleUrl: /^https:\/\/www\.middleeasteye\.net\/news\/[a-z0-9-]+/i
  },

  // ── Африка ────────────────────────────────────────────────────────────────
  {
    id: 'africa-report',
    name: 'The Africa Report',
    homepage: 'https://www.theafricareport.com',
    listUrls: ['https://www.theafricareport.com/'],
    articleUrl: /^https:\/\/www\.theafricareport\.com\/\d+\//i
  },

  // ── Россия / диаспора ─────────────────────────────────────────────────────
  {
    id: 'meduza',
    name: 'Meduza',
    homepage: 'https://meduza.io/en',
    listUrls: ['https://meduza.io/en'],
    articleUrl: /^https:\/\/meduza\.io\/en\/[a-z-]+\/\d{4}\/\d{2}\/\d{2}\//i
  },
  {
    id: 'moscow-times',
    name: 'The Moscow Times',
    homepage: 'https://www.themoscowtimes.com/news',
    listUrls: ['https://www.themoscowtimes.com/news'],
    articleUrl: /^https:\/\/www\.themoscowtimes\.com\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+-a\d+/i
  },

  // ── Дополнительные европейские (английский) ───────────────────────────────
  {
    id: 'irish-times',
    name: 'The Irish Times',
    homepage: 'https://www.irishtimes.com/world',
    listUrls: ['https://www.irishtimes.com/world/'],
    articleUrl: /^https:\/\/www\.irishtimes\.com\/(?:[a-z-]+\/)+[a-z0-9-]+\//i
  },
  {
    id: 'france24',
    name: 'France 24',
    homepage: 'https://www.france24.com/en/europe',
    listUrls: ['https://www.france24.com/en/europe/'],
    articleUrl: /^https:\/\/www\.france24\.com\/en\/[a-z]+\/\d{8}-.+/i
  },
  {
    id: 'channel4-news',
    name: 'Channel 4 News',
    homepage: 'https://www.channel4.com/news',
    listUrls: ['https://www.channel4.com/news'],
    articleUrl: /^https:\/\/www\.channel4\.com\/news\/.+/i
  },
  {
    id: 'n1-serbia',
    name: 'N1 Serbia',
    homepage: 'https://n1info.rs/english',
    listUrls: ['https://n1info.rs/english/'],
    articleUrl: /^https:\/\/n1info\.rs\/english\/[a-z-]+\/[a-z0-9-]+\//i
  },


  // ── Украина ───────────────────────────────────────────────────────────────
  {
    id: 'kyiv-independent',
    name: 'Kyiv Independent',
    homepage: 'https://kyivindependent.com',
    listUrls: ['https://kyivindependent.com/'],
    articleUrl: /^https:\/\/kyivindependent\.com\/[a-z0-9-]+\//i
  },
  {
    id: 'ukrinform',
    name: 'Ukrinform',
    homepage: 'https://www.ukrinform.net',
    listUrls: ['https://www.ukrinform.net/'],
    articleUrl: /^https:\/\/www\.ukrinform\.net\/rubric-[a-z]+\/\d+-[a-z0-9-]+\.html/i
  },
  {
    id: 'kyiv-post',
    name: 'The Kyiv Post',
    homepage: 'https://www.kyivpost.com',
    listUrls: ['https://www.kyivpost.com/'],
    articleUrl: /^https:\/\/www\.kyivpost\.com\/post\/\d+/i
  },
  {
    id: 'interfax-ukraine',
    name: 'Interfax Ukraine',
    homepage: 'https://en.interfax.com.ua',
    listUrls: ['https://en.interfax.com.ua/'],
    articleUrl: /^https:\/\/en\.interfax\.com\.ua\/news\/general\/\d+\.html/i
  },

  // ── Ближний Восток ────────────────────────────────────────────────────────
  {
    id: 'jerusalem-post',
    name: 'Jerusalem Post',
    homepage: 'https://www.jpost.com',
    listUrls: ['https://www.jpost.com/international', 'https://www.jpost.com/middle-east'],
    articleUrl: /^https:\/\/www\.jpost\.com\/[a-z-]+\/article-\d+/i
  },
  {
    id: 'times-of-israel',
    name: 'Times of Israel',
    homepage: 'https://www.timesofisrael.com',
    listUrls: ['https://www.timesofisrael.com/'],
    articleUrl: /^https:\/\/www\.timesofisrael\.com\/[a-z0-9-]+\//i
  },
  {
    id: 'arab-news',
    name: 'Arab News',
    homepage: 'https://www.arabnews.com',
    listUrls: ['https://www.arabnews.com/world'],
    articleUrl: /^https:\/\/www\.arabnews\.com\/node\/\d+/i
  },

  // ── Турция ────────────────────────────────────────────────────────────────
  {
    id: 'daily-sabah',
    name: 'Daily Sabah',
    homepage: 'https://www.dailysabah.com',
    listUrls: ['https://www.dailysabah.com/world', 'https://www.dailysabah.com/europe'],
    articleUrl: /^https:\/\/www\.dailysabah\.com\/[a-z-]+\/\d{4}\/\d{2}\/\d{2}\/[a-z0-9-]+/i
  },
  {
    id: 'hurriyet-daily',
    name: 'Hurriyet Daily News',
    homepage: 'https://www.hurriyetdailynews.com',
    listUrls: ['https://www.hurriyetdailynews.com/'],
    articleUrl: /^https:\/\/www\.hurriyetdailynews\.com\/[a-z0-9-]+-\d+/i
  },

  // ── Армения ───────────────────────────────────────────────────────────────
  {
    id: 'armenpress',
    name: 'Armenpress',
    homepage: 'https://armenpress.am/eng',
    listUrls: ['https://armenpress.am/eng/'],
    articleUrl: /^https:\/\/armenpress\.am\/eng\/news\/\d+/i
  },
  {
    id: 'news-am',
    name: 'News.am',
    homepage: 'https://news.am/eng',
    listUrls: ['https://news.am/eng/'],
    articleUrl: /^https:\/\/news\.am\/eng\/news\/\d+\.html/i
  },

  // ── Азербайджан ───────────────────────────────────────────────────────────
  {
    id: 'trend-az',
    name: 'Trend News Agency',
    homepage: 'https://en.trend.az',
    listUrls: ['https://en.trend.az/'],
    articleUrl: /^https:\/\/en\.trend\.az\/(?:[a-z-]+\/)*\d+\.html/i
  },

  // ── Грузия ────────────────────────────────────────────────────────────────
  {
    id: 'georgia-today',
    name: 'Georgia Today',
    homepage: 'https://georgiatoday.ge',
    listUrls: ['https://georgiatoday.ge/'],
    articleUrl: /^https:\/\/georgiatoday\.ge\/news\/\d+\//i
  },

  // ── Россия EN ─────────────────────────────────────────────────────────────
  {
    id: 'tass-english',
    name: 'TASS',
    homepage: 'https://tass.com',
    listUrls: ['https://tass.com/world'],
    articleUrl: /^https:\/\/tass\.com\/[a-z-]+\/\d+/i
  },
  {
    id: 'the-insider',
    name: 'The Insider',
    homepage: 'https://theins.ru/en',
    listUrls: ['https://theins.ru/en/'],
    articleUrl: /^https:\/\/theins\.ru\/en\/[a-z-]+\/\d+/i
  },

  // ── Агрегатор (AP/Reuters/AFP) ────────────────────────────────────────────
  {
    id: 'newser',
    name: 'Newser',
    homepage: 'https://www.newser.com',
    listUrls: ['https://www.newser.com/'],
    // Newser агрегирует AP, Reuters, AFP, NYT и публикует краткие пересказы
    articleUrl: /^https:\/\/www\.newser\.com\/story\/\d+\//i
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
  'kyiv-independent': {
    summary: 'WordPress; URL slug has no date; fetch article metadata',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  ukrinform: {
    summary: 'URL has numeric id; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'kyiv-post': {
    summary: 'URL has numeric post id; fetch article metadata',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  'interfax-ukraine': {
    summary: 'URL has numeric id; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'jerusalem-post': {
    summary: 'URL has numeric article id; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'times-of-israel': {
    summary: 'WordPress; URL slug has no date; fetch article metadata',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  'arab-news': {
    summary: 'Drupal; URL has numeric node id; fetch article metadata',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'daily-sabah': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'hurriyet-daily': {
    summary: 'URL has numeric id; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  armenpress: {
    summary: 'URL has numeric id; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'news-am': {
    summary: 'URL has numeric id; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'trend-az': {
    summary: 'URL has numeric id; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'georgia-today': {
    summary: 'WordPress; URL has numeric id; fetch article metadata',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  'tass-english': {
    summary: 'URL has numeric id; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'the-insider': {
    summary: 'WordPress; URL has numeric id; fetch article metadata',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  newser: {
    summary: 'URL has numeric story id; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'reuters-world': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'bbc-world': {
    summary: 'no stable date in URL; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'meta[name="datePublished"]', 'time[datetime]']
  },
  economist: {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'foreign-policy': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'politico-us': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'the-hill': {
    summary: 'URL has numeric id; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'axios-world': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'straits-times': {
    summary: 'URL slug has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  scmp: {
    summary: 'URL has numeric id; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'japan-times': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'middle-east-eye': {
    summary: 'URL slug has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'al-monitor': {
    summary: 'URL gives month; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'africa-report': {
    summary: 'URL has numeric id; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  meduza: {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'moscow-times': {
    summary: 'URL gives day; fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'irish-times': {
    summary: 'URL slug has no date; fetch article metadata/time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]', 'meta[name="date"]']
  },
  'channel4-news': {
    summary: 'article page timestamp required',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]']
  },
  france24: {
    summary: 'URL gives day (YYYYMMDD); fetch article metadata for exact time',
    articleDateSelectors: ['meta[property="article:published_time"]', 'time[datetime]'],
    alwaysCheckArticleDate: true
  },
  'n1-serbia': {
    summary: 'URL slug has no date; fetch article metadata/time',
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
  swissinfo:         [],  // RSS 410 gone; работает через HTML
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
  // Украина
  'kyiv-independent': ['https://kyivindependent.com/feed/'],
  ukrinform:          ['https://www.ukrinform.net/rss/block-lastnews'],
  'kyiv-post':        ['https://www.kyivpost.com/feed'],
  'interfax-ukraine': ['https://en.interfax.com.ua/news/rss.html'],
  // Ближний Восток
  'jerusalem-post':   ['https://www.jpost.com/Rss/RssFeedsHeadlines.aspx'],
  'times-of-israel':  ['https://www.timesofisrael.com/feed/'],
  'arab-news':        ['https://www.arabnews.com/rss.xml'],
  // Турция
  'daily-sabah':      ['https://www.dailysabah.com/rss'],
  'hurriyet-daily':   ['https://www.hurriyetdailynews.com/rss/'],
  // Армения
  armenpress:         ['https://armenpress.am/eng/rss/news/'],
  'news-am':          ['https://news.am/eng/rss/all-news.rss'],
  // Азербайджан
  'trend-az':         ['https://en.trend.az/rss/'],
  // Грузия
  'georgia-today':    ['https://georgiatoday.ge/feed/'],
  // Россия EN
  'tass-english':     ['https://tass.com/rss/v2.xml'],
  'the-insider':      ['https://theins.ru/en/feed'],
  // Агрегатор
  newser:             ['https://www.newser.com/rss/headlines.xml'],
  // Глобальные агентства
  'reuters-world':   ['https://feeds.reuters.com/reuters/worldNews'],
  'bbc-world':       ['https://feeds.bbci.co.uk/news/world/rss.xml'],
  economist:         ['https://www.economist.com/europe/rss.xml', 'https://www.economist.com/international/rss.xml'],
  'foreign-policy':  ['https://foreignpolicy.com/feed/'],
  // США
  'politico-us':     ['https://www.politico.com/rss/politics08.xml'],
  'the-hill':        ['https://thehill.com/feed/'],
  'axios-world':     ['https://api.axios.com/feed/rss/world'],
  // Азия
  'straits-times':   ['https://www.straitstimes.com/rss/s3a.xml'],
  scmp:              ['https://www.scmp.com/rss/91/feed'],
  'japan-times':     ['https://www.japantimes.co.jp/feed/'],
  // Ближний Восток
  'middle-east-eye': ['https://www.middleeasteye.net/rss'],
  'al-monitor':      ['https://www.al-monitor.com/rss'],
  // Африка
  'africa-report':   ['https://www.theafricareport.com/feed/'],
  // Россия / диаспора
  meduza:            ['https://meduza.io/rss/en/all'],
  'moscow-times':    ['https://www.themoscowtimes.com/rss/news'],
  // Европа английская
  'irish-times':     ['https://www.irishtimes.com/arc/outboundfeeds/feed/?outputType=rss'],
  france24:          ['https://www.france24.com/en/rss'],
  'channel4-news':   [],
  'n1-serbia':       ['https://n1info.rs/feed/'],
  // Кавказ / ЦА
  'civil-georgia':     ['https://civil.ge/feed/'],
  'oc-media':          ['https://oc-media.org/feed/'],
  eurasianet:          [],  // RSS 403; работает через HTML
  rferl:               ['https://www.rferl.org/api/eprkynpb-nqiqpe/20/1/0/0'],
  'evn-report':        [],  // RSS 403; работает через HTML
  'astana-times':      ['https://astanatimes.com/feed/'],
  azernews:            ['https://azernews.az/rss/'],
  'jam-news':          ['https://jam-news.net/feed/'],
  // Сербия / Черногория
  'n1-serbia':         ['https://n1info.rs/feed/'],
  'emerging-europe':   ['https://emerging-europe.com/feed/'],
  'total-montenegro':  ['https://www.total-montenegro-news.com/feed/'],
  // США
  'ap-world':          [],  // rsshub заблокирован; AP работает через HTML listUrl
  'npr-world':         ['https://feeds.npr.org/1004/rss.xml', 'https://feeds.npr.org/1001/rss.xml'],  // добавлен top stories
  // Латинская Америка
  mercopress:          ['https://en.mercopress.com/feed/rss2/all.xml'],  // rss.xml → 404
  'buenos-aires-herald': [],  // RSS 403, работает через HTML
  'brazilian-report':  ['https://brazilian.report/rss/'],  // feed/ → 404
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
