/* ═══════════════════════════════════════════════
   SEKAR JAGAD 43 — Mega Menu "Layanan" (navbar)
   Memuat daftar layanan dari Supabase ke .mega-menu-items.
   Hover (desktop) atau klik (mobile) membuka panel.
   Fallback: 6 item statis jika Supabase belum siap.
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const esc = (s) => window.API.escapeHtml(s);

  // Fallback statis (tanpa Supabase)
  const FALLBACK = [
    { title: 'Imigrasi Kilat', slug: 'imigrasi-kilat', icon: 'fas fa-passport', short_desc: 'Pengurusan imigrasi cepat tanpa antre panjang untuk rombongan jamaah.' },
    { title: 'Penanganan Bagasi', slug: 'penanganan-bagasi', icon: 'fas fa-suitcase', short_desc: 'Bagasi jamaah diurus dari bandara ke hotel secara aman dan tertib.' },
    { title: 'Porter Service', slug: 'porter-service', icon: 'fas fa-concierge-bell', short_desc: 'Tenaga porter profesional membantu jamaah membawa barang bawaan.' },
    { title: 'Penyediaan Konsumsi', slug: 'penyediaan-konsumsi', icon: 'fas fa-utensils', short_desc: 'Katering berkualitas untuk jamaah selama perjalanan darat dan transit.' },
    { title: 'Penanganan Transportasi', slug: 'penanganan-transportasi', icon: 'fas fa-bus', short_desc: 'Armada nyaman dari bandara ke hotel dan antar kota.' },
    { title: 'Handling Jamaah 24 Jam', slug: 'handling-jamaah-24-jam', icon: 'fas fa-hands-helping', short_desc: 'Pendampingan penuh selama jamaah berada di Arab Saudi.' }
  ];

  function itemHTML(s) {
    return `
      <a href="layanan?slug=${encodeURIComponent(s.slug)}" class="mega-menu-item">
        <span class="mega-item-icon">${s.icon ? `<i class="${esc(s.icon)}"></i>` : '<i class="fas fa-circle"></i>'}</span>
        <span class="mega-item-text">
          <strong>${esc(s.title)}</strong>
          <small>${esc(s.short_desc || '')}</small>
        </span>
      </a>`;
  }

  function fill(items) {
    const boxes = document.querySelectorAll('.mega-menu-items');
    if (!boxes.length) return;
    const html = items.map(itemHTML).join('');
    boxes.forEach(box => { box.innerHTML = html; });
  }

  function initInteraction(trigger) {
    if (!trigger || trigger.dataset.navWired) return;
    trigger.dataset.navWired = '1';

    const panel = trigger.querySelector('.mega-panel');
    if (!panel) return;

    let closeTimer = null;
    const open = () => {
      clearTimeout(closeTimer);
      panel.classList.add('open');
      trigger.classList.add('active');
    };
    const close = () => {
      closeTimer = setTimeout(() => {
        panel.classList.remove('open');
        trigger.classList.remove('active');
      }, 150);
    };

    trigger.addEventListener('mouseenter', open);
    trigger.addEventListener('mouseleave', close);
    panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    panel.addEventListener('mouseleave', close);

    // Mobile / klik: buka-tutup sekali klik
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = panel.classList.contains('open');
      document.querySelectorAll('.mega-panel.open').forEach(p => {
        if (p !== panel) { p.classList.remove('open'); p.closest('.nav-has-mega')?.classList.remove('active'); }
      });
      if (isOpen) close();
      else open();
    });

    // Tutup saat klik di luar
    document.addEventListener('click', (e) => {
      if (!trigger.contains(e.target)) close();
    });
  }

  async function load() {
    let items = FALLBACK;

    // Tunggu supabase-js siap (dimuat async via CDN) sebelum mengambil data.
    // Tanpa ini, isReady() bisa false saat DOMContentLoaded → menu jatuh ke fallback statis.
    if (window.API) {
      const ready = await window.API.waitReady();
      if (ready) {
        try {
          const fromDb = await window.API.services.list({ visibleOnly: true });
          if (fromDb && fromDb.length) items = fromDb;
        } catch (err) {
          console.error('[Sekar Jagad] Gagal memuat menu layanan:', err);
        }
      }
    }
    fill(items);

    document.querySelectorAll('.nav-has-mega').forEach(initInteraction);

    // Render section #services di beranda dari data yang sama (jika ada)
    if (items !== FALLBACK) {
      renderSection(items);
    }
  }

  function renderSection(items) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    // Halaman utama: maksimal 6 kartu; kalau lebih tampilkan tombol "Selengkapnya".
    const shown = items.slice(0, 6);
    grid.innerHTML = shown.map(s => `
      <a href="layanan?slug=${encodeURIComponent(s.slug)}" class="service-item js-reveal revealed">
        <div class="service-icon"><i class="${esc(s.icon || 'fas fa-circle')}"></i></div>
        <div>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.short_desc || '')}</p>
        </div>
      </a>
    `).join('');

    if (items.length > 6) {
      const btn = document.getElementById('servicesMore');
      if (btn) {
        btn.classList.remove('hidden');
        btn.querySelector('a').textContent = `Selengkapnya (${items.length} layanan)`;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', load);
})();
