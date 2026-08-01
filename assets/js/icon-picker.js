/* ═══════════════════════════════════════════════
   SEKAR JAGAD 43 — Icon Picker (Font Awesome)
   Galeri ikon + kotak pencarian untuk memilih ikon
   layanan di panel admin (tanpa mengetik nama manual).
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const ICONS = [
    { cls: 'fas fa-passport',          label: 'Paspor' },
    { cls: 'fas fa-suitcase',          label: 'Koper' },
    { cls: 'fas fa-suitcase-rolling',  label: 'Koper roda' },
    { cls: 'fas fa-luggage-cart',      label: 'Troli bagasi' },
    { cls: 'fas fa-concierge-bell',    label: 'Bell service' },
    { cls: 'fas fa-utensils',          label: 'Makanan' },
    { cls: 'fas fa-bus',               label: 'Bus' },
    { cls: 'fas fa-car',               label: 'Mobil' },
    { cls: 'fas fa-truck',             label: 'Truk' },
    { cls: 'fas fa-hands-helping',     label: 'Bantuan' },
    { cls: 'fas fa-hand-holding-heart',label: 'Bantuan tulus' },
    { cls: 'fas fa-user-shield',       label: 'Pengawal' },
    { cls: 'fas fa-headset',           label: 'Headset' },
    { cls: 'fas fa-user-clock',        label: 'Jam layanan' },
    { cls: 'fas fa-clock',             label: 'Jam' },
    { cls: 'fas fa-clock-rotate-left', label: 'Riwayat' },
    { cls: 'fas fa-plane',             label: 'Pesawat' },
    { cls: 'fas fa-plane-arrival',     label: 'Pesawat tiba' },
    { cls: 'fas fa-plane-departure',   label: 'Pesawat berangkat' },
    { cls: 'fas fa-hotel',             label: 'Hotel' },
    { cls: 'fas fa-mosque',            label: 'Masjid' },
    { cls: 'fas fa-kaaba',             label: 'Ka\'bah' },
    { cls: 'fas fa-id-card',           label: 'Kartu ID' },
    { cls: 'fas fa-id-card-clip',      label: 'Kartu ID (jepit)' },
    { cls: 'fas fa-file-passport',     label: 'File paspor' },
    { cls: 'fas fa-shield-heart',      label: 'Perlindungan' },
    { cls: 'fas fa-hands',             label: 'Tangan' },
    { cls: 'fas fa-handshake',         label: 'Jabat tangan' },
    { cls: 'fas fa-star',              label: 'Bintang' },
    { cls: 'fas fa-check',             label: 'Centang' },
    { cls: 'fas fa-phone',             label: 'Telepon' },
    { cls: 'fas fa-phone-volume',      label: 'Telepon volume' },
    { cls: 'fas fa-mobile-screen',     label: 'HP' },
    { cls: 'fas fa-envelope',          label: 'Email' },
    { cls: 'fas fa-location-dot',      label: 'Lokasi' },
    { cls: 'fas fa-map-pin',           label: 'Pin peta' },
    { cls: 'fas fa-globe',             label: 'Dunia' },
    { cls: 'fas fa-route',             label: 'Rute' },
    { cls: 'fas fa-money-bill',        label: 'Uang' },
    { cls: 'fas fa-crown',             label: 'Mahkota' },
    { cls: 'fas fa-gem',               label: 'Permata' },
    { cls: 'fas fa-medal',             label: 'Medali' },
    { cls: 'fas fa-award',             label: 'Penghargaan' },
    { cls: 'fas fa-certificate',       label: 'Sertifikat' },
    { cls: 'fas fa-shield',            label: 'Perisai' },
    { cls: 'fas fa-badge-check',       label: 'Badge centang' },
    { cls: 'fas fa-circle-check',      label: 'Lingkaran centang' },
    { cls: 'fas fa-heart',             label: 'Hati' },
    { cls: 'fas fa-thumbs-up',         label: 'Jempol' },
    { cls: 'fas fa-users',             label: 'Orang' },
    { cls: 'fas fa-user-group',        label: 'Kelompok' },
    { cls: 'fas fa-people-carry-box',  label: 'Angkut barang' },
    { cls: 'fas fa-box',               label: 'Kotak' },
    { cls: 'fas fa-box-open',          label: 'Kotak terbuka' },
    { cls: 'fas fa-key',               label: 'Kunci' },
    { cls: 'fas fa-wifi',              label: 'WiFi' },
    { cls: 'fas fa-bell',              label: 'Lonceng' },
    { cls: 'fas fa-circle-info',       label: 'Info' },
    { cls: 'fas fa-question',          label: 'Tanya' },
    { cls: 'fas fa-wand-magic',        label: 'Ajaib' }
  ];

  let activeCallback = null;
  let lastInput = null;
  let suppress = false; // mencegah modal langsung terbuka lagi setelah memilih

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function openPicker(current, onPick, inputEl) {
    if (window.bootstrap === undefined || !window.bootstrap.Modal) {
      console.warn('[Sekar Jagad] Bootstrap belum dimuat — icon picker tidak tersedia.');
      return;
    }
    if (suppress) return;
    activeCallback = onPick;
    lastInput = inputEl || lastInput;

    // Pastikan modal picker ada di DOM
    let root = document.getElementById('iconPickerModal');
    if (!root) {
      root = document.createElement('div');
      root.id = 'iconPickerModal';
      root.className = 'modal fade';
      root.tabIndex = -1;
      root.setAttribute('aria-hidden', 'true');
      root.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title"><i class="bi bi-grid me-2"></i>Pilih Ikon</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>
            <div class="modal-body">
              <div class="input-group mb-3">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control" id="iconPickerSearch" placeholder="Cari ikon (mis. paspor, bus, masjid)…">
              </div>
              <div id="iconPickerGrid" class="icon-picker-grid"></div>
            </div>
          </div>
        </div>`;
      document.body.appendChild(root);
    }

    const grid = root.querySelector('#iconPickerGrid');
    const search = root.querySelector('#iconPickerSearch');

    const render = (query) => {
      const q = (query || '').toLowerCase().trim();
      const list = ICONS.filter(i => !q || i.label.toLowerCase().includes(q) || i.cls.toLowerCase().includes(q));
      grid.innerHTML = list.length
        ? list.map(i => `
            <button type="button" class="icon-picker-item${i.cls === current ? ' active' : ''}"
                    data-icon="${esc(i.cls)}" title="${esc(i.label)}">
              <i class="${esc(i.cls)}"></i>
              <span>${esc(i.label)}</span>
            </button>`).join('')
        : '<div class="text-secondary w-100 text-center py-4">Ikon tidak ditemukan</div>';
    };

    search.addEventListener('input', () => render(search.value));
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.icon-picker-item');
      if (!btn) return;
      const chosen = btn.dataset.icon;
      if (activeCallback) activeCallback(chosen);
      const modal = window.bootstrap.Modal.getOrCreateInstance(root);
      modal.hide();
      // Cegah modal terbuka lagi akibat focus yang kembali ke input.
      suppress = true;
      setTimeout(() => { suppress = false; }, 300);
      if (lastInput) lastInput.blur();
    });

    render('');
    search.value = '';
    window.bootstrap.Modal.getOrCreateInstance(root).show();
  }

  /* Memasang picker ke input: klik input/badge → modal; hasil diisi ke input + preview. */
  function initPicker(input, preview) {
    if (!input) return;

    const showChosen = (cls) => {
      input.value = cls || '';
      if (preview) {
        preview.innerHTML = cls ? `<i class="${esc(cls)}"></i>` : '';
        preview.style.display = cls ? 'inline-flex' : 'none';
      }
    };

    if (preview) {
      preview.addEventListener('click', () => openPicker(input.value, showChosen, input));
    }
    input.addEventListener('click', () => openPicker(input.value, showChosen, input));
    input.setAttribute('readonly', 'readonly');

    showChosen(input.value);
  }

  window.IconPicker = {
    init: initPicker,
    open: (current, onPick) => openPicker(current, onPick, null)
  };
})();
