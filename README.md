# Smart Personnel Newspaper (Akıllı Personel Gazetesi)

Bu proje, personel için özelleştirilmiş, AI (Yapay Zeka) destekli bir haber portalıdır. Haberleri otomatik olarak çeker, sınıflandırır ve modern bir arayüz ile sunar.

## 🚀 Özellikler

- **AI Haber Sınıflandırma:** Haberleri kategorilerine göre (Gündem, Teknoloji, Ekonomi vb.) otomatik olarak ayırır.
- **Otomatik Haber Çekme:** RSS ve diğer kaynaklardan güncel haberleri toplar.
- **Modern Arayüz:** Next.js ve Tailwind CSS kullanılarak oluşturulmuş, kullanıcı dostu tasarım.
- **Kolay Başlatma:** Windows kullanıcıları için tek tıkla başlatma betiği.

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler

- [Node.js](https://nodejs.org/) (v18 veya üzeri önerilir)
- [Git](https://git-scm.com/)

### Hızlı Başlangıç (Windows)

Proje dizinindeki `baslat.bat` dosyasına çift tıklayarak uygulamayı otomatik olarak başlatabilirsiniz. Bu betik:
1. Gerekli paketleri yükler (`npm install`).
2. Geliştirme sunucusunu başlatır (`npm run dev`).

### Manuel Çalıştırma

Eğer terminal üzerinden çalıştırmak isterseniz:

```bash
# Proje dizinine gidin
cd "haber 2/haber 1/haber"

# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

## ⚙️ Yapılandırma (Environment Variables)

Projenin çalışması için bazı ortam değişkenlerinin ayarlanması gerekir. 

1. `haber 2/haber 1/haber/` dizinine gidin.
2. `.env.example` dosyasının adını `.env` olarak değiştirin.
3. İçindeki değişkenleri kendi anahtarlarınızla doldurun:

```env
DATABASE_URL="file:./prisma/dev.db"
OPENAI_API_KEY=your_openai_key_here
GOOGLE_AI_API_KEY=your_google_key_here
AI_PROVIDER=google # veya openai, anthropic, rule-based
AI_ENABLED=true
```

## 📂 Proje Yapısı

- `haber 2/haber 1/haber`: Ana uygulama kodları (Next.js, Prisma, API).
- `baslat.bat`: Windows için hızlı başlatma betiği.
- `Editor 2012 (1).pdf` & `Smart Personnel Newspaper.docx`: Proje dökümantasyonu.

## 📝 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
