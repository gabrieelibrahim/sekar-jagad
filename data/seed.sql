-- ══════════════════════════════════════════════════════════════
--  SEKAR JAGAD 43 — Skema Database + Data Awal (Supabase)
--  Jalankan di: Dashboard Supabase → SQL Editor → New query → Run
--  Panduan lengkap: docs/SETUP-SUPABASE.md
--  Skrip ini aman dijalankan ulang (idempotent).
-- ══════════════════════════════════════════════════════════════

-- ── TABEL ─────────────────────────────────────────────────────
create table if not exists public.articles (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  slug       text unique not null,
  category   text,
  excerpt    text,
  content    text not null,
  cover_url  text,
  status     text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null,
  caption    text,
  sort       integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  company    text,
  text       text not null,
  rating     integer not null default 5,
  created_at timestamptz not null default now()
);

create table if not exists public.packages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  price       numeric not null,
  currency    text not null default 'SAR',
  description text,
  features    jsonb not null default '[]',
  badge       text,
  featured    boolean not null default false,
  sort        integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
alter table public.articles     enable row level security;
alter table public.gallery      enable row level security;
alter table public.testimonials enable row level security;
alter table public.packages     enable row level security;

-- Baca publik (artikel draft hanya terlihat admin yang login)
drop policy if exists "public read articles" on public.articles;
create policy "public read articles" on public.articles
  for select
  using (status = 'published' or auth.uid() is not null);

drop policy if exists "public read gallery" on public.gallery;
create policy "public read gallery" on public.gallery
  for select using (true);

drop policy if exists "public read testimonials" on public.testimonials;
create policy "public read testimonials" on public.testimonials
  for select using (true);

drop policy if exists "public read packages" on public.packages;
create policy "public read packages" on public.packages
  for select using (true);

-- Tulis hanya admin (user yang login)
drop policy if exists "admin write articles" on public.articles;
create policy "admin write articles" on public.articles
  for all to authenticated using (true) with check (true);

drop policy if exists "admin write gallery" on public.gallery;
create policy "admin write gallery" on public.gallery
  for all to authenticated using (true) with check (true);

drop policy if exists "admin write testimonials" on public.testimonials;
create policy "admin write testimonials" on public.testimonials
  for all to authenticated using (true) with check (true);

drop policy if exists "admin write packages" on public.packages;
create policy "admin write packages" on public.packages
  for all to authenticated using (true) with check (true);

-- ── STORAGE (bucket gambar publik) ────────────────────────────
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "public read images" on storage.objects;
create policy "public read images" on storage.objects
  for select using (bucket_id = 'images');

drop policy if exists "admin write images" on storage.objects;
create policy "admin write images" on storage.objects
  for all to authenticated
  using (bucket_id = 'images')
  with check (bucket_id = 'images');

-- ── LAYANAN (mega dropdown navbar) ───────────────────────────
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text unique not null,
  icon        text,
  short_desc  text,
  content     text not null default '',
  cover_url   text,
  visible     boolean not null default true,
  sort        integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.services enable row level security;

drop policy if exists "public read services" on public.services;
create policy "public read services" on public.services
  for select using (visible = true or auth.uid() is not null);

drop policy if exists "admin write services" on public.services;
create policy "admin write services" on public.services
  for all to authenticated using (true) with check (true);

-- ── SEED: PAKET ───────────────────────────────────────────────
insert into public.packages (name, price, currency, description, features, badge, featured, sort)
select * from (values
  (
    'Paket Bandara Baru Jeddah',
    95, 'SAR',
    'Paket handling standar untuk kedatangan di Bandara Baru Jeddah.',
    '["Jasa Porter Bandara","Konsumsi","Pembimbing jamaah","Boarding Pass Pesawat","Pengamanan Koper","Free Zam-Zam 5L","Pendampingan Penuh"]'::jsonb,
    'Populer', false, 0
  ),
  (
    'Paket Bandara Haji Jeddah',
    100, 'SAR',
    'Paket handling lengkap untuk rombongan haji/umrah di Bandara Haji Jeddah.',
    '["Jasa Porter Bandara","Konsumsi","Pembimbing jamaah","Boarding Pass Pesawat","Pengamanan Koper","Free Zam-Zam 5L","Pendampingan Penuh"]'::jsonb,
    'Rekomendasi', true, 1
  )
) as v(name, price, currency, description, features, badge, featured, sort)
where not exists (select 1 from public.packages);

-- ── SEED: GALERI (foto lokal) ─────────────────────────────────
insert into public.gallery (image_url, caption, sort)
select * from (values
  ('assets/images/01.jpeg', 'Dokumentasi 1', 0),
  ('assets/images/02.jpeg', 'Dokumentasi 2', 1),
  ('assets/images/03.jpeg', 'Dokumentasi 3', 2),
  ('assets/images/04.jpeg', 'Dokumentasi 4', 3),
  ('assets/images/05.jpeg', 'Dokumentasi 5', 4),
  ('assets/images/06.jpeg', 'Dokumentasi 6', 5),
  ('assets/images/07.jpeg', 'Dokumentasi 7', 6),
  ('assets/images/08.jpeg', 'Dokumentasi 8', 7),
  ('assets/images/09.jpeg', 'Dokumentasi 9', 8),
  ('assets/images/10.jpeg', 'Dokumentasi 10', 9),
  ('assets/images/11.jpeg', 'Dokumentasi 11', 10)
) as v(image_url, caption, sort)
where not exists (select 1 from public.gallery);

-- ── SEED: TESTIMONI ───────────────────────────────────────────
insert into public.testimonials (name, company, text, rating)
select * from (values
  ('Ahmad Fauzi', 'Travel Umrah Al-Amin',
   'Pelayanan sangat profesional. Jamaah kami puas dengan handling dari Sekar Jagad 43. Mulai dari penjemputan sampai antar ke hotel berjalan lancar.', 5),
  ('Siti Nurhaliza', 'Dirut Andalus Tour',
   'Sudah 5 tahun bekerja sama. Timnya responsif, amanah, dan selalu siap 24 jam. Pelayanan imigrasi kilatnya sangat membantu jamaah kami.', 5),
  ('Hendra Gunawan', 'Manager Ar-Rahman Travel',
   'Handling bandara terbaik yang pernah kami pakai. Porter service-nya cepat, transportasi nyaman, dan konsumsi berkualitas.', 5)
) as v(name, company, text, rating)
where not exists (select 1 from public.testimonials);

-- ── SEED: ARTIKEL (contoh) ────────────────────────────────────
insert into public.articles (title, slug, category, excerpt, content, status)
select * from (values
  (
    'Tips Persiapan Umrah Pertama Kali',
    'tips-persiapan-umrah-pertama-kali',
    'Panduan',
    'Panduan lengkap mempersiapkan perjalanan umrah pertama Anda, dari dokumen hingga barang bawaan.',
    '## Dokumen yang Perlu Disiapkan

Pastikan paspor berlaku minimal 6 bulan, visa umrah aktif, dan tiket sudah terkonfirmasi.

## Persiapan Fisik

Perjalanan umrah cukup menguras tenaga. Biasakan berjalan kaki dan istirahat cukup sebelum keberangkatan.

## Koordinasi dengan Pihak Handling

Pilih layanan handling bandara yang berpengalaman agar proses imigrasi dan bagasi berjalan cepat dan lancar.',
    'published'
  ),
  (
    'Apa Itu Handling Bandara untuk Jamaah Umrah?',
    'apa-itu-handling-bandara',
    'Info Layanan',
    'Menjelaskan apa saja yang dikerjakan tim handling bandara untuk kenyamanan rombongan jamaah.',
    '## Pengertian Handling Bandara

Handling bandara adalah layanan pendampingan dan pengurusan kebutuhan jamaah sejak tiba di bandara hingga check-in hotel.

## Layanan yang Diberikan

Imigrasi kilat, penanganan bagasi, porter service, penyediaan konsumsi, dan koordinasi transportasi.

## Kenapa Perlu Handling?

Dengan tim handling, rombongan besar tidak perlu antre lama dan perjalanan ibadah berjalan lebih nyaman.',
    'published'
  ),
  (
    'Mengenal Rute Jeddah – Madinah untuk Travel Umrah',
    'rute-jeddah-madinah',
    'Tips Perjalanan',
    'Informasi rute dan waktu tempuh antara Jeddah dan Madinah untuk perencanaan travel Anda.',
    '## Jarak dan Waktu Tempuh

Perjalanan dari Bandara Jeddah menuju Madinah menempuh jarak sekitar 420 km dengan waktu 4–5 jam.

## Sarana Perjalanan

Kami menyediakan armada transportasi yang nyaman dengan pendampingan penuh selama perjalanan.

## Tips untuk Travel

Siapkan jadwal istirahat dan konsumsi selama perjalanan agar jamaah tetap nyaman.',
    'published'
  )
) as v(title, slug, category, excerpt, content, status)
where not exists (select 1 from public.articles);

-- ── SEED: LAYANAN ─────────────────────────────────────────────
insert into public.services (title, slug, icon, short_desc, content, sort)
select * from (values
  (
    'Imigrasi Kilat', 'imigrasi-kilat', 'fas fa-passport',
    'Pengurusan imigrasi cepat tanpa antre panjang untuk rombongan jamaah.',
    '## Pengurusan Imigrasi Kilat

Tim kami membantu pengurusan imigrasi rombongan jamaah secara cepat dan terkoordinasi.

## Keunggulan

- Jalur khusus dan prioritas di bandara
- Pendampingan langsung oleh petugas handling
- Mengurangi waktu tunggu rombongan

## Manfaat untuk Travel

Rombongan tidak perlu antre panjang, perjalanan ibadah dimulai lebih awal dan nyaman.',
    0
  ),
  (
    'Penanganan Bagasi', 'penanganan-bagasi', 'fas fa-suitcase',
    'Bagasi jamaah diurus dari bandara ke hotel secara aman dan tertib.',
    '## Penanganan Bagasi

Kami mengurus bagasi jamaah mulai dari bandara hingga hotel dengan aman dan tertib.

## Keunggulan

- Pengamanan koper setiap rombongan
- Koordinasi pengiriman ke kamar hotel
- Pelacakan bagasi saat transit

## Manfaat untuk Travel

Jamaah tidak perlu memikirkan barang bawaan dan bisa fokus pada ibadah.',
    1
  ),
  (
    'Porter Service', 'porter-service', 'fas fa-concierge-bell',
    'Tenaga porter profesional membantu jamaah membawa barang bawaan.',
    '## Porter Service

Tim porter profesional siap membantu jamaah membawa barang bawaan dengan ramah dan sigap.

## Keunggulan

- Tenaga porter berpengalaman
- Penanganan barang yang hati-hati
- Siap membantu di area bandara

## Manfaat untuk Travel

Jamaah lanjut usia dan ibu-ibu merasa terbantu, perjalanan lebih ringan dan nyaman.',
    2
  ),
  (
    'Penyediaan Konsumsi', 'penyediaan-konsumsi', 'fas fa-utensils',
    'Katering berkualitas untuk jamaah selama perjalanan darat dan transit.',
    '## Penyediaan Konsumsi

Kami menyediakan konsumsi berkualitas untuk jamaah selama perjalanan darat dan transit.

## Keunggulan

- Menu halal dan bergizi
- Porsi disesuaikan kebutuhan rombongan
- Pengiriman tepat waktu

## Manfaat untuk Travel

Jamaah tetap bertenaga selama perjalanan panjang antar kota.',
    3
  ),
  (
    'Penanganan Transportasi', 'penanganan-transportasi', 'fas fa-bus',
    'Armada nyaman dari bandara ke hotel dan antar kota (Jeddah–Madinah).',
    '## Penanganan Transportasi

Kami menyediakan armada transportasi yang nyaman untuk rombongan jamaah.

## Keunggulan

- Armada terawat dan ber-AC
- Koordinasi penjemputan presisi
- Rute Jeddah – Madinah terlayani

## Manfaat untuk Travel

Perjalanan antar kota aman, nyaman, dan tepat waktu.',
    4
  ),
  (
    'Handling Jamaah 24 Jam', 'handling-jamaah-24-jam', 'fas fa-hands-helping',
    'Pendampingan penuh selama jamaah berada di Arab Saudi, siaga setiap saat.',
    '## Handling Jamaah 24 Jam

Tim kami siaga penuh 24 jam selama jamaah berada di Arab Saudi.

## Keunggulan

- Pendampingan setiap saat
- Penanganan kendala cepat
- Koordinasi dengan pihak travel

## Manfaat untuk Travel

Rombongan selalu terpantau, kendala apa pun langsung ditangani.',
    5
  )
) as v(title, slug, icon, short_desc, content, sort)
where not exists (select 1 from public.services);
