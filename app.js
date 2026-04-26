// CONFIGURATION
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyx03-jB69rpj8rHnWT1esMIzORgoVRwG2l9Q569gUG2OTPZb6bkpZ_N3sbuPyHb10KIA/exec'; // Replace with your Apps Script web app URL

// Global state
let currentUser = null;
let currentWeek = null;
let allWeeks = [];
let allUsers = [];
let mesaiKayitlari = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUserFromStorage();
    setupEventListeners();
    renderView();
    loadYears();
});

// ==================== AUTH FUNCTIONS ====================

function loadUserFromStorage() {
    const stored = localStorage.getItem('user');
    if (stored) {
        currentUser = JSON.parse(stored);
    }
}

function saveUserToStorage(user) {
    localStorage.setItem('user', JSON.stringify(user));
    currentUser = user;
}

function clearUserStorage() {
    localStorage.removeItem('user');
    localStorage.removeItem('currentWeek');
    currentUser = null;
    currentWeek = null;
}

function setupEventListeners() {
    // Auth forms
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Create week form
    const createWeekForm = document.getElementById('createWeekForm');
    if (createWeekForm) {
        createWeekForm.addEventListener('submit', handleCreateWeek);
        const startDateInput = document.getElementById('newWeekStartDate');
        const intervalInput = document.getElementById('newWeekInterval');
        if (startDateInput) {
            startDateInput.addEventListener('change', () => {
                updateWeekInterval(startDateInput.value, intervalInput);
            });
        }
    }

    // Edit week form
    const editWeekForm = document.getElementById('editWeekForm');
    if (editWeekForm) {
        editWeekForm.addEventListener('submit', handleEditWeek);
        const startDateInput = document.getElementById('editWeekStartDate');
        const intervalInput = document.getElementById('editWeekInterval');
        if (startDateInput) {
            startDateInput.addEventListener('change', () => {
                updateWeekInterval(startDateInput.value, intervalInput);
            });
        }
    }

    // Mesai form
    const mesaiForm = document.getElementById('mesaiForm');
    if (mesaiForm) {
        mesaiForm.addEventListener('submit', handleAddMesai);
        const tarihInput = document.getElementById('mesaiTarihInput');
        if (tarihInput) {
            tarihInput.addEventListener('change', (e) => {
                updateSundayOverrideVisibility(e.target.value, 'treatAsNormalContainer');
            });
        }
    }

    // Reports forms
    const weekReportForm = document.getElementById('weekReportForm');
    if (weekReportForm) {
        weekReportForm.addEventListener('submit', handleGenerateWeekReport);
    }

    const dateRangeReportForm = document.getElementById('dateRangeReportForm');
    if (dateRangeReportForm) {
        dateRangeReportForm.addEventListener('submit', handleGenerateDateRangeReport);
    }

    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }

    // Year select
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
        yearSelect.addEventListener('change', handleYearSelect);
    }

    // User search
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('keyup', filterUserTable);
    }

    const userReportSearch = document.getElementById('userReportSearch');
    if (userReportSearch) {
        userReportSearch.addEventListener('keyup', filterUserReportSelect);
    }

    // Admin forms
    const userReportForm = document.getElementById('userReportForm');
    if (userReportForm) {
        userReportForm.addEventListener('submit', handleGenerateUserReport);
    }

    const allUsersReportForm = document.getElementById('allUsersReportForm');
    if (allUsersReportForm) {
        allUsersReportForm.addEventListener('submit', handleGenerateAllUsersReport);
    }
}

// ==================== LOGIN/REGISTER ====================

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;

    try {
        const response = await apiCall('login', {
            username: username,
            password: password
        });

        if (response.success) {
            const user = response.user;
            if (user.is_banned) {
                showMessage('Bu hesap banlanmıştır!', 'danger');
                return;
            }
            
            // Store login info if "Remember me" is checked
            if (remember) {
                localStorage.setItem('saved_username', username);
                localStorage.setItem('saved_password', password);
            } else {
                localStorage.removeItem('saved_username');
                localStorage.removeItem('saved_password');
            }
            
            saveUserToStorage(user);
            clearFormInputs();
            await loadWeeksForUser();
            renderView();
        } else {
            showMessage(response.message || 'Hatalı kullanıcı adı veya şifre!', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Giriş hatası: ' + error.message, 'danger');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const adsoyad = document.getElementById('regAdsoyad').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
        showMessage('Parolalar eşleşmiyor!', 'danger');
        return;
    }

    try {
        const response = await apiCall('register', {
            username: username,
            password: password,
            adsoyad: adsoyad
        });

        if (response.success) {
            saveUserToStorage(response.user);
            clearFormInputs();
            await loadWeeksForUser();
            renderView();
        } else {
            showMessage(response.message || 'Kayıt hatası', 'danger');
        }
    } catch (error) {
        console.error('Register error:', error);
        showMessage('Kayıt hatası: ' + error.message, 'danger');
    }
}

async function logout() {
    clearUserStorage();
    clearFormInputs();
    renderView();
}

function goHome() {
    if (currentUser) {
        renderView();
    }
}

// ==================== VIEW RENDERING ====================

function renderView() {
    const notLoggedInView = document.getElementById('notLoggedInView');
    const mainView = document.getElementById('mainView');
    const raporlarView = document.getElementById('raporlarView');
    const adminView = document.getElementById('adminView');

    // Hide all views
    notLoggedInView.style.display = 'none';
    mainView.style.display = 'none';
    raporlarView.style.display = 'none';
    adminView.style.display = 'none';

    if (!currentUser) {
        // Load saved credentials if available
        const savedUsername = localStorage.getItem('saved_username');
        const savedPassword = localStorage.getItem('saved_password');
        if (savedUsername && savedPassword) {
            document.getElementById('loginUsername').value = savedUsername;
            document.getElementById('loginPassword').value = savedPassword;
            document.getElementById('rememberMe').checked = true;
        }
        notLoggedInView.style.display = 'block';
    } else {
        mainView.style.display = 'block';
        document.getElementById('welcomeMessage').textContent = `| Hoşgeldin ${currentUser.adsoyad}`;
        
        if (currentUser.is_admin) {
            document.getElementById('adminPanelBtn').style.display = 'inline-block';
        } else {
            document.getElementById('adminPanelBtn').style.display = 'none';
        }

        loadWeeksForUser().then(() => {
            renderWeekSelector();
            renderMesaiTable();
        });
    }
}

async function viewReports() {
    const raporlarView = document.getElementById('raporlarView');
    const mainView = document.getElementById('mainView');
    const adminView = document.getElementById('adminView');

    adminView.style.display = 'none';
    mainView.style.display = 'none';
    raporlarView.style.display = 'block';

    await loadWeeksForUser();
    renderWeekReportSelect();
}

async function viewAdmin() {
    if (!currentUser || !currentUser.is_admin) {
        showMessage('Yetkisiz erişim!', 'danger');
        return;
    }

    const adminView = document.getElementById('adminView');
    const mainView = document.getElementById('mainView');
    const raporlarView = document.getElementById('raporlarView');

    raporlarView.style.display = 'none';
    mainView.style.display = 'none';
    adminView.style.display = 'block';

    document.getElementById('adminWelcome').textContent = `| Hoşgeldin ${currentUser.adsoyad}`;

    await loadAllUsers();
    renderUserTable();
    renderUserReportSelect();
}

// ==================== WEEK MANAGEMENT ====================

async function loadWeeksForUser() {
    try {
        const response = await apiCall('getWeeks', {
            user_id: currentUser.id
        });

        if (response.success) {
            allWeeks = response.weeks || [];
            // Restore current week if it exists
            const saved = localStorage.getItem('currentWeek');
            if (saved && allWeeks.find(w => w.id == saved)) {
                currentWeek = allWeeks.find(w => w.id == saved);
            } else if (allWeeks.length > 0) {
                currentWeek = allWeeks[0];
                localStorage.setItem('currentWeek', currentWeek.id);
            }
        }
    } catch (error) {
        console.error('Error loading weeks:', error);
    }
}

async function loadAllUsers() {
    try {
        const response = await apiCall('getUsers', {});
        if (response.success) {
            allUsers = response.users || [];
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function handleCreateWeek(e) {
    e.preventDefault();
    const hafta_baslangic = document.getElementById('newWeekStartDate').value;
    const hafta_araligi = document.getElementById('newWeekInterval').value;

    try {
        const response = await apiCall('createWeek', {
            hafta_baslangic: hafta_baslangic,
            hafta_araligi: hafta_araligi,
            calisan_adi: currentUser.adsoyad,
            user_id: currentUser.id
        });

        if (response.success) {
            showMessage('Hafta başarıyla oluşturuldu!', 'success');
            document.getElementById('createWeekForm').reset();
            document.getElementById('newWeekInterval').value = 'Otomatik oluşur';
            await loadWeeksForUser();
            renderWeekSelector();
        } else {
            showMessage(response.message || 'Hafta oluşturma hatası', 'danger');
        }
    } catch (error) {
        console.error('Error creating week:', error);
        showMessage('Hafta oluşturma hatası: ' + error.message, 'danger');
    }
}

async function handleEditWeek(e) {
    e.preventDefault();
    if (!currentWeek) return;

    const hafta_baslangic = document.getElementById('editWeekStartDate').value;
    const hafta_araligi = document.getElementById('editWeekInterval').value;

    try {
        const response = await apiCall('updateWeek', {
            week_id: currentWeek.id,
            hafta_baslangic: hafta_baslangic,
            hafta_araligi: hafta_araligi
        });

        if (response.success) {
            showMessage('Hafta başarıyla güncellendi!', 'success');
            await loadWeeksForUser();
            renderWeekSelector();
            renderMesaiTable();
            bootstrap.Modal.getInstance(document.getElementById('editWeekModal')).hide();
        } else {
            showMessage(response.message || 'Hafta güncelleme hatası', 'danger');
        }
    } catch (error) {
        console.error('Error updating week:', error);
        showMessage('Hafta güncelleme hatası: ' + error.message, 'danger');
    }
}

async function deleteWeek() {
    if (!currentWeek) return;
    
    if (!confirm('Bu haftayı silmek istediğinize emin misiniz?')) {
        return;
    }

    try {
        const response = await apiCall('deleteWeek', {
            week_id: currentWeek.id
        });

        if (response.success) {
            showMessage('Hafta başarıyla silindi!', 'success');
            currentWeek = null;
            localStorage.removeItem('currentWeek');
            await loadWeeksForUser();
            renderWeekSelector();
            renderMesaiTable();
        } else {
            showMessage(response.message || 'Hafta silme hatası', 'danger');
        }
    } catch (error) {
        console.error('Error deleting week:', error);
        showMessage('Hafta silme hatası: ' + error.message, 'danger');
    }
}

function renderWeekSelector() {
    const dropdown = document.getElementById('weekDropdownMenu');
    if (!dropdown) return;

    dropdown.innerHTML = '<li><a class="dropdown-item" href="#">Seçiniz</a></li>';

    allWeeks.forEach(week => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        if (currentWeek && currentWeek.id === week.id) {
            a.classList.add('active-week');
        }
        a.href = '#';
        a.textContent = `${week.hafta_araligi} ${week.calisan_adi}`;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            selectWeek(week);
        });
        li.appendChild(a);
        dropdown.appendChild(li);
    });

    // Update dropdown button text
    const btn = document.getElementById('weekDropdown');
    if (btn && currentWeek) {
        btn.textContent = `${currentWeek.hafta_araligi} ${currentWeek.calisan_adi}`;
    }
}

function selectWeek(week) {
    currentWeek = week;
    localStorage.setItem('currentWeek', week.id);
    renderWeekSelector();
    renderMesaiTable();
    loadMesaiForWeek();
}

function renderWeekReportSelect() {
    const select = document.getElementById('weekReportSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Seçiniz</option>';
    allWeeks.forEach(week => {
        const option = document.createElement('option');
        option.value = week.id;
        option.textContent = `${week.hafta_araligi} ${week.calisan_adi}`;
        select.appendChild(option);
    });
}

// ==================== DAY SELECTOR ====================

function renderDayButtons() {
    if (!currentWeek) return;

    const container = document.getElementById('dayButtonContainer');
    if (!container) return;

    container.innerHTML = '';

    const startDate = new Date(currentWeek.hafta_baslangic + 'T00:00:00');
    const mesaiDates = mesaiKayitlari.map(m => m.tarih);

    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startDate);
        currentDay.setDate(currentDay.getDate() + i);
        const formattedDate = formatDateToISO(currentDay);
        
        const dayOfWeek = currentDay.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isEntered = mesaiDates.includes(formattedDate);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn day-selector-btn';
        if (isEntered) button.classList.add('kayitli-gun');
        if (isWeekend) button.classList.add('weekend');
        button.textContent = formatDayDisplay(currentDay);
        button.dataset.date = formattedDate;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            selectDay(formattedDate);
        });

        container.appendChild(button);
    }
}

function selectDay(dateString) {
    const tarihInput = document.getElementById('mesaiTarihInput');
    if (tarihInput) {
        tarihInput.value = dateString;
        updateSundayOverrideVisibility(dateString, 'treatAsNormalContainer');
        
        // Update active button
        document.querySelectorAll('.day-selector-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.date === dateString) {
                btn.classList.add('active');
            }
        });

        const aciklamaInput = document.getElementById('mesaiAciklamaInput');
        if (aciklamaInput) {
            aciklamaInput.focus();
        }
    }
}

// ==================== MESAI FUNCTIONS ====================

async function loadMesaiForWeek() {
    if (!currentWeek) return;

    try {
        const response = await apiCall('getRecords', {
            week_id: currentWeek.id
        });

        if (response.success) {
            mesaiKayitlari = response.records || [];
            renderMesaiTable();
            renderDayButtons();
        }
    } catch (error) {
        console.error('Error loading mesai:', error);
    }
}

async function handleAddMesai(e) {
    e.preventDefault();
    if (!currentWeek) {
        showMessage('Lütfen önce bir hafta seçiniz!', 'danger');
        return;
    }

    const tarih = document.getElementById('mesaiTarihInput').value;
    const aciklama = document.getElementById('mesaiAciklamaInput').value;
    const saat = document.querySelector('input[name="saat"]').value || '0';
    const is_resmi_tatil = document.getElementById('isResmiTatil').checked ? 1 : 0;
    const treat_as_normal = document.getElementById('treatAsNormal').checked ? 1 : 0;

    // Validation
    if (!aciklama.trim()) {
        showMessage('Açıklama alanı boş bırakılamaz!', 'danger');
        return;
    }

    const isSunday = isSundayDate(tarih);
    const isSundayHoliday = isSunday && !treat_as_normal;

    if (saat === '' && !is_resmi_tatil && !isSundayHoliday) {
        showMessage('Saat alanı (Pazar günleri ve resmi tatiller hariç) boş bırakılamaz!', 'danger');
        return;
    }

    try {
        const response = await apiCall('addRecord', {
            week_id: currentWeek.id,
            tarih: tarih,
            aciklama: aciklama,
            saat: saat === '' ? 0 : parseFloat(saat),
            is_resmi_tatil: is_resmi_tatil,
            treat_as_normal: treat_as_normal
        });

        if (response.success) {
            showMessage('Kayıt başarıyla eklendi!', 'success');
            document.getElementById('mesaiForm').reset();
            document.getElementById('newWeekInterval').value = 'Otomatik oluşur';
            await loadMesaiForWeek();
        } else {
            showMessage(response.message || 'Kayıt ekleme hatası', 'danger');
        }
    } catch (error) {
        console.error('Error adding record:', error);
        showMessage('Kayıt ekleme hatası: ' + error.message, 'danger');
    }
}

async function editMesai(recordId) {
    const record = mesaiKayitlari.find(m => m.id === recordId);
    if (!record) return;

    const formData = new FormData(document.getElementById(`editForm${recordId}`));
    const tarih = formData.get('tarih');
    const aciklama = formData.get('aciklama');
    const saat = formData.get('saat') || '0';
    const is_resmi_tatil = formData.get('is_resmi_tatil') === 'on' ? 1 : 0;
    const treat_as_normal = formData.get('treat_as_normal') === 'on' ? 1 : 0;

    try {
        const response = await apiCall('updateRecord', {
            record_id: recordId,
            tarih: tarih,
            aciklama: aciklama,
            saat: parseFloat(saat),
            is_resmi_tatil: is_resmi_tatil,
            treat_as_normal: treat_as_normal
        });

        if (response.success) {
            showMessage('Kayıt başarıyla güncellendi!', 'success');
            await loadMesaiForWeek();
            bootstrap.Modal.getInstance(document.getElementById(`editModal${recordId}`)).hide();
        } else {
            showMessage(response.message || 'Kayıt güncelleme hatası', 'danger');
        }
    } catch (error) {
        console.error('Error updating record:', error);
        showMessage('Kayıt güncelleme hatası: ' + error.message, 'danger');
    }
}

async function deleteMesai(recordId) {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
        return;
    }

    try {
        const response = await apiCall('deleteRecord', {
            record_id: recordId
        });

        if (response.success) {
            showMessage('Kayıt başarıyla silindi!', 'success');
            await loadMesaiForWeek();
        } else {
            showMessage(response.message || 'Kayıt silme hatası', 'danger');
        }
    } catch (error) {
        console.error('Error deleting record:', error);
        showMessage('Kayıt silme hatası: ' + error.message, 'danger');
    }
}

function renderMesaiTable() {
    if (!currentWeek) {
        document.getElementById('mesaiTableContainer').style.display = 'none';
        document.getElementById('mesaiFormContainer').style.display = 'none';
        document.getElementById('dayButtonsContainer').style.display = 'none';
        return;
    }

    document.getElementById('dayButtonsContainer').style.display = 'block';
    document.getElementById('mesaiFormContainer').style.display = 'block';
    document.getElementById('mesaiTableContainer').style.display = 'block';

    // Title
    const title = document.getElementById('mesaiTableTitle');
    if (title) {
        title.textContent = `${currentWeek.hafta_araligi} ${currentWeek.calisan_adi} Mesai Kayıtları`;
    }

    // Table body
    const tbody = document.getElementById('mesaiTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (mesaiKayitlari.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Bu hafta için henüz mesai kaydı bulunmamaktadır.</td></tr>';
    } else {
        let totalHours = 0;
        let sundayCount = 0;
        let holidayCount = 0;

        mesaiKayitlari.forEach(item => {
            const treat_as_normal = item.treat_as_normal || 0;
            const isSundayHoliday = isSundayDate(item.tarih) && !treat_as_normal;

            const tr = document.createElement('tr');
            let rowClass = '';
            if (item.is_resmi_tatil) rowClass = 'resmi-tatil';
            else if (isSundayHoliday) rowClass = 'pazar';

            const hasHours = parseFloat(item.saat) > 0 || (item.saat === '0' && (isSundayHoliday || item.is_resmi_tatil));
            if (hasHours) rowClass += ' soluk';

            tr.className = rowClass;
            tr.id = `row${item.id}`;

            const tarihText = formatTarih(item.tarih) + (isSundayHoliday ? ' (Pazar)' : '');
            const aciklamaText = item.aciklama + (item.is_resmi_tatil ? ' (Resmi Tatil Mesaisi)' : '');
            const saatText = hasHours ? `${item.saat} saat` : '';

            tr.innerHTML = `
                <td>${tarihText}</td>
                <td>${aciklamaText}</td>
                <td>${saatText}</td>
                <td class="edit-buttons" style="display: none;">
                    <button type="button" class="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#editModal${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-danger" onclick="deleteMesai(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(tr);

            // Create edit modal
            createEditModal(item);

            // Calculate totals
            totalHours += parseFloat(item.saat);
            if (isSundayHoliday) sundayCount++;
            if (item.is_resmi_tatil) holidayCount++;
        });

        // Footer
        const tfoot = document.getElementById('mesaiTableFooter');
        if (tfoot) {
            tfoot.innerHTML = `
                <tr class="table-primary">
                    <td colspan="2"><strong>Toplam Mesai</strong></td>
                    <td colspan="2"><strong>${totalHours} saat</strong></td>
                </tr>
                <tr class="table-warning">
                    <td colspan="2"><strong>Pazar Mesai Sayısı</strong></td>
                    <td colspan="2"><strong>${sundayCount} adet</strong></td>
                </tr>
                ${holidayCount > 0 ? `
                <tr class="table-info">
                    <td colspan="2"><strong>Resmi Tatil Mesaisi Sayısı</strong></td>
                    <td colspan="2"><strong>${holidayCount} adet</strong></td>
                </tr>
                ` : ''}
            `;
        }
    }

    renderDayButtons();
}

function createEditModal(record) {
    const isSunday = isSundayDate(record.tarih);
    const container = document.getElementById('editModalsContainer');
    if (!container || document.getElementById(`editModal${record.id}`)) return;

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = `editModal${record.id}`;
    modal.tabIndex = '-1';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <form id="editForm${record.id}" onsubmit="event.preventDefault(); editMesai(${record.id});">
                    <div class="modal-header">
                        <h5 class="modal-title">Kayıt Düzenle</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
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
                            <input type="number" step="0.1" name="saat" class="form-control" value="${record.saat}">
                        </div>
                        <div class="form-check">
                            <input type="checkbox" name="is_resmi_tatil" class="form-check-input" id="isResmiTatilEdit${record.id}" ${record.is_resmi_tatil ? 'checked' : ''}>
                            <label class="form-check-label" for="isResmiTatilEdit${record.id}">Resmi Tatil Mesaisi</label>
                        </div>
                        <div class="form-check" id="treatAsNormalEditContainer${record.id}" ${isSunday ? '' : 'style="display: none;"'}>
                            <input type="checkbox" name="treat_as_normal" class="form-check-input" id="treatAsNormalEdit${record.id}" ${record.treat_as_normal ? 'checked' : ''}>
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

    container.appendChild(modal);
}

function toggleEditButtons() {
    const buttons = document.querySelectorAll('.edit-buttons');
    const headers = document.querySelectorAll('.edit-header');
    const isHidden = buttons.length > 0 && (buttons[0].style.display === 'none' || buttons[0].style.display === '');
    
    buttons.forEach(btn => {
        btn.style.display = isHidden ? 'table-cell' : 'none';
    });

    headers.forEach(header => {
        header.style.display = isHidden ? 'table-cell' : 'none';
    });

    const toggleBtn = document.getElementById('toggleEditButton');
    if (toggleBtn) {
        toggleBtn.innerHTML = isHidden ? '<i class="fas fa-times"></i> Düzenlemeyi Kapat' : '<i class="fas fa-edit"></i> Günleri Düzenle';
    }
}

// ==================== REPORT FUNCTIONS ====================

async function handleGenerateWeekReport(e) {
    e.preventDefault();
    const weekId = document.querySelector('#weekReportForm select[name="week_id"]').value;

    if (!weekId) {
        showMessage('Lütfen bir hafta seçiniz!', 'danger');
        return;
    }

    try {
        const response = await apiCall('generateWeekReport', {
            week_id: parseInt(weekId)
        });

        if (response.success) {
            document.getElementById('weekReportText').value = response.report;
            document.getElementById('weekReportResult').style.display = 'block';
        } else {
            showMessage(response.message || 'Rapor oluşturma hatası', 'danger');
        }
    } catch (error) {
        console.error('Error generating report:', error);
        showMessage('Rapor oluşturma hatası: ' + error.message, 'danger');
    }
}

async function handleGenerateDateRangeReport(e) {
    e.preventDefault();
    const startDate = document.querySelector('#dateRangeReportForm input[name="start_date"]').value;
    const endDate = document.querySelector('#dateRangeReportForm input[name="end_date"]').value;

    if (!startDate || !endDate) {
        showMessage('Lütfen başlangıç ve bitiş tarihlerini giriniz!', 'danger');
        return;
    }

    if (startDate > endDate) {
        showMessage('Başlangıç tarihi, bitiş tarihinden sonra olamaz!', 'danger');
        return;
    }

    try {
        const response = await apiCall('generateDateRangeReport', {
            start_date: startDate,
            end_date: endDate
        });

        if (response.success) {
            document.getElementById('dateRangeReportText').value = response.report;
            document.getElementById('dateRangeReportResult').style.display = 'block';
        } else {
            showMessage(response.message || 'Rapor oluşturma hatası', 'danger');
        }
    } catch (error) {
        console.error('Error generating report:', error);
        showMessage('Rapor oluşturma hatası: ' + error.message, 'danger');
    }
}

// ==================== ADMIN FUNCTIONS ====================

function renderUserTable() {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    allUsers.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.adsoyad}</td>
            <td>${user.is_admin ? '<span class="badge bg-primary">Admin</span>' : '<span class="badge bg-secondary">Kullanıcı</span>'}</td>
            <td>${user.is_banned ? '<span class="badge bg-danger">Banlı</span>' : '<span class="badge bg-success">Aktif</span>'}</td>
            <td>
                <button type="button" class="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#editUserModal${user.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
                <button type="button" class="btn btn-sm btn-${user.is_banned ? 'success' : 'secondary'}" onclick="toggleBan(${user.id})">
                    <i class="fas fa-${user.is_banned ? 'unlock' : 'ban'}"></i>
                </button>
                <button type="button" class="btn btn-sm btn-${user.is_admin ? 'secondary' : 'primary'}" onclick="toggleAdmin(${user.id})">
                    <i class="fas fa-${user.is_admin ? 'user' : 'user-shield'}"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);

        // Create edit modal
        createEditUserModal(user);
    });
}

function createEditUserModal(user) {
    const container = document.getElementById('editUserModalsContainer');
    if (!container || document.getElementById(`editUserModal${user.id}`)) return;

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = `editUserModal${user.id}`;
    modal.tabIndex = '-1';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <form onsubmit="event.preventDefault(); updateUser(${user.id});">
                    <div class="modal-header">
                        <h5 class="modal-title">Kullanıcı Düzenle</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-2">
                            <label class="form-label">Yeni Kullanıcı Adı</label>
                            <input type="text" name="username" class="form-control" value="${user.username}" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label">Yeni Ad ve Soyad</label>
                            <input type="text" name="adsoyad" class="form-control" value="${user.adsoyad}" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label">Yeni Şifre (Boş bırakılırsa değişmez)</label>
                            <input type="password" name="password" class="form-control">
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

    container.appendChild(modal);
}

async function updateUser(userId) {
    const form = document.querySelector(`#editUserModal${userId} form`);
    const formData = new FormData(form);

    try {
        const response = await apiCall('updateUser', {
            user_id: userId,
            username: formData.get('username'),
            adsoyad: formData.get('adsoyad'),
            password: formData.get('password') || null
        });

        if (response.success) {
            showMessage('Kullanıcı başarıyla güncellendi!', 'success');
            await loadAllUsers();
            renderUserTable();
            bootstrap.Modal.getInstance(document.getElementById(`editUserModal${userId}`)).hide();
        } else {
            showMessage(response.message || 'Kullanıcı güncelleme hatası', 'danger');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showMessage('Kullanıcı güncelleme hatası: ' + error.message, 'danger');
    }
}

async function deleteUser(userId) {
    if (userId === currentUser.id) {
        showMessage('Kendinizi silemezsiniz!', 'danger');
        return;
    }

    if (!confirm('Bu kullanıcıyı ve tüm verilerini silmek istediğinizden emin misiniz?')) {
        return;
    }

    try {
        const response = await apiCall('deleteUser', {
            user_id: userId
        });

        if (response.success) {
            showMessage('Kullanıcı başarıyla silindi!', 'success');
            await loadAllUsers();
            renderUserTable();
        } else {
            showMessage(response.message || 'Kullanıcı silme hatası', 'danger');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage('Kullanıcı silme hatası: ' + error.message, 'danger');
    }
}

async function toggleBan(userId) {
    if (userId === currentUser.id) {
        showMessage('Kendinizi banlayamazsınız!', 'danger');
        return;
    }

    try {
        const response = await apiCall('toggleBan', {
            user_id: userId
        });

        if (response.success) {
            showMessage('Kullanıcı ban durumu güncellendi!', 'success');
            await loadAllUsers();
            renderUserTable();
        } else {
            showMessage(response.message || 'Ban durumu güncelleme hatası', 'danger');
        }
    } catch (error) {
        console.error('Error toggling ban:', error);
        showMessage('Ban durumu güncelleme hatası: ' + error.message, 'danger');
    }
}

async function toggleAdmin(userId) {
    if (userId === currentUser.id) {
        showMessage('Kendi admin yetkinizi değiştiremezsiniz!', 'danger');
        return;
    }

    try {
        const response = await apiCall('toggleAdmin', {
            user_id: userId
        });

        if (response.success) {
            showMessage('Kullanıcı admin durumu güncellendi!', 'success');
            await loadAllUsers();
            renderUserTable();
        } else {
            showMessage(response.message || 'Admin durumu güncelleme hatası', 'danger');
        }
    } catch (error) {
        console.error('Error toggling admin:', error);
        showMessage('Admin durumu güncelleme hatası: ' + error.message, 'danger');
    }
}

function renderUserReportSelect() {
    const select = document.getElementById('userReportSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Seçiniz</option>';
    allUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.adsoyad;
        select.appendChild(option);
    });
}

async function handleGenerateUserReport(e) {
    e.preventDefault();
    const userId = document.querySelector('#userReportForm select[name="user_id"]').value;
    const startDate = document.querySelector('#userReportForm input[name="start_date"]').value;
    const endDate = document.querySelector('#userReportForm input[name="end_date"]').value;

    if (!userId || !startDate || !endDate) {
        showMessage('Lütfen tüm alanları doldurunuz!', 'danger');
        return;
    }

    if (startDate > endDate) {
        showMessage('Başlangıç tarihi, bitiş tarihinden sonra olamaz!', 'danger');
        return;
    }

    try {
        const response = await apiCall('generateUserReport', {
            user_id: parseInt(userId),
            start_date: startDate,
            end_date: endDate
        });

        if (response.success) {
            document.getElementById('userReportText').value = response.report;
            document.getElementById('userReportResult').style.display = 'block';
        } else {
            showMessage(response.message || 'Rapor oluşturma hatası', 'danger');
        }
    } catch (error) {
        console.error('Error generating report:', error);
        showMessage('Rapor oluşturma hatası: ' + error.message, 'danger');
    }
}

async function handleGenerateAllUsersReport(e) {
    e.preventDefault();
    const startDate = document.querySelector('#allUsersReportForm input[name="start_date"]').value;
    const endDate = document.querySelector('#allUsersReportForm input[name="end_date"]').value;

    if (!startDate || !endDate) {
        showMessage('Lütfen başlangıç ve bitiş tarihlerini giriniz!', 'danger');
        return;
    }

    if (startDate > endDate) {
        showMessage('Başlangıç tarihi, bitiş tarihinden sonra olamaz!', 'danger');
        return;
    }

    try {
        const response = await apiCall('generateAllUsersReport', {
            start_date: startDate,
            end_date: endDate
        });

        if (response.success) {
            document.getElementById('allUsersReportText').value = response.report;
            document.getElementById('allUsersReportResult').style.display = 'block';
        } else {
            showMessage(response.message || 'Rapor oluşturma hatası', 'danger');
        }
    } catch (error) {
        console.error('Error generating report:', error);
        showMessage('Rapor oluşturma hatası: ' + error.message, 'danger');
    }
}

// ==================== PASSWORD CHANGE ====================

async function handleChangePassword(e) {
    e.preventDefault();
    const currentPassword = document.querySelector('#changePasswordForm input[name="current_password"]').value;
    const newPassword = document.querySelector('#changePasswordForm input[name="new_password"]').value;
    const confirmPassword = document.querySelector('#changePasswordForm input[name="confirm_password"]').value;

    if (newPassword !== confirmPassword) {
        showMessage('Yeni şifreler eşleşmiyor!', 'danger');
        return;
    }

    if (!newPassword) {
        showMessage('Yeni şifre boş olamaz!', 'danger');
        return;
    }

    try {
        const response = await apiCall('changePassword', {
            current_password: currentPassword,
            new_password: newPassword
        });

        if (response.success) {
            showMessage('Şifreniz başarıyla güncellendi!', 'success');
            document.getElementById('changePasswordForm').reset();
        } else {
            showMessage(response.message || 'Şifre güncelleme hatası', 'danger');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showMessage('Şifre güncelleme hatası: ' + error.message, 'danger');
    }
}

// ==================== UTILITY FUNCTIONS ====================

async function apiCall(action, data) {
    const payload = {
        action: action,
        ...data
    };

    const response = await fetch(WEBAPP_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();
    return result;
}

function showMessage(message, type = 'info') {
    const container = document.getElementById('messageContainer');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    container.innerHTML = '';
    container.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showMessage('Rapor kopyalandı!', 'success');
        }).catch(err => {
            showMessage('Kopyalama başarısız: ' + err, 'danger');
        });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showMessage('Rapor kopyalandı!', 'success');
        } catch (err) {
            showMessage('Kopyalama başarısız: ' + err, 'danger');
        }
        document.body.removeChild(textarea);
    }
}

function updateWeekInterval(startDateStr, intervalInput) {
    if (!startDateStr) {
        if (intervalInput) intervalInput.value = 'Otomatik oluşur';
        return;
    }

    const startDate = new Date(startDateStr + 'T00:00:00');
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const startMonthName = months[startDate.getMonth()];
    const endMonthName = months[endDate.getMonth()];

    const weekInterval = startDate.getMonth() === endDate.getMonth() ?
        `${startDay}-${endDay} ${startMonthName}` :
        `${startDay} ${startMonthName} - ${endDay} ${endMonthName}`;

    if (intervalInput) {
        intervalInput.value = weekInterval;
    }
}

function isSundayDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDay() === 0;
}

function updateSundayOverrideVisibility(dateStr, containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        if (isSundayDate(dateStr)) {
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
            const checkbox = container.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
        }
    }
}

function formatTarih(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    return `${day} ${month}`;
}

function formatDayDisplay(date) {
    const dayNames = ['PZR', 'PTS', 'SAL', 'ÇAR', 'PER', 'CUM', 'CTS'];
    const dayName = dayNames[date.getDay()];
    const tarih = formatTarih(formatDateToISO(date));
    return `${dayName} ${tarih}`;
}

function formatDateToISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function clearFormInputs() {
    document.querySelectorAll('form').forEach(form => {
        form.reset();
    });
    document.getElementById('newWeekInterval').value = 'Otomatik oluşur';
}

function loadYears() {
    if (!currentUser) return;

    const years = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = currentYear; i >= currentYear - 5; i--) {
        years.push(i);
    }

    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
        yearSelect.innerHTML = '';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        });
    }
}

function handleYearSelect(e) {
    const selectedYear = parseInt(e.target.value);
    if (selectedYear) {
        loadWeeksForUser().then(() => {
            renderWeekSelector();
            renderMesaiTable();
            renderWeekReportSelect();
        });
    }
}

function filterUserTable() {
    const searchInput = document.getElementById('userSearch');
    const filter = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll('#userTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
}

function filterUserReportSelect() {
    const searchInput = document.getElementById('userReportSearch');
    const filter = searchInput.value.toLowerCase();
    const select = document.getElementById('userReportSelect');
    
    for (let i = 0; i < select.options.length; i++) {
        const txt = select.options[i].text.toLowerCase();
        select.options[i].style.display = txt.includes(filter) ? '' : 'none';
    }
}

// Auto-hide footer after 10 seconds
setTimeout(() => {
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.display = 'none';
    }
}, 10000);
