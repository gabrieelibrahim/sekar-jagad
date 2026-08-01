/* ═══════════════════════════════════════════════
   SEKAR JAGAD 43 — Supabase Client (supabase-js v2 via CDN)
   Memuat skrip supabase-js + inisialisasi client.
   Aman dipanggil meski config belum diisi: client jadi null,
   dan halaman tetap berfungsi (fallback statis).
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const cfg = window.SUPABASE_CONFIG || null;
  const ready = !!cfg && typeof cfg.url === 'string' && cfg.url.includes('supabase.co') &&
                typeof cfg.anonKey === 'string' && cfg.anonKey !== 'YOUR_ANON_PUBLIC_KEY' &&
                cfg.anonKey.length > 10;

  window.SUPABASE_READY = ready;

  if (!ready) {
    console.warn('[Sekar Jagad] Supabase belum dikonfigurasi — memakai konten statis.');
    return;
  }

  const supabaseJs = document.createElement('script');

  // Pasang handler SEBELUM set src — kalau script sudah di-cache browser,
  // onload bisa langsung dipanggil dan tidak boleh terlewat.
  supabaseJs.onload = () => {
    try {
      const { createClient } = window.supabase;
      window.supabaseClient = createClient(cfg.url, cfg.anonKey, {
        auth: {
          // Simpan sesi hanya selama tab/browser aktif (sessionStorage).
          // Begitu tab ditutup, sesi hilang → buka admin lagi harus login ulang.
          storage: window.sessionStorage
        }
      });
      window.SUPABASE_READY = true;
    } catch (err) {
      console.error('[Sekar Jagad] Gagal inisialisasi Supabase:', err);
      window.SUPABASE_READY = false;
    }
    document.dispatchEvent(new CustomEvent('supabase:ready'));
  };
  supabaseJs.onerror = () => {
    console.warn('[Sekar Jagad] Gagal memuat supabase-js — memakai konten statis.');
    window.SUPABASE_READY = false;
    document.dispatchEvent(new CustomEvent('supabase:ready'));
  };

  supabaseJs.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  document.head.appendChild(supabaseJs);
})();
