# Production Hardening

## Mevcut Durum

- Demo user tabanli MVP aktif
- `getCurrentUser()` merkezi kullanici alma noktasi olarak kullaniliyor
- Preferences API normalize ve validate ediyor
- PersonalEdition refresh mevcut `refresh=true` davranisi ile calisiyor
- SQLite hedefi inspect edilerek standardize edildi

## Demo User Notu

- Gercek auth bu adimda yok
- Demo user fallback halen merkezde tutuluyor
- Gercek auth gecisinde esas degisecek dosya `src/lib/user/getCurrentUser.ts`

## Preference Cleanup

- Legacy preference verileri icin manuel script eklendi
- Dry-run:
  - `npm run preferences:normalize`
- Apply:
  - `npm run preferences:normalize -- --apply`

Script su alanlari normalize eder:

- `interests`
- `blockedTopics`
- `profession`
- `preferredReadingDepth`
- `preferredTone`
- `categoryId`

## SafeImage ve Remote Hostlar

- Dis RSS gorselleri icin `SafeImage` abstraction kullanilir
- Bilinen hostlar `next/image` icin allowlist edildi
- Allowlist disi hostlarda native fallback kullanilir
- Print yuzeyinde native image davranisi korunabilir

## Rate Limit ve Cooldown

- `GET /api/newspaper/today?refresh=true` ayni kullanici icin in-memory cooldown ile korunur
- MVP ayari:
  - cooldown: 3 dakika
  - in-flight lock: 60 saniye TTL
- Bu strateji tek instance icin uygundur
- Multi-instance veya serverless production icin Redis/Upstash benzeri distributed rate limit gerekir

## Cache Stratejisi

- Cache edilen endpointler:
  - `/api/news`
  - `/api/news/trending`
  - RSS feed fetch katmani
  - source health bilgisi
- Cache edilmeyen user-specific endpointler:
  - `/api/preferences`
  - `/api/bookmarks`
  - `/api/history`
  - `/api/newspaper/today`
  - `/api/impact`

## Cache Invalidation

- `/api/news/refresh` development modunda `rssCache` ve `apiCache` flush eder
- Preference update global news cache flush etmez
- Bookmark/history preference sinyali saglar ama global cache invalidation tetiklemez
- `refresh=true` user-specific edition uretir; route-level response cache kullanilmaz

## Multi-user Readiness

- `UserPreference`, `Bookmark`, `ReadingHistory` ve `PersonalEdition` user bazli ayrilir
- `getCurrentUser()` merkezi gecis noktasi olarak korunur
- Bookmarks/history route'lari de bu helper ile hizalanmistir
- Demo user fallback halen gecici davranistir; gercek auth ile development-only veya kaldirilmis hale getirilmeli

## DB Notlari

- `PersonalEdition` icin DB seviyesinde unique koruma aktif:
  - `unique(userId, date, type)`
- Local SQLite standardi:
  - `DATABASE_URL` absolute path ile `prisma/dev.db` dosyasini gostermeli
  - Relative `file:./dev.db` ifadesi CLI/runtime arasinda farkli cozulebildigi icin risklidir
- Inspect komutlari:
  - `npm run db:inspect`
  - `npm run db:inspect:root`
  - `npm run db:inspect:prisma`
- Unique migration oncesi su komutlar calistirilmali:
  - `npm run personal-editions:check-duplicates`
  - `npm run personal-editions:cleanup-duplicates`
  - `npm run personal-editions:cleanup-duplicates -- --apply`
- Migration gate:
  - `personal-editions:check-duplicates` raporunda `safeForUniqueMigration: true` olmali
- Cleanup apply komutu yalnizca veritabani yedegi alindiktan sonra calistirilmali
- Unique migration sonrasi:
  - duplicate PersonalEdition kayitlari DB seviyesinde engellenir
  - app-level cooldown ve in-flight lock yine korunmalidir
- Manuel `db execute` sonrasi migration history otomatik yazilmaz
- `migrate resolve` veya herhangi bir baseline islemi backup alinmadan uygulanmamalidir
- `20260513190000_add_personal_edition_unique` migration'i icin kontrollu resolve tamamlandi
- Mevcut durumda `npx prisma migrate status` temiz donmektedir
- Auth oncesi Prisma checklist:
  - `npm run db:inspect`
  - `npx prisma migrate status`
  - `npx prisma validate`
  - `npm run build`

## PDF / Print

- `/newspaper` browser print ve PDF kaydet akisi korunmustur
- Print yuzeyinde gorsel davranisi intentionally daha muhafazakar tutulmustur

## Bilinen Riskler

- Yeni RSS kaynaklari farkli image hostlari getirebilir
- `next/image` allowlist yeni host geldikce guncellenmelidir
- in-memory cooldown multi-instance ortamlarda garanti vermez
- Demo user fallback multi-user production davranisi degildir
- Full initial baseline tartismasi ayri bir konu olabilir, ancak mevcut migration history su an bu unique migration icin uyumlu

## Sonraki Oneriler

- Gercek auth
- Server-side PDF
- Admin paneli
- Full-text search
- API rate limiting
- Distributed rate limiting / Redis
- Image host allowlist yonetimi
- `onboardingCompleted` ve `newsIntensity` icin kontrollu migration
