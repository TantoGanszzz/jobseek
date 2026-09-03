# Project Summary: Jobseek (up to commit `Error Fix1`)

Dokumen ini merangkum status, arsitektur, dan teknologi dari proyek **Jobseek** hingga commit `ea328b1` ("Error Fix1").

## 1. Tech Stack
- **Framework**: Next.js (App Router) v16.3.1
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS, class-variance-authority, clsx, tailwind-merge
- **UI Components**: shadcn/ui (Radix UI), lucide-react, react-icons, tw-animate-css
- **Backend & Auth**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)

## 2. Struktur Proyek Saat Ini

Proyek menggunakan arsitektur App Router Next.js dengan pemisahan komponen dan fungsi server:

```text
/app
  /(auth)              # Route group untuk halaman autentikasi
    /login             # Halaman Sign In
    /register          # Halaman Sign Up
  /dashboard           # Halaman untuk user yang sudah login
    /find-jobs         # Pencarian kerja khusus user login
    /profile           # Pengaturan profil pengguna
  /find-jobs           # Pencarian kerja publik
  /actions             # Server Actions untuk auth, jobs, dan profile
  /auth/callback       # Route handler untuk callback Supabase Auth
  layout.tsx           # Root layout
  page.tsx             # Landing page utama (Home)

/components
  /ui                  # Komponen reusable dari shadcn (button, input, card, avatar, dropdown-menu)
  auth-form.tsx        # Form untuk login dan register
  navbar.tsx           # Navigasi utama
  hero-section.tsx     # Bagian Hero di halaman utama
  featured-jobs.tsx    # Daftar pekerjaan unggulan
  job-search.tsx       # Komponen pencarian pekerjaan
  profile-form.tsx     # Form untuk edit profil

/lib
  /supabase            # Konfigurasi Supabase Client (browser, server, middleware)
  utils.ts             # Fungsi utilitas (terutama untuk Tailwind classes)
```

## 3. Fitur yang Sudah Terimplementasi (hingga Error Fix1)

1. **Autentikasi (Supabase)**
   - Setup Supabase Auth menggunakan SSR (Server-Side Rendering).
   - Halaman Login dan Register sudah ada di `app/(auth)`.
   - `proxy.ts` (yang berfungsi sebagai middleware) digunakan untuk proteksi route, memastikan pengguna yang tidak terautentikasi diarahkan ke halaman login jika mencoba mengakses halaman terlindungi.

2. **Landing Page (Public)**
   - Hero Section, Fitur Orbit Teknologi (`stack-feature-section.tsx`), dan Navigasi.
   - Menampilkan Statistik dan Career Resources.
   - Komponen Job Search dan Featured Jobs untuk publik.

3. **Dashboard & Halaman Pengguna**
   - Halaman Dashboard utama (`app/dashboard/page.tsx`).
   - Halaman Profil (`app/dashboard/profile/page.tsx`) beserta form edit profil.
   - Halaman Cari Kerja untuk pengguna terautentikasi (`app/dashboard/find-jobs/page.tsx`).

## 4. Catatan & PR (Berdasarkan Spesifikasi)
Meskipun struktur di atas sudah cukup lengkap, ada beberapa penyesuaian yang mungkin diperlukan untuk menyelaraskan penuh dengan instruksi desain:
- **Routing Dashboard**: Spesifikasi meminta `app/(dashboard)/layout.tsx` (sebagai route group), tetapi saat ini masih menggunakan `app/dashboard/layout.tsx`.
- **Warna & Tema**: Harus dipastikan hanya menggunakan **White & Navy** (tanpa mode gelap atau warna lain).
- **Middleware**: File proteksi saat ini bernama `proxy.ts`, yang di Next.js standar seharusnya bernama `middleware.ts`.

## 5. Status Terminal
- Proyek saat ini sedang dalam proses pembatalan commit (revert) dari commit terbaru (`9a4c353` - "menambahkan dashboard") untuk kembali secara bersih ke status `Error Fix1`.
