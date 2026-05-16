import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({ weight: ["300", "400", "700", "900"], subsets: ["latin"], variable: "--font-merriweather" });

export const metadata: Metadata = {
  title: "MyPress AI - Kişiselleştirilmiş Gazeteniz",
  description: "Yapay zeka destekli kişiselleştirilmiş haber bülteni.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.variable} ${merriweather.variable} font-sans bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
