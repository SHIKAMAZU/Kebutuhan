/* ============================================================
   workout.js — render hari, checklist, toggle-toggle.
   Pindahan persis dari script.js lama, tanpa perubahan logika.
   ============================================================ */

function renderChecklistHTML(dayName) {
    const data = getDayData(dayName);
    const weeks = [
        { num: 1, label: 'Minggu 1' },
        { num: 2, label: 'Minggu 2' },
        { num: 3, label: 'Minggu 3' },
        { num: 4, label: 'Minggu 4' }
    ];

    let rows = '';
    weeks.forEach(w => {
        const isChecked = data[w.num] === true;

        rows += `
            <div class="checklist-item">
                <div class="minggu-card ${isChecked ? 'done' : ''}" onclick="window.toggleCheck('${dayName}', ${w.num})">
                    <span class="checklist-text">${w.label}</span>
                    <div class="checklist-box ${isChecked ? 'checked' : ''}" onclick="event.stopPropagation(); window.toggleCheck('${dayName}', ${w.num})">
                        <span class="checkmark">✓</span>
                    </div>
                </div>
            </div>
        `;
    });

    const checkedCount = Object.values(data).filter(v => v === true).length;
    const percent = Math.round((checkedCount / 4) * 100);

    return `
        <div class="checklist-wrap">
            <div class="checklist-label-section">📋 Progress Mingguan</div>
            ${rows}
            <div class="checklist-progress">
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${percent}%"></div>
                </div>
                <div class="progress-text">${checkedCount} / 4 minggu selesai (${percent}%)</div>
            </div>
        </div>
    `;
}

function renderDay(dayName) {
    const mainInner = AURA.els.mainInner;
    const data = AURA.workoutData[dayName];
    let workoutHTML = '';

    if (data.items === null) {
        workoutHTML = `
            <span class="main-icon">${data.icon}</span>
            <div class="main-title">${dayName}</div>
            <div class="rest-box">
                <span class="rest-icon">🛌</span>
                <span class="rest-text">Hari Istirahat</span>
            </div>
        `;
    } else {
        const list = data.items.map((item, idx) => {
            const detailIdEx = `${dayName}-ex-${idx}`;
            const isDetailOpen = AURA.openDetails.has(detailIdEx);
            const savedLinks = getItemLinks(dayName, idx);
            const meta = getItemMeta(dayName, idx);

            const inputsHTML = savedLinks.map((link, slotIdx) => `
                <div class="link-row">
                    <input type="text" class="workout-link-input"
                        data-day="${dayName}" data-idx="${idx}" data-slot="${slotIdx}"
                        placeholder="Paste link TikTok ${slotIdx + 1}..."
                        value="${escapeHtml(link)}">
                    ${savedLinks.length > 1 ? `<button class="link-del" onclick="event.stopPropagation(); window.removeLink('${dayName}', ${idx}, ${slotIdx})" title="Hapus link">×</button>` : ''}
                </div>
            `).join('');

            return `
                <div class="workout-entry">
                    <div class="workout-item">
                        <div class="workout-info">
                            <div class="workout-dot"></div>
                            <div class="workout-text">${item}</div>
                        </div>
                        <div class="detail-card ex-inline" onclick="event.stopPropagation(); window.toggleDetail('${detailIdEx}')">
                            <span class="detail-text">Detail</span>
                            <span class="detail-arrow ${isDetailOpen ? 'open' : ''}" id="detail-arrow-${detailIdEx}">▼</span>
                        </div>
                    </div>
                    <div class="detail-panel ${isDetailOpen ? 'open' : ''}" id="detail-panel-${detailIdEx}">
                        <div class="detail-panel-inner">
                            <div class="workout-link-label">Link TikTok...</div>
                            ${inputsHTML}
                            <button class="link-add" onclick="event.stopPropagation(); window.addLink('${dayName}', ${idx})">+ Tambah Link</button>
                            <div class="meta-divider"></div>
                            <div class="workout-link-label">Info Latihan...</div>
                            <label class="meta-label">Beban
                                <input type="text" class="workout-meta-input"
                                    data-day="${dayName}" data-idx="${idx}" data-field="berat"
                                    placeholder="cth: 5 kg..."
                                    value="${escapeHtml(meta.berat)}">
                            </label>
                            <label class="meta-label">Istirahat antar set
                                <input type="text" class="workout-meta-input"
                                    data-day="${dayName}" data-idx="${idx}" data-field="antarSet"
                                    placeholder="cth: 5 menit..."
                                    value="${escapeHtml(meta.antarSet)}">
                            </label>
                            <label class="meta-label">Istirahat antar repetisi
                                <input type="text" class="workout-meta-input"
                                    data-day="${dayName}" data-idx="${idx}" data-field="antarRepetisi"
                                    placeholder="cth: 50 detik..."
                                    value="${escapeHtml(meta.antarRepetisi)}">
                            </label>
                            <button class="link-del-text" onclick="event.stopPropagation(); window.clearMeta('${dayName}', ${idx})">Hapus info ini</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        workoutHTML = `
            <span class="main-icon">${data.icon}</span>
            <div class="main-title">${dayName}</div>
            <div class="workout-list">${list}</div>
        `;
    }

    const checklistHTML = renderChecklistHTML(dayName);

    mainInner.style.animation = 'none';
    void mainInner.offsetHeight;
    mainInner.style.animation = 'mainFadeIn 0.4s ease forwards';
    mainInner.innerHTML = workoutHTML + checklistHTML;
}

// Update checklist doang, tanpa nyentuh/reset animasi .main-inner
function updateChecklistOnly(dayName) {
    const mainInner = AURA.els.mainInner;
    const checklistWrap = mainInner.querySelector('.checklist-wrap');
    if (checklistWrap) {
        checklistWrap.outerHTML = renderChecklistHTML(dayName);
    }
}

window.toggleDetail = function(detailId) {
    const panel = document.getElementById(`detail-panel-${detailId}`);
    const arrow = document.getElementById(`detail-arrow-${detailId}`);
    if (!panel) return;

    const willOpen = !panel.classList.contains('open');

    if (willOpen) {
        AURA.openDetails.add(detailId);
        panel.classList.add('open');
        if (arrow) arrow.classList.add('open');
    } else {
        AURA.openDetails.delete(detailId);
        panel.classList.remove('open');
        if (arrow) arrow.classList.remove('open');
    }
};

window.toggleWorkoutLink = function(linkId) {
    const panel = document.getElementById(`w-panel-${linkId}`);
    const arrow = document.getElementById(`w-arrow-${linkId}`);
    if (!panel) return;

    const willOpen = !panel.classList.contains('open');

    if (willOpen) {
        AURA.openWorkoutLinks.add(linkId);
        panel.classList.add('open');
        if (arrow) arrow.classList.add('open');
    } else {
        AURA.openWorkoutLinks.delete(linkId);
        panel.classList.remove('open');
        if (arrow) arrow.classList.remove('open');
    }
};

window.toggleCheck = function(dayName, weekNum) {
    const data = getDayData(dayName);
    data[weekNum] = !data[weekNum];
    saveDayData(dayName, data);
    updateChecklistOnly(dayName);
};

window.addLink = function(dayName, itemIdx) {
    addItemLink(dayName, itemIdx);
    renderDay(dayName);
};

window.removeLink = function(dayName, itemIdx, slotIdx) {
    removeItemLink(dayName, itemIdx, slotIdx);
    renderDay(dayName);
};

window.clearMeta = function(dayName, itemIdx) {
    clearItemMeta(dayName, itemIdx);
    renderDay(dayName);
};

// Klik hari + efek ripple (dipanggil sekali dari main.js)
function initDays() {
    const days = AURA.els.days;
    days.forEach(day => {
        day.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);

            days.forEach(d => d.classList.remove('active'));
            this.classList.add('active');

            renderDay(this.dataset.day);
        });
    });
}
