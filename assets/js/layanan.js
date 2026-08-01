/* ═══════════════════════════════════════════════
   SEKAR JAGAD 43 — Halaman Layanan
   Tanpa parameter → daftar semua layanan (grid).
   Dengan ?slug= (atau ?id=) → detail layanan.
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const escapeHtml = (s) => window.API.escapeHtml(s);

  function renderList(items, box) {
    document.title = 'Layanan — Sekar Jagad 43';
    if (!items.length) {
      box.innerHTML = '<div class="artikel-empty">Belum ada layanan.</div>';
      return;
    }
    box.innerHTML = `
      <div class="artikel-grid" style="margin-top: 0;">
        ${items.map(s => `
          <a href="layanan?slug=${encodeURIComponent(s.slug)}" class="artikel-card layanan-card">
            <div class="layanan-card-icon"><i class="${escapeHtml(s.icon || 'fas fa-circle')}"></i></div>
            <div class="artikel-card-body">
              <h3>${escapeHtml(s.title)}</h3>
              <p class="artikel-card-excerpt">${escapeHtml(s.short_desc || '')}</p>
            </div>
          </a>
        `).join('')}
      </div>`;
  }

  async function render() {
    const box = document.getElementById('layananDetail');
    if (!box) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const id = params.get('id');

    // Tanpa parameter → daftar semua layanan
    if (!slug && !id) {
      const ready = await window.API.waitReady();
      if (!ready) {
        box.innerHTML = '<div class="artikel-empty">Layanan tidak tersedia.</div>';
        return;
      }
      let items = [];
      try {
        items = await window.API.services.list({ visibleOnly: true });
      } catch (err) {
        console.error('[Sekar Jagad] Gagal memuat daftar layanan:', err);
      }
      renderList(items, box);
      return;
    }

    const ready = await window.API.waitReady();
    if (!ready) {
      box.innerHTML = '<div class="artikel-empty">Layanan tidak ditemukan.</div>';
      return;
    }

    let service = null;
    try {
      service = slug
        ? await window.API.services.bySlug(slug)
        : await window.API.services.byId(id);
    } catch (err) {
      console.error('[Sekar Jagad] Gagal memuat layanan:', err);
    }

    if (!service) {
      box.innerHTML = '<div class="artikel-empty">Layanan tidak ditemukan.</div>';
      return;
    }

    document.title = `${service.title} — Sekar Jagad 43`;

    box.innerHTML = `
      <article>
        <header class="artikel-detail-header">
          <span class="artikel-card-category">Layanan</span>
          <h1>${escapeHtml(service.title)}</h1>
          ${service.short_desc
            ? `<p style="margin-top: var(--space-md); color: var(--ink-muted); font-size: 1.05rem;">${escapeHtml(service.short_desc)}</p>`
            : ''}
        </header>
        ${service.cover_url
          ? `<img class="artikel-detail-cover" src="${escapeHtml(service.cover_url)}" alt="${escapeHtml(service.title)}">`
          : ''}
        <div class="artikel-body">${window.API.renderContent(service.content)}</div>
        <div class="artikel-detail-actions">
          <a href="index.html#services" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Semua Layanan</a>
          <a href="https://wa.me/6285946454995?text=Assalamualaikum%2C%20saya%20ingin%20bertanya%20tentang%20${encodeURIComponent(service.title)}" target="_blank" rel="noopener" class="btn btn-whatsapp"><i class="fab fa-whatsapp"></i> Konsultasi Gratis</a>
        </div>
      </article>
    `;
  }

  document.addEventListener('DOMContentLoaded', render);
})();
