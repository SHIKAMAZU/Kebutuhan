/* ============================================================
   config.js — data & konstanta doang, tanpa logika.
   Pindahan persis dari script.js lama. Jangan ubah isi data
   di sini kalau cuma mau ganti tampilan.
   ============================================================ */
window.AURA = window.AURA || {};

AURA.EXERCISES = {
    'Chest': ['Chest Press', 'Decline Press', 'Dumbbell Fly', 'Reverse Floor'],
    'Shoulders': ['Front Raises', 'Lateral Raises', 'Rear Delt Fly'],
    'Arms': ['Wrist Curl / Inward Curl', 'Wrist Extension / Hammer Forearm Curls', 'Hammer Curls / Reverse Dumbbell Curls'],
    'Back': ['Back Lats', 'Back Middle', 'Back Romboid Rear Deltoid / atas', 'Traps'],
    'Biceps': ['Bicep Curls', 'Hammer Curls', 'Concentration Curls'],
    'Abs': ['In and Out', 'Leg Raises', 'Crunches', 'Plank'],
    'Triceps': ['Overhead Tricep Extension', 'Tricep Kick Back']
};

function auraBuildItems(names) {
    return names.map(n => ({ name: n, exercises: (AURA.EXERCISES[n] || []).slice(0, 4) }));
}

AURA.workoutData = {
    'Senin': { icon: '🏋️', items: auraBuildItems(['Chest', 'Shoulders', 'Arms']) },
    'Selasa': { icon: '🤸', items: auraBuildItems(['Back', 'Biceps', 'Abs']) },
    'Rabu': { icon: '💪', items: auraBuildItems(['Triceps', 'Arms']) },
    'Kamis': { icon: '😴', items: null },
    'Jumat': { icon: '🏋️', items: auraBuildItems(['Chest', 'Shoulders', 'Triceps']) },
    'Sabtu': { icon: '🤸', items: auraBuildItems(['Back', 'Biceps', 'Arms']) },
    'Minggu': { icon: '😴', items: null }
};

// Normalisasi: dukung format lama ['Chest',...] & format baru [{name, exercises}]
function getWorkoutCategories(dayName) {
    const data = AURA.workoutData[dayName];
    if (!data || data.items === null) return null;
    return data.items.map(entry => {
        if (typeof entry === 'string') {
            return { name: entry, exercises: (AURA.EXERCISES[entry] || []).slice(0, 4) };
        }
        return { name: entry.name, exercises: Array.isArray(entry.exercises) ? entry.exercises : [] };
    });
}

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
