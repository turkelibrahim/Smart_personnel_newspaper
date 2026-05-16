# Personalization Logic

Kişiselleştirme algoritması tamamen `src/lib/personalization` klasörü altında işler. Saf fonksiyonlar kullanılarak hızlı bir skorlama sağlanır.

## Skorlama (`scoring.ts`)
Her haberin temel `importanceScore`'u üzerine ekleme/çıkarma yapılır:
- **Blocklama:** Kategori veya etiket `blockedTopics` içinde ise -100 veya -50 skor cezası.
- **İlgi Alanı:** `interests` ile eşleşirse +30 veya +15.
- **Meslek:** `profession` ile etiket eşleşirse +20.
- **Okuma Derinliği:** Kullanıcı "quick" istiyorsa kısa haberlere +10, "deep" istiyorsa uzun haberlere +10.
- Skoru 0'ın altına düşen haberler akıştan filtrelenir.

## Gazete Üretimi (`newspaperBuilder.ts`)
- Gelen haberler skora göre sıralanır.
- En yüksek skorlu 1 haber **Manşet** olur.
- Kalanlar okuma süresi ve etiketlere göre `5 Dakikada Gündem`, `Mesleğe Özel`, `Derin Okuma` ve `Günün Özeti` bölümlerine ayrılır.
- Bir haberin birden fazla bölümde tekrar etmesi `usedArticleIds` Set yapısı ile engellenir.

## Bana Etkisi Ne (`impactAnalysis.ts`)
- Kullanıcının mesleğine (`profession`) bakarak haberin potansiyel etkisini çıkarır.
- "Yazılımcı" için teknoloji avantajlarına, "Girişimci" için pazar fırsatlarına, "Yatırımcı" için risklere (finansal uyarılarla) odaklanılır.
