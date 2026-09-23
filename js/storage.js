/* ============================================================
   storage.js — semua urusan localStorage.
   Pindahan persis dari script.js lama, tanpa perubahan logika.
   ============================================================ */

// ---------- CHECKLIST ----------
function getAllData() {
    try {
        const raw = localStorage.getItem(AURA.STORAGE_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function getDayData(dayName) {
    const all = getAllData();
    if (!all[dayName]) {
        all[dayName] = { '1': false, '2': false, '3': false, '4': false };
    }
    return all[dayName];
}

function saveDayData(dayName, dayData) {
    const all = getAllData();
    all[dayName] = dayData;
    localStorage.setItem(AURA.STORAGE_KEY, JSON.stringify(all));
}

// ---------- LINK TIKTOK ----------
// Struktur: { "Senin": { "0": ["link1","link2"], "1": [...] } }
// Dinamis: default 1 slot, bisa tambah/hapus
function getAllLinks() {
    try {
        const raw = localStorage.getItem(AURA.LINKS_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function getDayLinks(dayName) {
    const all = getAllLinks();
    return all[dayName] || {};
}

function getItemLinks(dayName, itemIdx) {
    const dayLinks = getDayLinks(dayName);
    const arr = dayLinks[itemIdx];
    if (!Array.isArray(arr) || arr.length === 0) return [''];
    // migrasi data lama 4 slot: buang yang kosong, sisain minimal 1
    const compact = arr.filter(s => String(s || '').trim() !== '');
    // kalau semua kosong tapi array ada, tetap 1 input kosong
    if (compact.length === 0) {
        // kalau user sengaja punya >1 input kosong (baru nambah), hormati jumlahnya
        return arr.length > 1 ? arr : [''];
    }
    return compact;
}

function saveItemLink(dayName, itemIdx, slotIdx, value) {
    const all = getAllLinks();
    if (!all[dayName]) all[dayName] = {};
    if (!Array.isArray(all[dayName][itemIdx]) || all[dayName][itemIdx].length === 0) all[dayName][itemIdx] = [''];
    all[dayName][itemIdx][slotIdx] = value;
    localStorage.setItem(AURA.LINKS_KEY, JSON.stringify(all));
}

function addItemLink(dayName, itemIdx) {
    const all = getAllLinks();
    if (!all[dayName]) all[dayName] = {};
    const cur = getItemLinks(dayName, itemIdx);
    if (cur.length >= 10) return cur;
    cur.push('');
    all[dayName][itemIdx] = cur;
    localStorage.setItem(AURA.LINKS_KEY, JSON.stringify(all));
    return cur;
}

function removeItemLink(dayName, itemIdx, slotIdx) {
    const all = getAllLinks();
    if (!all[dayName]) all[dayName] = {};
    const cur = getItemLinks(dayName, itemIdx);
    cur.splice(slotIdx, 1);
    if (cur.length === 0) cur.push('');
    all[dayName][itemIdx] = cur;
    localStorage.setItem(AURA.LINKS_KEY, JSON.stringify(all));
    return cur;
}

// ---------- META PER LATIHAN (berat & istirahat, bisa edit/hapus) ----------
function getAllMeta() {
    try {
        const raw = localStorage.getItem(AURA.META_KEY);
        if (!raw) return {};
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

function getItemMeta(dayName, itemIdx) {
    const all = getAllMeta();
    const m = (all[dayName] || {})[itemIdx];
    return {
        berat: (m && m.berat) || '',
        antarSet: (m && m.antarSet) || '',
        antarRepetisi: (m && m.antarRepetisi) || ''
    };
}

function saveItemMetaField(dayName, itemIdx, field, value) {
    const all = getAllMeta();
    if (!all[dayName]) all[dayName] = {};
    if (!all[dayName][itemIdx]) all[dayName][itemIdx] = {};
    all[dayName][itemIdx][field] = value;
    localStorage.setItem(AURA.META_KEY, JSON.stringify(all));
}

function clearItemMeta(dayName, itemIdx) {
    const all = getAllMeta();
    if (all[dayName]) delete all[dayName][itemIdx];
    localStorage.setItem(AURA.META_KEY, JSON.stringify(all));
}

// ---------- INFO LATIHAN LIST (bisa nambah banyak, per minggu) ----------
// Format baru: { "Senin": { "0": [ {minggu:'1', berat:'', antarSet:'', antarRepetisi:''} ] } }
// Otomatis migrasi dari format lama {berat, antarSet, antarRepetisi}.
function blankMetaEntry() {
    return { minggu: '1', berat: '', antarSet: '', antarRepetisi: '' };
}

function normalizeMetaEntry(e) {
    const b = blankMetaEntry();
    if (!e || typeof e !== 'object') return b;
    let mg = String(e.minggu !== undefined ? e.minggu : '1').trim();
    // longgar: terima "1", "1-2", "1-3", "2-4", dst (termasuk dash HP).
    // Jangan pernah buang ketikan user — cuma rapikan.
    mg = mg.replace(/[–—]/g, '-').replace(/[^0-9,\-\/\s]/g, '').replace(/\s+/g, '').slice(0, 7);
    if (!/\d/.test(mg)) mg = '1';
    return {
        minggu: mg,
        berat: e.berat || '',
        antarSet: e.antarSet || '',
        antarRepetisi: e.antarRepetisi || ''
    };
}

function getItemMetaList(dayName, itemIdx) {
    const all = getAllMeta();
    const raw = (all[dayName] || {})[itemIdx];
    if (Array.isArray(raw) && raw.length > 0) return raw.map(normalizeMetaEntry);
    if (raw && typeof raw === 'object' && (raw.berat || raw.antarSet || raw.antarRepetisi)) {
        return [normalizeMetaEntry({ minggu: '1', berat: raw.berat, antarSet: raw.antarSet, antarRepetisi: raw.antarRepetisi })];
    }
    return [blankMetaEntry()];
}

function setItemMetaList(dayName, itemIdx, list) {
    const all = getAllMeta();
    if (!all[dayName]) all[dayName] = {};
    all[dayName][itemIdx] = list;
    localStorage.setItem(AURA.META_KEY, JSON.stringify(all));
}

function saveItemMetaEntryField(dayName, itemIdx, entryIdx, field, value) {
    const list = getItemMetaList(dayName, itemIdx);
    if (!list[entryIdx]) return;
    list[entryIdx][field] = value;
    setItemMetaList(dayName, itemIdx, list);
}

function addItemMetaEntry(dayName, itemIdx) {
    const list = getItemMetaList(dayName, itemIdx);
    if (list.length >= 8) return list;
    list.push(blankMetaEntry());
    setItemMetaList(dayName, itemIdx, list);
    return list;
}

function removeItemMetaEntry(dayName, itemIdx, entryIdx) {
    const list = getItemMetaList(dayName, itemIdx);
    list.splice(entryIdx, 1);
    if (list.length === 0) list.push(blankMetaEntry());
    setItemMetaList(dayName, itemIdx, list);
    return list;
}

// ---------- HALAMAN CUSTOM ----------
function getPages() {
    try { return JSON.parse(localStorage.getItem(AURA.PAGES_KEY)) || []; }
    catch { return []; }
}

function savePages(pages) {
    localStorage.setItem(AURA.PAGES_KEY, JSON.stringify(pages));
}

function getContents() {
    try { return JSON.parse(localStorage.getItem(AURA.PAGES_CONTENT_KEY)) || {}; }
    catch { return {}; }
}

function saveContent(pageId, text) {
    const all = getContents();
    all[pageId] = text;
    localStorage.setItem(AURA.PAGES_CONTENT_KEY, JSON.stringify(all));
}

// ---------- BACKUP / RESTORE (biar HP = laptop via file) ----------
function exportAllData() {
    return {
        app: 'aura-fit',
        version: 1,
        exportedAt: new Date().toISOString(),
        checklist: getAllData(),
        links: getAllLinks(),
        meta: getAllMeta(),
        pages: getPages(),
        contents: getContents(),
        activePage: null
    };
}

function importAllData(obj) {
    if (!obj || typeof obj !== 'object') throw new Error('File tidak valid');
    if (obj.checklist) localStorage.setItem(AURA.STORAGE_KEY, JSON.stringify(obj.checklist));
    if (obj.links) localStorage.setItem(AURA.LINKS_KEY, JSON.stringify(obj.links));
    if (obj.meta && AURA.META_KEY) localStorage.setItem(AURA.META_KEY, JSON.stringify(obj.meta));
    if (obj.pages) localStorage.setItem(AURA.PAGES_KEY, JSON.stringify(obj.pages));
    if (obj.contents) localStorage.setItem(AURA.PAGES_CONTENT_KEY, JSON.stringify(obj.contents));
}

// Biar link yang ada tanda kutip/ampersand gak merusak HTML
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
