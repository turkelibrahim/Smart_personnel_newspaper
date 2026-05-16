import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@mypress.ai' },
    update: {},
    create: {
      name: 'İbrahim',
      email: 'demo@mypress.ai',
      preference: {
        create: {
          profession: 'Yazılımcı',
          interests: JSON.stringify(['Yapay Zeka', 'Teknoloji', 'Ekonomi', 'Girişimcilik']),
          blockedTopics: JSON.stringify(['Magazin', 'Şiddet haberleri']),
          preferredReadingDepth: 'balanced',
          location: 'Türkiye'
        }
      }
    }
  })
  console.log('Created demo user:', demoUser.name)

  // 2. Create Sources
  const sources = [
    { name: 'TechCrunch', url: 'https://techcrunch.com', type: 'Tech', language: 'en', trustScore: 90.0 },
    { name: 'Wired', url: 'https://wired.com', type: 'Tech', language: 'en', trustScore: 85.0 },
    { name: 'Bloomberg', url: 'https://bloomberg.com', type: 'Economy', language: 'en', trustScore: 95.0 },
    { name: 'Webrazzi', url: 'https://webrazzi.com', type: 'Tech', language: 'tr', trustScore: 88.0 },
  ]

  const createdSources = await Promise.all(
    sources.map((s) => prisma.source.create({ data: s }))
  )
  console.log('Created sources:', createdSources.map(s => s.name).join(', '))

  // 3. Create Articles
  const articles = [
    {
      title: 'OpenAI, GPT-5 Modelini Duyurmaya Hazırlanıyor',
      summary: 'Yapay zeka dünyasında büyük yankı uyandıran OpenAI, yeni nesil dil modeli GPT-5\'i tanıtmaya hazırlanıyor. Yeni modelin çoklu modal yeteneklerinin büyük oranda geliştiği iddia ediliyor.',
      content: 'Uzun süredir beklenen GPT-5 modeli hakkında sızıntılar gelmeye devam ediyor. Sektör uzmanlarına göre yeni model hem görsel hem de işitsel bağlamda daha önce görülmemiş bir anlama kapasitesine sahip olacak. OpenAI yetkililerinden henüz resmi bir tarih açıklaması gelmese de...',
      url: 'https://example.com/openai-gpt-5',
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
      category: 'Teknoloji',
      tags: JSON.stringify(['Yapay Zeka', 'OpenAI', 'LLM']),
      sourceId: createdSources.find(s => s.name === 'Webrazzi')!.id,
      publishedAt: new Date(),
      importanceScore: 95.0,
      readingTime: 3,
      trustScore: 88.0
    },
    {
      title: 'Küresel Piyasalarda Enflasyon Endişesi Sürüyor',
      summary: 'Merkez bankalarının faiz indirim döngüsüne girmesi beklenirken, inatçı enflasyon verileri piyasalarda tedirginlik yaratmaya devam ediyor.',
      content: 'Avrupa ve ABD piyasalarında son açıklanan çekirdek enflasyon verileri, beklentilerin üzerinde geldi. Bu durum, teknoloji hisseleri başta olmak üzere birçok sektörde satış baskısına neden oldu. Analistler, yılın geri kalanında merkez bankalarının atacağı adımların...',
      url: 'https://example.com/global-inflation',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      category: 'Ekonomi',
      tags: JSON.stringify(['Enflasyon', 'Faiz', 'Piyasalar']),
      sourceId: createdSources.find(s => s.name === 'Bloomberg')!.id,
      publishedAt: new Date(),
      importanceScore: 85.0,
      readingTime: 4,
      trustScore: 95.0
    },
    {
      title: 'Girişimcilik Ekosisteminde Yeni Fon Rüzgarı',
      summary: 'Türkiye merkezli yeni kurulan girişim sermayesi fonu, erken aşama teknoloji girişimlerine 50 milyon dolarlık yatırım yapacağını duyurdu.',
      content: 'Özellikle yapay zeka ve fintek dikeyindeki girişimleri hedefleyen yeni VC fonu, Türkiye ekosistemindeki nakit sıkıntısını çözmeyi umuyor. Fon yöneticileri, ilk yatırımlarını bu çeyrek bitmeden açıklayacaklarını belirttiler.',
      url: 'https://example.com/vc-fund-turkey',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80',
      category: 'Girişimcilik',
      tags: JSON.stringify(['Yatırım', 'Girişimcilik', 'VC']),
      sourceId: createdSources.find(s => s.name === 'Webrazzi')!.id,
      publishedAt: new Date(),
      importanceScore: 75.0,
      readingTime: 2,
      trustScore: 85.0
    },
    {
      title: 'Ünlü Şarkıcıdan Olay Yaratacak Açıklamalar',
      summary: 'Son konserinde yaşadığı teknik sorunlar sonrasında ünlü şarkıcı sert açıklamalarda bulundu.',
      content: 'Konser alanında yaşanan ses sistemi arızası nedeniyle...',
      url: 'https://example.com/magazin-haber',
      imageUrl: 'https://images.unsplash.com/photo-1516280440502-62b16cebc2da?auto=format&fit=crop&w=800&q=80',
      category: 'Magazin',
      tags: JSON.stringify(['Müzik', 'Skandal']),
      sourceId: createdSources.find(s => s.name === 'TechCrunch')!.id, // Mock source
      publishedAt: new Date(),
      importanceScore: 30.0,
      readingTime: 1,
      trustScore: 40.0
    }
  ]

  const createdArticles = await Promise.all(
    articles.map(a => prisma.article.create({ data: a }))
  )
  console.log(`Created ${createdArticles.length} articles.`)

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
