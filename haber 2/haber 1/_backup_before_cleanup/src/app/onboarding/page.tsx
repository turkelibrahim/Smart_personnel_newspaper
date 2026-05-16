'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    profession: '',
    interests: [] as string[],
    blockedTopics: [] as string[],
    preferredReadingDepth: 'balanced'
  })

  const [loading, setLoading] = useState(false)

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => s - 1)

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleBlockedToggle = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      blockedTopics: prev.blockedTopics.includes(topic) 
        ? prev.blockedTopics.filter(t => t !== topic)
        : [...prev.blockedTopics, topic]
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        router.push('/dashboard')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="glass-panel rounded-3xl p-8 md:p-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-2">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 w-12 rounded-full ${step >= i ? 'bg-red-500' : 'bg-white/10'}`} />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Adım {step}/4</span>
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-black text-white mb-4">Mesleğiniz Nedir?</h2>
            <p className="text-gray-400 mb-8">Size sektörünüzdeki en önemli gelişmeleri getirebilmemiz için bilmemiz gerekiyor.</p>
            <input 
              type="text" 
              placeholder="Örn: Yazılım Mühendisi, Doktor, Öğrenci..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-500 transition-colors"
              value={formData.profession}
              onChange={e => setFormData({...formData, profession: e.target.value})}
            />
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-black text-white mb-4">Nelerle İlgileniyorsunuz?</h2>
            <p className="text-gray-400 mb-8">En çok görmek istediğiniz konuları seçin.</p>
            <div className="flex flex-wrap gap-3">
              {['Yapay Zeka', 'Teknoloji', 'Ekonomi', 'Girişimcilik', 'Bilim', 'Spor', 'Kültür Sanat'].map(item => (
                <button
                  key={item}
                  onClick={() => handleInterestToggle(item)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${
                    formData.interests.includes(item) 
                      ? 'bg-red-500 border-red-500 text-white' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-black text-white mb-4">Görmek İstemediğiniz Konular?</h2>
            <p className="text-gray-400 mb-8">Akışınızda asla karşınıza çıkmayacak konuları seçin.</p>
            <div className="flex flex-wrap gap-3">
              {['Magazin', 'Şiddet haberleri', 'Astroloji', 'Politika'].map(item => (
                <button
                  key={item}
                  onClick={() => handleBlockedToggle(item)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${
                    formData.blockedTopics.includes(item) 
                      ? 'bg-slate-800 border-slate-600 text-gray-300' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-black text-white mb-4">Okuma Tarzınız</h2>
            <p className="text-gray-400 mb-8">Haberleri nasıl tüketmeyi tercih edersiniz?</p>
            <div className="space-y-4">
              {[
                { id: 'quick', title: 'Hızlıca Göz Atmak', desc: 'Sadece özetler ve önemli noktalar' },
                { id: 'balanced', title: 'Dengeli', desc: 'Genel haberler, gerektiğinde detay' },
                { id: 'deep', title: 'Derinlemesine Analiz', desc: 'Uzun okumalar ve arka plan bilgileri' },
              ].map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => setFormData({...formData, preferredReadingDepth: opt.id})}
                  className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                    formData.preferredReadingDepth === opt.id
                      ? 'bg-red-500/10 border-red-500'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="font-bold text-white mb-1">{opt.title}</div>
                  <div className="text-sm text-gray-400">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-between">
          {step > 1 ? (
            <button onClick={handleBack} className="text-gray-400 hover:text-white font-bold text-sm px-6 py-3">Geri</button>
          ) : <div />}
          
          {step < 4 ? (
            <button 
              onClick={handleNext} 
              className="bg-white text-black font-black text-sm px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Devam Et
            </button>
          ) : (
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-red-600 text-white font-black text-sm px-8 py-3 rounded-xl hover:bg-red-700 transition-colors"
            >
              {loading ? 'Kaydediliyor...' : 'Gazetemi Hazırla'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
