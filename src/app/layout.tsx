import type { Metadata } from 'next';
import { Work_Sans, PT_Mono } from 'next/font/google';
import './globals.css';

// Font UI, Title & Main menggunakan Work Sans
const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

// Font Deskripsi & Penjelasan menggunakan PT Mono
const ptMono = PT_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Unravel - Platform Pemecahan Masalah',
  description: 'Urai benang kusut studi kasus global bersama komunitas.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${workSans.variable} ${ptMono.variable}`}>
      <body className="font-sans bg-neogrid text-black antialiased">
        {children}
      </body>
    </html>
  );
}