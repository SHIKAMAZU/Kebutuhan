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
    if (!AURA.openCats) AURA.openCats = new Set();
    let workoutHTML = '';

    if (!data || data.items === null) {
        workoutHTML = `
            <span class="main-icon">${data ? data.icon : '😴'}</span>
            <div class="main-title">${dayName}</div>
            <div class="rest-box">
                <span class="rest-icon">🛌</span>
                <span class="rest-text">Hari Istirahat</span>
            </div>
        `;
    } else {
        const cats = getWorkoutCategories(dayName);

        const list = cats.map((cat, catIdx) => {
            const catId = `${dayName}-cat-${catIdx}`;
            const isCatOpen = AURA.openCats.has(catId);
            const catLinks = getCategoryLinks(dayName, catIdx);
            const catLinksHTML = catLinks.map((cl, slotIdx) => `
                <div class="link-row">
                    <input type="text" class="cat-link-input"
                        data-day="${dayName}" data-cat="${catIdx}" data-slot="${slotIdx}"
                        placeholder="Paste link TikTok ${slotIdx + 1} ${escapeHtml(cat.name)}..."
                        value="${escapeHtml(cl)}">
                    ${catLinks.length > 1 ? `<button class="link-del" onclick="event.stopPropagation(); window.removeCatLink('${dayName}', ${catIdx}, ${slotIdx})" title="Hapus link">×</button>` : ''}
                </div>
            `).join('');

            const subList = (cat.exercises || []).map((exName, exIdx) => {
                const detailIdEx = `${dayName}-cat${catIdx}-ex${exIdx}`;
                const isDetailOpen = AURA.openDetails.has(detailIdEx);
                const metaList = getExerciseMetaList(dayName, catIdx, exIdx);

                const metaHTML = metaList.map((m, eIdx) => `
                    <div class="meta-entry">
                        ${metaList.length > 1 ? `<div class="meta-top"><button class="link-del" onclick="event.stopPropagation(); window.removeExMeta('${dayName}', ${catIdx}, ${exIdx}, ${eIdx})" title="Hapus info">×</button></div>` : ''}
                        <div class="meta-head">
                            <span class="meta-title">Info latihan...</span>
                            <label class="meta-week">Minggu
                                <input type="text" class="workout-meta-input meta-week-input"
                                    data-day="${dayName}" data-cat="${catIdx}" data-ex="${exIdx}" data-entry="${eIdx}" data-field="minggu"
                                    placeholder="1-2" maxlength="7" value="${escapeHtml(m.minggu)}">
                            </label>
                        </div>
                        <label class="meta-label">Beban
                            <input type="text" class="workout-meta-input"
                                data-day="${dayName}" data-cat="${catIdx}" data-ex="${exIdx}" data-entry="${eIdx}" data-field="berat"
                                placeholder="cth: 5 kg..."
                                value="${escapeHtml(m.berat)}">
                        </label>
                        <label class="meta-label">Istirahat antar set
                            <input type="text" class="workout-meta-input"
                                data-day="${dayName}" data-cat="${catIdx}" data-ex="${exIdx}" data-entry="${eIdx}" data-field="antarSet"
                                placeholder="cth: 5 menit..."
                                value="${escapeHtml(m.antarSet)}">
                        </label>
                        <label class="meta-label">Istirahat antar repetisi
                            <input type="text" class="workout-meta-input"
                                data-day="${dayName}" data-cat="${catIdx}" data-ex="${exIdx}" data-entry="${eIdx}" data-field="antarRepetisi"
                                placeholder="cth: 50 detik..."
                                value="${escapeHtml(m.antarRepetisi)}">
                        </label>
                        <div class="meta-row-2">
                            <label class="meta-label">Repetisi
                                <input type="text" class="workout-meta-input"
                                    data-day="${dayName}" data-cat="${catIdx}" data-ex="${exIdx}" data-entry="${eIdx}" data-field="repetisi"
                                    placeholder="cth: 12x..."
                                    value="${escapeHtml(m.repetisi || '')}">
                            </label>
                            <label class="meta-label">Set
                                <input type="text" class="workout-meta-input"
                                    data-day="${dayName}" data-cat="${catIdx}" data-ex="${exIdx}" data-entry="${eIdx}" data-field="jumlahSet"
                                    placeholder="cth: 3 set..."
                                    value="${escapeHtml(m.jumlahSet || m.set || '')}">
                            </label>
                        </div>
                    </div>
                `).join('');

                return `
                    <div class="sub-entry">
                        <div class="sub-item">
                            <div class="sub-info">
                                <span class="sub-num">${exIdx + 1}</span>
                                <span class="sub-text">${escapeHtml(exName)}</span>
                            </div>
                            <div class="detail-card ex-inline sub-detail-btn" onclick="event.stopPropagation(); window.toggleDetail('${detailIdEx}')">
                                <span class="detail-text">Detail</span>
                                <span class="detail-arrow ${isDetailOpen ? 'open' : ''}" id="detail-arrow-${detailIdEx}">▼</span>
                            </div>
                        </div>
                        <div class="detail-panel sub-panel ${isDetailOpen ? 'open' : ''}" id="detail-panel-${detailIdEx}">
                            <div class="detail-panel-inner">
                                ${metaHTML}
                                <button class="link-add" onclick="event.stopPropagation(); window.addExMeta('${dayName}', ${catIdx}, ${exIdx})">+ Tambah Info</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="workout-entry cat-entry">
                    <div class="workout-item cat-head" onclick="window.toggleCat('${catId}')">
                        <div class="workout-info">
                            <div class="workout-dot"></div>
                            <div class="workout-text">${escapeHtml(cat.name)}</div>
                            <span class="cat-badge">${(cat.exercises || []).length} gerakan</span>
                        </div>
                        <div class="detail-card ex-inline cat-toggle">
                            <span class="detail-text">${isCatOpen ? 'Tutup' : 'Buka'}</span>
                            <span class="detail-arrow ${isCatOpen ? 'open' : ''}" id="cat-arrow-${catId}">▼</span>
                        </div>
                    </div>
                    <div class="cat-panel ${isCatOpen ? 'open' : ''}" id="cat-panel-${catId}">
                        <div class="sub-list">
                            <div class="cat-link-box">
                                <div class="workout-link-label">📎 Link TikTok — ${escapeHtml(cat.name)}</div>
                                ${catLinksHTML}
                                <button class="link-add" onclick="event.stopPropagation(); window.addCatLink('${dayName}', ${catIdx})">+ Tambah Link</button>
                            </div>
                            ${subList}
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

window.toggleCat = function(catId) {
    if (!AURA.openCats) AURA.openCats = new Set();
    const panel = document.getElementById(`cat-panel-${catId}`);
    const arrow = document.getElementById(`cat-arrow-${catId}`);
    if (!panel) return;
    const willOpen = !panel.classList.contains('open');
    if (willOpen) {
        AURA.openCats.add(catId);
        panel.classList.add('open');
        if (arrow) arrow.classList.add('open');
        const head = panel.previousElementSibling;
        const label = head ? head.querySelector('.cat-toggle .detail-text') : null;
        if (label) label.textContent = 'Tutup';
    } else {
        AURA.openCats.delete(catId);
        panel.classList.remove('open');
        if (arrow) arrow.classList.remove('open');
        const head = panel.previousElementSibling;
        const label = head ? head.querySelector('.cat-toggle .detail-text') : null;
        if (label) label.textContent = 'Buka';
    }
};

window.addCatLink = function(dayName, catIdx) {
    addCategoryLink(dayName, catIdx);
    renderDay(dayName);
};

window.removeCatLink = function(dayName, catIdx, slotIdx) {
    removeCategoryLink(dayName, catIdx, slotIdx);
    renderDay(dayName);
};

window.addExLink = function(dayName, catIdx, exIdx) {
    addExerciseLink(dayName, catIdx, exIdx);
    renderDay(dayName);
};

window.removeExLink = function(dayName, catIdx, exIdx, slotIdx) {
    removeExerciseLink(dayName, catIdx, exIdx, slotIdx);
    renderDay(dayName);
};

window.addExMeta = function(dayName, catIdx, exIdx) {
    addExerciseMetaEntry(dayName, catIdx, exIdx);
    renderDay(dayName);
};

window.removeExMeta = function(dayName, catIdx, exIdx, entryIdx) {
    removeExerciseMetaEntry(dayName, catIdx, exIdx, entryIdx);
    renderDay(dayName);
};

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

window.addMeta = function(dayName, itemIdx) {
    addItemMetaEntry(dayName, itemIdx);
    renderDay(dayName);
};

window.removeMeta = function(dayName, itemIdx, entryIdx) {
    removeItemMetaEntry(dayName, itemIdx, entryIdx);
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
