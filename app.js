const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxLGvfYbaMES1JR7_6tuK-Y_DSsz3V86xY0xrSDMhbNWV6pVmHogIVgEuO2ww-31dpP/exec";

let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let currentWeek = null;
let allWeeks = [];
let editMode = false;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('footer-year').innerText = new Date().getFullYear();
    initApp();
});

function initApp() {
    if (currentUser) {
        showSection('home');
        document.getElementById('display-name').innerText = currentUser.adsoyad;
        if (currentUser.is_admin == 1) {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        }
        loadYears();
        loadWeeks();
    } else {
        showSection('auth');
    }
}

// --- NAVIGATION & UI ---
function showSection(section) {
    document.getElementById('auth-view').style.display = 'none';
    document.getElementById('main-view').style.display = 'none';
    document.getElementById('home-section').style.display = 'none';
    document.getElementById('reports-section').style.display = 'none';
    document.getElementById('admin-section').style.display = 'none';

    if (section === 'auth') {
        document.getElementById('auth-view').style.display = 'block';
    } else {
        document.getElementById('main-view').style.display = 'block';
        if (section === 'home') document.getElementById('home-section').style.display = 'block';
        if (section === 'reports') {
            document.getElementById('reports-section').style.display = 'block';
            loadReportWeeks();
        }
        if (section === 'admin') {
            document.getElementById('admin-section').style.display = 'block';
            loadAdminUsers();
        }
    }
}

function showLoader(show) {
    document.getElementById('app-loader').style.display = show ? 'flex' : 'none';
}

function showAlert(message, type = 'danger') {
    const container = document.getElementById('alert-container');
    container.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show">${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    window.scrollTo(0, 0);
}

// --- API HELPER ---
async function apiCall(payload) {
    showLoader(true);
    try {
        const response = await fetch(WEBAPP_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!data.success && data.message) showAlert(data.message);
        return data;
    } catch (error) {
        showAlert("Bağlantı hatası!");
        console.error(error);
        return { success: false };
    } finally {
        showLoader(false);
    }
}

// --- AUTH ACTIONS ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const res = await apiCall({ action: 'login', username, password });
    if (res.success) {
        currentUser = res.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        initApp();
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const adsoyad = document.getElementById('reg-adsoyad').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm-password').value;
    if (password !== confirm) return showAlert("Parolalar eşleşmiyor!");

    const res = await apiCall({ action: 'register', adsoyad, username, password });
    if (res.success) {
        currentUser = res.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        initApp();
    }
});

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    location.reload();
}

document.getElementById('change-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('cur-pass').value;
    const newPassword = document.getElementById('new-pass').value;
    const confirm = document.getElementById('new-pass-confirm').value;
    if (newPassword !== confirm) return showAlert("Yeni şifreler eşleşmiyor!");

    const res = await apiCall({ action: 'changePassword', userId: currentUser.id, currentPassword, newPassword });
    if (res.success) {
        showAlert(res.message, 'success');
        e.target.reset();
        bootstrap.Collapse.getInstance(document.getElementById('changePasswordPanel')).hide();
    }
});

// --- WEEK ACTIONS ---
function loadYears() {
    const select = document.getElementById('year-select');
    const currentYear = new Date().getFullYear();
    select.innerHTML = '';
    for (let y = currentYear; y >= currentYear - 5; y--) {
        select.innerHTML += `<option value="${y}">${y}</option>`;
    }
    select.onchange = loadWeeks;
}

async function loadWeeks() {
    const year = document.getElementById('year-select').value;
    const res = await apiCall({ action: 'getWeeks', userId: currentUser.id, year: year });
    if (res.success) {
        allWeeks = res.weeks;
        const list = document.getElementById('week-list-dropdown');
        list.innerHTML = '';
        allWeeks.forEach(w => {
            list.innerHTML += `<li><a class="dropdown-item ${currentWeek && currentWeek.id == w.id ? 'active-week' : ''}" href="#" onclick="selectWeek(${w.id})">${w.hafta_araligi} ${w.calisan_adi || ''}</a></li>`;
        });
        if (allWeeks.length === 0) {
            document.getElementById('weekDropdown').innerText = "Hafta Seç";
            document.getElementById('week-content').style.display = 'none';
        }
    }
}

async function selectWeek(id) {
    currentWeek = allWeeks.find(w => w.id == id);
    document.getElementById('weekDropdown').innerText = `${currentWeek.hafta_araligi} ${currentWeek.calisan_adi || ''}`;
    document.getElementById('week-content').style.display = 'block';
    
    // Day Buttons
    const container = document.getElementById('dayButtonContainer');
    container.innerHTML = '';
    const startDate = new Date(currentWeek.hafta_baslangic);
    
    // Fetch records to highlight entered days
    const recRes = await apiCall({ action: 'getRecords', weekId: id });
    const enteredDates = recRes.success ? recRes.records.map(r => formatDate(r.tarih)) : [];
    
    for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = formatDate(d);
        const dayNum = d.getDay();
        const shortDay = getShortDay(dayNum);
        const isEntered = enteredDates.includes(dateStr);
        
        let btnClass = isEntered ? 'kayitli-gun' : 'btn-outline-primary';
        if (dayNum === 0 || dayNum === 6) btnClass += ' weekend';
        
        const displayDate = `${shortDay} ${formatTurkishDate(d)}`;
        container.innerHTML += `<button type="button" class="btn ${btnClass} day-selector-btn" onclick="setRecordDate('${dateStr}', this)">${displayDate}</button>`;
    }
    
    renderRecords(recRes.records || []);
}

function setRecordDate(dateStr, btn) {
    document.getElementById('record-date').value = dateStr;
    document.querySelectorAll('.day-selector-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateSundayVisibility(dateStr, 'treatAsNormalContainer');
    document.getElementById('record-desc').focus();
}

document.getElementById('new-week-start').addEventListener('change', (e) => {
    document.getElementById('new-week-range').value = calculateWeekInterval(e.target.value);
});

document.getElementById('create-week-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const hafta_baslangic = document.getElementById('new-week-start').value;
    const hafta_araligi = document.getElementById('new-week-range').value;
    const res = await apiCall({ action: 'createWeek', userId: currentUser.id, hafta_baslangic, hafta_araligi, calisan_adi: currentUser.adsoyad });
    if (res.success) {
        e.target.reset();
        loadWeeks().then(() => selectWeek(res.weekId));
    }
});

// --- RECORD ACTIONS ---
async function renderRecords(records) {
    const tableContainer = document.getElementById('records-table-container');
    const body = document.getElementById('records-body');
    const footer = document.getElementById('records-footer');
    const title = document.getElementById('current-week-title');
    
    if (!currentWeek) return;
    tableContainer.style.display = 'block';
    title.innerText = `${currentWeek.hafta_araligi} ${currentWeek.calisan_adi || ''} Mesai Kayıtları`;
    
    body.innerHTML = '';
    let totalH = 0, pazarC = 0, holidayC = 0;
    
    records.forEach(r => {
        const d = new Date(r.tarih);
        const isP = r.treat_as_normal != 1 && d.getDay() === 0;
        const rowClass = r.is_resmi_tatil == 1 ? 'resmi-tatil' : (isP ? 'pazar' : '');
        const solukClass = (parseFloat(r.saat) > 0 || (r.saat == 0 && (isP || r.is_resmi_tatil == 1))) ? 'soluk' : '';
        
        let saatDisp = "";
        if (!((r.saat == 0 || !r.saat) && (isP || r.is_resmi_tatil == 1))) saatDisp = `${r.saat} saat`;

        body.innerHTML += `
            <tr class="${rowClass} ${solukClass}">
                <td>${formatTurkishDate(d)} ${isP ? '(Pazar)' : ''}</td>
                <td>${r.aciklama} ${r.is_resmi_tatil == 1 ? '(Resmi Tatil Mesaisi)' : ''}</td>
                <td>${saatDisp}</td>
                <td class="edit-buttons" style="display:${editMode ? 'table-cell' : 'none'}">
                    <button class="btn btn-sm btn-warning" onclick="openEditRecordModal(${JSON.stringify(r).replace(/"/g, '&quot;')})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRecord(${r.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
        
        totalH += parseFloat(r.saat || 0);
        if (isP) pazarC++;
        if (r.is_resmi_tatil == 1) holidayC++;
    });
    
    footer.innerHTML = `
        <tr class="table-primary"><td colspan="2"><strong>Toplam Mesai</strong></td><td colspan="2"><strong>${totalH} saat</strong></td></tr>
        <tr class="table-warning"><td colspan="2"><strong>Pazar Mesai Sayısı</strong></td><td colspan="2"><strong>${pazarC} adet</strong></td></tr>
        ${holidayC > 0 ? `<tr class="table-info"><td colspan="2"><strong>Resmi Tatil Mesaisi Sayısı</strong></td><td colspan="2"><strong>${holidayC} adet</strong></td></tr>` : ''}
    `;
    
    document.querySelector('.edit-header').style.display = editMode ? 'table-cell' : 'none';
}

document.getElementById('add-record-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentWeek) return;
    
    const payload = {
        action: 'addRecord',
        weekId: currentWeek.id,
        tarih: document.getElementById('record-date').value,
        aciklama: document.getElementById('record-desc').value,
        saat: document.getElementById('record-hour').value || 0,
        is_resmi_tatil: document.getElementById('record-holiday').checked,
        treat_as_normal: document.getElementById('record-normal').checked
    };
    
    const res = await apiCall(payload);
    if (res.success) {
        e.target.reset();
        selectWeek(currentWeek.id);
    }
});

function toggleEditMode() {
    editMode = !editMode;
    selectWeek(currentWeek.id);
}

// --- MODAL ACTIONS ---
function openEditRecordModal(record) {
    document.getElementById('edit-rec-id').value = record.id;
    document.getElementById('edit-rec-date').value = formatDate(record.tarih);
    document.getElementById('edit-rec-desc').value = record.aciklama;
    document.getElementById('edit-rec-hour').value = record.saat;
    document.getElementById('edit-rec-holiday').checked = record.is_resmi_tatil == 1;
    document.getElementById('edit-rec-normal').checked = record.treat_as_normal == 1;
    updateSundayVisibility(record.tarih, 'edit-treat-normal-container');
    new bootstrap.Modal(document.getElementById('editRecordModal')).show();
}

document.getElementById('edit-record-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        action: 'updateRecord',
        recordId: document.getElementById('edit-rec-id').value,
        tarih: document.getElementById('edit-rec-date').value,
        aciklama: document.getElementById('edit-rec-desc').value,
        saat: document.getElementById('edit-rec-hour').value || 0,
        is_resmi_tatil: document.getElementById('edit-rec-holiday').checked,
        treat_as_normal: document.getElementById('edit-rec-normal').checked
    };
    const res = await apiCall(payload);
    if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('editRecordModal')).hide();
        selectWeek(currentWeek.id);
    }
});

async function deleteRecord(id) {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    const res = await apiCall({ action: 'deleteRecord', recordId: id });
    if (res.success) selectWeek(currentWeek.id);
}

function openEditWeekModal() {
    document.getElementById('edit-week-start').value = formatDate(currentWeek.hafta_baslangic);
    document.getElementById('edit-week-range').value = currentWeek.hafta_araligi;
    new bootstrap.Modal(document.getElementById('editWeekModal')).show();
}

document.getElementById('edit-week-start').addEventListener('change', (e) => {
    document.getElementById('edit-week-range').value = calculateWeekInterval(e.target.value);
});

document.getElementById('edit-week-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        action: 'updateWeek',
        weekId: currentWeek.id,
        hafta_baslangic: document.getElementById('edit-week-start').value,
        hafta_araligi: document.getElementById('edit-week-range').value
    };
    const res = await apiCall(payload);
    if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('editWeekModal')).hide();
        loadWeeks().then(() => selectWeek(currentWeek.id));
    }
});

async function confirmDeleteWeek() {
    if (!confirm("Bu haftayı ve içindeki tüm mesai verilerini silmek istediğinize emin misiniz?")) return;
    const res = await apiCall({ action: 'deleteWeek', weekId: currentWeek.id });
    if (res.success) {
        currentWeek = null;
        loadWeeks();
    }
}

// --- REPORT ACTIONS ---
async function loadReportWeeks() {
    const res = await apiCall({ action: 'getWeeks', userId: currentUser.id });
    if (res.success) {
        const select = document.getElementById('report-week-select');
        select.innerHTML = '<option value="">Seçiniz</option>';
        res.weeks.forEach(w => {
            select.innerHTML += `<option value="${w.id}">${w.hafta_araligi} ${w.calisan_adi || ''}</option>`;
        });
    }
}

document.getElementById('week-report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const weekId = document.getElementById('report-week-select').value;
    const res = await apiCall({ action: 'generateReport', type: 'week', weekId });
    if (res.success) {
        const area = document.getElementById('week-report-result');
        area.style.display = 'block';
        area.querySelector('textarea').value = res.report;
    }
});

document.getElementById('range-report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const startDate = document.getElementById('range-start').value;
    const endDate = document.getElementById('range-end').value;
    const res = await apiCall({ action: 'generateReport', type: 'range', userId: currentUser.id, startDate, endDate });
    if (res.success) {
        const area = document.getElementById('range-report-result');
        area.style.display = 'block';
        area.querySelector('textarea').value = res.report;
    }
});

document.getElementById('admin-report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const startDate = document.getElementById('admin-start').value;
    const endDate = document.getElementById('admin-end').value;
    const res = await apiCall({ action: 'generateReport', type: 'admin_all', startDate, endDate });
    if (res.success) {
        const area = document.getElementById('admin-report-result');
        area.style.display = 'block';
        area.querySelector('textarea').value = res.report;
    }
});

function copyReport(containerId) {
    const text = document.getElementById(containerId).querySelector('textarea').value;
    navigator.clipboard.writeText(text).then(() => alert('Rapor kopyalandı!'));
}

// --- ADMIN ACTIONS ---
async function loadAdminUsers() {
    const res = await apiCall({ action: 'getUsers' });
    if (res.success) {
        const body = document.getElementById('admin-user-list');
        body.innerHTML = '';
        res.users.forEach(u => {
            body.innerHTML += `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.username}</td>
                    <td>${u.adsoyad}</td>
                    <td><span class="badge bg-${u.is_admin == 1 ? 'primary' : 'secondary'}">${u.is_admin == 1 ? 'Admin' : 'Kullanıcı'}</span></td>
                    <td><span class="badge bg-${u.is_banned == 1 ? 'danger' : 'success'}">${u.is_banned == 1 ? 'Banlı' : 'Aktif'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="openEditUserModal(${JSON.stringify(u).replace(/"/g, '&quot;')})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>
                        <button class="btn btn-sm btn-${u.is_banned == 1 ? 'success' : 'secondary'}" onclick="toggleBan(${u.id})"><i class="fas fa-${u.is_banned == 1 ? 'unlock' : 'ban'}"></i></button>
                        <button class="btn btn-sm btn-${u.is_admin == 1 ? 'secondary' : 'primary'}" onclick="toggleAdmin(${u.id})"><i class="fas fa-${u.is_admin == 1 ? 'user' : 'user-shield'}"></i></button>
                    </td>
                </tr>
            `;
        });
    }
}

function filterUsers() {
    const filter = document.getElementById('userSearch').value.toLowerCase();
    document.querySelectorAll('#admin-user-list tr').forEach(tr => {
        tr.style.display = tr.innerText.toLowerCase().includes(filter) ? '' : 'none';
    });
}

function openEditUserModal(user) {
    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-user-username').value = user.username;
    document.getElementById('edit-user-adsoyad').value = user.adsoyad;
    document.getElementById('edit-user-pass').value = '';
    new bootstrap.Modal(document.getElementById('editUserModal')).show();
}

document.getElementById('edit-user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        action: 'updateUser',
        targetUserId: document.getElementById('edit-user-id').value,
        username: document.getElementById('edit-user-username').value,
        adsoyad: document.getElementById('edit-user-adsoyad').value,
        password: document.getElementById('edit-user-pass').value
    };
    const res = await apiCall(payload);
    if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
        loadAdminUsers();
    }
});

async function deleteUser(id) {
    if (id == currentUser.id) return showAlert("Kendinizi silemezsiniz!");
    if (!confirm("Bu kullanıcıyı ve tüm verilerini silmek istediğinizden emin misiniz?")) return;
    const res = await apiCall({ action: 'deleteUser', targetUserId: id });
    if (res.success) loadAdminUsers();
}

async function toggleBan(id) {
    if (id == currentUser.id) return showAlert("Kendinizi banlayamazsınız!");
    const res = await apiCall({ action: 'toggleBan', targetUserId: id });
    if (res.success) loadAdminUsers();
}

async function toggleAdmin(id) {
    if (id == currentUser.id) return showAlert("Kendi admin yetkinizi değiştiremezsiniz!");
    const res = await apiCall({ action: 'toggleAdmin', targetUserId: id });
    if (res.success) loadAdminUsers();
}

// --- UTILITIES ---
function formatDate(d) {
    const date = new Date(d);
    return date.toISOString().split('T')[0];
}

function formatTurkishDate(d) {
    const date = new Date(d);
    const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    return `${date.getDate()} ${months[date.getMonth()]}`;
}

function getShortDay(dayNum) {
    return ['PZR', 'PTS', 'SAL', 'ÇAR', 'PER', 'CUM', 'CTS'][dayNum];
}

function calculateWeekInterval(startDateStr) {
    if (!startDateStr) return "Otomatik oluşur";
    const start = new Date(startDateStr);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    return start.getMonth() === end.getMonth() ?
        `${start.getDate()}-${end.getDate()} ${months[start.getMonth()]}` :
        `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]}`;
}

function updateSundayVisibility(dateStr, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const d = new Date(dateStr);
    container.style.display = d.getDay() === 0 ? 'block' : 'none';
    if (d.getDay() !== 0) container.querySelector('input').checked = false;
}
