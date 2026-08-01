# Sekar Jagad 43 — Company Profile Website

**Static site (HTML/CSS/JS) + Supabase (data dinamis)** — airport ground handling services for Indonesian umrah travel agencies.

## Info

- **Company:** Sekar Jagad 43
- **Field:** Airport Handling Services for Umrah Travel
- **Founded:** 2015
- **Operations:** Jeddah, Makkah, Madinah
- **WA Admin:** 085946454995

## Halaman

| File | Isi |
|---|---|
| `index.html` | Beranda (hero, tentang, layanan, paket, galeri, artikel, testimoni, FAQ, kontak) |
| `artikel.html` | Daftar artikel/blog (pagination) |
| `artikel-detail.html` | Isi artikel |
| `layanan.html` | Daftar layanan & detail layanan |
| `admin-login.html` | Halaman login admin |
| `admin.html` | Panel admin (kelola artikel, layanan, galeri, testimoni, paket) |

Semua konten yang bisa dikelola di admin (artikel, layanan, paket, galeri, testimoni) disimpan di **Supabase** dan dirender otomatis. Jika Supabase belum dikonfigurasi, halaman utama memakai **konten statis fallback** yang sudah ada.

## Struktur

```
Sekar-jagat/
├── index.html               # Beranda (single page)
├── artikel.html             # Daftar artikel
├── artikel-detail.html      # Detail artikel
├── layanan.html             # Daftar & detail layanan
├── admin-login.html         # Login admin
├── admin.html               # Panel admin
├── README.md
├── PRODUCT.md               # Product definition & design brief
├── docs/
│   ├── PRD.md               # Product Requirements Document
│   └── SETUP-SUPABASE.md    # ⭐ Panduan setup Supabase (baca ini dulu)
├── data/
│   └── seed.sql             # Skema + RLS + data awal (jalankan di Supabase)
└── assets/
    ├── css/
    │   ├── style.css        # Design system & halaman utama (+ responsive)
    │   ├── artikel.css      # Halaman artikel & layanan
    │   └── admin.css        # Panel admin + icon picker
    ├── js/
    │   ├── main.js          # Interaksi halaman utama
    │   ├── config.js        # ⭐ Isi SUPABASE_URL + anon key di sini
    │   ├── supabase-client.js
    │   ├── api.js           # Data layer (CRUD + auth)
    │   ├── nav-menu.js      # Mega dropdown layanan di navbar
    │   ├── index-data.js    # Render data dinamis di beranda
    │   ├── artikel.js / artikel-detail.js
    │   ├── layanan.js       # Daftar & detail layanan
    │   ├── admin-login.js   # Logika login
    │   ├── admin.js         # Logika panel admin
    │   └── icon-picker.js   # Pemilih ikon (admin)
    ├── icons/               # Favicon & apple-touch-icon
    └── images/              # Foto & assets
```

## Setup (sekali)

1. Ikuti **`docs/SETUP-SUPABASE.md`**: buat project Supabase gratis → isi `assets/js/config.js` → jalankan `data/seed.sql` → buat akun admin.
2. Jalankan lokal: `npx serve .` lalu buka `http://localhost:3000`.
3. Deploy seluruh folder ke hosting statis (cPanel / Netlify / Vercel).

## Tech

- HTML5 + CSS3 + JavaScript (Vanilla)
- Supabase (Postgres + Auth + Storage) — via `@supabase/supabase-js` CDN
- Responsive (Desktop, Tablet, Mobile)
- WhatsApp Click-to-Chat integration
- Google Maps embed
- Tanpa backend sendiri

## Deployment

Static site — any shared hosting / cPanel / VPS / Netlify / Vercel. HTTPS otomatis disediakan hosting.
