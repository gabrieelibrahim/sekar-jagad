/* ═══════════════════════════════════════════════
   SEKAR JAGAD 43 — Detail Artikel
   Render artikel berdasarkan ?id= dari URL.
   Fallback: pesan "tidak ditemukan".
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const escapeHtml = (s) => window.API.escapeHtml(s);
  const formatDate = (s) => window.API.formatDate(s);

  async function render() {
    const box = document.getElementById('artikelDetail');
    if (!box) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      box.innerHTML = '<div class="artikel-empty">Artikel tidak ditemukan.</div>';
      return;
    }

    // Tunggu supabase-js siap sebelum memuat artikel.
    const ready = await window.API.waitReady();
    if (!ready) {
      box.innerHTML = '<div class="artikel-empty">Artikel tidak ditemukan.</div>';
      return;
    }

    let article = null;
    try {
      article = await window.API.articles.byId(id);
    } catch (err) {
      console.error('[Sekar Jagad] Gagal memuat artikel:', err);
    }

    if (!article) {
      box.innerHTML = '<div class="artikel-empty">Artikel tidak ditemukan.</div>';
      return;
    }

    document.title = `${article.title} — Sekar Jagad 43`;

    box.innerHTML = `
      <article>
        <header class="artikel-detail-header">
          ${article.category ? `<span class="artikel-card-category">${escapeHtml(article.category)}</span>` : ''}
          <h1>${escapeHtml(article.title)}</h1>
          <div class="artikel-detail-meta">Dipublikasikan ${formatDate(article.created_at)}</div>
        </header>
        ${article.cover_url
          ? `<img class="artikel-detail-cover" src="${escapeHtml(article.cover_url)}" alt="${escapeHtml(article.title)}">`
          : ''}
        <div class="artikel-body">${window.API.renderContent(article.content)}</div>
        <div class="artikel-detail-actions">
          <a href="artikel.html" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Semua Artikel</a>
          <a href="https://wa.me/6285946454995?text=Assalamualaikum%2C%20saya%20tertarik%20dengan%20layanan%20Sekar%20Jagad%2043" target="_blank" rel="noopener" class="btn btn-whatsapp"><i class="fab fa-whatsapp"></i> Konsultasi Gratis</a>
        </div>
      </article>
    `;
  }

  document.addEventListener('DOMContentLoaded', render);
})();
