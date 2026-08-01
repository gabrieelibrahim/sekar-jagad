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

/* ═══ SEO: update meta dinamis setelah artikel dimuat ═══ */
(function updateSEOMeta() {
  const origRender = window.renderArtikelDetail || null;
  const applyMeta = (artikel) => {
    if (!artikel) return;
    const title = artikel.title ? artikel.title + " — Sekar Jagad 43" : document.title;
    const desc = (artikel.excerpt || artikel.content || "").toString().replace(/<[^>]*>/g, "").slice(0, 155);
    document.title = title;
    const setMeta = (sel, attr, val) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content", desc);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", desc);
    setMeta('meta[property="og:url"]', "content", window.location.href);
    setMeta('link[rel="canonical"]', "href", window.location.href);
    if (artikel.cover_url) setMeta('meta[property="og:image"]', "content", artikel.cover_url);
  };
  const orig = window.API && window.API.loadArtikel ? window.API.loadArtikel : null;
  if (orig) {
    const wrapped = async (...args) => {
      const r = await orig.apply(window.API, args);
      if (r) applyMeta(r);
      return r;
    };
    window.API.loadArtikel = wrapped;
  }
  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;
    const tryApply = () => {
      const el = document.querySelector(".artikel-title, h1");
      if (el && el.textContent.trim()) {
        applyMeta({ title: el.textContent.trim(), excerpt: el.textContent.trim() });
      }
    };
    setTimeout(tryApply, 1200);
    setTimeout(tryApply, 3000);
  });
})();
