/* ============================================================
   pages.js — sistem multi-halaman (sidebar kiri).
   Pindahan persis dari script.js lama, tanpa perubahan logika.
   ============================================================ */

function renderNav() {
    const navList = AURA.els.navList;
    const pages = getPages();
    // hapus item custom lama, sisakan tombol workout
    navList.querySelectorAll('.nav-item[data-page]:not([data-page="workout"])').forEach(el => el.remove());
    pages.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'nav-item' + (AURA.state.activePage === p.id ? ' active' : '');
        btn.dataset.page = p.id;
        btn.title = p.title;
        btn.innerHTML = `<span class="nav-ico">${p.icon}</span><span class="nav-txt">${escapeHtml(p.title)}</span><span class="nav-actions"><span class="nav-edit" data-edit="${p.id}" title="Edit halaman">✎</span><span class="nav-del" data-del="${p.id}" title="Hapus halaman">×</span></span>`;
        navList.appendChild(btn);
    });
    navList.querySelector('.nav-item[data-page="workout"]')?.classList.toggle('active', AURA.state.activePage === 'workout');
}

function currentDayOrToday() {
    const act = document.querySelector('.day.active');
    return act ? act.dataset.day : AURA.state.todayName;
}

function renderCustomPage(page) {
    const mainInner = AURA.els.mainInner;
    const text = getContents()[page.id] || '';
    mainInner.style.animation = 'none';
    void mainInner.offsetHeight;
    mainInner.style.animation = 'mainFadeIn 0.4s ease forwards';
    mainInner.innerHTML = `
        <div class="custom-page">
            <span class="custom-icon">${page.icon}</span>
            <div class="custom-title">${escapeHtml(page.title)}</div>
            <div class="custom-sub">Halaman barumu siap diisi — catatan tersimpan otomatis.</div>
            <div class="custom-card">
                <div class="custom-card-label">📝 Catatan ${escapeHtml(page.title)}</div>
                <textarea class="custom-textarea" id="customNotes" placeholder="Tulis rencana, target, atau jadwal di sini...">${escapeHtml(text)}</textarea>
                <div class="custom-hint">Auto-save tiap ketikan, aman walau refresh.</div>
            </div>
                <div class="custom-actions">
                    <button class="btn-edit" id="editPageBtn">✎ Edit halaman</button>
                    <button class="btn-danger" id="deletePageBtn">Hapus halaman ini</button>
                </div>
            </div>
        `;
        document.getElementById('customNotes').addEventListener('input', (e) => {
            saveContent(page.id, e.target.value);
        });
        document.getElementById('editPageBtn').addEventListener('click', () => {
            openEditModal(page.id);
        });
        document.getElementById('deletePageBtn').addEventListener('click', () => {
            deletePage(page.id);
        });
}

function switchPage(id) {
    AURA.state.activePage = id;
    try { localStorage.setItem(AURA.ACTIVE_PAGE_KEY, id); } catch {}
    renderNav();
    if (id === 'workout') {
        AURA.els.container.classList.remove('page-custom');
        AURA.els.pageTitle.textContent = 'Jadwal Workout';
        AURA.els.pageSub.textContent = 'Pilih hari, gas latihan, centang progres mingguanmu. Semua tersimpan otomatis di perangkat ini.';
        renderDay(currentDayOrToday());
    } else {
        const page = getPages().find(p => p.id === id);
        if (!page) { switchPage('workout'); return; }
        AURA.els.container.classList.add('page-custom');
        AURA.els.pageTitle.textContent = `${page.icon} ${page.title}`;
        AURA.els.pageSub.textContent = `Halaman “${page.title}” — ruang bebas buat rencana & catatan tambahanmu.`;
        renderCustomPage(page);
    }
}

function deletePage(id) {
    if (!confirm('Hapus halaman ini? Catatannya ikut kehapus.')) return;
    savePages(getPages().filter(p => p.id !== id));
    const all = getContents();
    delete all[id];
    localStorage.setItem(AURA.PAGES_CONTENT_KEY, JSON.stringify(all));
    switchPage('workout');
}

// ---- modal tambah / edit halaman ----
function setIconPick(icon) {
    const iconPick = AURA.els.iconPick;
    iconPick.querySelectorAll('.icon-opt').forEach(o => o.classList.toggle('selected', o.dataset.icon === icon));
    AURA.state.pickedIcon = icon;
}

function openModal() {
    AURA.els.pageModal.classList.add('show');
    setTimeout(() => AURA.els.newPageTitleInput.focus(), 100);
}

function closeModal() {
    AURA.els.pageModal.classList.remove('show');
    AURA.els.newPageTitleInput.value = '';
    AURA.state.editingId = null;
}

function openAddModal() {
    AURA.state.editingId = null;
    document.getElementById('modalTitle').textContent = '＋ Halaman Baru';
    document.getElementById('modalSub').textContent = 'Kasih nama & ikon, langsung jadi menu di sidebar kiri.';
    document.getElementById('modalSave').textContent = 'Buat Halaman';
    AURA.els.newPageTitleInput.value = '';
    setIconPick('🥗');
    openModal();
}

function openEditModal(id) {
    const page = getPages().find(p => p.id === id);
    if (!page) return;
    AURA.state.editingId = id;
    document.getElementById('modalTitle').textContent = '✎ Edit Halaman';
    document.getElementById('modalSub').textContent = `Ubah nama & ikon halaman “${page.title}”.`;
    document.getElementById('modalSave').textContent = 'Simpan Perubahan';
    AURA.els.newPageTitleInput.value = page.title;
    AURA.state.pickedIcon = page.icon;
    const known = [...AURA.els.iconPick.querySelectorAll('.icon-opt')].some(o => o.dataset.icon === page.icon);
    if (known) setIconPick(page.icon);
    else AURA.els.iconPick.querySelectorAll('.icon-opt').forEach(o => o.classList.remove('selected'));
    openModal();
}

function saveModal() {
    const title = AURA.els.newPageTitleInput.value.trim();
    if (!title) { AURA.els.newPageTitleInput.focus(); return; }
    if (AURA.state.editingId) {
        const id = AURA.state.editingId;
        savePages(getPages().map(p => p.id === id ? { ...p, title, icon: AURA.state.pickedIcon } : p));
        closeModal();
        switchPage(id);
    } else {
        const pages = getPages();
        const id = 'p' + Date.now();
        pages.push({ id, title, icon: AURA.state.pickedIcon });
        savePages(pages);
        closeModal();
        switchPage(id);
    }
}

// Modal tambah halaman + wiring nav (dipanggil sekali dari main.js)
function initPages() {
    const navList = AURA.els.navList;
    const navAddBtn = AURA.els.navAddBtn;
    const pageModal = AURA.els.pageModal;
    const newPageTitleInput = AURA.els.newPageTitleInput;
    const iconPick = AURA.els.iconPick;

    try { AURA.state.activePage = localStorage.getItem(AURA.ACTIVE_PAGE_KEY) || 'workout'; }
    catch { AURA.state.activePage = 'workout'; }

    // klik nav (delegasi, termasuk tombol edit ✎ & hapus ×)
    navList.addEventListener('click', (e) => {
        const edit = e.target.closest('[data-edit]');
        if (edit) {
            e.stopPropagation();
            openEditModal(edit.dataset.edit);
            return;
        }
        const del = e.target.closest('[data-del]');
        if (del) {
            e.stopPropagation();
            deletePage(del.dataset.del);
            return;
        }
        const item = e.target.closest('.nav-item[data-page]');
        if (item) switchPage(item.dataset.page);
    });

    navAddBtn.addEventListener('click', openAddModal);
    document.getElementById('modalCancel').addEventListener('click', closeModal);
    pageModal.addEventListener('click', (e) => { if (e.target === pageModal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    iconPick.addEventListener('click', (e) => {
        const opt = e.target.closest('.icon-opt');
        if (!opt) return;
        iconPick.querySelectorAll('.icon-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        AURA.state.pickedIcon = opt.dataset.icon;
    });
    document.getElementById('modalSave').addEventListener('click', saveModal);
    newPageTitleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('modalSave').click();
    });

    // init: hormati halaman terakhir yang dibuka
    renderNav();
    if (AURA.state.activePage !== 'workout') switchPage(AURA.state.activePage);
}
