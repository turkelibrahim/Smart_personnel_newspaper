'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    profession: '',
    interests: [] as string[],
    blockedTopics: [] as string[],
    preferredReadingDepth: 'balanced'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/preferences')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setFormData({
            profession: data.profession || '',
            interests: data.interests ? JSON.parse(data.interests) : [],
            blockedTopics: data.blockedTopics ? JSON.parse(data.blockedTopics) : [],
            preferredReadingDepth: data.preferredReadingDepth || 'balanced'
          })
        }
        setLoading(false)
      })
  }, [])

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
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setMessage('Tercihleriniz başarıyla güncellendi.')
      } else {
        setMessage('Güncelleme sırasında bir hata oluştu.')
      }
    } catch (e) {
      setMessage('Bağlantı hatası.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-white">Yükleniyor...</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-black text-white mb-8">Tercihleri Düzenle</h1>
      
      <div className="space-y-8">
        <div className="glass-panel p-6 rounded-2xl">
          <label className="text-sm font-bold text-gray-400 block mb-2">Meslek</label>
          <input 
            type="text" 
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
            value={formData.profession}
            onChange={e => setFormData({...formData, profession: e.target.value})}
          />
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <label className="text-sm font-bold text-gray-400 block mb-4">İlgi Alanları</label>
          <div className="flex flex-wrap gap-2">
            {['Yapay Zeka', 'Teknoloji', 'Ekonomi', 'Girişimcilik', 'Bilim', 'Spor', 'Kültür Sanat'].map(item => (
              <button
                key={item}
                onClick={() => handleInterestToggle(item)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border ${
                  formData.interests.includes(item) 
                    ? 'bg-red-500 border-red-500 text-white' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <label className="text-sm font-bold text-gray-400 block mb-4">Engellenen Konular</label>
          <div className="flex flex-wrap gap-2">
            {['Magazin', 'Şiddet haberleri', 'Astroloji', 'Politika'].map(item => (
              <button
                key={item}
                onClick={() => handleBlockedToggle(item)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border ${
                  formData.blockedTopics.includes(item) 
                    ? 'bg-slate-800 border-slate-600 text-gray-300' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <label className="text-sm font-bold text-gray-400 block mb-4">Okuma Tarzı</label>
          <select 
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
            value={formData.preferredReadingDepth}
            onChange={e => setFormData({...formData, preferredReadingDepth: e.target.value})}
          >
            <option value="quick" className="bg-slate-900">Hızlıca Göz Atmak</option>
            <option value="balanced" className="bg-slate-900">Dengeli</option>
            <option value="deep" className="bg-slate-900">Derinlemesine Analiz</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-white text-black font-black text-sm px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
          {message && <span className="text-sm text-green-400 font-bold">{message}</span>}
        </div>
      </div>
    </div>
  )
}
