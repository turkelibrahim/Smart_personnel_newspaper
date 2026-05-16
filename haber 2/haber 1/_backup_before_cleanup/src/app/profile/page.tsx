import { prisma } from '@/lib/db'
import { createProfileSignature } from '@/lib/personalization/scoring'
import Link from 'next/link'

const DEMO_EMAIL = 'demo@mypress.ai'
export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    include: { preference: true }
  })

  const signature = createProfileSignature(user?.preference || null)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-black text-white tracking-tight mb-4">Haber DNA'm</h1>
        <p className="text-gray-400">Yapay zekanın sizi nasıl tanıdığı ve içerikleri nasıl filtrelediği.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-sm font-black uppercase tracking-widest text-white/50 mb-6">Temel Profil</h2>
          
          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-1">İsim</label>
              <div className="text-xl font-bold text-white">{user?.name}</div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Meslek</label>
              <div className="text-xl font-bold text-blue-400">{user?.preference?.profession || 'Belirtilmedi'}</div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Konum</label>
              <div className="text-lg font-bold text-white">{user?.preference?.location || 'Belirtilmedi'}</div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-sm font-black uppercase tracking-widest text-white/50 mb-6">Algoritma İmzası</h2>
          
          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">İlgi Alanları (Boost)</label>
              <div className="flex flex-wrap gap-2">
                {signature.interests?.map((i: string) => (
                  <span key={i} className="bg-white/5 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                    {i}
                  </span>
                )) || <span className="text-sm text-gray-400">Yok</span>}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Okuma Derinliği</label>
                <div className="text-lg font-bold text-white capitalize">{signature.readingStyle}</div>
              </div>
              <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Engellenen Konu</label>
                <div className="text-lg font-bold text-red-400">{signature.blockedCount} Adet</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link 
          href="/settings" 
          className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-8 py-4 rounded-xl transition-colors inline-flex items-center"
        >
          <i className="fas fa-sliders-h mr-2"></i> Tercihleri Güncelle
        </Link>
      </div>
    </div>
  )
}
