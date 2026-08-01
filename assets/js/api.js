/* ═══════════════════════════════════════════════
   SEKAR JAGAD 43 — Data Layer (CRUD via Supabase)
   Semua fungsi mengembalikan Promise.
   Jika Supabase belum siap, fungsi baca mengembalikan [] (null),
   fungsi tulis melempar error dengan pesan yang jelas.
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const sb = () => window.supabaseClient;

  const isReady = () => !!(window.supabaseClient && window.SUPABASE_READY);

  async function waitClient(timeout = 8000) {
    if (isReady()) return sb();
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        document.removeEventListener('supabase:ready', onReady);
        reject(new Error('Supabase belum siap. Pastikan config.js sudah diisi.'));
      }, timeout);
      function onReady() {
        clearTimeout(t);
        if (isReady()) resolve(sb());
        else reject(new Error('Gagal menginisialisasi Supabase.'));
      }
      document.addEventListener('supabase:ready', onReady);
    });
  }

  const ok = (r) => {
    if (r.error) throw r.error;
    return r.data;
  };

  function getPublicUrl(path) {
    try {
      return sb().storage.from('images').getPublicUrl(path).data.publicUrl;
    } catch (e) {
      return null;
    }
  }

  /* ── ARTIKEL ───────────────────────────────── */
  const articles = {
    async list({ publishedOnly = true } = {}) {
      if (!isReady()) return [];
      let q = sb().from('articles').select('*').order('created_at', { ascending: false });
      if (publishedOnly) q = q.eq('status', 'published');
      return ok(await q);
    },
    async bySlug(slug) {
      if (!isReady()) return null;
      return ok(await sb().from('articles').select('*').eq('slug', slug).maybeSingle());
    },
    async byId(id) {
      if (!isReady()) return null;
      return ok(await sb().from('articles').select('*').eq('id', id).maybeSingle());
    },
    async create(data) {
      const c = await waitClient();
      return ok(await c.from('articles').insert(data).select().single());
    },
    async update(id, data) {
      const c = await waitClient();
      return ok(await c.from('articles').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single());
    },
    async remove(id) {
      const c = await waitClient();
      return ok(await c.from('articles').delete().eq('id', id));
    }
  };

  /* ── GALERI ────────────────────────────────── */
  const gallery = {
    async list() {
      if (!isReady()) return [];
      return ok(await sb().from('gallery').select('*').order('sort', { ascending: true }));
    },
    async create(data) {
      const c = await waitClient();
      return ok(await c.from('gallery').insert(data).select().single());
    },
    async remove(id) {
      const c = await waitClient();
      return ok(await c.from('gallery').delete().eq('id', id));
    },
    async upload(file, folder = 'gallery') {
      const c = await waitClient();
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const name = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${folder}/${name}`;
      const { error } = await c.storage.from('images').upload(path, file, { upsert: false });
      if (error) throw error;
      return getPublicUrl(path);
    },
    async removeImage(path) {
      try {
        const c = await waitClient();
        await c.storage.from('images').remove([path]);
      } catch (e) { /* non-fatal */ }
    }
  };

  /* ── TESTIMONI ─────────────────────────────── */
  const testimonials = {
    async list() {
      if (!isReady()) return [];
      return ok(await sb().from('testimonials').select('*').order('created_at', { ascending: false }));
    },
    async create(data) {
      const c = await waitClient();
      return ok(await c.from('testimonials').insert(data).select().single());
    },
    async update(id, data) {
      const c = await waitClient();
      return ok(await c.from('testimonials').update(data).eq('id', id).select().single());
    },
    async remove(id) {
      const c = await waitClient();
      return ok(await c.from('testimonials').delete().eq('id', id));
    }
  };

  /* ── PAKET ─────────────────────────────────── */
  const packages = {
    async list() {
      if (!isReady()) return [];
      return ok(await sb().from('packages').select('*').order('sort', { ascending: true }));
    },
    async create(data) {
      const c = await waitClient();
      return ok(await c.from('packages').insert(data).select().single());
    },
    async update(id, data) {
      const c = await waitClient();
      return ok(await c.from('packages').update(data).eq('id', id).select().single());
    },
    async remove(id) {
      const c = await waitClient();
      return ok(await c.from('packages').delete().eq('id', id));
    }
  };

  /* ── LAYANAN ───────────────────────────────── */
  const services = {
    /* Untuk publik (hanya visible) dan untuk admin (semua). */
    async list({ visibleOnly = false } = {}) {
      if (!isReady()) return [];
      let q = sb().from('services').select('*').order('sort', { ascending: true });
      if (visibleOnly) q = q.eq('visible', true);
      return ok(await q);
    },
    async byId(id) {
      if (!isReady()) return null;
      return ok(await sb().from('services').select('*').eq('id', id).maybeSingle());
    },
    async bySlug(slug) {
      if (!isReady()) return null;
      return ok(await sb().from('services').select('*').eq('slug', slug).eq('visible', true).maybeSingle());
    },
    async create(data) {
      const c = await waitClient();
      return ok(await c.from('services').insert(data).select().single());
    },
    async update(id, data) {
      const c = await waitClient();
      return ok(await c.from('services').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single());
    },
    async remove(id) {
      const c = await waitClient();
      return ok(await c.from('services').delete().eq('id', id));
    }
  };

  /* ── AUTH ──────────────────────────────────── */
  const auth = {
    async getSession() {
      if (!isReady()) return null;
      const { data } = await sb().auth.getSession();
      return data.session || null;
    },
    async onAuthStateChange(cb) {
      if (!isReady()) return () => {};
      const { data } = sb().auth.onAuthStateChange(cb);
      return data.subscription.unsubscribe;
    },
    async signIn(email, password) {
      const c = await waitClient();
      const { data, error } = await c.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.session;
    },
    async signOut() {
      const c = await waitClient();
      const { error } = await c.auth.signOut();
      if (error) throw error;
    }
  };

  /* ── UTIL (dipakai bersama) ─────────────────── */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return String(iso).slice(0, 10);
    }
  }

  /* Renderer konten artikel: paragraf, heading ##/###, list "- ". */
  function renderContent(text) {
    const blocks = String(text || '').split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
    const out = [];
    blocks.forEach(block => {
      const lines = block.split('\n');
      const first = lines[0].trim();
      if (first.startsWith('## ')) {
        out.push(`<h2>${escapeHtml(first.slice(3).trim())}</h2>`);
        if (lines.length > 1) out.push(`<p>${escapeHtml(lines.slice(1).join(' '))}</p>`);
      } else if (first.startsWith('### ')) {
        out.push(`<h3>${escapeHtml(first.slice(4).trim())}</h3>`);
        if (lines.length > 1) out.push(`<p>${escapeHtml(lines.slice(1).join(' '))}</p>`);
      } else if (lines.every(l => l.trim().startsWith('- '))) {
        const items = lines.map(l => `<li>${escapeHtml(l.trim().slice(2))}</li>`).join('');
        out.push(`<ul>${items}</ul>`);
      } else {
        out.push(`<p>${escapeHtml(lines.join(' '))}</p>`);
      }
    });
    return out.join('');
  }

  /* Tunggu sampai client supabase-js benar-benar siap.
     Penting: supabase-js dimuat async via CDN, jadi bisa belum siap
     saat DOMContentLoaded. Pakai fungsi ini sebelum cek sesi.
     Mengembalikan boolean, tidak melempar. */
  async function waitReady(timeout = 8000) {
    try {
      await waitClient(timeout);
    } catch (err) {
      console.warn('[Sekar Jagad] Supabase tidak siap:', err.message);
      return false;
    }
    return isReady();
  }

  window.API = { articles, gallery, testimonials, packages, services, auth, isReady, waitReady, escapeHtml, formatDate, renderContent };
})();
