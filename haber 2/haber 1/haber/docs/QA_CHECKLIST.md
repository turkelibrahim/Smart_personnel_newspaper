# QA Checklist

## Kurulum Oncesi

- `npm install`
- `.env` dosyasinda `DATABASE_URL` dogru mu kontrol et
- Gerekirse `npx prisma db seed`

## Dogrulama Komutlari

- `npm run db:inspect`
- `npm run db:inspect:root`
- `npm run db:inspect:prisma`
- `npx prisma migrate status`
- `npx prisma validate`
- `npm run lint`
- `npm run build`
- `npm run preferences:normalize`
- `npm run preferences:normalize -- --apply`
- `npm run personal-editions:check-duplicates`
- `npm run personal-editions:cleanup-duplicates`
- `npm run personal-editions:cleanup-duplicates -- --apply`
- `npx prisma migrate dev --name add_personal_edition_unique` veya mevcut ortamda kullanilan esdeger migration akisi

## Preferences API

- `GET /api/preferences`
- `PUT /api/preferences` gecerli body ile 200 donuyor mu
- `POST /api/preferences` geriye uyumlu calisiyor mu
- `interests` array degilse 400
- `blockedTopics` array degilse 400
- `preferredReadingDepth` gecersizse 400
- `preferredTone` gecersizse 400
- `profession` gecersizse 400

## Onboarding

- `/onboarding` aciliyor mu
- Minimum 3 kategori secilmeden adim 2 gecilmiyor mu
- Kaydetme sonrasi dashboard ve gazete olustur secenekleri gorunuyor mu

## Settings

- `/settings` aciliyor mu
- Mevcut preference degerleri yukleniyor mu
- Kaydetme sonrasi bilgi banner gorunuyor mu
- Refresh CTA gorunuyor mu
- Refresh basariliysa `/newspaper` aciliyor mu

## Newspaper

- `GET /api/newspaper/today?refresh=true`
- Hemen ikinci `GET /api/newspaper/today?refresh=true` istegi `429` donuyor mu
- Paralel iki refresh isteginden biri `409` veya `429` donuyor mu
- `/newspaper` aciliyor mu
- Print preview layout bozuluyor mu kontrol et
- Bugunun `PersonalEdition` sayisi `1` kaliyor mu

## PersonalEdition Unique Migration Gate

- `npm run personal-editions:check-duplicates` sonucu `safeForUniqueMigration: true` mu
- Duplicate varsa once `npm run personal-editions:cleanup-duplicates` dry-run raporu incelendi mi
- Apply gerekiyorsa veritabani yedegi alindi mi
- Cleanup apply sonrasi duplicate check tekrar temiz donuyor mu
- Unique migration sonrasi check script hala `safeForUniqueMigration: true` donuyor mu

## Prisma DB Path ve Baseline

- `npm run db:inspect` sonucu runtime aday DB net mi
- `db:inspect:root` ve `db:inspect:prisma` sonuclari birbirini dogruluyor mu
- `_prisma_migrations` tablosu var mi
- `npx prisma migrate status` temiz mi
- Temiz degilse sebep raporlandi mi
- Herhangi bir baseline/resolve oncesi backup alindi mi
- Resolve sonrasi `npx prisma migrate status` tekrar temiz donuyor mu

## Search

- `/search?q=teknoloji`
- `/api/news?limit=abc`
- `/api/news?page=abc`
- `/api/news/trending?limit=abc`
- Bos sonuc durumunda empty state gorunuyor mu
- Search filtre badge alanlari gorunuyor mu
- `Filtreleri temizle` aksiyonu query parametrelerini temizliyor mu

## Bookmark ve History

- Article detail sayfasinda bookmark ekleme
- Bookmark kaldirma
- History tracker article acildiginda hata cikarmiyor mu
- `/api/bookmarks` ve `/api/history` getCurrentUser fallback ile calisiyor mu
- `/bookmarks` aciliyor mu
- Navbar icinde bookmarks/kaydet linki desktop ve mobilde gorunuyor mu
- Bookmarks bosken empty state dogru gorunuyor mu
- Bookmarks sayfasinda kaydi kaldirinca listeden dusuyor mu

## Image Fallback

- Gorseli olan haber karti normal gorunuyor mu
- `imageUrl` bos olan haber placeholder gosteriyor mu
- Bozuk image URL icin fallback placeholder gorunuyor mu
- Home hero gorseli fallback ile layout bozuyor mu
- Detail image fallback layout bozuyor mu
- Newspaper print goruntusu bozulmuyor mu

## Final Smoke Checklist

- `/`
- `/bookmarks`
- `/dashboard`
- `/newspaper`
- `/news/[id]`
- `/settings`
- `/onboarding`
- `/profile`
- `GET /api/bookmarks`
- Dashboard filtre badge gorunumu manuel kontrol edildi mi
- Newspaper print preview manuel kontrol edildi mi
- `npm run preferences:normalize` dry-run raporu
- `npm run personal-editions:check-duplicates` dry-run raporu
- `GET /api/news?limit=3`
- `GET /api/news/trending`
- Auth migration oncesi dogrudan `getDemoUser` kullanan route kaldi mi kontrol et
