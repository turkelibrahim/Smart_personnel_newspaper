import { Article, UserPreference } from '@prisma/client'

export interface ImpactAnalysis {
  impactLevel: 'High' | 'Medium' | 'Low'
  whyImportant: string
  personalImpact: string
  opportunity: string
  risk: string
  followUp: string
}

export function generateImpactAnalysis(article: Article, preference: UserPreference | null): ImpactAnalysis {
  const prof = preference?.profession || 'Genel Okuyucu';
  
  let impactLevel: 'High' | 'Medium' | 'Low' = 'Medium';
  let personalImpact = `${prof} olarak bu haber sizi doğrudan etkileyebilir.`;
  let opportunity = 'Bu gelişmeyi avantaja çevirmek için sektör trendlerini takip edin.';
  let risk = 'Piyasadaki dalgalanmalara karşı dikkatli olun.';
  
  if (prof.toLowerCase().includes('yazılım')) {
    impactLevel = 'High';
    personalImpact = 'Teknoloji ve yazılım dünyasındaki bu gelişme, yeni araçların veya kütüphanelerin habercisi olabilir.';
    opportunity = 'Yeni çıkan teknolojileri erken benimseyerek kariyerinize katkı sağlayabilirsiniz.';
    risk = 'Eski teknolojilerde kalmak uzun vadede rekabet gücünüzü düşürebilir.';
  } else if (prof.toLowerCase().includes('girişim')) {
    impactLevel = 'High';
    personalImpact = 'Girişimci olarak bu piyasa hareketleri, yeni yatırım fırsatlarına işaret ediyor.';
    opportunity = 'Bu alandaki boşlukları dolduracak ürün fikirleri geliştirebilirsiniz.';
    risk = 'Rakiplerin pazara hızlı girmesi durumunda pazar payı kaybı yaşanabilir.';
  } else if (prof.toLowerCase().includes('yatırım')) {
    impactLevel = 'High';
    personalImpact = 'Yatırımcı şapkanızla bu haberi incelediğinizde, potansiyel varlık değerlemelerinde değişiklikler öngörülebilir.';
    opportunity = 'Erken aşama pozisyon almak getiri sağlayabilir.';
    risk = 'Bu haber yatırım tavsiyesi değildir. Piyasadaki volatilite anapara kaybına neden olabilir.';
  } else if (prof.toLowerCase().includes('öğrenci')) {
    impactLevel = 'Low';
    personalImpact = 'Eğitim hayatınızda bu gelişmeleri vizyonunuzu genişletmek için kullanabilirsiniz.';
    opportunity = 'Staj veya bitirme projelerinizde bu konuyu araştırmak faydalı olabilir.';
    risk = 'Haberdeki bilgiler çok hızlı değişebileceği için temel kavramları kaçırmamaya dikkat edin.';
  }

  // Adjust by category
  if (article.category === 'Ekonomi' || article.category === 'Finans') {
    risk += ' (Bu içerik finansal bilgilendirme amaçlıdır, kesinlikle yatırım tavsiyesi değildir.)';
  }

  return {
    impactLevel,
    whyImportant: article.summary || 'Bu haber genel gündemi etkileme potansiyeline sahip.',
    personalImpact,
    opportunity,
    risk,
    followUp: 'Gelişmeleri takip etmek için bildirimlerinizi açık tutun.'
  };
}
