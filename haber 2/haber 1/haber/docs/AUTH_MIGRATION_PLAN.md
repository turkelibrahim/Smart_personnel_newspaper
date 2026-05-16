# Auth Migration Plan

## Mevcut Durum

- Sistem demo user fallback ile calisiyor
- Merkezi gecis noktasi `src/lib/user/getCurrentUser.ts`
- User-specific endpointler userId ile ayriliyor
- SQLite hedefi inspect komutlari ile dogrulaniyor

## Auth Gelince Yapilacaklar

1. Auth provider secimi
2. `getCurrentUser` fonksiyonunu request-aware hale getirme
3. Demo fallback'i development-only yapma veya kaldirma
4. API route auth guard stratejisini ekleme
5. Auth provider user mapping stratejisini `User` tablosu ile netlestirme
6. Bookmark/history/preferences/newspaper route'larini authenticated user ile dogrulama
7. Cok kullanicili QA testlerini ekleme

## Migration Oncesi Kontrol Listesi

- Dogrudan `getDemoUser` kullanan route kaldi mi
- Hardcoded demo email kaldi mi
- User-specific endpointler cache edilmiyor mu
- `PersonalEdition` duplicate riski icin DB unique migration tamamlandi mi
- `npm run personal-editions:check-duplicates` sonucu `safeForUniqueMigration: true` mi
- Duplicate varsa cleanup yalnizca yedek sonrasi `npm run personal-editions:cleanup-duplicates -- --apply` ile calistirildi mi
- `npm run db:inspect` ile CLI/runtime DB hedefi dogrulandi mi
- `npx prisma migrate status` sonucu baseline durumunu acikca gosteriyor mu
- `_prisma_migrations` eksikse Auth oncesi ayri baseline adimi planlandi mi

## Tamamlanan DB Guclendirmesi

- `PersonalEdition unique(userId, date, type)`
- Bu migration oncesi duplicate gate scriptleri kullanildi
- Auth gecisine giderken bu duplicate riski artik DB seviyesinde kapatilmis durumda
- `db execute` sonrasi `20260513190000_add_personal_edition_unique` icin kontrollu `migrate resolve` tamamlandi
- `npx prisma migrate status` temiz

## Auth Sonrasi QA

- Farkli iki kullanicinin bookmarks ayriliyor mu
- Farkli iki kullanicinin reading history ayriliyor mu
- Preferences cakisiyor mu
- `refresh=true` cooldown key'i user bazli dogru calisiyor mu
