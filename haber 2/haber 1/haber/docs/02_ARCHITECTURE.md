# Architecture

Mevcut karmaşık yapıdan, modern ve ölçeklenebilir bir mimariye (Next.js + Prisma) geçiş yapılmıştır.

## Teknoloji Yığını (Stack)
- **Frontend / Backend Çerçevesi:** Next.js (App Router) + TypeScript
- **Stil:** Tailwind CSS
- **Veritabanı ORM:** Prisma (v5.22.0)
- **Veritabanı:** Geliştirme için SQLite, production için PostgreSQL uyumlu (schema.prisma).
- **Dil:** TypeScript

## Dizinsel Yapı
- `src/app/`: Next.js App Router sayfaları ve API uç noktaları.
- `src/components/`: Yeniden kullanılabilir UI bileşenleri (NewsCard, Navbar vb.).
- `src/lib/`: Veritabanı istemcisi (`db.ts`) ve kişiselleştirme algoritmaları (`personalization/`).
- `prisma/`: Veritabanı şeması ve seed verileri.

## Veri Akışı
Kullanıcı tercihleri -> `/api/preferences` -> Prisma (SQLite)
Haber Gösterimi -> `scoring.ts` algoritması -> UI (Dashboard / Newspaper)
Bana Etkisi Ne -> `impactAnalysis.ts` -> `/api/impact`
