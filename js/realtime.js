/* ============================================================
   realtime.js — jam & tanggal realtime.
   Pindahan persis dari script.js lama.
   ============================================================ */

function updateRealtime() {
    const now = new Date();
    const hari = AURA.namaHari[now.getDay()];
    const tanggal = now.getDate();
    const bulan = AURA.namaBulan[now.getMonth()];
    const tahun = now.getFullYear();
    AURA.els.rtDate.textContent = `${hari}, ${tanggal} ${bulan} ${tahun}`;

    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    const detik = String(now.getSeconds()).padStart(2, '0');
    AURA.els.rtTime.textContent = `${jam}:${menit}:${detik}`;
}

function initRealtime() {
    updateRealtime();
    setInterval(updateRealtime, 1000);
}
