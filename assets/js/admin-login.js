/* ═══════════════════════════════════════════════
   SEKAR JAGAD 43 — Halaman Login Admin
   Terpisah dari dashboard (admin.html).
   Setelah login berhasil → redirect ke admin.html.
   Sudah login → langsung redirect ke admin.html.
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  async function init() {
    // Tunggu supabase-js siap dulu — kalau sudah login, langsung ke dashboard.
    const ready = await window.API.waitReady();
    if (!ready) return; // config belum diisi → user akan lihat pesan saat login

    try {
      const session = await window.API.auth.getSession();
      if (session) {
        window.location.replace('admin.html');
      }
    } catch (err) {
      console.error('[Sekar Jagad] Gagal cek sesi:', err);
    }
  }

  const form = $('#loginForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = $('#loginError');
      errBox.classList.remove('show');
      const email = $('#loginEmail').value.trim();
      const password = $('#loginPassword').value;

      if (!window.API.isReady()) {
        errBox.textContent = 'Supabase belum siap. Tunggu sebentar lalu coba lagi, atau pastikan config.js sudah diisi.';
        errBox.classList.add('show');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        await window.API.auth.signIn(email, password);
        window.location.replace('admin.html');
      } catch (err) {
        console.error(err);
        errBox.textContent = 'Email atau password salah.';
        errBox.classList.add('show');
        btn.disabled = false;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
