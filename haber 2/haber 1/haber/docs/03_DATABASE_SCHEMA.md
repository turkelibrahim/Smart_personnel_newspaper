# Database Schema

Prisma ORM ile tasarlanmış ilişkisel veritabanı şeması:

## Modeller
1. **User**: Sistemdeki kullanıcılar.
   - `id`, `name`, `email`
2. **UserPreference**: Kullanıcının haber tüketim tercihleri.
   - `profession`, `interests` (JSON Array), `blockedTopics` (JSON Array), `preferredReadingDepth` vb.
   - User ile 1-1 ilişkilidir.
3. **Source**: Haber kaynakları (ör. TechCrunch, Bloomberg).
   - `name`, `url`, `trustScore`
4. **Article**: Haber içerikleri.
   - `title`, `summary`, `content`, `tags` (JSON Array), `importanceScore`, `trustScore`
5. **ArticleCluster**: Benzer haber grupları (ileride NLP/Vector DB için).
6. **NewspaperEdition**: Günlük üretilen gazetelerin kaydedildiği model.
7. **ReadingEvent**: Kullanıcı analitiklerini tutar (view, read, like).
8. **SavedArticle**: Kaydedilen haberler.
