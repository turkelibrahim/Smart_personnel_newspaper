import crypto from 'crypto';
import slugify from 'slugify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const J = JSON.stringify;

function makeSlug(value: string) {
  return slugify(value, { lower: true, strict: true, locale: 'tr' });
}

function makeHash(input: string) {
  return crypto.createHash('md5').update(input).digest('hex');
}

async function main() {
  await prisma.adminLog.deleteMany();
  await prisma.fetchLog.deleteMany();
  await prisma.personalEditionArticle.deleteMany();
  await prisma.personalEdition.deleteMany();
  await prisma.readingHistory.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.eventAnnouncement.deleteMany();
  await prisma.article.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.newsSource.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categorySeeds = [
    { name: 'Gündem', slug: 'gundem', color: '#ef4444', icon: 'newspaper', sortOrder: 1 },
    { name: 'Ekonomi', slug: 'ekonomi', color: '#22c55e', icon: 'chart-column', sortOrder: 2 },
    { name: 'Spor', slug: 'spor', color: '#f97316', icon: 'trophy', sortOrder: 3 },
    { name: 'Teknoloji', slug: 'teknoloji', color: '#3b82f6', icon: 'cpu', sortOrder: 4 },
    { name: 'Dünya', slug: 'dunya', color: '#8b5cf6', icon: 'globe', sortOrder: 5 },
    { name: 'Sağlık', slug: 'saglik', color: '#06b6d4', icon: 'heart-pulse', sortOrder: 6 },
    { name: 'Kültür Sanat', slug: 'kultur-sanat', color: '#ec4899', icon: 'palette', sortOrder: 7 },
    { name: 'Eğitim', slug: 'egitim', color: '#f59e0b', icon: 'graduation-cap', sortOrder: 8 },
    { name: 'Bilim', slug: 'bilim', color: '#14b8a6', icon: 'flask-conical', sortOrder: 9 },
    { name: 'Yerel', slug: 'yerel', color: '#64748b', icon: 'map-pinned', sortOrder: 10 },
  ];

  for (const item of categorySeeds) {
    await prisma.category.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: `${item.name} kategorisi`,
        color: item.color,
        icon: item.icon,
        sortOrder: item.sortOrder,
        isActive: true,
      },
    });
  }

  const categories = await prisma.category.findMany();
  const categoryBySlug = Object.fromEntries(categories.map((item) => [item.slug, item]));

  const user = await prisma.user.create({
    data: {
      name: 'Ibrahim',
      email: 'demo@mypress.ai',
      role: 'ADMIN',
      preference: {
        create: {
          categoryId: categoryBySlug.teknoloji.id,
          weight: 0.95,
          profession: 'yazilimci',
          interests: J(['yapay-zeka', 'teknoloji', 'ekonomi', 'bilim']),
          blockedTopics: J(['magazin', 'astroloji']),
          preferredReadingDepth: 'balanced',
          preferredTone: 'analytical',
          location: 'Istanbul',
        },
      },
    },
  });

  const sources = [
    {
      id: 'webrazzi',
      name: 'Webrazzi',
      type: 'BLOG',
      baseUrl: 'https://webrazzi.com',
      rssUrl: 'https://webrazzi.com/feed',
      url: 'https://webrazzi.com',
      language: 'tr',
      country: 'TR',
      reliabilityScore: 88,
      trustScore: 88,
    },
    {
      id: 'bloomberght',
      name: 'Bloomberg HT',
      type: 'NEWS_PORTAL',
      baseUrl: 'https://www.bloomberght.com',
      rssUrl: 'https://www.bloomberght.com/rss',
      url: 'https://www.bloomberght.com',
      language: 'tr',
      country: 'TR',
      reliabilityScore: 92,
      trustScore: 92,
    },
    {
      id: 'techcrunch',
      name: 'TechCrunch',
      type: 'BLOG',
      baseUrl: 'https://techcrunch.com',
      rssUrl: 'https://techcrunch.com/feed',
      url: 'https://techcrunch.com',
      language: 'en',
      country: 'US',
      reliabilityScore: 90,
      trustScore: 90,
    },
    {
      id: 'hurriyet',
      name: 'Hurriyet',
      type: 'NEWSPAPER',
      baseUrl: 'https://www.hurriyet.com.tr',
      rssUrl: 'https://www.hurriyet.com.tr/rss/anasayfa',
      url: 'https://www.hurriyet.com.tr',
      language: 'tr',
      country: 'TR',
      reliabilityScore: 80,
      trustScore: 80,
    },
    {
      id: 'trthaber',
      name: 'TRT Haber',
      type: 'NEWS_PORTAL',
      baseUrl: 'https://www.trthaber.com',
      rssUrl: 'https://www.trthaber.com/sondakika_articles.rss',
      url: 'https://www.trthaber.com',
      language: 'tr',
      country: 'TR',
      reliabilityScore: 91,
      trustScore: 91,
    },
  ];

  for (const source of sources) {
    await prisma.newsSource.create({
      data: {
        ...source,
        isActive: true,
        lastFetchedAt: new Date(),
      },
    });
  }

  const articleSeeds = [
    {
      sourceId: 'webrazzi',
      title: 'OpenAI yeni kurumsal arac setini duyurdu',
      summary: 'Yeni arac seti kurumsal bilgi erisimi, ajan is akislari ve dokuman analizi icin tasarlandi.',
      content: 'Duyuru, yapay zeka destekli is sureclerinde kurumsal verinin daha guvenli sekilde kullanilmasini hedefliyor.',
      originalUrl: 'https://example.com/openai-enterprise-suite',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      author: 'Editor Desk',
      language: 'tr',
      publishedAt: new Date('2026-05-13T08:00:00Z'),
      categorySlug: 'teknoloji',
      reliabilityScore: 88,
      trustScore: 88,
      popularityScore: 78,
      personalizationScore: 96,
      readingTime: 4,
      sentiment: 0.7,
      tags: ['Yapay Zeka', 'OpenAI', 'Kurumsal Yazilim'],
      relatedProfessions: ['Yazilimci', 'Girisimci'],
    },
    {
      sourceId: 'bloomberght',
      title: 'Merkez Bankasi sonrasi piyasalarda yeni denge arayisi',
      summary: 'Faiz patikasi beklentileri kur ve kredi piyasalarinda yeni fiyatlamalari tetikledi.',
      content: 'Analistler, sirketlerin finansman maliyetlerinde kademeli bir degisim bekliyor.',
      originalUrl: 'https://example.com/merkez-bankasi-denge',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
      author: 'Ekonomi Servisi',
      language: 'tr',
      publishedAt: new Date('2026-05-13T07:30:00Z'),
      categorySlug: 'ekonomi',
      reliabilityScore: 92,
      trustScore: 92,
      popularityScore: 72,
      personalizationScore: 86,
      readingTime: 3,
      sentiment: 0.1,
      tags: ['Faiz', 'Merkez Bankasi', 'Piyasalar'],
      relatedProfessions: ['Yatirimci', 'Girisimci'],
    },
    {
      sourceId: 'hurriyet',
      title: 'YKS basvuru takvimi ve yeni kilavuz yayimlandi',
      summary: 'Ogrenciler icin sinav takvimi, basvuru tarihleri ve yeni soru dagilimi netlesti.',
      content: 'Klavuzda dijital basvuru adimlari ve tercih donemine iliskin yeni notlar yer aliyor.',
      originalUrl: 'https://example.com/yks-kilavuz',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
      author: 'Egitim Masasi',
      language: 'tr',
      publishedAt: new Date('2026-05-12T10:00:00Z'),
      categorySlug: 'egitim',
      reliabilityScore: 80,
      trustScore: 80,
      popularityScore: 61,
      personalizationScore: 58,
      readingTime: 2,
      sentiment: 0.0,
      tags: ['YKS', 'Ogrenci', 'OSYM'],
      relatedProfessions: ['Ogrenci'],
    },
    {
      sourceId: 'trthaber',
      title: 'Saglikta dijital randevu donemi daha genis kapsama yayiliyor',
      summary: 'Kamu hastanelerinde dijital randevu kurallari genisletiliyor ve isleyis sadelelestiriliyor.',
      content: 'Yeni uygulamanin bekleme suresini azaltmasi ve vatandas deneyimini iyilestirmesi hedefleniyor.',
      originalUrl: 'https://example.com/dijital-randevu',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      author: 'Saglik Haberleri',
      language: 'tr',
      publishedAt: new Date('2026-05-12T08:00:00Z'),
      categorySlug: 'saglik',
      reliabilityScore: 91,
      trustScore: 91,
      popularityScore: 67,
      personalizationScore: 52,
      readingTime: 2,
      sentiment: 0.3,
      tags: ['Saglik', 'Dijital Kamu', 'Hastane'],
      relatedProfessions: ['Genel'],
    },
    {
      sourceId: 'techcrunch',
      title: 'Yeni agent mode gelistirme sureclerini degistiriyor',
      summary: 'Kod tamamlama yerine gorev bazli calisan ajan yapilari urun gelistirme akisini hizlandiriyor.',
      content: 'Uzun baglam ve dosya seviyesinde planlama ile ajanlar artik sadece kod degil akisi da yonetiyor.',
      originalUrl: 'https://example.com/agent-mode',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
      author: 'Product Team',
      language: 'en',
      publishedAt: new Date('2026-05-13T06:00:00Z'),
      categorySlug: 'teknoloji',
      reliabilityScore: 90,
      trustScore: 90,
      popularityScore: 81,
      personalizationScore: 94,
      readingTime: 4,
      sentiment: 0.8,
      tags: ['AI Agents', 'Developer Tools', 'Copilot'],
      relatedProfessions: ['Yazilimci'],
    },
    {
      sourceId: 'webrazzi',
      title: 'Turkiye girisim ekosisteminde yeni yatirim hizi',
      summary: 'Erken asama teknoloji sirketlerine yonelik ilgi ikinci ceyrekte guclu sekilde suruyor.',
      content: 'SaaS ve yapay zeka odakli sirketler yeni fonlarla buyume planlarini hizlandiriyor.',
      originalUrl: 'https://example.com/girisim-yatirim',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80',
      author: 'Startup Desk',
      language: 'tr',
      publishedAt: new Date('2026-05-13T09:00:00Z'),
      categorySlug: 'ekonomi',
      reliabilityScore: 88,
      trustScore: 88,
      popularityScore: 75,
      personalizationScore: 89,
      readingTime: 3,
      sentiment: 0.6,
      tags: ['Girisimcilik', 'Yatirim', 'SaaS'],
      relatedProfessions: ['Girisimci', 'Yatirimci'],
    },
    {
      sourceId: 'trthaber',
      title: 'Yerel ulasim projesi sehir ici akis verilerini aciyor',
      summary: 'Yeni yerel veri platformu belediye bazli ulasim kararlarini daha gorunur hale getiriyor.',
      content: 'Platform, toplu tasima doluluk ve saat bazli gecikme verilerini kamuya aciklayacak.',
      originalUrl: 'https://example.com/yerel-ulasim-verisi',
      imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
      author: 'Yerel Gundem',
      language: 'tr',
      publishedAt: new Date('2026-05-12T13:00:00Z'),
      categorySlug: 'yerel',
      reliabilityScore: 91,
      trustScore: 91,
      popularityScore: 55,
      personalizationScore: 44,
      readingTime: 3,
      sentiment: 0.2,
      tags: ['Belediye', 'Ulasim', 'Acilan Veri'],
      relatedProfessions: ['Genel'],
    },
    {
      sourceId: 'hurriyet',
      title: 'Kultur sanat sezonunda yeni festival takvimi aciklandi',
      summary: 'Buyuksehirlerde tiyatro, sergi ve konser takvimi yaz sezonu icin netlesti.',
      content: 'Kamu ve ozel kurumlarin ortak takvimi ile etkinlik planlamasi daha kolay hale geliyor.',
      originalUrl: 'https://example.com/festival-takvimi',
      imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
      author: 'Kultur Servisi',
      language: 'tr',
      publishedAt: new Date('2026-05-11T18:00:00Z'),
      categorySlug: 'kultur-sanat',
      reliabilityScore: 80,
      trustScore: 80,
      popularityScore: 49,
      personalizationScore: 40,
      readingTime: 2,
      sentiment: 0.5,
      tags: ['Festival', 'Tiyatro', 'Sergi'],
      relatedProfessions: ['Genel'],
    },
    {
      sourceId: 'trthaber',
      title: 'Uluslararasi enerji koridorlari yeniden gundemde',
      summary: 'Bolgesel enerji hatti projeleri yeni diplomatik gorusmelerle tekrar hiz kazandi.',
      content: 'Gelismeler hem ekonomi hem de dis politika tarafinda yeni etkiler uretebilir.',
      originalUrl: 'https://example.com/enerji-koridorlari',
      imageUrl: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&q=80',
      author: 'Dis Haberler',
      language: 'tr',
      publishedAt: new Date('2026-05-13T05:30:00Z'),
      categorySlug: 'dunya',
      reliabilityScore: 91,
      trustScore: 91,
      popularityScore: 70,
      personalizationScore: 64,
      readingTime: 4,
      sentiment: -0.1,
      tags: ['Enerji', 'Diplomasi', 'Bolge'],
      relatedProfessions: ['Yatirimci', 'Girisimci'],
    },
    {
      sourceId: 'webrazzi',
      title: 'Yeni bilim fonu yapay zeka ve saglik projelerine odaklaniyor',
      summary: 'Arastirma destekleri yapay zeka, biyoteknoloji ve veri bilimi ekseninde buyutuluyor.',
      content: 'Universite ve ozel sektor ortakliklari yeni cagri takvimi ile desteklenecek.',
      originalUrl: 'https://example.com/bilim-fonu',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
      author: 'Arastirma Servisi',
      language: 'tr',
      publishedAt: new Date('2026-05-12T14:00:00Z'),
      categorySlug: 'bilim',
      reliabilityScore: 88,
      trustScore: 88,
      popularityScore: 63,
      personalizationScore: 79,
      readingTime: 4,
      sentiment: 0.6,
      tags: ['Bilim', 'Arastirma', 'Yapay Zeka'],
      relatedProfessions: ['Akademisyen', 'Yazilimci'],
    },
  ];

  const createdArticles = [];

  for (const item of articleSeeds) {
    const category = categoryBySlug[item.categorySlug];
    const slug = makeSlug(item.title);
    const duplicateHash = makeHash(`${item.sourceId}:${item.originalUrl}:${item.title}`);
    const article = await prisma.article.create({
      data: {
        sourceId: item.sourceId,
        title: item.title,
        slug,
        summary: item.summary,
        content: item.content,
        originalUrl: item.originalUrl,
        url: item.originalUrl,
        imageUrl: item.imageUrl,
        author: item.author,
        language: item.language,
        publishedAt: item.publishedAt,
        fetchedAt: new Date(),
        categoryId: category.id,
        category: category.slug,
        reliabilityScore: item.reliabilityScore,
        trustScore: item.trustScore,
        popularityScore: item.popularityScore,
        personalizationScore: item.personalizationScore,
        duplicateHash,
        isDuplicate: false,
        isActive: true,
        importanceScore: Math.max(item.popularityScore, item.personalizationScore),
        readingTime: item.readingTime,
        sentiment: item.sentiment,
        tags: J(item.tags),
        relatedProfessions: J(item.relatedProfessions),
      },
    });

    createdArticles.push({ article, tags: item.tags });
  }

  const uniqueTags = [...new Set(createdArticles.flatMap((item) => item.tags))];
  for (const tagName of uniqueTags) {
    await prisma.tag.create({
      data: {
        name: tagName,
        slug: makeSlug(tagName),
      },
    });
  }

  const tags = await prisma.tag.findMany();
  const tagBySlug = Object.fromEntries(tags.map((item) => [item.slug, item]));

  for (const item of createdArticles) {
    for (const tagName of item.tags) {
      const tag = tagBySlug[makeSlug(tagName)];
      await prisma.articleTag.create({
        data: {
          articleId: item.article.id,
          tagId: tag.id,
        },
      });
    }
  }

  await prisma.bookmark.create({
    data: {
      userId: user.id,
      articleId: createdArticles[0].article.id,
    },
  });

  await prisma.readingHistory.createMany({
    data: [
      {
        userId: user.id,
        articleId: createdArticles[0].article.id,
        readAt: new Date(),
        readingTime: 210,
        scrollDepth: 0.92,
      },
      {
        userId: user.id,
        articleId: createdArticles[1].article.id,
        readAt: new Date(),
        readingTime: 130,
        scrollDepth: 0.67,
      },
    ],
  });

  const edition = await prisma.personalEdition.create({
    data: {
      userId: user.id,
      title: 'MyPress AI Gunluk Ozel Baski',
      type: 'DAILY',
      date: new Date('2026-05-13T00:00:00Z'),
      status: 'READY',
    },
  });

  for (const [index, item] of createdArticles.slice(0, 5).entries()) {
    await prisma.personalEditionArticle.create({
      data: {
        editionId: edition.id,
        articleId: item.article.id,
        position: index + 1,
        reason: index === 0 ? 'Ana manset ve yuksek kisisellestirme skoru' : 'Kategori dengesi ve guncellik',
      },
    });
  }

  await prisma.fetchLog.createMany({
    data: [
      {
        sourceId: 'webrazzi',
        status: 'SUCCESS',
        message: 'RSS basariyla alindi',
        fetchedCount: 24,
        errorCount: 0,
        startedAt: new Date('2026-05-13T05:00:00Z'),
        finishedAt: new Date('2026-05-13T05:00:08Z'),
      },
      {
        sourceId: 'hurriyet',
        status: 'PARTIAL',
        message: 'Bazi gorseller eksik geldi',
        fetchedCount: 18,
        errorCount: 2,
        startedAt: new Date('2026-05-13T05:10:00Z'),
        finishedAt: new Date('2026-05-13T05:10:12Z'),
      },
    ],
  });

  await prisma.adminLog.create({
    data: {
      userId: user.id,
      action: 'INITIAL_SEED',
      entityType: 'SYSTEM',
      entityId: edition.id,
      metadata: J({ editionStatus: 'READY', articleCount: 5 }),
    },
  });

  await prisma.eventAnnouncement.createMany({
    data: [
      {
        title: 'Universite tercih takvimi duyurusu',
        description: 'Egitim odakli kullanicilar icin oncelikli takvim bildirimi.',
        category: 'Eğitim',
        startsAt: new Date('2026-05-20T09:00:00Z'),
        endsAt: new Date('2026-05-30T18:00:00Z'),
        priority: 'HIGH',
        isActive: true,
      },
      {
        title: 'Yerel inovasyon zirvesi',
        description: 'Teknoloji ve girisimcilik odakli etkinlik.',
        category: 'Teknoloji',
        startsAt: new Date('2026-06-02T08:00:00Z'),
        endsAt: new Date('2026-06-02T17:00:00Z'),
        priority: 'MEDIUM',
        isActive: true,
      },
    ],
  });

  console.log(
    `Seeded: 1 user, ${categories.length} categories, ${sources.length} sources, ${createdArticles.length} articles, 1 edition`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
