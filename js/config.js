/* ============================================================
   config.js — data & konstanta doang, tanpa logika.
   Pindahan persis dari script.js lama. Jangan ubah isi data
   di sini kalau cuma mau ganti tampilan.
   ============================================================ */
window.AURA = window.AURA || {};

AURA.workoutData = {
    'Senin': { icon: '🏋️', items: ['Chest', 'Shoulders', 'Arms'] },
    'Selasa': { icon: '🤸', items: ['Back', 'Biceps', 'Abs'] },
    'Rabu': { icon: '💪', items: ['Triceps', 'Arms'] },
    'Kamis': { icon: '😴', items: null },
    'Jumat': { icon: '🏋️', items: ['Chest', 'Shoulders', 'Triceps'] },
    'Sabtu': { icon: '🤸', items: ['Back', 'Biceps', 'Arms'] },
    'Minggu': { icon: '😴', items: null }
};

AURA.namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
AURA.namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

AURA.detailInfo = {
    antarRepetisi: '50 detik',
    antarSet: '5 menit',
    berat: '5 kg'
};

// Storage keys (jangan diganti biar data lama tetap kebaca)
AURA.STORAGE_KEY = 'workoutChecklist_v2';
AURA.LINKS_KEY = 'workoutLinks_v1';
AURA.META_KEY = 'workoutMeta_v1';
AURA.PAGES_KEY = 'auraPages_v1';
AURA.PAGES_CONTENT_KEY = 'auraPagesContent_v1';
AURA.ACTIVE_PAGE_KEY = 'auraActivePage_v1';

// State runtime (dibentuk ulang tiap refresh, tidak disimpan)
AURA.openDetails = new Set();
AURA.openWorkoutLinks = new Set();
AURA.state = {
    activePage: 'workout',
    pickedIcon: '🥗',
    todayName: null
};

// Elemen DOM (diisi sekali di main.js saat DOMContentLoaded)
AURA.els = {};
