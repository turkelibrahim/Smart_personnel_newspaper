# Rebuild Notes

## Eski Yapıdan Ne Silindi? Neden Silindi?
- `backend/` klasörü altındaki Python FastAPI ve Celery servisleri, birden fazla SQLite veritabanı dosyası (`news.db`, `celery.sqlite` vb.).
- `js/` ve `css/` içindeki tüm Vanilla JS ve CDN tabanlı Tailwind HTML yapıları.
- **Neden?** Proje karmaşık bir monolit halini almıştı, global DOM manipülasyonu performansı düşürüyor ve bakım zorluğu yaratıyordu. Ayrıca veritabanı yönetimi ORM olmadan zorlaşıyordu.

## Ne Yeniden Kuruldu?
- Next.js (App Router) ile yepyeni bir Full-Stack yapı kuruldu.
- Tailwind CSS, PostCSS ile tam donanımlı olarak Next.js'e entegre edildi.
- Prisma ORM kullanılarak temiz bir SQLite veritabanı şeması oluşturuldu (PostgreSQL uyumlu).
- Tüm modüller (NewsCard, Onboarding, Feed vb.) React/TypeScript bileşenlerine çevrildi.

## Test Sonuçları
- `npm install` ve paket kurulumu başarılı.
- Prisma SQLite migration ve seed işlemi başarılı.
- Onboarding üzerinden tercihler kaydedilip veritabanına aktarılabiliyor.
- `Dashboard` sayfası, kaydedilen tercihleri alıp skorlama algoritmasından geçirerek feed oluşturabiliyor.
- `Newspaper` sayfası gazeteyi istenilen kategorilere göre sorunsuz render ediyor.
