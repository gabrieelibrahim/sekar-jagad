# Panduan Setup Supabase — Sekar Jagad 43

Website ini tetap 100% HTML/CSS/JS (tanpa server sendiri). Supabase dipakai sebagai penyimpanan data (artikel, layanan, galeri, testimoni, paket) dan autentikasi admin.

Ikuti langkah ini **sekali** saat pertama kali menyiapkan website.

---

## 1. Buat akun & project Supabase

1. Buka **[supabase.com](https://supabase.com)** dan klik **Start your project** / daftar (gratis, cukup email).
2. Setelah masuk, klik **New Project**.
   - **Name**: misal `sekar-jagad-43`
   - **Database Password**: isi dengan kata sandi kuat dan **simpan** (kadang perlu).
   - **Region**: pilih yang terdekat (Singapura) supaya koneksi lebih cepat.
3. Klik **Create new project** dan tunggu ±2 menit sampai siap.

## 2. Ambil URL & anon key

1. Di sidebar kiri pilih **Project Settings → API**.
2. Salin dua nilai:
   - **Project URL** (misal `https://abcdefgh.supabase.co`)
   - **anon public** (deretan huruf panjang `eyJ...`)
3. Buka file **`assets/js/config.js`** di project ini dan isi kedua nilai tersebut:

```js
window.SUPABASE_CONFIG = {
  url: 'https://abcdefgh.supabase.co',   // Project URL
  anonKey: 'eyJhbGciOiJIUzI1NiIs...'      // anon public
};
```

> Penting: kalau file ini masih berisi `PROJECT_REF` / `YOUR_ANON_PUBLIC_KEY`, website memakai konten statis (fallback) dan halaman artikel belum aktif.

## 3. Jalankan skrip database

1. Di Dashboard Supabase, buka **SQL Editor** (sidebar kiri).
2. Klik **New query**.
3. Salin **seluruh isi** file **`data/seed.sql`** di project ini ke dalam editor.
4. Klik **Run** (tombol di kanan bawah / Ctrl+Enter).
5. Pastikan tidak ada error. Skrip ini akan membuat:
   - Tabel: `articles`, `services`, `gallery`, `testimonials`, `packages`
   - Aturan keamanan (RLS): publik hanya bisa **baca**, tulis hanya admin login
   - Bucket penyimpanan `images` (untuk upload foto)
   - Data awal: 6 layanan, 2 paket, 11 foto galeri, 3 testimoni, 3 artikel contoh

> Cara cek: sidebar → **Table Editor** → pilih tabel → data seed sudah tampil.

## 4. Buat akun admin

1. Sidebar kiri → **Authentication → Users**.
2. Klik **Add user**.
3. Isi **Email** dan **Password** (misal `admin@sekarjagad43.com` dan kata sandi kuat).
4. **Jangan centang** "Auto Confirm User" jika tidak perlu (default boleh).
5. Simpan.

> Biarkan **public signup tetap dimatikan** (default). Supabase sudah otomatis memblokir pendaftaran terbuka — akun admin dibuat manual saja supaya hanya kamu yang bisa login.

## 5. Tes di komputer kamu

1. Di folder project, jalankan:

   ```bash
   npx serve .
   ```

2. Buka:
   - `http://localhost:3000/index.html` → layanan, paket, galeri, testimoni terisi dari Supabase
   - `http://localhost:3000/artikel.html` → daftar artikel tampil
   - `http://localhost:3000/layanan.html` → daftar semua layanan
   - `http://localhost:3000/admin-login.html` → login dengan email+password admin, lalu kelola konten
3. Coba buat artikel/layanan baru → cek `artikel.html` / menu Layanan di navbar → data baru muncul.

## 6. Deploy ke hosting

Upload seluruh isi folder project ke hosting statis biasa (cPanel, Netlify, Vercel, dll). Tidak perlu VPS.

- **cPanel**: zip isi folder (bukan folder-nya), upload via File Manager ke `public_html`, extract.
- **Netlify**: drag-and-drop folder ke app.netlify.com/drop (gratis).
- **Vercel**: `vercel` di folder project.

Setelah deploy, buka situs → pastikan halaman artikel dan admin jalan. Login admin dari HP/komputer mana pun juga bisa.

---

## Cara kerja keamanan (singkat)

- **Anon key** yang ada di `config.js` itu publik by design — boleh terlihat.
- Yang menjaga data: **Row Level Security (RLS)** di database. Publik hanya bisa membaca; menambah/mengubah/menghapus hanya bisa user yang login (admin).
- Untuk menambah admin kedua: **Authentication → Users → Add user**.

## Pertanyaan umum

**Kenapa data yang kuubah di admin tidak langsung terlihat?**
Perubahan tersimpan di Supabase dan akan terlihat oleh semua pengunjung begitu halaman di-refresh. Pastikan halaman sudah di-refresh.

**Bagaimana kalau mau ganti angka WhatsApp?**
Nomor WA admin tertulis di beberapa file (`index.html`, `artikel.html`, `artikel-detail.html`, `assets/js/index-data.js`). Cari `6285946454995` lalu ganti semua.

**Aku ingin konten tambahan tanpa coding?**
Panel admin sudah bisa: artikel (dengan format teks sederhana), layanan (mega dropdown), foto galeri (upload), testimoni, dan paket harga.
