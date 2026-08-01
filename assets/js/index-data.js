/* ═══════════════════════════════════════════════
   SEKAR JAGAD 43 — Data dinamis di halaman utama
   Render paket, galeri, dan testimoni dari Supabase.
   Progressive enhancement: jika data gagal dimuat atau
   Supabase belum dikonfigurasi, konten statis di index.html
   tetap tampil apa adanya (fallback).
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const esc = (s) => window.API.escapeHtml(s);
  const WA = 'https://wa.me/6285946454995?text=Assalamualaikum%2C%20saya%20tertarik%20dengan%20layanan%20Sekar%20Jagad%2043';

  function cardFor(pkg) {
    const features = (pkg.features || []).map(f =>
      `<li><i class="fas fa-check"></i> ${esc(f)}</li>`).join('');
    const badge = pkg.badge ? `<div class="package-badge">${esc(pkg.badge)}</div>` : '';
    return `
      <div class="package-card ${pkg.featured ? 'featured ' : ''}js-reveal revealed">
        ${badge}
        <div class="package-header">
          <h3>${esc(pkg.name)}</h3>
          <div class="package-price">
            <span class="price">${esc(pkg.price)}</span>
            <span class="suffix">${esc(pkg.currency || 'SAR')} /pax</span>
          </div>
        </div>
        <div class="package-body">
          <ul class="package-features">${features}</ul>
        </div>
        <div class="package-footer">
          <a href="${WA}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-block"><i class="fab fa-whatsapp"></i> Booking Sekarang</a>
        </div>
      </div>`;
  }

  async function renderPackages() {
    const grid = document.getElementById('packagesGrid');
    if (!grid) return;
    let items;
    try {
      items = await window.API.packages.list();
    } catch (err) {
      console.error('[Sekar Jagad] Gagal memuat paket:', err);
      return;
    }
    if (!items || !items.length) return; // fallback ke statis
    grid.innerHTML = items.map(cardFor).join('');
    layoutPackages(items.length);
    wirePackageSlider();
  }

  /* Paket 1–3: track dibuat flexbaris dengan lebar otomatis, tidak scroll,
     lalu dipusatkan di tengah. Paket >3: mode slider geser (scroll). */
  function layoutPackages(count) {
    const wrap = document.getElementById('paketSliderWrap');
    const scroll = document.getElementById('paketSlider');
    const track = document.getElementById('packagesGrid');
    if (!wrap || !scroll || !track) return;

    const arrowsVisible = count > 3;
    wrap.classList.toggle('paket-centered', !arrowsVisible);

    // Kartu paket: tampilkan semua bila sedikit (tanpa scroll), beri lebar fleksibel.
    track.classList.toggle('paket-track-fit', count <= 3);
    scroll.classList.toggle('paket-scroll-fit', count <= 3);
    track.style.width = arrowsVisible ? '' : 'max-content';
    scroll.style.overflowX = arrowsVisible ? 'auto' : 'visible';

    const prev = wrap.querySelector('.paket-slider-prev');
    const next = wrap.querySelector('.paket-slider-next');
    if (prev) prev.style.display = arrowsVisible ? '' : 'none';
    if (next) next.style.display = arrowsVisible ? '' : 'none';
  }

  function wirePackageSlider() {
    const scrollEl = document.getElementById('paketSlider');
    const prev = document.querySelector('.paket-slider-prev');
    const next = document.querySelector('.paket-slider-next');
    if (!scrollEl || !prev || !next) return;
    if (scrollEl.dataset.wired) return;
    scrollEl.dataset.wired = '1';
    const step = () => {
      const item = scrollEl.querySelector('.package-card');
      return item ? item.offsetWidth + 24 : 420;
    };
    prev.addEventListener('click', () => scrollEl.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => scrollEl.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  async function renderGallery() {
    const track = document.getElementById('galleryTrack');
    if (!track) return;
    let items;
    try {
      items = await window.API.gallery.list();
    } catch (err) {
      console.error('[Sekar Jagad] Gagal memuat galeri:', err);
      return;
    }
    if (!items || !items.length) return; // fallback ke statis
    track.innerHTML = items.map(g =>
      `<div class="gallery-item"><img src="${esc(g.image_url)}" alt="${esc(g.caption || 'Dokumentasi Sekar Jagad 43')}" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block;" loading="lazy"></div>`
    ).join('');
  }

  function stars(n) {
    const count = Math.max(0, Math.min(5, n || 5));
    return '<i class="fas fa-star"></i>'.repeat(count);
  }

  async function renderTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    if (!grid) return;
    let items;
    try {
      items = await window.API.testimonials.list();
    } catch (err) {
      console.error('[Sekar Jagad] Gagal memuat testimoni:', err);
      return;
    }
    if (!items || !items.length) return; // fallback ke statis
    grid.innerHTML = items.map(t => `
      <div class="testimonial-card js-reveal revealed">
        <div class="testimonial-stars">${stars(t.rating)}</div>
        <p class="testimonial-text">"${esc(t.text)}"</p>
        <div class="testimonial-author">
          <i class="fas fa-user-circle"></i>
          <div>
            <h4>${esc(t.name)}</h4>
            <span>${esc(t.company || '')}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function waitForClient(timeout = 6000) {
    if (window.API.isReady()) return Promise.resolve();
    return new Promise(resolve => {
      const t = setTimeout(() => resolve(), timeout);
      document.addEventListener('supabase:ready', () => {
        clearTimeout(t);
        resolve();
      }, { once: true });
    });
  }

  /* ── Artikel terbaru (homepage, slider 1 baris, maks 10) ── */
  async function renderLatestArticles() {
    const track = document.getElementById('artikelHomeGrid');
    if (!track) return;
    let items;
    try {
      items = await window.API.articles.list({ publishedOnly: true });
    } catch (err) {
      console.error('[Sekar Jagad] Gagal memuat artikel terbaru:', err);
      return;
    }
    if (!items || !items.length) {
      track.innerHTML = '<div class="artikel-empty">Belum ada artikel. Silakan cek kembali nanti.</div>';
      return;
    }
    const latest = items.slice(0, 10);
    track.innerHTML = latest.map(a => `
      <a href="artikel-detail?id=${encodeURIComponent(a.id)}" class="artikel-card artikel-slider-item artikel-card-link">
        ${a.cover_url
          ? `<img class="artikel-card-cover" src="${esc(a.cover_url)}" alt="${esc(a.title)}" loading="lazy">`
          : ''}
        <div class="artikel-card-body">
          ${a.category ? `<span class="artikel-card-category">${esc(a.category)}</span>` : ''}
          <h3>${esc(a.title)}</h3>
          <p class="artikel-card-excerpt">${esc(a.excerpt || '')}</p>
          <div class="artikel-card-meta">${window.API.formatDate(a.created_at)}</div>
        </div>
      </a>
    `).join('');
    wireArticleSlider();
  }

  /* Tombol panah slider artikel (mirip galeri). */
  function wireArticleSlider() {
    const scrollEl = document.getElementById('artikelSlider');
    const prev = document.querySelector('.artikel-slider-prev');
    const next = document.querySelector('.artikel-slider-next');
    if (!scrollEl || !prev || !next) return;
    if (scrollEl.dataset.wired) return;
    scrollEl.dataset.wired = '1';
    const step = () => {
      const item = scrollEl.querySelector('.artikel-slider-item');
      return item ? item.offsetWidth + 24 : 380;
    };
    prev.addEventListener('click', () => scrollEl.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => scrollEl.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  async function run() {
    if (!window.API) return; // api.js tidak dimuat
    await waitForClient();
    if (!window.API.isReady()) return; // Supabase belum siap → fallback statis
    // Jalankan berurutan agar tidak membebani; error satu tidak memengaruhi lain.
    await Promise.all([renderPackages(), renderGallery(), renderTestimonials(), renderLatestArticles()]);
  }

  document.addEventListener('DOMContentLoaded', run);
})();
