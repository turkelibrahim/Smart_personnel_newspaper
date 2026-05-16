export interface NewsFeed {
  category: string;
  url: string;
}

export interface NewsSource {
  slug: string;
  name: string;
  homepage: string;
  feeds: NewsFeed[];
  active: boolean;
  defaultCategory?: string;
  language?: string;
  country?: string;
  type?: string;
  reliabilityScore?: number;
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    slug: "sozcu",
    name: "Sözcü",
    homepage: "https://www.sozcu.com.tr",
    feeds: [
      { category: "genel", url: "https://www.sozcu.com.tr/feeds-haberler" },
      { category: "son-dakika", url: "https://www.sozcu.com.tr/feeds-son-dakika" },
      { category: "gundem", url: "https://www.sozcu.com.tr/feeds-rss-category-gundem" },
      { category: "ekonomi", url: "https://www.sozcu.com.tr/feeds-rss-category-ekonomi" },
      { category: "dunya", url: "https://www.sozcu.com.tr/feeds-rss-category-dunya" },
      { category: "spor", url: "https://www.sozcu.com.tr/feeds-rss-category-spor" },
      { category: "teknoloji", url: "https://www.sozcu.com.tr/feeds-rss-category-bilim-teknoloji" }
    ],
    active: true
  },
  {
    slug: "hurriyet",
    name: "Hürriyet",
    homepage: "https://www.hurriyet.com.tr",
    feeds: [
      { category: "genel", url: "https://www.hurriyet.com.tr/rss/anasayfa" },
      { category: "gundem", url: "https://www.hurriyet.com.tr/rss/gundem" },
      { category: "ekonomi", url: "https://www.hurriyet.com.tr/rss/ekonomi" },
      { category: "dunya", url: "https://www.hurriyet.com.tr/rss/dunya" },
      { category: "spor", url: "https://www.hurriyet.com.tr/rss/spor" },
      { category: "teknoloji", url: "https://www.hurriyet.com.tr/rss/teknoloji" }
    ],
    active: true
  },
  {
    slug: "mynet",
    name: "Mynet Haber",
    homepage: "https://www.mynet.com",
    feeds: [
      { category: "son-dakika", url: "https://www.mynet.com/haber/rss/sondakika" },
      { category: "genel", url: "https://www.mynet.com/haber/rss/gununozeti/" },
      { category: "magazin", url: "https://www.mynet.com/magazin/rss" },
      { category: "spor", url: "https://spor.mynet.com/rss" }
    ],
    active: true
  },
  {
    slug: "ensonhaber",
    name: "Ensonhaber",
    homepage: "https://www.ensonhaber.com",
    feeds: [
      { category: "genel", url: "https://www.ensonhaber.com/rss/ensonhaber.xml" }
    ],
    active: true
  },
  {
    slug: "haberler",
    name: "Haberler.com",
    homepage: "https://www.haberler.com",
    feeds: [
      { category: "son-dakika", url: "https://rss.haberler.com/" }
    ],
    active: true
  },
  {
    slug: "sabah",
    name: "Sabah",
    homepage: "https://www.sabah.com.tr",
    feeds: [
      { category: "genel", url: "https://www.sabah.com.tr/rss/anasayfa.xml" },
      { category: "son-dakika", url: "https://www.sabah.com.tr/rss/sondakika.xml" },
      { category: "gundem", url: "https://www.sabah.com.tr/rss/gundem.xml" },
      { category: "ekonomi", url: "https://www.sabah.com.tr/rss/ekonomi.xml" },
      { category: "dunya", url: "https://www.sabah.com.tr/rss/dunya.xml" },
      { category: "spor", url: "https://www.sabah.com.tr/rss/spor.xml" },
      { category: "teknoloji", url: "https://www.sabah.com.tr/rss/teknoloji.xml" }
    ],
    active: true
  },
  {
    slug: "milliyet",
    name: "Milliyet",
    homepage: "https://www.milliyet.com.tr",
    feeds: [
      { category: "son-dakika", url: "https://www.milliyet.com.tr/rss/rssNew/SonDakikaRss.xml" },
      { category: "gundem", url: "https://www.milliyet.com.tr/rss/rssNew/gundemRss.xml" },
      { category: "ekonomi", url: "https://www.milliyet.com.tr/rss/rssNew/ekonomiRss.xml" },
      { category: "dunya", url: "https://www.milliyet.com.tr/rss/rssNew/dunyaRss.xml" },
      { category: "teknoloji", url: "https://www.milliyet.com.tr/rss/rssNew/teknolojiRss.xml" },
      { category: "magazin", url: "https://www.milliyet.com.tr/rss/rssNew/magazinRss.xml" }
    ],
    active: true
  },
  {
    slug: "haberturk",
    name: "Habertürk",
    homepage: "https://www.haberturk.com",
    feeds: [
      { category: "genel", url: "https://www.haberturk.com/rss" },
      { category: "ekonomi", url: "https://www.haberturk.com/rss/ekonomi.xml" },
      { category: "spor", url: "https://www.haberturk.com/rss/spor.xml" },
      { category: "magazin", url: "https://www.haberturk.com/rss/magazin.xml" }
    ],
    active: true
  },
  {
    slug: "cumhuriyet",
    name: "Cumhuriyet",
    homepage: "https://www.cumhuriyet.com.tr",
    feeds: [
      { category: "son-dakika", url: "https://www.cumhuriyet.com.tr/rss/son_dakika.xml" },
      { category: "genel", url: "https://www.cumhuriyet.com.tr/rss/9.xml" },
      { category: "ekonomi", url: "https://www.cumhuriyet.com.tr/rss/6.xml" },
      { category: "spor", url: "https://www.cumhuriyet.com.tr/rss/11.xml" }
    ],
    active: true
  },
  {
    slug: "ntv",
    name: "NTV",
    homepage: "https://www.ntv.com.tr",
    feeds: [
      { category: "gundem", url: "https://www.ntv.com.tr/gundem.rss" },
      { category: "dunya", url: "https://www.ntv.com.tr/dunya.rss" },
      { category: "ekonomi", url: "https://www.ntv.com.tr/ekonomi.rss" },
      { category: "spor", url: "https://www.ntv.com.tr/spor.rss" },
      { category: "teknoloji", url: "https://www.ntv.com.tr/teknoloji.rss" },
      { category: "yasam", url: "https://www.ntv.com.tr/yasam.rss" },
      { category: "saglik", url: "https://www.ntv.com.tr/saglik.rss" }
    ],
    active: true
  },
  {
    slug: "cnnturk",
    name: "CNN Türk",
    homepage: "https://www.cnnturk.com",
    feeds: [
      { category: "genel", url: "https://www.cnnturk.com/feed/rss/all/news" },
      { category: "gundem", url: "https://www.cnnturk.com/feed/rss/turkiye/news" },
      { category: "dunya", url: "https://www.cnnturk.com/feed/rss/dunya/news" },
      { category: "ekonomi", url: "https://www.cnnturk.com/feed/rss/ekonomi/news" },
      { category: "spor", url: "https://www.cnnturk.com/feed/rss/spor/news" },
      { category: "teknoloji", url: "https://www.cnnturk.com/feed/rss/bilim-teknoloji/news" },
      { category: "saglik", url: "https://www.cnnturk.com/feed/rss/saglik/news" }
    ],
    active: true
  },
  {
    slug: "trthaber",
    name: "TRT Haber",
    homepage: "https://www.trthaber.com",
    feeds: [
      { category: "son-dakika", url: "https://www.trthaber.com/sondakika_articles.rss" },
      { category: "gundem", url: "https://www.trthaber.com/gundem_articles.rss" },
      { category: "dunya", url: "https://www.trthaber.com/dunya_articles.rss" },
      { category: "ekonomi", url: "https://www.trthaber.com/ekonomi_articles.rss" },
      { category: "spor", url: "https://www.trthaber.com/spor_articles.rss" },
      { category: "teknoloji", url: "https://www.trthaber.com/bilim_teknoloji_articles.rss" }
    ],
    active: true
  },
  {
    slug: "haber7",
    name: "Haber7",
    homepage: "https://www.haber7.com",
    feeds: [
      { category: "son-dakika", url: "http://sondakika.haber7.com/sondakika.rss" }
    ],
    active: true
  },
  {
    slug: "yenisafak",
    name: "Yeni Şafak",
    homepage: "https://www.yenisafak.com",
    feeds: [
      { category: "genel", url: "https://www.yenisafak.com/Rss" },
      { category: "gundem", url: "https://www.yenisafak.com/rss?xml=gundem" },
      { category: "ekonomi", url: "https://www.yenisafak.com/rss?xml=ekonomi" },
      { category: "dunya", url: "https://www.yenisafak.com/rss?xml=dunya" },
      { category: "spor", url: "https://www.yenisafak.com/rss?xml=spor" },
      { category: "teknoloji", url: "https://www.yenisafak.com/rss?xml=teknoloji" }
    ],
    active: true
  },
  {
    slug: "ahaber",
    name: "A Haber",
    homepage: "https://www.ahaber.com.tr",
    feeds: [
      { category: "genel", url: "https://www.ahaber.com.tr/rss/anasayfa.xml" },
      { category: "gundem", url: "https://www.ahaber.com.tr/rss/gundem.xml" },
      { category: "ekonomi", url: "https://www.ahaber.com.tr/rss/ekonomi.xml" },
      { category: "spor", url: "https://www.ahaber.com.tr/rss/spor.xml" },
      { category: "dunya", url: "https://www.ahaber.com.tr/rss/dunya.xml" },
      { category: "teknoloji", url: "https://www.ahaber.com.tr/rss/teknoloji.xml" }
    ],
    active: true
  },
  {
    slug: "takvim",
    name: "Takvim",
    homepage: "https://www.takvim.com.tr",
    feeds: [
      { category: "genel", url: "https://www.takvim.com.tr/rss/anasayfa.xml" },
      { category: "son-dakika", url: "https://www.takvim.com.tr/rss/son24saat.xml" },
      { category: "gundem", url: "https://www.takvim.com.tr/rss/guncel.xml" },
      { category: "ekonomi", url: "https://www.takvim.com.tr/rss/ekonomi.xml" },
      { category: "spor", url: "https://www.takvim.com.tr/rss/spor.xml" },
      { category: "yasam", url: "https://www.takvim.com.tr/rss/yasam.xml" }
    ],
    active: true
  },
  {
    slug: "turkiyegazetesi",
    name: "Türkiye Gazetesi",
    homepage: "https://www.turkiyegazetesi.com.tr",
    feeds: [
      { category: "genel", url: "https://www.turkiyegazetesi.com.tr/rss/rss.xml" }
    ],
    active: true
  },
  {
    slug: "yeniakit",
    name: "Yeni Akit",
    homepage: "https://www.yeniakit.com.tr",
    feeds: [
      { category: "genel", url: "https://www.yeniakit.com.tr/rss/haber" },
      { category: "gundem", url: "https://www.yeniakit.com.tr/rss/haber/gundem" },
      { category: "ekonomi", url: "https://www.yeniakit.com.tr/rss/haber/ekonomi" },
      { category: "dunya", url: "https://www.yeniakit.com.tr/rss/haber/dunya" },
      { category: "spor", url: "https://www.yeniakit.com.tr/rss/haber/spor" },
      { category: "teknoloji", url: "https://www.yeniakit.com.tr/rss/haber/teknoloji" }
    ],
    active: true
  },
  {
    slug: "birgun",
    name: "BirGün",
    homepage: "https://www.birgun.net",
    feeds: [
      { category: "genel", url: "https://www.birgun.net/rss" }
    ],
    active: true
  },
  {
    slug: "t24",
    name: "T24",
    homepage: "https://t24.com.tr",
    feeds: [
      { category: "genel", url: "https://t24.com.tr/rss/haberler" }
    ],
    active: true
  }
];
