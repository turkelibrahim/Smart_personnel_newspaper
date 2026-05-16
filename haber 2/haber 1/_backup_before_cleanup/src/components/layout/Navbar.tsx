import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white">
          MYPRESS<span className="text-red-500">AI</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-bold text-gray-300 hover:text-white transition">Akışım</Link>
          <Link href="/newspaper" className="text-sm font-bold text-yellow-500 hover:text-yellow-400 transition flex items-center gap-2">
            <span>Gazetem</span>
            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">AI</span>
          </Link>
          <Link href="/profile" className="text-sm font-bold text-gray-300 hover:text-white transition">Haber DNA</Link>
          <Link href="/settings" className="text-sm font-bold text-gray-300 hover:text-white transition">Tercihler</Link>
        </nav>
      </div>
    </header>
  )
}
