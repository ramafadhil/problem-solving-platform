import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google';
import './globals.css';

// Font UI & Body tetap menggunakan favoritmu
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

// Font Judul menggunakan gaya gamifikasi playful
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  // Fraunces mendukung fitur soft/opsi kemiringan yang estetik jika diperlukan
  weight: ['400', '600', '700', '900'], 
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Unravel - Platform Pemecahan Masalah',
  description: 'Urai benang kusut studi kasus global bersama komunitas.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${fraunces.variable}`}>
      <body className="font-sans bg-[#FFFDF9] text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}