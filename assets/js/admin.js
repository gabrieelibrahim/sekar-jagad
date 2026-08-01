/* ═══════════════════════════════════════════════
   SEKAR JAGAD 43 — Panel Admin (AdminLTE 4 / Bootstrap 5)
   Auth (Supabase), CRUD: artikel, galeri, testimoni, paket.
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const esc = (s) => window.API.escapeHtml(s);
  const fmt = (s) => window.API.formatDate(s);

  /* ── Toast (Bootstrap) ── */
  function toast(msg, type = 'success') {
    const el = $('#adminToast');
    const msgEl = $('#adminToastMsg');
    if (!el || !msgEl) return;
    el.classList.remove('text-bg-success', 'text-bg-danger');
    el.classList.add(type === 'danger' ? 'text-bg-danger' : 'text-bg-success');
    msgEl.textContent = msg;
    bootstrap.Toast.getOrCreateInstance(el).show();
  }

  /* ── Modal konfirmasi (Bootstrap) ── */
  function confirmModal(title, text) {
    return new Promise(resolve => {
      const modalEl = $('#confirmModal');
      $('#confirmTitle').textContent = title;
      $('#confirmText').textContent = text;
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      const ok = $('#confirmOk');
      const cancel = $('#confirmCancel'); // boleh null — tombol Batal pakai data-bs-dismiss

      let settled = false;
      const done = (val) => {
        if (settled) return;      // cegah resolve ganda
        settled = true;
        cleanup();
        modal.hide();
        resolve(val);
      };
      const cleanup = () => {
        ok.onclick = null;
        if (cancel) cancel.onclick = null;
        modalEl.removeEventListener('hidden.bs.modal', onHidden);
      };
      const onHidden = () => done(false); // Batal (X / backdrop / data-bs-dismiss) → false

      ok.onclick = () => done(true);
      if (cancel) cancel.onclick = () => done(false);
      modalEl.addEventListener('hidden.bs.modal', onHidden);
      modal.show();
    });
  }

  /* ── State aplikasi ── */
  const state = {
    editing: null,        // { type, id } data yang sedang diedit
    articles: [],
    services: [],
    testimonials: [],
    packages: []
  };

  /* ══════════ AUTH (halaman dashboard — guard) ══════════ */
  async function showApp(session) {
    $('#adminApp').hidden = false;
    $('#adminUser').textContent = (session.user && session.user.email) ? session.user.email : 'Admin';
    await Promise.all([loadArticles(), loadServices(), loadGallery(), loadTestimonials(), loadPackages()]);
  }

  async function init() {
    // Tunggu supabase-js siap (dimuat async). Kalau timeout → config belum diisi.
    const ready = await window.API.waitReady();
    if (!ready) {
      window.location.replace('admin-login.html');
      return;
    }

    try {
      const session = await window.API.auth.getSession();
      if (session) {
        await showApp(session);
      } else {
        // Belum login → ke halaman login terpisah.
        window.location.replace('admin-login.html');
      }
    } catch (err) {
      console.error(err);
      window.location.replace('admin-login.html');
    }
  }

  $('#btnLogout').addEventListener('click', async () => {
    try { await window.API.auth.signOut(); } catch (e) { /* ignore */ }
    window.location.replace('admin-login.html');
  });

  /* ══════════ NAVIGASI TAB (sidebar + title) ══════════ */
  const TAB_META = {
    articles:      { title: 'Artikel',      crumb: 'Artikel' },
    services:      { title: 'Layanan',      crumb: 'Layanan' },
    gallery:       { title: 'Galeri',       crumb: 'Galeri' },
    testimonials:  { title: 'Testimoni',    crumb: 'Testimoni' },
    packages:      { title: 'Paket',        crumb: 'Paket' }
  };

  function setActiveTab(key) {
    $$('.sidebar-menu .nav-link').forEach(l => l.classList.toggle('active', l.dataset.tab === key));
    $$('.admin-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + key));
    const meta = TAB_META[key];
    if (meta) {
      $('#pageTitle').textContent = meta.title;
      $('#pageCrumb').textContent = meta.crumb;
    }
  }

  $$('.sidebar-menu .nav-link[data-tab]').forEach(link =>
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setActiveTab(link.dataset.tab);
    }));

  /* ══════════ ARTIKEL ══════════ */
  function slugify(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async function loadArticles() {
    const listEl = $('#articleList');
    listEl.innerHTML = '<div class="text-center py-5 text-secondary"><i class="bi bi-arrow-repeat"></i> Memuat…</div>';
    try {
      state.articles = await window.API.articles.list({ publishedOnly: false });
    } catch (err) {
      console.error(err);
      state.articles = [];
    }
    renderArticles();
  }

  function renderArticles() {
    const listEl = $('#articleList');
    if (!state.articles.length) {
      listEl.innerHTML = '<div class="text-center py-5 text-secondary">Belum ada artikel. Klik "Artikel Baru" untuk membuat.</div>';
      return;
    }
    listEl.innerHTML = `
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th style="width:40px;">#</th>
            <th>Judul</th>
            <th class="d-none d-md-table-cell">Kategori</th>
            <th class="d-none d-lg-table-cell">Status</th>
            <th class="text-end">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${state.articles.map((a, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>
                <div class="fw-semibold">${esc(a.title)}</div>
                <div class="text-secondary fs-7 d-md-none">${fmt(a.created_at)}</div>
                ${a.cover_url ? `<img src="${esc(a.cover_url)}" alt="" style="width:56px;height:36px;object-fit:cover;border-radius:4px;" class="mt-1">` : ''}
              </td>
              <td class="d-none d-md-table-cell">${esc(a.category || '—')}</td>
              <td class="d-none d-lg-table-cell">
                <span class="badge text-bg-${a.status === 'published' ? 'success' : 'secondary'}">${esc(a.status)}</span>
              </td>
              <td class="text-end text-nowrap">
                <a class="btn btn-sm btn-outline-secondary" target="_blank" rel="noopener" href="artikel-detail?id=${encodeURIComponent(a.id)}" title="Lihat"><i class="bi bi-eye"></i></a>
                <button class="btn btn-sm btn-outline-primary" data-edit-article="${a.id}" title="Edit"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" data-del-article="${a.id}" title="Hapus"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

    $$('[data-edit-article]', listEl).forEach(btn =>
      btn.addEventListener('click', () => openArticleForm(state.articles.find(a => a.id === btn.dataset.editArticle))));
    $$('[data-del-article]', listEl).forEach(btn =>
      btn.addEventListener('click', () => deleteArticle(btn.dataset.delArticle)));
  }

  function openArticleForm(article) {
    state.editing = article ? { type: 'article', id: article.id } : { type: 'article', id: null };
    const wrap = $('#articleFormWrap');
    const a = article || {};
    wrap.innerHTML = `
      <div class="card mb-3 border-primary">
        <div class="card-header bg-primary-subtle">
          <h3 class="card-title mb-0 fs-6">${a.id ? 'Edit Artikel' : 'Artikel Baru'}</h3>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="f_title" class="form-label">Judul</label>
            <input type="text" class="form-control" id="f_title" value="${esc(a.title || '')}" required>
          </div>
          <div class="row g-3">
            <div class="col-md-6">
              <label for="f_slug" class="form-label">Slug (URL)</label>
              <input type="text" class="form-control" id="f_slug" value="${esc(a.slug || '')}" placeholder="auto dari judul">
            </div>
            <div class="col-md-6">
              <label for="f_category" class="form-label">Kategori</label>
              <input type="text" class="form-control" id="f_category" value="${esc(a.category || '')}" placeholder="mis. Tips Perjalanan">
            </div>
          </div>
          <div class="mb-3 mt-3">
            <label for="f_excerpt" class="form-label">Ringkasan</label>
            <textarea class="form-control" id="f_excerpt" rows="2" placeholder="Ringkasan singkat yang tampil di daftar artikel.">${esc(a.excerpt || '')}</textarea>
          </div>
          <div class="mb-3">
            <label for="f_cover" class="form-label">URL Gambar Sampul</label>
            <input type="url" class="form-control" id="f_cover" value="${esc(a.cover_url || '')}" placeholder="https://… atau upload di tab Galeri lalu salin URL-nya">
          </div>
          <div class="mb-3">
            <label for="f_content" class="form-label">Isi Artikel</label>
            <textarea class="form-control" id="f_content" rows="10" placeholder="Tulis artikel di sini. Gunakan ## untuk sub-judul, kosongkan satu baris antar paragraf, dan '-' untuk poin list.">${esc(a.content || '')}</textarea>
            <div class="form-text">Format: "## Sub-judul", paragraf dipisah baris kosong, "- poin" untuk list.</div>
          </div>
          <div class="row g-3">
            <div class="col-md-4">
              <label for="f_status" class="form-label">Status</label>
              <select class="form-select" id="f_status">
                <option value="published" ${(a.status || 'published') === 'published' ? 'selected' : ''}>Published</option>
                <option value="draft" ${a.status === 'draft' ? 'selected' : ''}>Draft</option>
              </select>
            </div>
          </div>
        </div>
        <div class="card-footer d-flex gap-2">
          <button class="btn btn-primary btn-sm" id="btnSaveArticle"><i class="bi bi-save me-1"></i> Simpan</button>
          <button class="btn btn-outline-secondary btn-sm" id="btnCancelArticle">Batal</button>
        </div>
      </div>`;

    const slugInput = $('#f_slug');
    const titleInput = $('#f_title');
    titleInput.addEventListener('input', () => {
      if (!slugInput.dataset.touched) slugInput.value = slugify(titleInput.value);
    });
    slugInput.addEventListener('input', () => { slugInput.dataset.touched = '1'; });

    $('#btnCancelArticle').addEventListener('click', () => {
      wrap.innerHTML = '';
      state.editing = null;
    });
    $('#btnSaveArticle').addEventListener('click', () => saveArticle());
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function saveArticle() {
    const data = {
      title: $('#f_title').value.trim(),
      slug: slugify($('#f_slug').value.trim()) || slugify($('#f_title').value.trim()),
      category: $('#f_category').value.trim(),
      excerpt: $('#f_excerpt').value.trim(),
      cover_url: $('#f_cover').value.trim() || null,
      content: $('#f_content').value,
      status: $('#f_status').value
    };
    if (!data.title) { toast('Judul tidak boleh kosong', 'danger'); return; }
    if (!data.content.trim()) { toast('Isi artikel tidak boleh kosong', 'danger'); return; }

    const btn = $('#btnSaveArticle');
    btn.disabled = true;
    try {
      if (state.editing && state.editing.id) {
        await window.API.articles.update(state.editing.id, data);
        toast('Artikel diperbarui');
      } else {
        await window.API.articles.create(data);
        toast('Artikel dibuat');
      }
      $('#articleFormWrap').innerHTML = '';
      state.editing = null;
      await loadArticles();
    } catch (err) {
      console.error(err);
      toast('Gagal menyimpan artikel. Periksa slug sudah dipakai?', 'danger');
      btn.disabled = false;
    }
  }

  async function deleteArticle(id) {
    const ok = await confirmModal('Hapus artikel?', 'Artikel yang dihapus tidak dapat dikembalikan.');
    if (!ok) return;
    try {
      await window.API.articles.remove(id);
      toast('Artikel dihapus');
      await loadArticles();
    } catch (err) {
      console.error(err);
      toast('Gagal menghapus artikel', 'danger');
    }
  }

  $('#btnNewArticle').addEventListener('click', () => openArticleForm(null));

  /* ══════════ LAYANAN ══════════ */
  async function loadServices() {
    const listEl = $('#serviceList');
    listEl.innerHTML = '<div class="text-center py-5 text-secondary"><i class="bi bi-arrow-repeat"></i> Memuat…</div>';
    try {
      state.services = await window.API.services.list(); // semua (termasuk non-visible) untuk admin
    } catch (err) {
      console.error(err);
      state.services = [];
    }
    renderServices();
  }

  function renderServices() {
    const listEl = $('#serviceList');
    if (!state.services.length) {
      listEl.innerHTML = '<div class="text-center py-5 text-secondary">Belum ada layanan. Klik "Layanan Baru" untuk menambah.</div>';
      return;
    }
    listEl.innerHTML = `
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th style="width:40px;">#</th>
            <th>Layanan</th>
            <th class="d-none d-md-table-cell">Slug</th>
            <th class="d-none d-lg-table-cell">Tampil</th>
            <th class="text-end">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${state.services.map((s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>
                <div class="fw-semibold">${s.icon ? `<i class="${esc(s.icon)} me-2"></i>` : ''}${esc(s.title)}</div>
                <div class="text-secondary fs-7 d-md-none">${esc(s.slug)}</div>
              </td>
              <td class="d-none d-md-table-cell"><code>${esc(s.slug)}</code></td>
              <td class="d-none d-lg-table-cell">
                <span class="badge text-bg-${s.visible ? 'success' : 'secondary'}">${s.visible ? 'Tampil' : 'Tersembunyi'}</span>
              </td>
              <td class="text-end text-nowrap">
                <a class="btn btn-sm btn-outline-secondary" target="_blank" rel="noopener" href="layanan?slug=${encodeURIComponent(s.slug)}" title="Lihat"><i class="bi bi-eye"></i></a>
                <button class="btn btn-sm btn-outline-primary" data-edit-svc="${s.id}" title="Edit"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" data-del-svc="${s.id}" title="Hapus"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

    $$('[data-edit-svc]', listEl).forEach(btn =>
      btn.addEventListener('click', () => openServiceForm(state.services.find(s => s.id === btn.dataset.editSvc))));
    $$('[data-del-svc]', listEl).forEach(btn =>
      btn.addEventListener('click', () => deleteService(btn.dataset.delSvc)));
  }

  function openServiceForm(service) {
    state.editing = service ? { type: 'service', id: service.id } : { type: 'service', id: null };
    const wrap = $('#serviceFormWrap');
    const s = service || {};
    wrap.innerHTML = `
      <div class="card mb-3 border-primary">
        <div class="card-header bg-primary-subtle">
          <h3 class="card-title mb-0 fs-6">${s.id ? 'Edit Layanan' : 'Layanan Baru'}</h3>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="s_title" class="form-label">Nama Layanan</label>
              <input type="text" class="form-control" id="s_title" value="${esc(s.title || '')}" required>
            </div>
            <div class="col-md-6">
              <label for="s_slug" class="form-label">Slug (URL)</label>
              <input type="text" class="form-control" id="s_slug" value="${esc(s.slug || '')}" placeholder="auto dari nama">
            </div>
          </div>
          <div class="row g-3 mt-1">
            <div class="col-md-6">
              <label class="form-label d-block">Ikon</label>
              <div class="icon-picker-trigger">
                <button type="button" class="icon-picker-preview" id="s_icon_preview" aria-label="Pilih ikon"></button>
                <input type="text" class="form-control" id="s_icon" value="${esc(s.icon || '')}" placeholder="Klik untuk memilih ikon">
              </div>
              <div class="form-text">Klik kotak/field untuk membuka galeri ikon.</div>
            </div>
            <div class="col-md-6">
              <label for="s_sort" class="form-label">Urutan</label>
              <input type="number" class="form-control" id="s_sort" value="${s.sort != null ? s.sort : 0}" min="0">
            </div>
          </div>
          <div class="mb-3 mt-3">
            <label for="s_short" class="form-label">Deskripsi Singkat (di dropdown)</label>
            <textarea class="form-control" id="s_short" rows="2">${esc(s.short_desc || '')}</textarea>
          </div>
          <div class="mb-3">
            <label for="s_cover" class="form-label">URL Gambar (opsional)</label>
            <input type="url" class="form-control" id="s_cover" value="${esc(s.cover_url || '')}" placeholder="https://…">
          </div>
          <div class="mb-3">
            <label for="s_content" class="form-label">Isi Halaman Layanan</label>
            <textarea class="form-control" id="s_content" rows="8" placeholder="Tulis isi halaman. Gunakan ## untuk sub-judul, baris kosong antar paragraf, '-' untuk list.">${esc(s.content || '')}</textarea>
            <div class="form-text">Format: "## Sub-judul", paragraf dipisah baris kosong, "- poin" untuk list.</div>
          </div>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="s_visible" ${s.visible !== false ? 'checked' : ''}>
            <label class="form-check-label" for="s_visible">Tampilkan di dropdown menu &amp; halaman</label>
          </div>
        </div>
        <div class="card-footer d-flex gap-2">
          <button class="btn btn-primary btn-sm" id="btnSaveSvc"><i class="bi bi-save me-1"></i> Simpan</button>
          <button class="btn btn-outline-secondary btn-sm" id="btnCancelSvc">Batal</button>
        </div>
      </div>`;

    const slugInput = $('#s_slug');
    const titleInput = $('#s_title');
    titleInput.addEventListener('input', () => {
      if (!slugInput.dataset.touched) slugInput.value = slugify(titleInput.value);
    });
    slugInput.addEventListener('input', () => { slugInput.dataset.touched = '1'; });

    $('#btnCancelSvc').addEventListener('click', () => { wrap.innerHTML = ''; state.editing = null; });
    $('#btnSaveSvc').addEventListener('click', () => saveService());

    // Icon picker
    if (window.IconPicker) {
      window.IconPicker.init($('#s_icon'), $('#s_icon_preview'));
    }

    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function saveService() {
    const data = {
      title: $('#s_title').value.trim(),
      slug: slugify($('#s_slug').value.trim()) || slugify($('#s_title').value.trim()),
      icon: $('#s_icon').value.trim() || null,
      short_desc: $('#s_short').value.trim(),
      cover_url: $('#s_cover').value.trim() || null,
      content: $('#s_content').value,
      visible: $('#s_visible').checked,
      sort: parseInt($('#s_sort').value, 10) || 0
    };
    if (!data.title) { toast('Nama layanan wajib diisi', 'danger'); return; }
    if (!data.content.trim()) { toast('Isi halaman layanan wajib diisi', 'danger'); return; }

    const btn = $('#btnSaveSvc');
    btn.disabled = true;
    try {
      if (state.editing && state.editing.id) {
        await window.API.services.update(state.editing.id, data);
        toast('Layanan diperbarui');
      } else {
        await window.API.services.create(data);
        toast('Layanan dibuat');
      }
      $('#serviceFormWrap').innerHTML = '';
      state.editing = null;
      await loadServices();
    } catch (err) {
      console.error(err);
      toast('Gagal menyimpan layanan. Periksa slug sudah dipakai?', 'danger');
      btn.disabled = false;
    }
  }

  async function deleteService(id) {
    const ok = await confirmModal('Hapus layanan?', 'Layanan akan dihapus dari dropdown navbar dan halamannya.');
    if (!ok) return;
    try {
      await window.API.services.remove(id);
      toast('Layanan dihapus');
      await loadServices();
    } catch (err) {
      console.error(err);
      toast('Gagal menghapus layanan', 'danger');
    }
  }

  $('#btnNewService').addEventListener('click', () => openServiceForm(null));

  /* ══════════ GALERI ══════════ */
  async function loadGallery() {
    const gridEl = $('#galleryGrid');
    gridEl.innerHTML = '<div class="text-center py-5 text-secondary"><i class="bi bi-arrow-repeat"></i> Memuat…</div>';
    let items = [];
    try {
      items = await window.API.gallery.list();
    } catch (err) {
      console.error(err);
    }
    renderGallery(items, gridEl);
  }

  function renderGallery(items, gridEl) {
    if (!items.length) {
      gridEl.innerHTML = '<div class="text-center py-5 text-secondary">Belum ada foto. Upload gambar di atas.</div>';
      return;
    }
    gridEl.innerHTML = items.map(g => `
      <div class="card">
        <img src="${esc(g.image_url)}" alt="${esc(g.caption || '')}" loading="lazy" class="card-img-top" style="aspect-ratio:4/3;object-fit:cover;">
        <div class="card-body py-2 px-3 d-flex align-items-center justify-content-between gap-2">
          <span class="fs-7 text-secondary text-truncate">${esc(g.caption || 'Tanpa keterangan')}</span>
          <button class="btn btn-sm btn-outline-danger" data-del-gallery="${g.id}" title="Hapus"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `).join('');

    $$('[data-del-gallery]', gridEl).forEach(btn =>
      btn.addEventListener('click', () => deleteGallery(btn.dataset.delGallery)));
  }

  async function deleteGallery(id) {
    const ok = await confirmModal('Hapus foto?', 'Foto akan dihapus dari galeri situs.');
    if (!ok) return;
    try {
      await window.API.gallery.remove(id);
      toast('Foto dihapus');
      await loadGallery();
    } catch (err) {
      console.error(err);
      toast('Gagal menghapus foto', 'danger');
    }
  }

  $('#galleryUploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = $('#galleryFile');
    const file = input.files && input.files[0];
    if (!file) { toast('Pilih file gambar dulu', 'danger'); return; }

    const btn = e.submitter || $('button[type="submit"]', e.target);
    const oldText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Uploading…';

    try {
      const url = await window.API.gallery.upload(file);
      await window.API.gallery.create({ image_url: url, caption: '', sort: 0 });
      toast('Foto ditambahkan');
      input.value = '';
      await loadGallery();
    } catch (err) {
      console.error(err);
      toast('Gagal upload gambar', 'danger');
    } finally {
      btn.disabled = false;
      btn.innerHTML = oldText;
    }
  });

  /* ══════════ TESTIMONI ══════════ */
  async function loadTestimonials() {
    const listEl = $('#testimonialList');
    listEl.innerHTML = '<div class="text-center py-5 text-secondary"><i class="bi bi-arrow-repeat"></i> Memuat…</div>';
    try {
      state.testimonials = await window.API.testimonials.list();
    } catch (err) {
      console.error(err);
      state.testimonials = [];
    }
    renderTestimonials();
  }

  function renderTestimonials() {
    const listEl = $('#testimonialList');
    if (!state.testimonials.length) {
      listEl.innerHTML = '<div class="text-center py-5 text-secondary">Belum ada testimoni.</div>';
      return;
    }
    listEl.innerHTML = `
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th style="width:40px;">#</th>
            <th>Nama</th>
            <th class="d-none d-md-table-cell">Perusahaan</th>
            <th class="d-none d-lg-table-cell">Rating</th>
            <th class="text-end">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${state.testimonials.map((t, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>
                <div class="fw-semibold">${esc(t.name)}</div>
                <div class="text-secondary fs-7 d-md-none">${esc(t.company || '')}</div>
                <div class="text-secondary fs-7">${esc(t.text)}</div>
              </td>
              <td class="d-none d-md-table-cell">${esc(t.company || '—')}</td>
              <td class="d-none d-lg-table-cell"><span class="text-warning">${'★'.repeat(Math.max(0, Math.min(5, t.rating || 5)))}</span></td>
              <td class="text-end text-nowrap">
                <button class="btn btn-sm btn-outline-primary" data-edit-testi="${t.id}" title="Edit"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" data-del-testi="${t.id}" title="Hapus"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

    $$('[data-edit-testi]', listEl).forEach(btn =>
      btn.addEventListener('click', () => openTestimonialForm(state.testimonials.find(t => t.id === btn.dataset.editTesti))));
    $$('[data-del-testi]', listEl).forEach(btn =>
      btn.addEventListener('click', () => deleteTestimonial(btn.dataset.delTesti)));
  }

  function openTestimonialForm(testi) {
    state.editing = testi ? { type: 'testimonial', id: testi.id } : { type: 'testimonial', id: null };
    const wrap = $('#testimonialFormWrap');
    const t = testi || {};
    wrap.innerHTML = `
      <div class="card mb-3 border-primary">
        <div class="card-header bg-primary-subtle">
          <h3 class="card-title mb-0 fs-6">${t.id ? 'Edit Testimoni' : 'Testimoni Baru'}</h3>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="t_name" class="form-label">Nama</label>
              <input type="text" class="form-control" id="t_name" value="${esc(t.name || '')}" required>
            </div>
            <div class="col-md-6">
              <label for="t_company" class="form-label">Perusahaan / Jabatan</label>
              <input type="text" class="form-control" id="t_company" value="${esc(t.company || '')}">
            </div>
          </div>
          <div class="mb-3 mt-3">
            <label for="t_text" class="form-label">Isi Testimoni</label>
            <textarea class="form-control" id="t_text" rows="3" required>${esc(t.text || '')}</textarea>
          </div>
          <div class="col-md-4">
            <label for="t_rating" class="form-label">Rating (1–5)</label>
            <select class="form-select" id="t_rating">
              ${[1,2,3,4,5].map(n => `<option value="${n}" ${(t.rating || 5) === n ? 'selected' : ''}>${n} ★</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="card-footer d-flex gap-2">
          <button class="btn btn-primary btn-sm" id="btnSaveTesti"><i class="bi bi-save me-1"></i> Simpan</button>
          <button class="btn btn-outline-secondary btn-sm" id="btnCancelTesti">Batal</button>
        </div>
      </div>`;

    $('#btnCancelTesti').addEventListener('click', () => { wrap.innerHTML = ''; state.editing = null; });
    $('#btnSaveTesti').addEventListener('click', () => saveTestimonial());
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function saveTestimonial() {
    const data = {
      name: $('#t_name').value.trim(),
      company: $('#t_company').value.trim(),
      text: $('#t_text').value.trim(),
      rating: parseInt($('#t_rating').value, 10) || 5
    };
    if (!data.name || !data.text) { toast('Nama dan isi testimoni wajib diisi', 'danger'); return; }

    const btn = $('#btnSaveTesti');
    btn.disabled = true;
    try {
      if (state.editing && state.editing.id) {
        await window.API.testimonials.update(state.editing.id, data);
        toast('Testimoni diperbarui');
      } else {
        await window.API.testimonials.create(data);
        toast('Testimoni dibuat');
      }
      $('#testimonialFormWrap').innerHTML = '';
      state.editing = null;
      await loadTestimonials();
    } catch (err) {
      console.error(err);
      toast('Gagal menyimpan testimoni', 'danger');
      btn.disabled = false;
    }
  }

  async function deleteTestimonial(id) {
    const ok = await confirmModal('Hapus testimoni?', 'Testimoni akan dihapus dari situs.');
    if (!ok) return;
    try {
      await window.API.testimonials.remove(id);
      toast('Testimoni dihapus');
      await loadTestimonials();
    } catch (err) {
      console.error(err);
      toast('Gagal menghapus testimoni', 'danger');
    }
  }

  $('#btnNewTestimonial').addEventListener('click', () => openTestimonialForm(null));

  /* ══════════ PAKET ══════════ */
  async function loadPackages() {
    const listEl = $('#packageList');
    listEl.innerHTML = '<div class="text-center py-5 text-secondary"><i class="bi bi-arrow-repeat"></i> Memuat…</div>';
    try {
      state.packages = await window.API.packages.list();
    } catch (err) {
      console.error(err);
      state.packages = [];
    }
    renderPackages();
  }

  function renderPackages() {
    const listEl = $('#packageList');
    if (!state.packages.length) {
      listEl.innerHTML = '<div class="text-center py-5 text-secondary">Belum ada paket.</div>';
      return;
    }
    listEl.innerHTML = `
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th style="width:40px;">#</th>
            <th>Nama Paket</th>
            <th class="d-none d-md-table-cell">Harga</th>
            <th class="d-none d-lg-table-cell">Badge</th>
            <th class="text-end">Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${state.packages.map((p, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>
                <div class="fw-semibold">${esc(p.name)} ${p.featured ? '<span class="badge text-bg-warning ms-1">Featured</span>' : ''}</div>
                <div class="text-secondary fs-7">${(p.features || []).length} fitur</div>
              </td>
              <td class="d-none d-md-table-cell">${esc(p.price)} ${esc(p.currency || 'SAR')}</td>
              <td class="d-none d-lg-table-cell">${p.badge ? `<span class="badge text-bg-info">${esc(p.badge)}</span>` : '—'}</td>
              <td class="text-end text-nowrap">
                <button class="btn btn-sm btn-outline-primary" data-edit-pkg="${p.id}" title="Edit"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" data-del-pkg="${p.id}" title="Hapus"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

    $$('[data-edit-pkg]', listEl).forEach(btn =>
      btn.addEventListener('click', () => openPackageForm(state.packages.find(p => p.id === btn.dataset.editPkg))));
    $$('[data-del-pkg]', listEl).forEach(btn =>
      btn.addEventListener('click', () => deletePackage(btn.dataset.delPkg)));
  }

  function openPackageForm(pkg) {
    state.editing = pkg ? { type: 'package', id: pkg.id } : { type: 'package', id: null };
    const wrap = $('#packageFormWrap');
    const p = pkg || {};
    const features = (p.features || []).join('\n');
    wrap.innerHTML = `
      <div class="card mb-3 border-primary">
        <div class="card-header bg-primary-subtle">
          <h3 class="card-title mb-0 fs-6">${p.id ? 'Edit Paket' : 'Paket Baru'}</h3>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="p_name" class="form-label">Nama Paket</label>
              <input type="text" class="form-control" id="p_name" value="${esc(p.name || '')}" required>
            </div>
            <div class="col-md-2">
              <label for="p_price" class="form-label">Harga</label>
              <input type="number" class="form-control" id="p_price" value="${p.price != null ? p.price : ''}" min="0" step="0.01" required>
            </div>
            <div class="col-md-2">
              <label for="p_currency" class="form-label">Mata Uang</label>
              <input type="text" class="form-control" id="p_currency" value="${esc(p.currency || 'SAR')}">
            </div>
            <div class="col-md-2">
              <label for="p_badge" class="form-label">Badge</label>
              <input type="text" class="form-control" id="p_badge" value="${esc(p.badge || '')}" placeholder="Populer">
            </div>
          </div>
          <div class="mb-3 mt-3">
            <label for="p_description" class="form-label">Deskripsi</label>
            <textarea class="form-control" id="p_description" rows="2">${esc(p.description || '')}</textarea>
          </div>
          <div class="mb-3">
            <label for="p_features" class="form-label">Fitur (satu per baris)</label>
            <textarea class="form-control" id="p_features" rows="5" placeholder="Jasa Porter Bandara&#10;Konsumsi&#10;Pendampingan Penuh">${esc(features)}</textarea>
          </div>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="p_featured" ${p.featured ? 'checked' : ''}>
            <label class="form-check-label" for="p_featured">Tampilkan sebagai paket unggulan (featured)</label>
          </div>
        </div>
        <div class="card-footer d-flex gap-2">
          <button class="btn btn-primary btn-sm" id="btnSavePkg"><i class="bi bi-save me-1"></i> Simpan</button>
          <button class="btn btn-outline-secondary btn-sm" id="btnCancelPkg">Batal</button>
        </div>
      </div>`;

    $('#btnCancelPkg').addEventListener('click', () => { wrap.innerHTML = ''; state.editing = null; });
    $('#btnSavePkg').addEventListener('click', () => savePackage());
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function savePackage() {
    const data = {
      name: $('#p_name').value.trim(),
      price: parseFloat($('#p_price').value),
      currency: $('#p_currency').value.trim() || 'SAR',
      description: $('#p_description').value.trim(),
      features: $('#p_features').value.split('\n').map(s => s.trim()).filter(Boolean),
      badge: $('#p_badge').value.trim() || null,
      featured: $('#p_featured').checked
    };
    if (!data.name || isNaN(data.price)) { toast('Nama dan harga wajib diisi', 'danger'); return; }

    const btn = $('#btnSavePkg');
    btn.disabled = true;
    try {
      if (state.editing && state.editing.id) {
        await window.API.packages.update(state.editing.id, data);
        toast('Paket diperbarui');
      } else {
        await window.API.packages.create(data);
        toast('Paket dibuat');
      }
      $('#packageFormWrap').innerHTML = '';
      state.editing = null;
      await loadPackages();
    } catch (err) {
      console.error(err);
      toast('Gagal menyimpan paket', 'danger');
      btn.disabled = false;
    }
  }

  async function deletePackage(id) {
    const ok = await confirmModal('Hapus paket?', 'Paket akan dihapus dari halaman utama.');
    if (!ok) return;
    try {
      await window.API.packages.remove(id);
      toast('Paket dihapus');
      await loadPackages();
    } catch (err) {
      console.error(err);
      toast('Gagal menghapus paket', 'danger');
    }
  }

  $('#btnNewPackage').addEventListener('click', () => openPackageForm(null));

  /* ══════════ MULAI ══════════ */
  document.addEventListener('DOMContentLoaded', init);
})();
