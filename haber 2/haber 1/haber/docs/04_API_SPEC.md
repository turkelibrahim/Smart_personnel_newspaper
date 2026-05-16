# API Spec

Sistemdeki API uç noktaları Next.js Route Handlers ile `/api` altında oluşturulmuştur.

## `GET /api/preferences`
- **Açıklama:** Demo kullanıcısının tercihlerini getirir.
- **Dönen Değer:** `UserPreference` JSON objesi.

## `POST /api/preferences`
- **Açıklama:** Kullanıcının tercihlerini günceller/oluşturur.
- **Gövde (Body):**
  ```json
  {
    "profession": "string",
    "interests": ["string"],
    "blockedTopics": ["string"],
    "preferredReadingDepth": "string"
  }
  ```

## `GET /api/articles`
- **Açıklama:** Sistemdeki haberleri tarih sırasına göre döndürür.

## `GET /api/feed/personalized`
- **Açıklama:** Kullanıcının tercihlerine göre hesaplanan algoritma skorlarına dayanarak sıralanmış, özel haber akışını (feed) döndürür.

## `GET /api/newspaper/today`
- **Açıklama:** Günlük gazeteyi bölümleriyle (`Manşet`, `5 Dakikada Gündem`, `Mesleğe Göre` vb.) birlikte oluşturup döndürür.

## `POST /api/impact`
- **Açıklama:** Belirli bir haberin kullanıcı üzerindeki etkisini (Bana Etkisi Ne?) metinsel olarak oluşturur.
- **Gövde:** `{ "articleId": "uuid" }`
