import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] relative overflow-hidden px-4">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
        <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 flex items-center gap-2">
          <i className="fas fa-sparkles"></i>
          Yeni Nesil Haber Deneyimi
        </span>
        
        <h1 className="text-5xl md:text-7xl font-serif font-black text-white tracking-tighter leading-tight mb-6">
          Sadece Sana Özel <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
            Kişisel Gazeten
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          İlgi alanlarına, mesleğine ve okuma tarzına göre yapay zeka tarafından 
          her gün özel olarak hazırlanan haber bültenini keşfet. Zaman kaybetme, odaklan.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link 
            href="/onboarding" 
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <i className="fas fa-bolt"></i> Gazeteni Oluştur
          </Link>
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto glass-panel hover:bg-white/5 text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-xl transition-all flex items-center justify-center"
          >
            Akışı Görüntüle
          </Link>
        </div>
      </div>
    </div>
  )
}
