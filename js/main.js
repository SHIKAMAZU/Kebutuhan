/* ============================================================
   main.js — inisiasi aplikasi (satu-satunya DOMContentLoaded).
   Urutan init sama persis seperti script.js lama:
   realtime → loader → particles → hari → pages.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Kumpulin elemen sekali, dipakai file lain via AURA.els
    AURA.els.loader = document.getElementById('loader');
    AURA.els.days = document.querySelectorAll('.day');
    AURA.els.mainInner = document.getElementById('mainInner');
    AURA.els.particles = document.getElementById('particles');
    AURA.els.rtDate = document.getElementById('rtDate');
    AURA.els.rtTime = document.getElementById('rtTime');
    AURA.els.container = document.getElementById('container');
    AURA.els.pageTitle = document.getElementById('pageTitle');
    AURA.els.pageSub = document.getElementById('pageSub');
    AURA.els.navList = document.getElementById('navList');
    AURA.els.navAddBtn = document.getElementById('navAddBtn');
    AURA.els.pageModal = document.getElementById('pageModal');
    AURA.els.newPageTitleInput = document.getElementById('newPageTitle');
    AURA.els.iconPick = document.getElementById('iconPick');

    const { loader, days, mainInner, particles } = AURA.els;

    // Delegasi event: tangkap semua ketikan di input link + meta, langsung simpan.
    // Taruh di mainInner sekali aja, jadi gak hilang walau di-render ulang.
    mainInner.addEventListener('input', (e) => {
        const input = e.target;
        if (input.classList.contains('workout-link-input')) {
            const dayName = input.dataset.day;
            const itemIdx = input.dataset.idx;
            const slotIdx = input.dataset.slot;
            if (dayName !== undefined && itemIdx !== undefined && slotIdx !== undefined) {
                saveItemLink(dayName, itemIdx, Number(slotIdx), input.value);
            }
            return;
        }
        if (input.classList.contains('workout-meta-input')) {
            const dayName = input.dataset.day;
            const itemIdx = input.dataset.idx;
            const field = input.dataset.field;
            if (dayName !== undefined && itemIdx !== undefined && field) {
                saveItemMetaField(dayName, itemIdx, field, input.value);
            }
        }
    });

    initRealtime();

    setTimeout(() => {
        loader.classList.add('hidden');
    }, 800);

    for (let i = 0; i < 10; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 8 + 's';
        p.style.animationDuration = (6 + Math.random() * 5) + 's';
        p.style.width = p.style.height = (4 + Math.random() * 8) + 'px';
        particles.appendChild(p);
    }

    initDays();

    // Backup / Restore wiring
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    if (exportBtn) exportBtn.addEventListener('click', () => {
        const data = exportAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'aura-fit-backup.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', () => {
            const f = importFile.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => {
                try {
                    importAllData(JSON.parse(r.result));
                    renderNav();
                    switchPage('workout');
                    alert('Restore berhasil!');
                } catch { alert('File tidak valid!'); }
                importFile.value = '';
            };
            r.readAsText(f);
        });
    }

    AURA.state.todayName = AURA.namaHari[new Date().getDay()];
    days.forEach(d => {
        if (d.dataset.day === AURA.state.todayName) {
            d.classList.add('active');
        }
    });
    renderDay(AURA.state.todayName);

    initPages();
});
