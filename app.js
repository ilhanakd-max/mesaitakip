const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwFSFig3HFA1lNjZKdQL6cAvh2tAwyYoWJ3Hn_Mtn0a37uzR10SvUrByUBRl7vC6DiX/exec';

let currentUser = null;
let currentWeek = null;
let allWeeks = [];
let mesaiRecords = [];
let isEditMode = false;

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    document.getElementById('footerYear').textContent = new Date().getFullYear();
    
    checkSession();
    
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('createWeekForm').addEventListener('submit', handleCreateWeek);
    document.getElementById('addRecordForm').addEventListener('submit', handleAddRecord);
    document.getElementById('changePasswordForm').addEventListener('submit', handleChangePassword);
    document.getElementById('weekReportForm').addEventListener('submit', handleWeekReport);
    document.getElementById('dateRangeReportForm').addEventListener('submit', handleDateRangeReport);
    document.getElementById('yearSelect').addEventListener('change', handleYearChange);
    document.getElementById('editWeekForm').addEventListener('submit', handleEditWeek);
    document.getElementById('adminUserReportForm').addEventListener('submit', handleAdminUserReport);
    document.getElementById('adminAllUsersReportForm').addEventListener('submit', handleAdminAllUsersReport);
    
    document.getElementById('haftaBaslangic').addEventListener('change', updateWeekInterval);
    document.getElementById('editWeekStartDate').addEventListener('change', updateEditWeekInterval);
    
    document.getElementById('userSearch').addEventListener('keyup', filterUserTable);
    document.getElementById('userReportSearch').addEventListener('keyup', filterUserReportSelect);
    
    document.getElementById('mesaiTarihInput').addEventListener('change', handleDateChange);
}

async function apiCall(action, data) {
    if (!data) data = {};
    data.action = action;
    
    try {
        const response = await fetch(WEBAPP_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        showMessage('API hatası: ' + error.message);
        return { success: false, message: error.message };
    }
}

function checkSession() {
    const savedUser = localStorage.getItem('mesai_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainPage();
    }
}

function saveSession() {
    if (currentUser) {
        localStorage.setItem('mesai_user', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('mesai_user');
    }
}

function showMessage(message, isError = true) {
    const messageArea = document.getElementById('messageArea');
    messageArea.textContent = message;
    messageArea.className = isError ? 'alert alert-danger' : 'alert alert-success';
    messageArea.style.display = 'block';
    setTimeout(() => {
        messageArea.style.display = 'none';
    }, 5000);
}

function showSection(sectionId) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainSection').style.display = 'none';
    document.getElementById('reportsSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'none';
    
    if (sectionId) {
        document.getElementById(sectionId).style.display = 'block';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;
    
    if (!username || !password) {
        showMessage('Tüm alanlar doldurulmalıdır!');
        return;
    }
    
    const result = await apiCall('login', { username, password });
    
    if (result.success) {
        currentUser = result.user;
        
        if (remember) {
            localStorage.setItem('mesai_username', username);
            localStorage.setItem('mesai_password', password);
        }
        
        saveSession();
        showMainPage();
    } else {
        showMessage(result.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const adsoyad = document.getElementById('regAdsoyad').value;
    
    if (!username || !password || !confirmPassword || !adsoyad) {
        showMessage('Tüm alanlar doldurulmalıdır!');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Parolalar eşleşmiyor!');
        return;
    }
    
    const result = await apiCall('register', { username, password, adsoyad });
    
    if (result.success) {
        currentUser = result.user;
        saveSession();
        showMainPage();
    } else {
        showMessage(result.message);
    }
}

function logout() {
    currentUser = null;
    currentWeek = null;
    localStorage.removeItem('mesai_user');
    localStorage.removeItem('mesai_username');
    localStorage.removeItem('mesai_password');
    showSection('loginSection');
}

function showMainPage() {
    showSection('mainSection');
    
    document.getElementById('userWelcome').textContent = '| Hoşgeldin ' + currentUser.adsoyad;
    
    if (currentUser.is_admin === 1) {
        document.getElementById('adminLink').style.display = 'block';
    } else {
        document.getElementById('adminLink').style.display = 'none';
    }
    
    loadYears();
}

async function loadYears() {
    const result = await apiCall('getYearOptions', { user_id: currentUser.id });
    
    if (result.success) {
        const yearSelect = document.getElementById('yearSelect');
        yearSelect.innerHTML = '';
        
        result.years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
        
        if (result.years.length > 0 && !result.years.includes(new Date().getFullYear())) {
            const option = document.createElement('option');
            option.value = new Date().getFullYear();
            option.textContent = new Date().getFullYear();
            yearSelect.appendChild(option);
        }
        
        loadWeeks();
    }
}

async function handleYearChange() {
    loadWeeks();
}

async function loadWeeks() {
    const year = document.getElementById('yearSelect').value;
    
    const result = await apiCall('getWeeks', { user_id: currentUser.id, year });
    
    if (result.success) {
        allWeeks = result.weeks;
        renderWeekDropdown();
    }
}

function renderWeekDropdown() {
    const dropdownMenu = document.getElementById('weekDropdownMenu');
    const selectedWeekText = document.getElementById('selectedWeekText');
    dropdownMenu.innerHTML = '';
    
    if (allWeeks.length === 0) {
        selectedWeekText.textContent = 'Hafta Seç';
        return;
    }
    
    allWeeks.forEach(week => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        a.href = '#';
        a.textContent = week.hafta_araligi + (week.calisan_adi ? ' ' + week.calisan_adi : '');
        a.onclick = () => selectWeek(week.id);
        li.appendChild(a);
        dropdownMenu.appendChild(li);
    });
    
    if (currentWeek) {
        selectedWeekText.textContent = currentWeek.hafta_araligi + (currentWeek.calisan_adi ? ' ' + currentWeek.calisan_adi : '');
    } else {
        selectedWeekText.textContent = 'Hafta Seç';
    }
}

async function selectWeek(weekId) {
    const result = await apiCall('selectWeek', { week_id: weekId, user_id: currentUser.id });
    
    if (result.success) {
        currentWeek = result.week;
        document.getElementById('selectedWeekText').textContent = currentWeek.hafta_araligi + (currentWeek.calisan_adi ? ' ' + currentWeek.calisan_adi : '');
        loadRecords();
    }
}

function updateWeekInterval() {
    const startDateInput = document.getElementById('haftaBaslangic');
    const intervalInput = document.getElementById('haftaAraligi');
    
    if (startDateInput.value) {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        intervalInput.value = formatHaftaAraligi(startDate, endDate);
    } else {
        intervalInput.value = 'Otomatik oluşur';
    }
}

function updateEditWeekInterval() {
    const startDateInput = document.getElementById('editWeekStartDate');
    const intervalInput = document.getElementById('editWeekInterval');
    
    if (startDateInput.value) {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        intervalInput.value = formatHaftaAraligi(startDate, endDate);
    }
}

function formatHaftaAraligi(startDate, endDate) {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const startMonthName = months[startDate.getMonth()];
    const endMonthName = months[endDate.getMonth()];
    
    if (startDate.getMonth() === endDate.getMonth()) {
        return startDay + '-' + endDay + ' ' + startMonthName;
    }
    return startDay + ' ' + startMonthName + ' - ' + endDay + ' ' + endMonthName;
}

async function handleCreateWeek(e) {
    e.preventDefault();
    
    const haftaBaslangic = document.getElementById('haftaBaslangic').value;
    const haftaAraligi = document.getElementById('haftaAraligi').value;
    
    if (!haftaBaslangic) {
        showMessage('Hafta başlangıç tarihi gereklidir!');
        return;
    }
    
    const result = await apiCall('createWeek', {
        user_id: currentUser.id,
        hafta_baslangic: haftaBaslangic,
        calisan_adi: currentUser.adsoyad
    });
    
    if (result.success) {
        currentWeek = { id: result.week_id, hafta_baslangic: haftaBaslangic, hafta_araligi: result.hafta_araligi, calisan_adi: currentUser.adsoyad };
        document.getElementById('haftaBaslangic').value = '';
        document.getElementById('haftaAraligi').value = 'Otomatik oluşur';
        loadWeeks();
        loadRecords();
        showMessage('Hafta başarıyla oluşturuldu!', false);
    } else {
        showMessage(result.message);
    }
}

async function loadRecords() {
    if (!currentWeek) {
        document.getElementById('weekDetailsSection').style.display = 'none';
        document.getElementById('recordsSection').style.display = 'none';
        document.getElementById('noRecordsMessage').style.display = 'none';
        return;
    }
    
    document.getElementById('weekDetailsSection').style.display = 'block';
    
    document.getElementById('mesaiTarihInput').value = currentWeek.hafta_baslangic;
    
    renderDayButtons();
    
    const result = await apiCall('getRecords', { hafta_id: currentWeek.id });
    
    if (result.success) {
        mesaiRecords = result.records;
        renderRecords();
    }
}

function renderDayButtons() {
    const container = document.getElementById('dayButtonContainer');
    container.innerHTML = '';
    
    if (!currentWeek) return;
    
    const startDate = new Date(currentWeek.hafta_baslangic);
    const mesaiDates = mesaiRecords.map(r => r.tarih);
    
    const gunler = ['PZR', 'PTS', 'SAL', 'ÇAR', 'PER', 'CUM', 'CTS'];
    const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startDate);
        currentDay.setDate(currentDay.getDate() + i);
        
        const dateStr = currentDay.toISOString().split('T')[0];
        const gunNum = currentDay.getDay();
        
        const displayText = gunler[gunNum] + ' ' + currentDay.getDate() + ' ' + aylar[currentDay.getMonth()];
        
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn day-selector-btn';
        btn.dataset.date = dateStr;
        
        if (mesaiDates.includes(dateStr)) {
            btn.classList.add('kayitli-gun');
        }
        
        if (gunNum === 0 || gunNum === 6) {
            btn.classList.add('weekend');
        }
        
        btn.textContent = displayText;
        btn.onclick = () => selectDay(dateStr);
        
        container.appendChild(btn);
    }
}

function selectDay(dateStr) {
    document.getElementById('mesaiTarihInput').value = dateStr;
    
    document.querySelectorAll('.day-selector-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.date === dateStr) {
            btn.classList.add('active');
        }
    });
    
    handleDateChange();
    
    document.getElementById('mesaiAciklamaInput').focus();
}

function handleDateChange() {
    const dateStr = document.getElementById('mesaiTarihInput').value;
    const container = document.getElementById('treatAsNormalContainer');
    
    if (dateStr && isSunday(dateStr)) {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        document.getElementById('treatAsNormal').checked = false;
    }
}

function isSunday(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getDay() === 0;
}

async function handleAddRecord(e) {
    e.preventDefault();
    
    if (!currentWeek) {
        showMessage('Önce bir hafta seçin!');
        return;
    }
    
    const tarih = document.getElementById('mesaiTarihInput').value;
    const aciklama = document.getElementById('mesaiAciklamaInput').value;
    const saat = document.getElementById('mesaiSaatInput').value;
    const is_resmi_tatil = document.getElementById('isResmiTatil').checked ? 1 : 0;
    const treat_as_normal = document.getElementById('treatAsNormal').checked ? 1 : 0;
    
    const result = await apiCall('addRecord', {
        hafta_id: currentWeek.id,
        tarih,
        aciklama,
        saat: saat || '0',
        is_resmi_tatil,
        treat_as_normal
    });
    
    if (result.success) {
        document.getElementById('mesaiAciklamaInput').value = '';
        document.getElementById('mesaiSaatInput').value = '';
        document.getElementById('isResmiTatil').checked = false;
        document.getElementById('treatAsNormal').checked = false;
        
        loadRecords();
        showMessage('Kayıt başarıyla eklendi!', false);
    } else {
        showMessage(result.message);
    }
}

function renderRecords() {
    const tbody = document.getElementById('recordsTableBody');
    const summary = document.getElementById('recordsSummary');
    const recordsSection = document.getElementById('recordsSection');
    const noRecordsMessage = document.getElementById('noRecordsMessage');
    
    tbody.innerHTML = '';
    
    if (mesaiRecords.length === 0) {
        recordsSection.style.display = 'none';
        noRecordsMessage.style.display = 'block';
        return;
    }
    
    recordsSection.style.display = 'block';
    noRecordsMessage.style.display = 'none';
    
    document.getElementById('recordsTitle').textContent = currentWeek.hafta_araligi + (currentWeek.calisan_adi ? ' ' + currentWeek.calisan_adi : '') + ' Mesai Kayıtları';
    
    let toplamSaat = 0;
    let pazarSayisi = 0;
    let resmiTatilSayisi = 0;
    
    mesaiRecords.forEach(record => {
        const treatAsNormal = record.treat_as_normal === 1;
        const isPazar = isSunday(record.tarih);
        const isPazarAndNotNormal = isPazar && !treatAsNormal;
        
        const tr = document.createElement('tr');
        
        if (record.is_resmi_tatil === 1) {
            tr.classList.add('resmi-tatil');
        } else if (isPazarAndNotNormal) {
            tr.classList.add('pazar');
        }
        
        if ((parseFloat(record.saati) > 0 || (record.saati === '0' && (isPazarAndNotNormal || record.is_resmi_tatil === 1)))) {
            tr.classList.add('soluk');
        }
        
        const formattedTarih = formatTarih(record.tarih);
        const pazarText = isPazar && !treatAsNormal ? ' (Pazar)' : '';
        const saatText = (parseFloat(record.saati) > 0 || (record.saati === '0' && (isPazarAndNotNormal || record.is_resmi_tatil === 1))) ? record.saati + ' saat' : '';
        
        tr.innerHTML = `
            <td>${formattedTarih}${pazarText}</td>
            <td>${record.aciklama}${record.is_resmi_tatil === 1 ? ' (Resmi Tatil Mesaisi)' : ''}</td>
            <td>${saatText}</td>
            <td class="edit-buttons">
                <button type="button" class="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#editRecordModal${record.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <a href="#" class="btn btn-sm btn-danger" onclick="confirmDeleteRecord(${record.id}); return false;">
                    <i class="fas fa-trash"></i>
                </a>
            </td>
        `;
        
        tbody.appendChild(tr);
        
        if (record.saati) {
            toplamSaat += parseFloat(record.saati);
        }
        if (isPazar && !treatAsNormal) pazarSayisi++;
        if (record.is_resmi_tatil === 1) resmiTatilSayisi++;
        
        createEditModal(record);
    });
    
    summary.innerHTML = `
        <tr class="table-primary">
            <td colspan="2"><strong>Toplam Mesai</strong></td>
            <td colspan="2"><strong>${toplamSaat} saat</strong></td>
        </tr>
        <tr class="table-warning">
            <td colspan="2"><strong>Pazar Mesai Sayısı</strong></td>
            <td colspan="2"><strong>${pazarSayisi} adet</strong></td>
        </tr>
        ${resmiTatilSayisi > 0 ? `
        <tr class="table-info">
            <td colspan="2"><strong>Resmi Tatil Mesaisi Sayısı</strong></td>
            <td colspan="2"><strong>${resmiTatilSayisi} adet</strong></td>
        </tr>
        ` : ''}
    `;
}

function formatTarih(dateStr) {
    if (!dateStr) return '';
    
    const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const d = new Date(dateStr);
    return d.getDate() + ' ' + aylar[d.getMonth()];
}

function createEditModal(record) {
    const modalId = 'editRecordModal' + record.id;
    
    if (document.getElementById(modalId)) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = modalId;
    modal.tabIndex = '-1';
    
    const treatAsNormal = record.treat_as_normal === 1;
    const isPazar = isSunday(record.tarih);
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <form onsubmit="handleUpdateRecord(event, ${record.id})">
                    <div class="modal-header">
                        <h5 class="modal-title">Kayıt Düzenle</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" name="id" value="${record.id}">
                        <div class="mb-2">
                            <label class="form-label">Tarih</label>
                            <input type="date" name="tarih" class="form-control" value="${record.tarih}" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label">Açıklama</label>
                            <input type="text" name="aciklama" class="form-control" value="${record.aciklama}" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label">Saat</label>
                            <input type="number" step="0.1" name="saat" class="form-control" value="${record.saati}">
                        </div>
                        <div class="form-check">
                            <input type="checkbox" name="is_resmi_tatil" class="form-check-input" id="isResmiTatilEdit${record.id}" ${record.is_resmi_tatil === 1 ? 'checked' : ''}>
                            <label class="form-check-label" for="isResmiTatilEdit${record.id}">Resmi Tatil Mesaisi</label>
                        </div>
                        <div class="form-check" id="treatAsNormalContainerEdit${record.id}" ${isPazar ? '' : 'style="display: none;"'}>
                            <input type="checkbox" name="treat_as_normal" class="form-check-input" id="treatAsNormalEdit${record.id}" ${treatAsNormal ? 'checked' : ''}>
                            <label class="form-check-label" for="treatAsNormalEdit${record.id}">Pazar gününü normal hafta içi say</label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                        <button type="submit" class="btn btn-primary">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function handleUpdateRecord(e, id) {
    e.preventDefault();
    
    const form = e.target;
    const tarih = form.tarih.value;
    const aciklama = form.aciklama.value;
    const saat = form.saat.value;
    const is_resmi_tatil = form.is_resmi_tatil.checked ? 1 : 0;
    const treat_as_normal = form.treat_as_normal.checked ? 1 : 0;
    
    const result = await apiCall('updateRecord', {
        id,
        hafta_id: currentWeek.id,
        tarih,
        aciklama,
        saat: saat || '0',
        is_resmi_tatil,
        treat_as_normal
    });
    
    if (result.success) {
        loadRecords();
        showMessage('Kayıt başarıyla güncellendi!', false);
    } else {
        showMessage(result.message);
    }
}

function confirmDeleteRecord(id) {
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    document.getElementById('confirmModalMessage').textContent = 'Bu kaydı silmek istediğinize emin misiniz?';
    document.getElementById('confirmYesBtn').onclick = () => deleteRecord(id);
    modal.show();
}

async function deleteRecord(id) {
    const result = await apiCall('deleteRecord', { id });
    
    if (result.success) {
        bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
        loadRecords();
        showMessage('Kayıt başarıyla silindi!', false);
    } else {
        showMessage(result.message);
    }
}

function toggleEditButtons() {
    const buttons = document.querySelectorAll('.edit-buttons');
    const header = document.querySelector('.edit-header');
    const isHidden = buttons.length > 0 && (buttons[0].style.display === 'none' || buttons[0].style.display === '');
    
    buttons.forEach(button => {
        button.style.display = isHidden ? 'table-cell' : 'none';
    });
    
    if (header) {
        header.style.display = isHidden ? 'table-cell' : 'none';
    }
}

async function handleEditWeek(e) {
    e.preventDefault();
    
    const week_id = document.getElementById('editWeekId').value;
    const hafta_baslangic = document.getElementById('editWeekStartDate').value;
    const hafta_araligi = document.getElementById('editWeekInterval').value;
    
    const result = await apiCall('updateWeek', {
        week_id,
        user_id: currentUser.id,
        hafta_baslangic,
        hafta_araligi
    });
    
    if (result.success) {
        currentWeek.hafta_baslangic = hafta_baslangic;
        currentWeek.hafta_araligi = result.hafta_araligi;
        
        loadWeeks();
        bootstrap.Modal.getInstance(document.getElementById('editWeekModal')).hide();
        showMessage('Hafta başarıyla güncellendi!', false);
    } else {
        showMessage(result.message);
    }
}

function confirmDeleteWeek() {
    if (!currentWeek) return;
    
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    
    const hasRecords = mesaiRecords.length > 0;
    document.getElementById('confirmModalMessage').textContent = hasRecords 
        ? 'Bu hafta içerisinde mesai verisi bulunuyor. Silmek istediğinize emin misiniz?' 
        : 'Bu haftayı silmek istediğinize emin misiniz?';
    
    document.getElementById('confirmYesBtn').onclick = deleteWeek;
    modal.show();
}

async function deleteWeek() {
    const result = await apiCall('deleteWeek', { week_id: currentWeek.id, user_id: currentUser.id });
    
    if (result.success) {
        bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
        currentWeek = null;
        loadWeeks();
        loadRecords();
        showMessage('Hafta başarıyla silindi!', false);
    } else {
        showMessage(result.message);
    }
}

async function handleChangePassword(e) {
    e.preventDefault();
    
    const current_password = document.getElementById('currentPassword').value;
    const new_password = document.getElementById('newPassword').value;
    const confirm_new_password = document.getElementById('confirmNewPassword').value;
    
    if (new_password !== confirm_new_password) {
        showMessage('Yeni şifreler eşleşmiyor!');
        return;
    }
    
    const result = await apiCall('changePassword', {
        user_id: currentUser.id,
        current_password,
        new_password
    });
    
    if (result.success) {
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        showMessage(result.message, false);
    } else {
        showMessage(result.message);
    }
}

async function handleWeekReport(e) {
    e.preventDefault();
    
    const selected_week = document.getElementById('reportWeekSelect').value;
    
    if (!selected_week) {
        showMessage('Lütfen bir hafta seçin!');
        return;
    }
    
    const result = await apiCall('getWeekReport', { week_id: selected_week });
    
    if (result.success) {
        document.getElementById('haftaRaporText').value = result.report;
        document.getElementById('weekReportResult').style.display = 'block';
    } else {
        showMessage(result.message);
    }
}

async function handleDateRangeReport(e) {
    e.preventDefault();
    
    const baslangic_tarihi = document.getElementById('reportBaslangic').value;
    const bitis_tarihi = document.getElementById('reportBitis').value;
    
    if (!baslangic_tarihi || !bitis_tarihi) {
        showMessage('Başlangıç ve bitiş tarihleri gereklidir!');
        return;
    }
    
    const result = await apiCall('getDateRangeReport', {
        baslangic_tarihi,
        bitis_tarihi
    });
    
    if (result.success) {
        document.getElementById('raporDateRangeText').value = result.report;
        document.getElementById('dateRangeReportResult').style.display = 'block';
    } else {
        showMessage(result.message);
    }
}

function showReportsPage() {
    showSection('reportsSection');
    loadReportWeeks();
}

async function loadReportWeeks() {
    const result = await apiCall('getWeeks', { user_id: currentUser.id });
    
    if (result.success) {
        const select = document.getElementById('reportWeekSelect');
        select.innerHTML = '<option value="">Seçiniz</option>';
        
        result.weeks.forEach(week => {
            const option = document.createElement('option');
            option.value = week.id;
            option.textContent = week.hafta_araligi + (week.calisan_adi ? ' ' + week.calisan_adi : '');
            select.appendChild(option);
        });
    }
}

function showAdminPage() {
    showSection('adminSection');
    document.getElementById('adminWelcome').textContent = 'Hoşgeldin ' + currentUser.adsoyad;
    loadAdminUsers();
}

async function loadAdminUsers() {
    const result = await apiCall('getUsers', {});
    
    if (result.success) {
        renderUserTable(result.users);
        populateUserSelects(result.users);
    }
}

function renderUserTable(users) {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.adsoyad}</td>
            <td>${user.is_admin === 1 ? '<span class="badge bg-primary">Admin</span>' : '<span class="badge bg-secondary">Kullanıcı</span>'}</td>
            <td>${user.is_banned ? '<span class="badge bg-danger">Banlı</span>' : '<span class="badge bg-success">Aktif</span>'}</td>
            <td>
                <button type="button" class="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#editUserModal${user.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <a href="#" class="btn btn-sm btn-danger" onclick="deleteUser(${user.id}); return false;">
                    <i class="fas fa-trash"></i>
                </a>
                <a href="#" class="btn btn-sm btn-${user.is_banned ? 'success' : 'secondary'}" onclick="toggleBan(${user.id}); return false;">
                    <i class="fas fa-${user.is_banned ? 'unlock' : 'ban'}"></i>
                </a>
                <a href="#" class="btn btn-sm btn-${user.is_admin === 1 ? 'secondary' : 'primary'}" onclick="toggleAdmin(${user.id}); return false;">
                    <i class="fas fa-${user.is_admin === 1 ? 'user' : 'user-shield'}"></i>
                </a>
            </td>
        `;
        
        tbody.appendChild(tr);
        
        createUserEditModal(user);
    });
}

function createUserEditModal(user) {
    const modalId = 'editUserModal' + user.id;
    
    if (document.getElementById(modalId)) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = modalId;
    modal.tabIndex = '-1';
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <form onsubmit="handleUpdateUser(event, ${user.id})">
                    <div class="modal-header">
                        <h5 class="modal-title">Kullanıcı Düzenle</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" name="user_id" value="${user.id}">
                        <div class="mb-2">
                            <label class="form-label">Yeni Kullanıcı Adı</label>
                            <input type="text" name="new_username" class="form-control" value="${user.username}" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label">Yeni Ad ve Soyad</label>
                            <input type="text" name="new_adsoyad" class="form-control" value="${user.adsoyad}" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label">Yeni Şifre (Boş bırakılırsa değişmez)</label>
                            <input type="password" name="new_password" class="form-control">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                        <button type="submit" class="btn btn-primary">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function populateUserSelects(users) {
    const reportSelect = document.getElementById('userReportSelect');
    reportSelect.innerHTML = '<option value="">Seçiniz</option>';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.adsoyad;
        reportSelect.appendChild(option);
    });
}

function filterUserTable() {
    const filter = document.getElementById('userSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#userTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.indexOf(filter) > -1 ? '' : 'none';
    });
}

function filterUserReportSelect() {
    const filter = document.getElementById('userReportSearch').value.toLowerCase();
    const select = document.getElementById('userReportSelect');
    
    for (let i = 0; i < select.options.length; i++) {
        const txt = select.options[i].text.toLowerCase();
        select.options[i].style.display = txt.indexOf(filter) > -1 ? '' : 'none';
    }
}

async function deleteUser(userId) {
    if (!confirm('Bu kullanıcıyı ve tüm verilerini silmek istediğinizden emin misiniz?')) return;
    
    const result = await apiCall('deleteUser', { user_id: userId });
    
    if (result.success) {
        loadAdminUsers();
        showMessage(result.message, false);
    } else {
        showMessage(result.message);
    }
}

async function toggleBan(userId) {
    const result = await apiCall('toggleBan', { user_id: userId });
    
    if (result.success) {
        loadAdminUsers();
        showMessage(result.message, false);
    } else {
        showMessage(result.message);
    }
}

async function toggleAdmin(userId) {
    const result = await apiCall('toggleAdmin', { user_id: userId });
    
    if (result.success) {
        loadAdminUsers();
        showMessage(result.message, false);
    } else {
        showMessage(result.message);
    }
}

async function handleUpdateUser(e, userId) {
    e.preventDefault();
    
    const form = e.target;
    const new_username = form.new_username.value;
    const new_adsoyad = form.new_adsoyad.value;
    const new_password = form.new_password.value;
    
    const result = await apiCall('updateUser', {
        user_id: userId,
        new_username,
        new_adsoyad,
        new_password
    });
    
    if (result.success) {
        loadAdminUsers();
        showMessage(result.message, false);
    } else {
        showMessage(result.message);
    }
}

async function handleAdminUserReport(e) {
    e.preventDefault();
    
    const selected_user = document.getElementById('userReportSelect').value;
    const baslangic_tarihi = document.getElementById('adminBaslangic').value;
    const bitis_tarihi = document.getElementById('adminBitis').value;
    
    if (!selected_user || !baslangic_tarihi || !bitis_tarihi) {
        showMessage('Tüm alanları doldurun!');
        return;
    }
    
    const result = await apiCall('getAdminUserReport', {
        user_id: selected_user,
        baslangic_tarihi,
        bitis_tarihi
    });
    
    if (result.success) {
        document.getElementById('adminUserReport').value = result.report;
        document.getElementById('adminUserReportResult').style.display = 'block';
    } else {
        showMessage(result.message);
    }
}

async function handleAdminAllUsersReport(e) {
    e.preventDefault();
    
    const baslangic_tarihi = document.getElementById('allUsersBaslangic').value;
    const bitis_tarihi = document.getElementById('allUsersBitis').value;
    
    if (!baslangic_tarihi || !bitis_tarihi) {
        showMessage('Tüm alanları doldurun!');
        return;
    }
    
    const result = await apiCall('getAdminAllUsersReport', {
        baslangic_tarihi,
        bitis_tarihi
    });
    
    if (result.success) {
        document.getElementById('adminAllUsersReport').value = result.report;
        document.getElementById('adminAllUsersReportResult').style.display = 'block';
    } else {
        showMessage(result.message);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            showMessage('Rapor kopyalandı!', false);
        }, function(err) {
            showMessage('Kopyalama başarısız: ' + err);
        });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showMessage('Rapor kopyalandı!', false);
        } catch (err) {
            showMessage('Kopyalama başarısız: ' + err);
        }
        document.body.removeChild(textarea);
    }
}