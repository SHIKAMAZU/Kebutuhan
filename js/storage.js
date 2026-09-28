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

// ---------- LINK PER KATEGORI (1-2 link untuk semua gerakan) ----------
// Array ["link1","link2"] = list link kategori. Objek {_cat:[...]} juga didukung.
function getCategoryLinks(dayName, catIdx) {
    const all = getAllLinks();
    const cat = (all[dayName] || {})[catIdx];
    if (Array.isArray(cat)) {
        if (cat.length === 0) return [''];
        // bedain array kategori vs array lama per-gerakan? array kategori langsung string.
        // Kalau isinya string -> itu link kategori.
        if (cat.every(s => typeof s === 'string')) {
            const compact = cat.filter(s => String(s || '').trim() !== '');
            if (compact.length === 0) return cat.length > 1 ? cat : [''];
            // hormati slot kosong yang baru ditambah
            const hasEmpty = cat.some(s => String(s || '').trim() === '');
            if (hasEmpty && compact.length < cat.length) {
                // kembalikan apa adanya biar input kosong tetap tampil
                return cat;
            }
            return compact;
        }
        return [''];
    }
    if (cat && typeof cat === 'object') {
        const cl = cat._cat;
        if (Array.isArray(cl)) {
            if (cl.length === 0) return [''];
            const compact = cl.filter(s => String(s || '').trim() !== '');
            if (compact.length === 0) return cl.length > 1 ? cl : [''];
            return compact.length < cl.length ? cl : compact;
        }
        if (typeof cl === 'string') return [cl];
        // fallback: array lama di ex-0 dianggap link kategori pertama
        const first = cat[0] !== undefined ? cat[0] : cat['0'];
        if (Array.isArray(first) && first[0]) return [first[0]];
        if (typeof first === 'string' && first) return [first];
    }
    if (typeof cat === 'string' && cat) return [cat];
    return [''];
}

function getCategoryLink(dayName, catIdx) {
    const arr = getCategoryLinks(dayName, catIdx);
    return arr[0] || '';
}

function setCategoryLinks(dayName, catIdx, arr) {
    const all = getAllLinks();
    if (!all[dayName]) all[dayName] = {};
    const cat = all[dayName][catIdx];
    if (cat && typeof cat === 'object' && !Array.isArray(cat)) {
        cat._cat = arr;
        all[dayName][catIdx] = cat;
    } else {
        all[dayName][catIdx] = arr;
    }
    localStorage.setItem(AURA.LINKS_KEY, JSON.stringify(all));
}

function saveCategoryLink(dayName, catIdx, value) {
    // kompatibel lama: set link pertama
    const cur = getCategoryLinks(dayName, catIdx);
    cur[0] = value;
    setCategoryLinks(dayName, catIdx, cur);
}

function saveCategoryLinkSlot(dayName, catIdx, slotIdx, value) {
    const cur = getCategoryLinks(dayName, catIdx);
    while (cur.length <= slotIdx) cur.push('');
    cur[slotIdx] = value;
    setCategoryLinks(dayName, catIdx, cur);
}

function addCategoryLink(dayName, catIdx) {
    const cur = getCategoryLinks(dayName, catIdx);
    if (cur.length >= 5) return cur;
    cur.push('');
    setCategoryLinks(dayName, catIdx, cur);
    return cur;
}

function removeCategoryLink(dayName, catIdx, slotIdx) {
    const cur = getCategoryLinks(dayName, catIdx);
    cur.splice(slotIdx, 1);
    if (cur.length === 0) cur.push('');
    setCategoryLinks(dayName, catIdx, cur);
    return cur;
}

// ---------- LINK PER GERAKAN (kategori > gerakan) ----------
// Format baru: { "Senin": { "0": { "0": ["link"], "1": [...] } } }
// Format lama: { "Senin": { "0": ["link"] } } -> dibaca sebagai gerakan ke-1
function getExerciseLinks(dayName, catIdx, exIdx) {
    const all = getAllLinks();
    const cat = (all[dayName] || {})[catIdx];
    if (Array.isArray(cat)) {
        if (Number(exIdx) === 0) return getItemLinks(dayName, catIdx);
        return [''];
    }
    if (cat && typeof cat === 'object') {
        const arr = cat[exIdx];
        if (!Array.isArray(arr) || arr.length === 0) return [''];
        const compact = arr.filter(s => String(s || '').trim() !== '');
        if (compact.length === 0) return arr.length > 1 ? arr : [''];
        return compact;
    }
    // fallback: coba format lama untuk gerakan pertama biar data lama kebawa
    if (Number(exIdx) === 0) {
        const legacy = getItemLinks(dayName, catIdx);
        if (legacy.length === 1 && legacy[0] === '') return [''];
        return legacy;
    }
    return [''];
}

function saveExerciseLink(dayName, catIdx, exIdx, slotIdx, value) {
    const all = getAllLinks();
    if (!all[dayName]) all[dayName] = {};
    let cat = all[dayName][catIdx];
    if (Array.isArray(cat)) {
        // migrasi: array lama jadi gerakan ke-0
        const old = cat;
        cat = { 0: old };
        all[dayName][catIdx] = cat;
    }
    if (!cat || typeof cat !== 'object') { cat = {}; all[dayName][catIdx] = cat; }
    if (!Array.isArray(cat[exIdx]) || cat[exIdx].length === 0) cat[exIdx] = [''];
    cat[exIdx][slotIdx] = value;
    localStorage.setItem(AURA.LINKS_KEY, JSON.stringify(all));
}

function addExerciseLink(dayName, catIdx, exIdx) {
    const cur = getExerciseLinks(dayName, catIdx, exIdx);
    if (cur.length >= 10) return cur;
    cur.push('');
    const all = getAllLinks();
    if (!all[dayName]) all[dayName] = {};
    let cat = all[dayName][catIdx];
    if (Array.isArray(cat)) { cat = { 0: cat }; all[dayName][catIdx] = cat; }
    if (!cat || typeof cat !== 'object') { cat = {}; all[dayName][catIdx] = cat; }
    cat[exIdx] = cur;
    localStorage.setItem(AURA.LINKS_KEY, JSON.stringify(all));
    return cur;
}

function removeExerciseLink(dayName, catIdx, exIdx, slotIdx) {
    const cur = getExerciseLinks(dayName, catIdx, exIdx);
    cur.splice(slotIdx, 1);
    if (cur.length === 0) cur.push('');
    const all = getAllLinks();
    if (!all[dayName]) all[dayName] = {};
    let cat = all[dayName][catIdx];
    if (Array.isArray(cat)) { cat = { 0: cat }; all[dayName][catIdx] = cat; }
    if (!cat || typeof cat !== 'object') { cat = {}; all[dayName][catIdx] = cat; }
    cat[exIdx] = cur;
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
        antarRepetisi: (m && m.antarRepetisi) || '',
        repetisi: (m && m.repetisi) || '',
        jumlahSet: (m && (m.jumlahSet || m.set)) || ''
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
    return { minggu: '1', berat: '', antarSet: '', antarRepetisi: '', repetisi: '', jumlahSet: '' };
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
        antarRepetisi: e.antarRepetisi || '',
        repetisi: e.repetisi || '',
        jumlahSet: e.jumlahSet || e.set || ''
    };
}

function getItemMetaList(dayName, itemIdx) {
    const all = getAllMeta();
    const raw = (all[dayName] || {})[itemIdx];
    if (Array.isArray(raw) && raw.length > 0) return raw.map(normalizeMetaEntry);
    if (raw && typeof raw === 'object' && (raw.berat || raw.antarSet || raw.antarRepetisi || raw.repetisi || raw.jumlahSet || raw.set)) {
        return [normalizeMetaEntry({ minggu: '1', berat: raw.berat, antarSet: raw.antarSet, antarRepetisi: raw.antarRepetisi, repetisi: raw.repetisi, jumlahSet: raw.jumlahSet || raw.set })];
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

// ---------- META PER GERAKAN (kategori > gerakan > list info) ----------
// Format baru: { "Senin": { "0": { "1": [ {...} ] } } }
// Format lama array per kategori dibaca sebagai gerakan ke-1.
function getExerciseMetaList(dayName, catIdx, exIdx) {
    const all = getAllMeta();
    const raw = (all[dayName] || {})[catIdx];
    if (Array.isArray(raw)) {
        if (Number(exIdx) === 0) {
            if (raw.length === 0) return [blankMetaEntry()];
            return raw.map(normalizeMetaEntry);
        }
        return [blankMetaEntry()];
    }
    if (raw && typeof raw === 'object') {
        // migrasi objek lama {berat,...} -> gerakan ke-1
        if (Number(exIdx) === 0 && (raw.berat || raw.antarSet || raw.antarRepetisi || raw.repetisi || raw.jumlahSet || raw.set) && !Array.isArray(raw[0]) && !Array.isArray(raw['0'])) {
            const hasExKeys = Object.keys(raw).some(k => /^\d+$/.test(k));
            if (!hasExKeys) return [normalizeMetaEntry({ minggu: '1', berat: raw.berat, antarSet: raw.antarSet, antarRepetisi: raw.antarRepetisi, repetisi: raw.repetisi, jumlahSet: raw.jumlahSet || raw.set })];
        }
        const exRaw = raw[exIdx];
        if (Array.isArray(exRaw) && exRaw.length > 0) return exRaw.map(normalizeMetaEntry);
        return [blankMetaEntry()];
    }
    if (Number(exIdx) === 0) {
        // fallback terakhir: coba baca format lama
        const legacy = getItemMetaList(dayName, catIdx);
        const isBlank = legacy.length === 1 && !legacy[0].berat && !legacy[0].antarSet && !legacy[0].antarRepetisi && !legacy[0].repetisi && !legacy[0].jumlahSet;
        if (!isBlank) return legacy;
    }
    return [blankMetaEntry()];
}

function setExerciseMetaList(dayName, catIdx, exIdx, list) {
    const all = getAllMeta();
    if (!all[dayName]) all[dayName] = {};
    let cat = all[dayName][catIdx];
    if (Array.isArray(cat)) { cat = { 0: cat }; }
    else if (!cat || typeof cat !== 'object') { cat = {}; }
    else if (cat.berat || cat.antarSet || cat.antarRepetisi || cat.repetisi || cat.jumlahSet || cat.set) {
        const hasExKeys = Object.keys(cat).some(k => /^\d+$/.test(k));
        if (!hasExKeys) cat = { 0: [{ minggu: '1', berat: cat.berat, antarSet: cat.antarSet, antarRepetisi: cat.antarRepetisi, repetisi: cat.repetisi, jumlahSet: cat.jumlahSet || cat.set }] };
    }
    cat[exIdx] = list;
    all[dayName][catIdx] = cat;
    localStorage.setItem(AURA.META_KEY, JSON.stringify(all));
}

function saveExerciseMetaEntryField(dayName, catIdx, exIdx, entryIdx, field, value) {
    const list = getExerciseMetaList(dayName, catIdx, exIdx);
    if (!list[entryIdx]) return;
    list[entryIdx][field] = value;
    setExerciseMetaList(dayName, catIdx, exIdx, list);
}

function addExerciseMetaEntry(dayName, catIdx, exIdx) {
    const list = getExerciseMetaList(dayName, catIdx, exIdx);
    if (list.length >= 8) return list;
    list.push(blankMetaEntry());
    setExerciseMetaList(dayName, catIdx, exIdx, list);
    return list;
}

function removeExerciseMetaEntry(dayName, catIdx, exIdx, entryIdx) {
    const list = getExerciseMetaList(dayName, catIdx, exIdx);
    list.splice(entryIdx, 1);
    if (list.length === 0) list.push(blankMetaEntry());
    setExerciseMetaList(dayName, catIdx, exIdx, list);
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
