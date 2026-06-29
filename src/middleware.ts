import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

// Daftarkan rute-rute yang WAJIB login untuk bisa diakses
const protectedRoutes = ['/belajar', '/diskusi'];

// Daftarkan rute autentikasi (Jika sudah login, tidak boleh ke sini lagi)
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  // Ambil token dari cookie (Next.js Middleware berjalan di sisi server, jadi tidak bisa membaca localStorage)
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

//   // 1. PROTEKSI RUTE UTAMA: Jika mencoba akses rute terproteksi tapi TIDAK punya token
//   const isMatchingProtected = protectedRoutes.some((route) => pathname.startsWith(route));
//   if (isMatchingProtected && !token) {
//     const loginUrl = new URL('/login', request.url);
//     // Simpan rute asal agar setelah login sukses bisa diarahkan kembali ke halaman ini
//     loginUrl.searchParams.set('callbackUrl', pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // 2. PROTEKSI RUTE AUTH: Jika SUDAH punya token tapi mencoba akses /login atau /signup
//   const isMatchingAuth = authRoutes.some((route) => pathname.startsWith(route));
//   if (isMatchingAuth && token) {
//     return NextResponse.redirect(new URL('/', request.url));
//   }

  return NextResponse.next();
}

// Menentukan rute mana saja yang akan diproses oleh middleware ini
export const config = {
  matcher: ['/belajar/:path*', '/diskusi/:path*', '/login', '/signup'],
};