import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
})

export const metadata: Metadata = {
  title: 'MyPress AI - Kişisel AI Haber Gazetesi',
  description: 'Yapay zeka destekli kişiselleştirilmiş haber uygulaması.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className="dark">
      <body
        className={`${inter.variable} ${merriweather.variable} min-h-screen bg-slate-950 font-sans text-slate-100 antialiased`}
      >
        <Navbar />
        <main className="flex-1 pt-20 md:pt-24">{children}</main>
      </body>
    </html>
  )
}
