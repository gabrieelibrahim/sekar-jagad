/* ═══════════════════════════════════════════════
   SEKAR JAGAD 43 — Daftar Artikel (dengan pagination)
   Render daftar artikel dari Supabase, 9 per halaman.
   URL mendukung ?page=N. Fallback: pesan "belum tersedia".
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const escapeHtml = (s) => window.API.escapeHtml(s);
  const formatDate = (s) => window.API.formatDate(s);
  const PAGE_SIZE = 9;

  let allArticles = [];

  function getPageFromUrl() {
    const p = parseInt(new URLSearchParams(window.location.search).get('page'), 10);
    return Number.isFinite(p) && p >= 1 ? p : 1;
  }

  function cardFor(a) {
    const href = `artikel-detail?id=${encodeURIComponent(a.id)}`;
    return `
      <a href="${href}" class="artikel-card artikel-card-link">
        ${a.cover_url
          ? `<img class="artikel-card-cover" src="${escapeHtml(a.cover_url)}" alt="${escapeHtml(a.title)}" loading="lazy">`
          : ''}
        <div class="artikel-card-body">
          ${a.category ? `<span class="artikel-card-category">${escapeHtml(a.category)}</span>` : ''}
          <h3>${escapeHtml(a.title)}</h3>
          <p class="artikel-card-excerpt">${escapeHtml(a.excerpt || '')}</p>
          <div class="artikel-card-meta">${formatDate(a.created_at)}</div>
        </div>
      </a>`;
  }

  function renderGrid(page) {
    const grid = document.getElementById('artikelGrid');
    if (!grid) return;

    const total = allArticles.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const current = Math.min(page, totalPages);
    const start = (current - 1) * PAGE_SIZE;
    const slice = allArticles.slice(start, start + PAGE_SIZE);

    grid.innerHTML = slice.map(cardFor).join('');
    renderPagination(current, totalPages, total);
    return current;
  }

  function renderPagination(current, totalPages, total) {
    const wrap = document.getElementById('artikelPagination');
    if (!wrap) return;
    if (totalPages <= 1) { wrap.innerHTML = ''; return; }

    const btn = (label, page, opts = {}) => {
      const attrs = opts.disabled ? ' disabled' : '';
      const cls = opts.active ? ' active' : '';
      return `<button type="button" class="pagination-btn${cls}" data-page="${page}"${attrs}>${label}</button>`;
    };

    // Nomor halaman, dipadatkan dengan "…" bila banyak
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - current) <= 2) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…');
      }
    }

    let html = `<span class="pagination-info">${total} artikel</span>`;
    html += btn('‹', current - 1, { disabled: current === 1 });
    pages.forEach(p => {
      html += p === '…'
        ? '<span class="pagination-dots">…</span>'
        : btn(p, p, { active: p === current });
    });
    html += btn('›', current + 1, { disabled: current === totalPages });

    wrap.innerHTML = `<div class="artikel-pagination">${html}</div>`;

    wrap.querySelectorAll('[data-page]').forEach(b => {
      b.addEventListener('click', () => {
        if (b.disabled) return;
        const p = parseInt(b.dataset.page, 10);
        window.history.pushState({ page: p }, '', `artikel.html?page=${p}`);
        renderGrid(p);
      });
    });
  }

  async function render() {
    const grid = document.getElementById('artikelGrid');
    if (!grid) return;

    // Tunggu supabase-js siap — kalau belum, list() mengembalikan []
    // dan artikel dianggap kosong (penyebab "kadang muncul, kadang tidak").
    const ready = await window.API.waitReady();
    if (!ready) {
      grid.innerHTML = '<div class="artikel-empty">Belum ada artikel. Silakan cek kembali nanti.</div>';
      return;
    }

    try {
      allArticles = await window.API.articles.list({ publishedOnly: true });
    } catch (err) {
      console.error('[Sekar Jagad] Gagal memuat artikel:', err);
      allArticles = [];
    }

    if (!allArticles.length) {
      grid.innerHTML = '<div class="artikel-empty">Belum ada artikel. Silakan cek kembali nanti.</div>';
      return;
    }

    renderGrid(getPageFromUrl());
  }

  // Mendukung tombol back/forward browser antar halaman
  window.addEventListener('popstate', () => {
    if (document.getElementById('artikelGrid')) renderGrid(getPageFromUrl());
  });

  document.addEventListener('DOMContentLoaded', render);
})();
