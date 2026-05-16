# Prisma Workflow

## Local SQLite Hedefi

- `DATABASE_URL` tek bir fiziksel SQLite dosyasini gostermelidir
- Bu projede hedef dosya:
  - `prisma/dev.db`
- Relative SQLite path ifadeleri CLI ve runtime tarafinda farkli cozulme riski tasir

## Inspect Komutlari

- `npm run db:inspect`
- `npm run db:inspect:root`
- `npm run db:inspect:prisma`

Bu komutlar su alanlari raporlar:

- `process.cwd()`
- `DATABASE_URL`
- olasi absolute path cozumleri
- dosya boyutu
- `User`, `Article`, `PersonalEdition` sayilari
- `PersonalEdition` unique index durumu
- `_prisma_migrations` tablosu

## Migration Oncesi Kontroller

1. `npm run db:inspect`
2. `npm run personal-editions:check-duplicates`
3. `npx prisma migrate status`
4. `npx prisma validate`

## Manuel SQL Sonrasi

- `prisma db execute` migration history'ye kayit dusmez
- Bu durumda `_prisma_migrations` ayri olarak degerlendirilmelidir
- `migrate resolve` ancak dogru DB hedefi kesinlestikten ve backup alindiktan sonra dusunulmelidir
- `20260513190000_add_personal_edition_unique` migration'i icin:
  - DB index varligi dogrulandi
  - duplicate check temiz gecti
  - backup alindi
  - `prisma migrate resolve --applied 20260513190000_add_personal_edition_unique` basariyla calisti

## Backup Kurali

- Baseline veya resolve oncesi DB backup zorunludur
- Backup alinmadan migration history duzeltmesi yapilmaz
- DB reset yasaktir

## Migration Sonrasi

1. `npx prisma migrate status`
2. `npx prisma validate`
3. `npm run lint`
4. `npm run build`
5. Runtime smoke:
   - `/api/newspaper/today`
   - `refresh=true`
   - paralel refresh
   - `/newspaper`
   - `/dashboard`
- Hedef durum:
  - `npx prisma migrate status` => `Database schema is up to date!`
