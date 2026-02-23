<?php
session_start();
// Veritabanı bağlantısı için global değişkenler
$db_host = 'fdb1028.awardspace.net';
$db_name = '4308587_aegeans';
$db_user = '4308587_aegeans';
$db_password = 'Aeg151851';
// Onay sayfası için flag'ler
$show_confirm = false;
$confirm_message = '';
$confirm_action = '';
// Eğer admin "DB Yedeği Al" işlemi tetiklenmişse (GET parametresi backup_db)
if (isset($_GET['backup_db'])) {
    $command = "mysqldump --host={$db_host} --user={$db_user} --password={$db_password} --databases {$db_name} --single-transaction --quick --lock-tables=false";
    $backup = shell_exec($command);
    header('Content-Type: application/sql');
    header('Content-Disposition: attachment; filename="backup_' . date("Y-m-d_H-i-s") . '.sql"');
    echo $backup;
    exit;
}
// Eğer admin "Yedeği Geri Yükle" işlemi tetiklenmişse (POST parametresi restore_db)
if (isset($_POST['restore_db'])) {
    if (isset($_FILES['backup_file']) && $_FILES['backup_file']['error'] == 0) {
        $sql = file_get_contents($_FILES['backup_file']['tmp_name']);
        try {
            $dbOptions = array(PDO::MYSQL_ATTR_MULTI_STATEMENTS => true);
            $db = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_password, $dbOptions);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $db->exec($sql);
            $message = "Veritabanı yedeği başarıyla geri yüklendi.";
        } catch (PDOException $e) {
            $message = "Yedek geri yüklenirken hata oluştu: " . $e->getMessage();
        }
    } else {
        $message = "Yedek dosyası yüklenemedi.";
    }
}
// Veritabanı bağlantısı fonksiyonu
function getDb() {
    global $db_host, $db_name, $db_user, $db_password;
    try {
        $db = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_password);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $db;
    } catch (PDOException $e) {
        die("Veritabanı bağlantı hatası: " . $e->getMessage());
    }
}
// Oturum kontrolü
function checkLogin() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}
// Admin kontrolü
function isAdmin() {
    return checkLogin() && isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === 1;
}
// Tarih formatını düzenleme fonksiyonu (yıl kısmı kaldırıldı)
function formatTarih($date) {
    $aylar = array(
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    );
    $d = new DateTime($date);
    $gun = $d->format('j');
    $ay = $aylar[$d->format('n') - 1];
    return "$gun $ay";
}
// Pazar günü kontrolü
function isPazar($date_string) {
    if (empty($date_string)) return ''; // Tarih boşsa Pazar değil
    try {
        $d = new DateTime($date_string);
        return $d->format('w') == 0 ? ' (Pazar)' : '';
    } catch (Exception $e) {
        return ''; // Geçersiz tarih formatı durumunda
    }
}
function isPazarBool($date_string) {
    if (empty($date_string)) return false;
    try {
        $d = new DateTime($date_string);
        return $d->format('w') == 0;
    } catch (Exception $e) {
        return false;
    }
}

// Yeni fonksiyon: Haftanın gününü kısaltma ile al
function getKisaGun($date_string) {
    if (empty($date_string)) return '';
    try {
        $d = new DateTime($date_string);
        $gunler = array('PZR', 'PTS', 'SAL', 'ÇAR', 'PER', 'CUM', 'CTS');
        return $gunler[$d->format('w')];
    } catch (Exception $e) {
        return '';
    }
}

// Raporlarda saat bilgisini formatlayan yardımcı fonksiyon
function formatSaatForReport($tarih, $saat, $is_resmi_tatil) {
    if (($saat === 0 || $saat === '0' || empty($saat)) && (isPazarBool($tarih) || $is_resmi_tatil)) {
        return "";
    }
    return $saat . " saat";
}
$message = '';
$rapor_date_range_text = '';
$hafta_rapor_text = '';
$admin_all_users_report = '';
$admin_user_report = '';
$db = getDb();
// Hafta Aralığı Raporu Oluşturma (Raporlar Sayfası)
if (isset($_POST['generate_week_report']) && checkLogin()) {
    $selected_week_id = $_POST['selected_week'];
    $stmt = $db->prepare("SELECT * FROM haftalar WHERE id = ? AND user_id = ?");
    $stmt->execute([$selected_week_id, $_SESSION['user_id']]);
    $selectedWeek = $stmt->fetch();
    if ($selectedWeek) {
        $stmt = $db->prepare("SELECT * FROM mesai_kayitlari WHERE hafta_id = ? ORDER BY tarih ASC");
        $stmt->execute([$selected_week_id]);
        $mesaiKayitlari = $stmt->fetchAll();
        if (!empty($mesaiKayitlari)) {
            $baslik = $selectedWeek['hafta_araligi'];
            if (!empty($selectedWeek['calisan_adi'])) {
                $baslik .= ' ' . $selectedWeek['calisan_adi'];
            }
            $baslik .= ' - Planlanan Mesailer';
            $hafta_rapor_text .= $baslik . "
";
            $toplam_saat_calc = 0;
            $pazar_sayisi_calc = 0;
            $resmi_tatil_sayisi_calc = 0;
            foreach ($mesaiKayitlari as $item) {
                $formattedTarih = formatTarih($item['tarih']);
                $pazar_text = isPazar($item['tarih']);
                $saatPart = formatSaatForReport($item['tarih'], $item['saat'], $item['is_resmi_tatil']);
                $resmiTatil = $item['is_resmi_tatil'] ? ' (Resmi Tatil Mesaisi)' : '';
                $hafta_rapor_text .= $formattedTarih . $pazar_text . " (" . $item['aciklama'] . $resmiTatil . ") " . $saatPart . "
";
                $toplam_saat_calc += (float)$item['saat'];
                if (isPazarBool($item['tarih'])) $pazar_sayisi_calc++;
                if ($item['is_resmi_tatil']) $resmi_tatil_sayisi_calc++;
            }
            $hafta_rapor_text .= "
Toplam Mesai Saati: " . $toplam_saat_calc;
            $hafta_rapor_text .= "
Pazar Mesai Sayısı: " . $pazar_sayisi_calc;
            if ($resmi_tatil_sayisi_calc > 0) {
                $hafta_rapor_text .= "
Resmi Tatil Mesaisi Sayısı: " . $resmi_tatil_sayisi_calc;
            }
        } else {
            $message = "Seçilen haftada kayıt bulunamadı!";
        }
    } else {
        $message = "Seçilen hafta bulunamadı!";
    }
}
// Tarih Aralığı Raporu Oluşturma (Raporlar Sayfası)
if (isset($_POST['generate_date_range_report']) && checkLogin()) {
    $baslangic_tarihi = $_POST['baslangic_tarihi'];
    $bitis_tarihi = $_POST['bitis_tarihi'];
    if (empty($baslangic_tarihi) || empty($bitis_tarihi)) {
        $message = "Başlangıç ve bitiş tarihleri gereklidir!";
    } elseif ($baslangic_tarihi > $bitis_tarihi) {
        $message = "Başlangıç tarihi, bitiş tarihinden sonra olamaz!";
    } else {
        $stmt = $db->prepare("
            SELECT m.*, h.calisan_adi 
            FROM mesai_kayitlari m
            INNER JOIN haftalar h ON m.hafta_id = h.id
            WHERE m.tarih BETWEEN ? AND ? AND h.user_id = ?
            ORDER BY m.tarih ASC
        ");
        $stmt->execute([$baslangic_tarihi, $bitis_tarihi, $_SESSION['user_id']]);
        $kayitlar = $stmt->fetchAll();
        if (empty($kayitlar)) {
            $message = "Belirtilen tarih aralığında kayıt bulunamadı!";
        } else {
            $baslik = formatTarih($baslangic_tarihi) . " - " . formatTarih($bitis_tarihi);
            if (!empty($kayitlar[0]['calisan_adi'])) {
                $baslik .= ' ' . $kayitlar[0]['calisan_adi'];
            }
            $baslik .= ' - Mesai Raporu';
            $rapor_date_range_text = $baslik . "
";
            $toplam_saat = 0;
            $pazar_sayisi = 0;
            $resmi_tatil_sayisi = 0;
            foreach ($kayitlar as $item) {
                $formattedTarih = formatTarih($item['tarih']);
                $pazar_text = isPazar($item['tarih']);
                $saatPart = formatSaatForReport($item['tarih'], $item['saat'], $item['is_resmi_tatil']);
                $resmiTatil = $item['is_resmi_tatil'] ? ' (Resmi Tatil Mesaisi)' : '';
                $rapor_date_range_text .= $formattedTarih . $pazar_text . " (" . $item['aciklama'] . $resmiTatil . ") " . $saatPart . "
";
                $toplam_saat += (float)$item['saat'];
                if (isPazarBool($item['tarih'])) $pazar_sayisi++;
                if ($item['is_resmi_tatil']) $resmi_tatil_sayisi++;
            }
            $rapor_date_range_text .= "
Toplam Mesai Saati: " . $toplam_saat;
            $rapor_date_range_text .= "
Pazar Mesai Sayısı: " . $pazar_sayisi;
            if ($resmi_tatil_sayisi > 0) {
                $rapor_date_range_text .= "
Resmi Tatil Mesaisi Sayısı: " . $resmi_tatil_sayisi;
            }
        }
    }
}
// Tüm Kullanıcılar için Tarih Aralığı Raporu (Admin)
if (isAdmin() && isset($_POST['admin_generate_all'])) {
    $baslangic_tarihi = $_POST['baslangic_tarihi'];
    $bitis_tarihi = $_POST['bitis_tarihi'];
    if (empty($baslangic_tarihi) || empty($bitis_tarihi)) {
        $message = "Başlangıç ve bitiş tarihleri gereklidir!";
    } elseif ($baslangic_tarihi > $bitis_tarihi) {
        $message = "Başlangıç tarihi, bitiş tarihinden sonra olamaz!";
    } else {
        $stmt = $db->prepare("
            SELECT h.hafta_araligi, h.calisan_adi, m.tarih, m.aciklama, m.saat, m.is_resmi_tatil
            FROM kullanicilar k
            LEFT JOIN haftalar h ON h.user_id = k.id
            LEFT JOIN mesai_kayitlari m ON m.hafta_id = h.id
            WHERE m.tarih BETWEEN ? AND ?
            ORDER BY h.calisan_adi, m.tarih
        ");
        $stmt->execute([$baslangic_tarihi, $bitis_tarihi]);
        $records = $stmt->fetchAll();
        if (empty($records)) {
            $message = "Belirtilen tarih aralığında kayıt bulunamadı!";
        } else {
            $admin_all_users_report = "Tüm Kullanıcılar Mesai Raporu: " . formatTarih($baslangic_tarihi) . " - " . formatTarih($bitis_tarihi) . "
";
            $current_name = '';
            $total_hours = 0;
            $total_pazar = 0;
            $total_resmi_tatil = 0;
            foreach ($records as $record) {
                if ($current_name !== $record['calisan_adi']) {
                    if ($current_name !== '') {
                        $admin_all_users_report .= "
Kullanıcı Toplam Mesai Saati: " . $total_hours . " saat, Pazar Mesai Sayısı: " . $total_pazar;
                        if ($total_resmi_tatil > 0) {
                            $admin_all_users_report .= ", Resmi Tatil Mesaisi Sayısı: " . $total_resmi_tatil;
                        }
                        $admin_all_users_report .= "
";
                    }
                    $current_name = $record['calisan_adi'];
                    $total_hours = 0;
                    $total_pazar = 0;
                    $total_resmi_tatil = 0;
                    $admin_all_users_report .= "Kullanıcı: " . $current_name . "
";
                }
                if ($record['tarih']) {
                    $saatPart = formatSaatForReport($record['tarih'], $record['saat'], $record['is_resmi_tatil']);
                    $resmiTatil = $record['is_resmi_tatil'] ? ' (Resmi Tatil Mesaisi)' : '';
                    $line = formatTarih($record['tarih']) . isPazar($record['tarih']) . " (" . $record['aciklama'] . $resmiTatil . ") " . $saatPart . " - " . $record['hafta_araligi'] . "
";
                    $admin_all_users_report .= $line;
                    $total_hours += (float)$record['saat'];
                    if (isPazarBool($record['tarih'])) $total_pazar++;
                    if ($record['is_resmi_tatil']) $total_resmi_tatil++;
                }
            }
            if ($current_name !== '') {
                $admin_all_users_report .= "
Kullanıcı Toplam Mesai Saati: " . $total_hours . " saat, Pazar Mesai Sayısı: " . $total_pazar;
                if ($total_resmi_tatil > 0) {
                    $admin_all_users_report .= ", Resmi Tatil Mesaisi Sayısı: " . $total_resmi_tatil;
                }
            }
        }
    }
}
// Giriş, Kayıt, Çıkış İşlemleri
if (isset($_POST['register'])) {
    $username = trim($_POST['reg_username']);
    $password = $_POST['reg_password'];
    $confirm_password = $_POST['reg_confirm_password'];
    $adsoyad = trim($_POST['reg_adsoyad']);
    if (empty($username) || empty($password) || empty($confirm_password) || empty($adsoyad)) {
        $message = "Tüm alanlar doldurulmalıdır!";
    } elseif ($password !== $confirm_password) {
        $message = "Parolalar eşleşmiyor!";
    } else {
        $stmt = $db->prepare("SELECT id FROM kullanicilar WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            $message = "Bu kullanıcı adı zaten kullanılıyor!";
        } else {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $db->prepare("INSERT INTO kullanicilar (username, password, adsoyad, is_admin) VALUES (?, ?, ?, 0)");
            $stmt->execute([$username, $hashed_password, $adsoyad]);
            $_SESSION['logged_in'] = true;
            $_SESSION['user_id'] = $db->lastInsertId();
            $_SESSION['username'] = $username;
            $_SESSION['adsoyad'] = $adsoyad;
            $_SESSION['is_admin'] = 0;
            header('Location: ' . $_SERVER['PHP_SELF']);
            exit;
        }
    }
}
if (isset($_POST['login'])) {
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    $remember = isset($_POST['remember']);
    $stmt = $db->prepare("SELECT * FROM kullanicilar WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    if ($user && password_verify($password, $user['password'])) {
        if (isset($user['is_banned']) && $user['is_banned']) {
            $message = "Bu hesap banlanmıştır!";
        } else {
            $_SESSION['logged_in'] = true;
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['adsoyad'] = $user['adsoyad'];
            $_SESSION['is_admin'] = $user['is_admin'];
            if ($remember) {
                setcookie('username', $username, time() + (86400 * 30), "/");
                setcookie('password', $password, time() + (86400 * 30), "/");
            }
            header('Location: ' . $_SERVER['PHP_SELF']);
            exit;
        }
    } else {
        $message = 'Hatalı kullanıcı adı veya şifre!';
    }
}
if (isset($_GET['logout'])) {
    session_destroy();
    setcookie('username', '', time() - 3600, "/");
    setcookie('password', '', time() - 3600, "/");
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}
// Admin İşlemleri (Kullanıcı düzenleme, silme, ban, admin yetkilendirme)
if (isAdmin()) {
    if (isset($_GET['delete_user'])) {
        $user_id = $_GET['delete_user'];
        if ($user_id != $_SESSION['user_id']) {
            $stmt = $db->prepare("DELETE FROM mesai_kayitlari WHERE hafta_id IN (SELECT id FROM haftalar WHERE user_id = ?)");
            $stmt->execute([$user_id]);
            $stmt = $db->prepare("DELETE FROM haftalar WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $stmt = $db->prepare("DELETE FROM kullanicilar WHERE id = ?");
            $stmt->execute([$user_id]);
            $message = "Kullanıcı başarıyla silindi!";
        } else {
            $message = "Kendinizi silemezsiniz!";
        }
    }
    if (isset($_GET['toggle_ban'])) {
        $user_id = $_GET['toggle_ban'];
        if ($user_id != $_SESSION['user_id']) {
            $stmt = $db->prepare("UPDATE kullanicilar SET is_banned = !is_banned WHERE id = ?");
            $stmt->execute([$user_id]);
            $message = "Kullanıcı ban durumu güncellendi!";
        } else {
            $message = "Kendinizi banlayamazsınız!";
        }
    }
    if (isset($_GET['toggle_admin'])) {
        $user_id = $_GET['toggle_admin'];
        if ($user_id != $_SESSION['user_id']) {
            $stmt = $db->prepare("UPDATE kullanicilar SET is_admin = !is_admin WHERE id = ?");
            $stmt->execute([$user_id]);
            $message = "Kullanıcı admin durumu güncellendi!";
        } else {
            $message = "Kendi admin yetkinizi değiştiremezsiniz!";
        }
    }
    if (isset($_POST['edit_user'])) {
        $user_id = $_POST['user_id'];
        $new_username = trim($_POST['new_username']);
        $new_adsoyad = trim($_POST['new_adsoyad']);
        $new_password = $_POST['new_password'];
        if (!empty($new_password)) {
            $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
            $stmt = $db->prepare("UPDATE kullanicilar SET username = ?, password = ?, adsoyad = ? WHERE id = ?");
            $stmt->execute([$new_username, $hashed_password, $new_adsoyad, $user_id]);
        } else {
            $stmt = $db->prepare("UPDATE kullanicilar SET username = ?, adsoyad = ? WHERE id = ?");
            $stmt->execute([$new_username, $new_adsoyad, $user_id]);
        }
        $message = "Kullanıcı bilgileri güncellendi!";
    }
}
if (isAdmin() && isset($_POST['admin_user_date_range'])) {
    $selected_user = $_POST['selected_user'];
    $baslangic_tarihi_admin = $_POST['baslangic_tarihi_admin'];
    $bitis_tarihi_admin = $_POST['bitis_tarihi_admin'];
    if (empty($baslangic_tarihi_admin) || empty($bitis_tarihi_admin)) {
        $message = "Başlangıç ve bitiş tarihleri gereklidir!";
    } elseif ($baslangic_tarihi_admin > $bitis_tarihi_admin) {
        $message = "Başlangıç tarihi, bitiş tarihinden sonra olamaz!";
    } else {
        $stmt = $db->prepare("
            SELECT h.hafta_araligi, h.calisan_adi, m.tarih, m.aciklama, m.saat, m.is_resmi_tatil
            FROM kullanicilar k
            LEFT JOIN haftalar h ON h.user_id = k.id
            LEFT JOIN mesai_kayitlari m ON m.hafta_id = h.id
            WHERE k.id = ? AND m.tarih BETWEEN ? AND ?
            ORDER BY m.tarih ASC
        ");
        $stmt->execute([$selected_user, $baslangic_tarihi_admin, $bitis_tarihi_admin]);
        $records = $stmt->fetchAll();
        if (empty($records)) {
            $message = "Belirtilen tarih aralığında kayıt bulunamadı!";
        } else {
            $admin_user_report = "Kullanıcı: " . $records[0]['calisan_adi'] . "
";
            $admin_user_report .= "Rapor: " . formatTarih($baslangic_tarihi_admin) . " - " . formatTarih($bitis_tarihi_admin) . "
";
            $total_hours = 0;
            $pazar_count = 0;
            $resmi_tatil_count = 0;
            foreach ($records as $record) {
                if ($record['tarih']) {
                    $saatPart = formatSaatForReport($record['tarih'], $record['saat'], $record['is_resmi_tatil']);
                    $resmiTatil = $record['is_resmi_tatil'] ? ' (Resmi Tatil Mesaisi)' : '';
                    $line = formatTarih($record['tarih']) . isPazar($record['tarih']) . " (" . $record['aciklama'] . $resmiTatil . ") " . $saatPart . "
";
                    $admin_user_report .= $line;
                    $total_hours += (float)$record['saat'];
                    if (isPazarBool($record['tarih'])) {
                        $pazar_count++;
                    }
                    if ($record['is_resmi_tatil']) {
                        $resmi_tatil_count++;
                    }
                }
            }
            $admin_user_report .= "
Kullanıcı Toplam Mesai Saati: " . $total_hours;
            $admin_user_report .= "
Pazar Mesai Sayısı: " . $pazar_count;
            if ($resmi_tatil_count > 0) {
                $admin_user_report .= "
Resmi Tatil Mesaisi Sayısı: " . $resmi_tatil_count;
            }
        }
    }
}
// Hafta Silme Onay Sayfası
if (isset($_GET['confirm_delete_week']) && checkLogin()) {
    $week_id = $_GET['confirm_delete_week'];
    $stmt = $db->prepare("SELECT * FROM haftalar WHERE id = ? AND user_id = ?");
    $stmt->execute([$week_id, $_SESSION['user_id']]);
    $week = $stmt->fetch();
    if ($week) {
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM mesai_kayitlari WHERE hafta_id = ?");
        $stmt->execute([$week_id]);
        $count = $stmt->fetchColumn();
        $show_confirm = true;
        $confirm_message = $count > 0 ? "Bu hafta içerisinde mesai verisi bulunuyor. Silmek istediğinize emin misiniz?" : "Bu haftayı silmek istediğinize emin misiniz?";
        $confirm_action = $_SERVER['PHP_SELF'];
    } else {
        $message = "Yetkisiz işlem!";
    }
}
// Hafta Silme İşlemi (POST ile)
if (isset($_POST['delete_week']) && checkLogin()) {
    $week_id = $_POST['week_id'];
    $stmt = $db->prepare("SELECT * FROM haftalar WHERE id = ? AND user_id = ?");
    $stmt->execute([$week_id, $_SESSION['user_id']]);
    $week = $stmt->fetch();
    if ($week || isAdmin()) { // Admin can delete any week theoretically, but query is user specific
        $user_id_to_delete_for = isAdmin() && isset($_POST['user_id_for_week_deletion']) ? $_POST['user_id_for_week_deletion'] : $_SESSION['user_id'];
        $stmt_check_owner = $db->prepare("SELECT user_id FROM haftalar WHERE id = ?");
        $stmt_check_owner->execute([$week_id]);
        $owner = $stmt_check_owner->fetch();
        if ($owner && ($owner['user_id'] == $_SESSION['user_id'] || isAdmin())) {
             $stmt = $db->prepare("DELETE FROM mesai_kayitlari WHERE hafta_id = ?");
             $stmt->execute([$week_id]);
             // Ensure the user deleting is the owner or an admin
             $delete_hafta_sql = "DELETE FROM haftalar WHERE id = ?";
             $delete_hafta_params = [$week_id];
             if (!isAdmin()){ // Non-admin can only delete their own weeks
                $delete_hafta_sql .= " AND user_id = ?";
                $delete_hafta_params[] = $_SESSION['user_id'];
             }
             $stmt = $db->prepare($delete_hafta_sql);
             $stmt->execute($delete_hafta_params);
            if (isset($_SESSION['current_week']) && $_SESSION['current_week'] == $week_id) {
                unset($_SESSION['current_week']);
            }
            header('Location: ' . $_SERVER['PHP_SELF']);
            exit;
        } else {
            $message = "Yetkisiz işlem veya hafta bulunamadı!";
        }
    } else {
        $message = "Yetkisiz işlem!";
    }
}
// Gün Silme Onay Sayfası
if (isset($_GET['confirm_delete']) && checkLogin() && isset($_SESSION['current_week'])) {
    $id = $_GET['confirm_delete'];
    $stmt = $db->prepare("SELECT mk.* FROM mesai_kayitlari mk JOIN haftalar h ON mk.hafta_id = h.id WHERE mk.id = ? AND h.user_id = ? AND mk.hafta_id = ?");
    $stmt->execute([$id, $_SESSION['user_id'], $_SESSION['current_week']]);
    $record = $stmt->fetch();
    if ($record) {
        $show_confirm = true;
        $confirm_message = "Bu kaydı silmek istediğinize emin misiniz?";
        $confirm_action = $_SERVER['PHP_SELF'];
    } else {
        $message = "Yetkisiz işlem veya kayıt bulunamadı!";
    }
}
// Gün Silme İşlemi (POST ile)
if (isset($_POST['delete_record']) && checkLogin() && isset($_SESSION['current_week'])) {
    $id = $_POST['record_id'];
    try {
        // Ensure the record belongs to the current user's week
        $stmt_check = $db->prepare("SELECT mk.id FROM mesai_kayitlari mk JOIN haftalar h ON mk.hafta_id = h.id WHERE mk.id = ? AND h.user_id = ? AND mk.hafta_id = ?");
        $stmt_check->execute([$id, $_SESSION['user_id'], $_SESSION['current_week']]);
        if ($stmt_check->fetch()) {
            $stmt = $db->prepare("DELETE FROM mesai_kayitlari WHERE id = ?");
            $stmt->execute([$id]);
            header('Location: ' . $_SERVER['PHP_SELF']);
            exit;
        } else {
            $message = "Yetkisiz işlem veya silinecek kayıt bulunamadı.";
        }
    } catch (PDOException $e) {
        $message = "Hata: " . $e->getMessage();
    }
}
if (isset($_POST['edit_week']) && checkLogin()) {
    $week_id = $_POST['week_id'];
    $hafta_baslangic = $_POST['hafta_baslangic'];
    $hafta_araligi = $_POST['hafta_araligi'];
    $calisanAdi = $_SESSION['adsoyad']; // Calisan adi cannot be changed from here by user
    $stmt = $db->prepare("UPDATE haftalar SET hafta_baslangic = ?, hafta_araligi = ? WHERE id = ? AND user_id = ?");
    $stmt->execute([$hafta_baslangic, $hafta_araligi, $week_id, $_SESSION['user_id']]);
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}
if (isset($_POST['create_week']) && checkLogin()) {
    $haftaBaslangic = $_POST['hafta_baslangic'];
    $haftaAraligi = $_POST['hafta_araligi'];
    $calisanAdi = $_SESSION['adsoyad'];
    try {
        $stmt = $db->prepare("INSERT INTO haftalar (hafta_baslangic, hafta_araligi, calisan_adi, user_id) VALUES (?, ?, ?, ?)");
        $stmt->execute([$haftaBaslangic, $haftaAraligi, $calisanAdi, $_SESSION['user_id']]);
        $_SESSION['current_week'] = $db->lastInsertId();
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    } catch (PDOException $e) {
        $message = "Hata: " . $e->getMessage();
    }
}
if (isset($_POST['submit']) && checkLogin() && isset($_SESSION['current_week'])) {
    $tarih = $_POST['tarih'];
    $aciklama = trim($_POST['aciklama']);
    $saat = trim($_POST['saat']); // Trim whitespace
    $is_resmi_tatil = isset($_POST['is_resmi_tatil']) ? 1 : 0;
    $stmt = $db->prepare("SELECT hafta_baslangic FROM haftalar WHERE id = ? AND user_id = ?");
    $stmt->execute([$_SESSION['current_week'], $_SESSION['user_id']]);
    $hafta = $stmt->fetch();
    if (!$hafta) {
        $message = "Seçili hafta bulunamadı!";
    } else {
        $weekStartDate = new DateTime($hafta['hafta_baslangic']);
        $weekEndDate = clone $weekStartDate;
        $weekEndDate->modify('+6 days');
        $enteredDate = new DateTime($tarih);
        if ($enteredDate < $weekStartDate || $enteredDate > $weekEndDate) {
            $message = "Seçili hafta dışındaki tarihler için kayıt yapılamaz!";
        } elseif (empty($aciklama)) {
            $message = "Açıklama alanı boş bırakılamaz!";
        } else {
            $is_pazar_day = isPazarBool($tarih);
            // Saat alanı boş bırakılamaz, Pazar günleri ve resmi tatiller hariç
            // Empty saat means empty string "", not "0". "0" is a valid entry.
            if ($saat === '' && !$is_resmi_tatil && !$is_pazar_day) {
                $message = "Saat alanı (Pazar günleri ve resmi tatiller hariç) boş bırakılamaz!";
            }
            if (empty($message)) {
                $stmt_check_existing = $db->prepare("SELECT id FROM mesai_kayitlari WHERE hafta_id = ? AND tarih = ?");
                $stmt_check_existing->execute([$_SESSION['current_week'], $tarih]);
                if ($stmt_check_existing->fetch()) {
                    $message = "Bu tarih için mesai verisi zaten girilmiş!";
                } else {
                    try {
                        // If it's Sunday or official holiday and hour is empty string, save hour as 0
                        $saat_to_save = ($saat === '' && ($is_pazar_day || $is_resmi_tatil)) ? '0' : $saat;
                        $stmt_insert = $db->prepare("INSERT INTO mesai_kayitlari (hafta_id, tarih, aciklama, saat, is_resmi_tatil) VALUES (?, ?, ?, ?, ?)");
                        $stmt_insert->execute([$_SESSION['current_week'], $tarih, $aciklama, $saat_to_save, $is_resmi_tatil]);
                        header('Location: ' . $_SERVER['PHP_SELF']);
                        exit;
                    } catch (PDOException $e) {
                        $message = "Hata: " . $e->getMessage();
                    }
                }
            }
        }
    }
}
if (isset($_POST['edit']) && checkLogin() && isset($_SESSION['current_week'])) {
    $id = $_POST['id'];
    $tarih = $_POST['tarih'];
    $aciklama = trim($_POST['aciklama']);
    $saat = trim($_POST['saat']);
    $is_resmi_tatil = isset($_POST['is_resmi_tatil']) ? 1 : 0;
    $stmt = $db->prepare("SELECT hafta_baslangic FROM haftalar WHERE id = ? AND user_id = ?");
    $stmt->execute([$_SESSION['current_week'], $_SESSION['user_id']]);
    $hafta = $stmt->fetch();
    if (!$hafta) {
        $message = "Seçili hafta bulunamadı!";
    } else {
        $weekStartDate = new DateTime($hafta['hafta_baslangic']);
        $weekEndDate = clone $weekStartDate;
        $weekEndDate->modify('+6 days');
        $enteredDate = new DateTime($tarih);
        if ($enteredDate < $weekStartDate || $enteredDate > $weekEndDate) {
            $message = "Seçili hafta dışındaki tarihler için kayıt yapılamaz!";
        } elseif (empty($aciklama)) {
            $message = "Açıklama alanı boş bırakılamaz!";
        } else {
            $is_pazar_day = isPazarBool($tarih);
            if ($saat === '' && !$is_resmi_tatil && !$is_pazar_day) {
                $message = "Saat alanı (Pazar günleri ve resmi tatiller hariç) boş bırakılamaz!";
            }
            if (empty($message)) {
                 // Check if another record (not this one) exists for the new date if date was changed.
                $stmt_check_other = $db->prepare("SELECT id FROM mesai_kayitlari WHERE hafta_id = ? AND tarih = ? AND id != ?");
                $stmt_check_other->execute([$_SESSION['current_week'], $tarih, $id]);
                if($stmt_check_other->fetch()){
                    $message = "Düzenlemeye çalıştığınız tarih için zaten başka bir kayıt mevcut!";
                } else {
                    try {
                        $saat_to_save = ($saat === '' && ($is_pazar_day || $is_resmi_tatil)) ? '0' : $saat;
                        $stmt_update = $db->prepare("UPDATE mesai_kayitlari SET tarih = ?, aciklama = ?, saat = ?, is_resmi_tatil = ? WHERE id = ? AND hafta_id = ?");
                        // Ensure the update is for the user's record
                        $stmt_check_owner_edit = $db->prepare("SELECT mk.id FROM mesai_kayitlari mk JOIN haftalar h ON mk.hafta_id = h.id WHERE mk.id = ? AND h.user_id = ?");
                        $stmt_check_owner_edit->execute([$id, $_SESSION['user_id']]);
                        if ($stmt_check_owner_edit->fetch()) {
                            $stmt_update->execute([$tarih, $aciklama, $saat_to_save, $is_resmi_tatil, $id, $_SESSION['current_week']]);
                            header('Location: ' . $_SERVER['PHP_SELF']);
                            exit;
                        } else {
                            $message = "Yetkisiz düzenleme işlemi.";
                        }
                    } catch (PDOException $e) {
                        $message = "Hata: " . $e->getMessage();
                    }
                }
            }
        }
    }
}
if (isset($_POST['change_password']) && checkLogin()) {
    $current_password = trim($_POST['current_password']);
    $new_password = trim($_POST['new_password']);
    $confirm_new_password = trim($_POST['confirm_new_password']);
    $stmt = $db->prepare("SELECT password FROM kullanicilar WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user_data = $stmt->fetch();
    if (!$user_data) {
        $message = "Kullanıcı bulunamadı!";
    } elseif (!password_verify($current_password, $user_data['password'])) {
        $message = "Geçerli şifreniz yanlış!";
    } elseif ($new_password !== $confirm_new_password) {
        $message = "Yeni şifreler eşleşmiyor!";
    } elseif (empty($new_password)) {
        $message = "Yeni şifre boş olamaz!";
    }
     else {
        $hashed_new_password = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $db->prepare("UPDATE kullanicilar SET password = ? WHERE id = ?");
        if ($stmt->execute([$hashed_new_password, $_SESSION['user_id']])) {
            $message = "Şifreniz başarıyla güncellendi!";
        } else {
            $message = "Şifre güncelleme sırasında bir hata oluştu!";
        }
    }
}
if (isset($_GET['select_week']) && checkLogin()) {
    $week_id = $_GET['select_week'];
    $stmt = $db->prepare("SELECT id FROM haftalar WHERE id = ? AND user_id = ?");
    $stmt->execute([$week_id, $_SESSION['user_id']]);
    if ($stmt->fetch()) {
        $_SESSION['current_week'] = $week_id;
        // Preserve year selection if present
        $year_param = isset($_GET['year']) ? '&year=' . $_GET['year'] : '';
        header('Location: ' . $_SERVER['PHP_SELF'] . '?' . ltrim($year_param, '&'));
        exit;
    } else {
        $message = "Yetkisiz işlem!";
    }
}
$currentWeek = null;
if (isset($_SESSION['current_week'])) {
    try {
        $stmt = $db->prepare("SELECT * FROM haftalar WHERE id = ? AND user_id = ?");
        $stmt->execute([$_SESSION['current_week'], $_SESSION['user_id']]);
        $currentWeek = $stmt->fetch();
    } catch (PDOException $e) {
        $message = "Hata: " . $e->getMessage();
    }
}
$selectedYear = isset($_GET['year']) ? (int)$_GET['year'] : (int)date("Y");
$yearOptions = [];
if (checkLogin()) {
    try {
        $stmt = $db->prepare("SELECT DISTINCT YEAR(hafta_baslangic) as yil FROM haftalar WHERE user_id = ? ORDER BY yil DESC");
        $stmt->execute([$_SESSION['user_id']]);
        $yearOptions = $stmt->fetchAll();
    } catch (PDOException $e) {
        $message = "Hata: " . $e->getMessage();
    }
}
$allWeeks = [];
if (checkLogin()) {
    try {
        $stmt = $db->prepare("SELECT * FROM haftalar WHERE user_id = ? AND YEAR(hafta_baslangic) = ? ORDER BY hafta_baslangic DESC");
        $stmt->execute([$_SESSION['user_id'], $selectedYear]);
        $allWeeks = $stmt->fetchAll();
    } catch (PDOException $e) {
        $message = "Hata: " . $e->getMessage();
    }
}
$mesaiKayitlari = [];
$toplam_saat = 0;
$pazar_sayisi = 0;
$resmi_tatil_sayisi = 0;
if ($currentWeek) {
    try {
        $stmt = $db->prepare("SELECT * FROM mesai_kayitlari WHERE hafta_id = ? ORDER BY tarih ASC");
        $stmt->execute([$_SESSION['current_week']]);
        $mesaiKayitlari = $stmt->fetchAll();
        foreach ($mesaiKayitlari as $item) {
            $toplam_saat += (float)$item['saat'];
            if (isPazarBool($item['tarih'])) $pazar_sayisi++;
            if ($item['is_resmi_tatil']) $resmi_tatil_sayisi++;
        }
    } catch (PDOException $e) {
        $message = "Hata: " . $e->getMessage();
    }
}
$rapor_text = "";
if ($currentWeek && !empty($mesaiKayitlari)) {
    $baslik = $currentWeek['hafta_araligi'];
    if (!empty($currentWeek['calisan_adi'])) {
        $baslik .= ' ' . $currentWeek['calisan_adi'];
    }
    $baslik .= ' - Planlanan Mesailer';
    $rapor_text .= $baslik . "
";
    $toplam_saat_calc = 0;
    $pazar_sayisi_calc = 0;
    $resmi_tatil_sayisi_calc = 0;
    foreach ($mesaiKayitlari as $item) {
        $formattedTarih = formatTarih($item['tarih']);
        $pazar_text = isPazar($item['tarih']);
        $saatPart = formatSaatForReport($item['tarih'], $item['saat'], $item['is_resmi_tatil']);
        $resmiTatil = $item['is_resmi_tatil'] ? ' (Resmi Tatil Mesaisi)' : '';
        $rapor_text .= $formattedTarih . $pazar_text . " (" . $item['aciklama'] . $resmiTatil . ") " . $saatPart . "
";
        $toplam_saat_calc += (float)$item['saat'];
        if (isPazarBool($item['tarih'])) $pazar_sayisi_calc++;
        if ($item['is_resmi_tatil']) $resmi_tatil_sayisi_calc++;
    }
    $rapor_text .= "
Toplam Mesai Saati: " . $toplam_saat_calc;
    $rapor_text .= "
Pazar Mesai Sayısı: " . $pazar_sayisi_calc;
    if ($resmi_tatil_sayisi_calc > 0) {
        $rapor_text .= "
Resmi Tatil Mesaisi Sayısı: " . $resmi_tatil_sayisi_calc;
    }
}
// Onay Sayfası Gösterimi
if ($show_confirm) {
    ?>
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Onay Sayfası</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="container my-4">
            <div class="alert alert-warning">
                <?php echo htmlspecialchars($confirm_message); ?>
            </div>
            <form method="post" action="<?php echo htmlspecialchars($confirm_action); ?>">
                <?php if (isset($_GET['confirm_delete_week']) && isset($week_id)): ?>
                    <input type="hidden" name="week_id" value="<?php echo htmlspecialchars($week_id); ?>">
                    <button type="submit" name="delete_week" class="btn btn-danger">Evet, sil</button>
                <?php elseif (isset($_GET['confirm_delete']) && isset($id)): ?>
                    <input type="hidden" name="record_id" value="<?php echo htmlspecialchars($id); ?>">
                    <button type="submit" name="delete_record" class="btn btn-danger">Evet, sil</button>
                <?php endif; ?>
                <a href="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" class="btn btn-secondary">Hayır, vazgeç</a>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit;
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mesai Takip Sistemi</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            background: linear-gradient(135deg, #007bff, #28a745);
            color: #343a40;
            margin-bottom: 80px;
            animation: fadeIn 1s ease-in;
        }
        .container {
            max-width: 1000px;
            padding: 20px;
        }
        .card {
            border-radius: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            background: #fff;
            margin-bottom: 20px;
            animation: slideIn 0.5s ease-out;
        }
        .card-header {
            background: #007bff;
            color: #fff;
            border-radius: 15px 15px 0 0;
            padding: 15px;
        }
        .btn-primary {
            background-color: #007bff;
            border-color: #007bff;
            transition: transform 0.3s ease, background-color 0.3s ease;
        }
        .btn-primary:hover {
            background-color: #0056b3;
            transform: scale(1.05);
        }
        .btn-success {
            background-color: #28a745;
            border-color: #28a745;
            transition: transform 0.3s ease, background-color 0.3s ease;
        }
        .btn-success:hover {
            background-color: #218838;
            transform: scale(1.05);
        }
        .btn-danger {
            background-color: #dc3545;
            border-color: #dc3545;
            transition: transform 0.3s ease, background-color 0.3s ease;
        }
        .btn-danger:hover {
            background-color: #c82333;
            transform: scale(1.05);
        }
        .pazar {
            background-color: #fff3cd !important; /* Ensure pazar color overrides other styles if necessary */
        }
        .resmi-tatil {
            background-color: #d1ecf1 !important; /* Ensure tatil color overrides */
        }
        .soluk, .kayitli-gun-soluk { /* .soluk class for table rows, .kayitli-gun-soluk for new day buttons */
            background-color: #e9ecef !important; /* More distinct faded color */
            opacity: 0.7;
        }
        .table-hover tbody tr.soluk:hover {
            background-color: #dfe2e5 !important; /* Slightly different hover for faded rows */
        }
        footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #343a40;
            color: #fff;
            text-align: center;
            padding: 10px 5px;
            font-size: 12px;
            animation: slideUp 0.5s ease-in;
            z-index: 1000; /* Ensure footer is above other content if needed */
        }
        .active-week {
            background-color: #007bff;
            color: #fff;
        }
        .table-hover tbody tr:hover {
            background-color: #f1f3f5;
            transition: background-color 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .day-selector-btn.active {
            background-color: #007bff;
            color: white;
            font-weight: bold;
            border-color: #0056b3;
        }
        .day-selector-btn.kayitli-gun { /* Style for buttons of days with data */
             background-color: #f8f9fa; /* Lighter grey */
             color: #6c757d; /* Muted text */
             border-color: #dee2e6;
             opacity: 0.7; /* Faded effect */
        }
        /* Yeni eklenen stil kuralları */
        .day-selector-btn.weekend {
            background-color: #fd7e14 !important; /* Turuncu renk */
            color: white !important;
            border-color: #dc650d !important;
        }
        .day-selector-btn.weekend.kayitli-gun {
            background-color: #e06b12 !important; /* Turuncuya biraz koyu */
            opacity: 0.85;
        }
        .day-selector-btn.weekend.active {
            background-color: #c95e0f !important; /* Turuncuya biraz daha koyu */
        }
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .btn { font-size: 0.9rem; padding: 10px 15px; /* Adjusted padding */ }
            .form-control, .form-select { font-size: 0.9rem; padding: 10px; } /* Added .form-select */
            .card { margin-bottom: 15px; } /* Reduced margin */
            .table th, .table td { font-size: 0.85rem; } /* Slightly smaller table font */
            .dropdown-menu { width: 100%; }
            .modal-dialog { margin: 10px; }
            .day-selector-btn {
                flex-grow: 1; /* Make buttons take available space */
                min-width: 100px; /* Minimum width for readability */
                margin-bottom: 5px !important; /* Ensure gap works with flex-wrap */
            }
            #dayButtonContainer {
                 justify-content: space-around; /* Distribute buttons more evenly on mobile */
            }
        }
        .edit-buttons, .edit-header { display: none; }
        .dropdown-menu { max-height: 200px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="container my-4">
        <?php if ($message): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>
        <?php if (!checkLogin()): ?>
            <div class="card mb-3">
                <div class="card-header">
                    <button class="btn btn-info w-100 text-start" type="button" data-bs-toggle="collapse" data-bs-target="#helpPanelNonLogged" aria-expanded="false" aria-controls="helpPanelNonLogged">
                        <i class="fas fa-question-circle"></i> Yardım / Kullanıcı Kılavuzu
                    </button>
                </div>
                <div class="collapse" id="helpPanelNonLogged">
                    <div class="card-body">
                        <h5>Sistemin Kullanım Kılavuzu</h5>
                        <p>Bu sistem, mesai kayıtlarınızı takip etmek ve yönetmek için tasarlanmıştır. Kayıt olmak için lütfen formu doldurun. Kayıt sırasında ad ve soyad bilgileriniz zorunludur. Kayıt olduktan sonra, haftalık mesai planınız otomatik olarak kayıt sırasında girilen ad ve soyad ile oluşturulacaktır.</p>
                        <p>Admin kullanıcılar, diğer kullanıcıların işlemlerini yönetebilir; kullanıcı ekleyip silebilir, rapor alabilir, DB yedeği alıp geri yükleyebilir ve hesap ayarlarını düzenleyebilir.</p>
                        <button type="button" class="btn btn-secondary" data-bs-toggle="collapse" data-bs-target="#helpPanelNonLogged">Kapat</button>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <h2 class="text-center mb-4">Mesai Takip Sistemi</h2>
                    <ul class="nav nav-tabs" id="authTab" role="tablist">
                        <li class="nav-item">
                            <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#login" type="button" role="tab">Giriş Yap</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" id="register-tab" data-bs-toggle="tab" data-bs-target="#register" type="button" role="tab">Kayıt Ol</button>
                        </li>
                    </ul>
                    <div class="tab-content" id="authTabContent">
                        <div class="tab-pane fade show active pt-3" id="login" role="tabpanel">
                            <form method="post" novalidate>
                                <div class="mb-3">
                                    <label class="form-label">Kullanıcı Adı</label>
                                    <input type="text" name="username" class="form-control" value="<?php echo isset($_COOKIE['username']) ? htmlspecialchars($_COOKIE['username']) : ''; ?>" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Şifre</label>
                                    <input type="password" name="password" class="form-control" value="<?php echo isset($_COOKIE['password']) ? htmlspecialchars($_COOKIE['password']) : ''; ?>" required>
                                </div>
                                <div class="mb-3 form-check">
                                    <input type="checkbox" name="remember" class="form-check-input" id="rememberMe">
                                    <label class="form-check-label" for="rememberMe">Beni Hatırla</label>
                                </div>
                                <button type="submit" name="login" class="btn btn-primary">Giriş Yap</button>
                            </form>
                        </div>
                        <div class="tab-pane fade pt-3" id="register" role="tabpanel">
                            <form method="post" novalidate>
                                <div class="mb-3">
                                    <label class="form-label">Ad ve Soyad</label>
                                    <input type="text" name="reg_adsoyad" class="form-control" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Kullanıcı Adı</label>
                                    <input type="text" name="reg_username" class="form-control" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Şifre</label>
                                    <input type="password" name="reg_password" class="form-control" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Şifre Tekrar</label>
                                    <input type="password" name="reg_confirm_password" class="form-control" required>
                                    <small class="form-text text-muted">Şifrenizi lütfen unutmayın. Unutursanız, site yöneticisi ile iletişime geçiniz.</small>
                                </div>
                                <button type="submit" name="register" class="btn btn-success">Kayıt Ol</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        <?php elseif (checkLogin() && isset($_GET['view']) && $_GET['view'] === 'raporlar'): ?>
            <?php
            $reportWeeks = [];
            if (checkLogin()) {
                try {
                    $stmt = $db->prepare("SELECT * FROM haftalar WHERE user_id = ? ORDER BY hafta_baslangic DESC");
                    $stmt->execute([$_SESSION['user_id']]);
                    $reportWeeks = $stmt->fetchAll();
                } catch (PDOException $e) {
                    $message = "Hata: " . $e->getMessage();
                }
            }
            ?>
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <a href="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" class="btn btn-outline-primary">
                            <i class="fas fa-home"></i> Ana Sayfa
                        </a>
                    </div>
                    <h4 class="mb-3">📊 Raporlar</h4>
                    <div class="card mb-3">
                        <div class="card-header bg-primary text-white">Hafta Aralığı Raporu (Planlanan Mesailer)</div>
                        <div class="card-body bg-light">
                            <form method="post" class="row g-2 align-items-end">
                                <div class="col-md-10">
                                    <label class="form-label">Hafta Seçin</label>
                                    <select name="selected_week" class="form-select" required>
                                        <option value="">Seçiniz</option>
                                        <?php foreach($reportWeeks as $week): ?>
                                            <option value="<?php echo htmlspecialchars($week['id']); ?>"><?php echo htmlspecialchars($week['hafta_araligi'] . ' ' . $week['calisan_adi']); ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <button type="submit" name="generate_week_report" class="btn btn-primary w-100">
                                        <i class="fas fa-file-alt"></i> Oluştur
                                    </button>
                                </div>
                            </form>
                            <?php if (!empty($hafta_rapor_text)): ?>
                                <div class="mt-3">
                                    <textarea id="haftaRaporText" style="width:100%; height:200px;" readonly><?php echo htmlspecialchars($hafta_rapor_text); ?></textarea>
                                    <button type="button" class="btn btn-success mt-2" onclick="copyToClipboard(document.getElementById('haftaRaporText').value)">
                                        <i class="fas fa-copy"></i> Raporu Kopyala
                                    </button>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    <div class="card mb-3">
                        <div class="card-header bg-primary text-white">Tarih Aralığı Raporu</div>
                        <div class="card-body bg-light">
                            <form method="post" class="row g-2 align-items-end">
                                <div class="col-md-5">
                                    <label class="form-label">Başlangıç Tarihi</label>
                                    <input type="date" name="baslangic_tarihi" class="form-control" required>
                                </div>
                                <div class="col-md-5">
                                    <label class="form-label">Bitiş Tarihi</label>
                                    <input type="date" name="bitis_tarihi" class="form-control" required>
                                </div>
                                <div class="col-md-2">
                                    <button type="submit" name="generate_date_range_report" class="btn btn-primary w-100">
                                        <i class="fas fa-file-alt"></i> Oluştur
                                    </button>
                                </div>
                            </form>
                            <?php if (!empty($rapor_date_range_text)): ?>
                                <div class="mt-3">
                                    <textarea id="raporDateRangeText" style="width:100%; height:200px;" readonly><?php echo htmlspecialchars($rapor_date_range_text); ?></textarea>
                                    <button type="button" class="btn btn-success mt-2" onclick="copyToClipboard(document.getElementById('raporDateRangeText').value)">
                                        <i class="fas fa-copy"></i> Raporu Kopyala
                                    </button>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        <?php else: ?>
            <?php if (isAdmin() && isset($_GET['view']) && $_GET['view'] === 'admin'): ?>
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                            <div class="d-flex align-items-center gap-3">
                                <a href="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" class="btn btn-outline-primary">
                                    <i class="fas fa-home"></i> Ana Sayfa
                                </a>
                                <span class="fw-bold">Hoşgeldin <?php echo htmlspecialchars($_SESSION['adsoyad']); ?></span>
                            </div>
                            <div class="d-flex gap-2 flex-column flex-md-row">
                                <a href="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" class="btn btn-secondary">
                                    <i class="fas fa-arrow-left"></i> Kullanıcı Arayüzüne Dön
                                </a>
                                <a href="?view=raporlar" class="btn btn-warning">
                                    <i class="fas fa-file-alt"></i> Raporlar
                                </a>
                                <a href="?logout" class="btn btn-danger">
                                    <i class="fas fa-sign-out-alt"></i> Çıkış
                                </a>
                            </div>
                        </div>
                        <div class="mb-4">
                            <button class="btn btn-info w-100 text-start" type="button" data-bs-toggle="collapse" data-bs-target="#dbBackupCollapse" aria-expanded="false" aria-controls="dbBackupCollapse">
                                <h5 class="mb-0"><i class="fas fa-database"></i> Veritabanı Yedeği İşlemleri</h5>
                            </button>
                            <div class="collapse" id="dbBackupCollapse">
                                <div class="card card-body">
                                    <div class="d-flex flex-column flex-md-row gap-2">
                                        <a href="?backup_db=1" class="btn btn-success">
                                            <i class="fas fa-download"></i> DB Yedeği Al
                                        </a>
                                        <form method="post" enctype="multipart/form-data" class="d-flex flex-column flex-md-row gap-2">
                                            <input type="file" name="backup_file" class="form-control" required>
                                            <button type="submit" name="restore_db" class="btn btn-warning">
                                                <i class="fas fa-upload"></i> Yedeği Geri Yükle
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h5><i class="fas fa-user-shield"></i> Kullanıcı Listesi</h5>
                        <div class="mb-2">
                            <input type="text" id="userSearch" class="form-control" placeholder="Kullanıcı Ara">
                        </div>
                        <div class="table-responsive mb-3" style="max-height:300px; overflow-y:auto;">
                            <table class="table table-hover" id="userTable">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Kullanıcı Adı</th>
                                        <th>Ad Soyad</th>
                                        <th>Admin?</th>
                                        <th>Durum</th>
                                        <th>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php
                                    $stmt = $db->prepare("SELECT id, username, adsoyad, is_banned, is_admin FROM kullanicilar ORDER BY username");
                                    $stmt->execute();
                                    $allUsers = $stmt->fetchAll();
                                    foreach ($allUsers as $user):
                                    ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($user['id']); ?></td>
                                        <td><?php echo htmlspecialchars($user['username']); ?></td>
                                        <td><?php echo htmlspecialchars($user['adsoyad']); ?></td>
                                        <td><?php echo $user['is_admin'] ? '<span class="badge bg-primary">Admin</span>' : '<span class="badge bg-secondary">Kullanıcı</span>'; ?></td>
                                        <td><?php echo $user['is_banned'] ? '<span class="badge bg-danger">Banlı</span>' : '<span class="badge bg-success">Aktif</span>'; ?></td>
                                        <td>
                                            <button type="button" class="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#editUserModal<?php echo htmlspecialchars($user['id']); ?>">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <a href="?delete_user=<?php echo htmlspecialchars($user['id']); ?>" class="btn btn-sm btn-danger" onclick="return confirm('Bu kullanıcıyı ve tüm verilerini silmek istediğinizden emin misiniz?')">
                                                <i class="fas fa-trash"></i>
                                            </a>
                                            <a href="?toggle_ban=<?php echo htmlspecialchars($user['id']); ?>" class="btn btn-sm btn-<?php echo $user['is_banned'] ? 'success' : 'secondary'; ?>">
                                                <i class="fas fa-<?php echo $user['is_banned'] ? 'unlock' : 'ban'; ?>"></i>
                                            </a>
                                            <a href="?toggle_admin=<?php echo htmlspecialchars($user['id']); ?>" class="btn btn-sm btn-<?php echo $user['is_admin'] ? 'secondary' : 'primary'; ?>">
                                                <i class="fas fa-<?php echo $user['is_admin'] ? 'user' : 'user-shield'; ?>"></i>
                                            </a>
                                        </td>
                                    </tr>
                                    <div class="modal fade" id="editUserModal<?php echo htmlspecialchars($user['id']); ?>" tabindex="-1">
                                        <div class="modal-dialog">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title">Kullanıcı Düzenle</h5>
                                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                                </div>
                                                <form method="post">
                                                    <div class="modal-body">
                                                        <input type="hidden" name="user_id" value="<?php echo htmlspecialchars($user['id']); ?>">
                                                        <div class="mb-2">
                                                            <label class="form-label">Yeni Kullanıcı Adı</label>
                                                            <input type="text" name="new_username" class="form-control" value="<?php echo htmlspecialchars($user['username']); ?>" required>
                                                        </div>
                                                        <div class="mb-2">
                                                            <label class="form-label">Yeni Ad ve Soyad</label>
                                                            <input type="text" name="new_adsoyad" class="form-control" value="<?php echo htmlspecialchars($user['adsoyad']); ?>" required>
                                                        </div>
                                                        <div class="mb-2">
                                                            <label class="form-label">Yeni Şifre (Boş bırakılırsa değişmez)</label>
                                                            <input type="password" name="new_password" class="form-control">
                                                        </div>
                                                    </div>
                                                    <div class="modal-footer">
                                                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                                                        <button type="submit" name="edit_user" class="btn btn-primary">Kaydet</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                        <h6>Kullanıcı Bazlı Rapor</h6>
                        <div class="mb-2">
                            <input type="text" id="userReportSearch" class="form-control" placeholder="Kullanıcı Ara">
                        </div>
                        <form method="post" class="row g-2">
                            <div class="col-md-4">
                                <label class="form-label">Kullanıcı Seçin</label>
                                <select name="selected_user" class="form-select" id="userReportSelect" required>
                                    <option value="">Seçiniz</option>
                                    <?php foreach($allUsers as $user): ?>
                                        <option value="<?php echo htmlspecialchars($user['id']); ?>"><?php echo htmlspecialchars($user['adsoyad']); ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Başlangıç Tarihi</label>
                                <input type="date" name="baslangic_tarihi_admin" class="form-control" required>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">Bitiş Tarihi</label>
                                <input type="date" name="bitis_tarihi_admin" class="form-control" required>
                            </div>
                            <div class="col-md-2 d-flex align-items-end">
                                <button type="submit" name="admin_user_date_range" class="btn btn-primary w-100">
                                    <i class="fas fa-file-alt"></i> Rapor Oluştur
                                </button>
                            </div>
                        </form>
                        <?php if (!empty($admin_user_report)): ?>
                            <div class="mt-3">
                                <h5>Kullanıcı Raporu</h5>
                                <textarea id="adminUserReport" style="width:100%; height:200px;" readonly><?php echo htmlspecialchars($admin_user_report); ?></textarea>
                                <button type="button" class="btn btn-success mt-2" onclick="copyToClipboard(document.getElementById('adminUserReport').value)">
                                    <i class="fas fa-copy"></i> Raporu Kopyala
                                </button>
                            </div>
                        <?php endif; ?>
                        <h6 class="mt-4">Tüm Kullanıcılar için Tarih Aralığı Raporu</h6>
                        <form method="post" class="row g-2">
                            <div class="col-md-5">
                                <label class="form-label">Başlangıç Tarihi</label>
                                <input type="date" name="baslangic_tarihi" class="form-control" required>
                            </div>
                            <div class="col-md-5">
                                <label class="form-label">Bitiş Tarihi</label>
                                <input type="date" name="bitis_tarihi" class="form-control" required>
                            </div>
                            <div class="col-md-2 d-flex align-items-end">
                                <button type="submit" name="admin_generate_all" class="btn btn-primary w-100">
                                    <i class="fas fa-file-alt"></i> Rapor Oluştur
                                </button>
                            </div>
                        </form>
                        <?php if (!empty($admin_all_users_report)): ?>
                            <div class="mt-3">
                                <h5>Tüm Kullanıcılar Raporu</h5>
                                <textarea id="adminAllUsersReport" style="width:100%; height:200px;" readonly><?php echo htmlspecialchars($admin_all_users_report); ?></textarea>
                                <button type="button" class="btn btn-success mt-2" onclick="copyToClipboard(document.getElementById('adminAllUsersReport').value)">
                                    <i class="fas fa-copy"></i> Raporu Kopyala
                                </button>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php else: ?>
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="d-flex align-items-center gap-3">
                                <h5 class="mb-0 text-primary fw-bold">Mesai Takip Sistemi</h5>
                                <span class="fw-bold">| Hoşgeldin <?php echo htmlspecialchars($_SESSION['adsoyad']); ?></span>
                            </div>
                            <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#mainMenu" aria-expanded="false" aria-controls="mainMenu">
                                <i class="fas fa-bars"></i> Menü
                            </button>
                        </div>
                         <div class="collapse mb-3" id="mainMenu">
                            <div class="d-flex flex-column flex-md-row gap-2 justify-content-end">
                                <a href="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" class="btn btn-outline-primary">
                                    <i class="fas fa-home"></i> Ana Sayfa
                                </a>
                                <button class="btn btn-info" type="button" data-bs-toggle="collapse" data-bs-target="#wizardPanel" aria-expanded="false" aria-controls="wizardPanel">
                                    <i class="fas fa-magic"></i> Kullanım Kılavuzu
                                </button>
                                <a href="?view=raporlar" class="btn btn-warning">
                                    <i class="fas fa-file-alt"></i> Raporlar
                                </a>
                                <button class="btn btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#changePasswordPanel" aria-expanded="false" aria-controls="changePasswordPanel">
                                    <i class="fas fa-key"></i> Şifre Değiştir
                                </button>
                                <?php if (isAdmin()): ?>
                                    <a href="?view=admin" class="btn btn-danger">
                                        <i class="fas fa-user-shield"></i> Admin Paneli
                                    </a>
                                <?php endif; ?>
                                 <a href="?logout" class="btn btn-danger">
                                    <i class="fas fa-sign-out-alt"></i> Çıkış
                                </a>
                            </div>
                        </div>
                        <div class="collapse mb-3" id="wizardPanel">
                            <div class="card card-body">
                                <h5>Adım Adım Kullanım Kılavuzu</h5>
                                <h6>Adım 1: Hafta Seçimi</h6>
                                <p>Hafta seçim menüsünden mevcut haftalarınızı seçin veya yeni bir hafta oluşturun.</p>
                                <h6>Adım 2: Gün Seçimi ve Mesai Kaydı</h6>
                                <p>Seçili haftanın günleri butonlar halinde gösterilir. Bir güne tıklayarak o güne ait tarihi otomatik doldurun, ardından açıklama ve saat girerek "Kaydet" butonuna basın. Veri girilmiş günler daha sönük renkte görünecektir.</p>
                                <h6>Adım 3: Rapor Oluşturma</h6>
                                <p>Raporlar sayfasından istediğiniz tarih aralığı için rapor oluşturabilirsiniz.</p>
                                <button type="button" class="btn btn-secondary" data-bs-toggle="collapse" data-bs-target="#wizardPanel">Kapat</button>
                            </div>
                        </div>
                        <div class="collapse mb-3" id="changePasswordPanel">
                            <div class="card card-body">
                                <h5><i class="fas fa-key"></i> Şifre Değiştir</h5>
                                <form method="post">
                                    <div class="mb-2">
                                        <label class="form-label">Mevcut Şifre</label>
                                        <input type="password" name="current_password" class="form-control" required>
                                    </div>
                                    <div class="mb-2">
                                        <label class="form-label">Yeni Şifre</label>
                                        <input type="password" name="new_password" class="form-control" required>
                                    </div>
                                    <div class="mb-2">
                                        <label class="form-label">Yeni Şifre (Tekrar)</label>
                                        <input type="password" name="confirm_new_password" class="form-control" required>
                                    </div>
                                    <button type="submit" name="change_password" class="btn btn-warning w-100">
                                        <i class="fas fa-sync-alt"></i> Şifreyi Değiştir
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card mb-4">
                    <div class="card-header"><h5>Yeni Hafta Oluştur</h5></div>
                    <div class="card-body">
                        <form method="post">
                            <div class="row g-2 align-items-end">
                                <div class="col-md-5">
                                    <label class="form-label">Hafta Başlangıç Tarihi</label>
                                    <input type="date" name="hafta_baslangic" class="form-control" required>
                                </div>
                                <div class="col-md-5">
                                    <label class="form-label">Hafta Aralığı (Örn: 1-7 Şubat)</label>
                                    <input type="text" name="hafta_araligi" class="form-control" placeholder="Otomatik oluşur" readonly required>
                                </div>
                                <div class="col-md-2">
                                    <button type="submit" name="create_week" class="btn btn-success w-100">
                                        <i class="fas fa-calendar-plus"></i> Oluştur
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="card mb-4">
                    <div class="card-header"><h5>Hafta Seçimi ve Mesai Kaydı</h5></div>
                    <div class="card-body">
                        <div class="row g-2 mb-3 align-items-end">
                            <div class="col-md-4">
                                <form method="get" id="yearSelectForm">
                                    <label class="form-label">Yıl Seçimi</label>
                                    <select name="year" class="form-select" onchange="document.getElementById('yearSelectForm').submit()">
                                        <?php 
                                        $uniqueYears = [];
                                        if (!empty($yearOptions)) {
                                            foreach ($yearOptions as $yearOption) $uniqueYears[] = $yearOption['yil'];
                                        }
                                        if (!in_array(date("Y"), $uniqueYears)) $uniqueYears[] = date("Y");
                                        rsort($uniqueYears);
                                        if (empty($uniqueYears)) { // Should not happen if current year is added
                                            echo '<option value="' . date("Y") . '">' . date("Y") . '</option>';
                                        } else {
                                            foreach ($uniqueYears as $yil) {
                                                $selected_attr = ($selectedYear == $yil) ? 'selected' : '';
                                                echo '<option value="' . htmlspecialchars($yil) . '" ' . $selected_attr . '>' . htmlspecialchars($yil) . '</option>';
                                            }
                                        }
                                        ?>
                                    </select>
                                </form>
                            </div>
                            <div class="col-md-8">
                                <?php if (!empty($allWeeks)): ?>
                                    <label class="form-label">Hafta Seçimi</label>
                                    <div class="dropdown">
                                        <button class="btn btn-primary dropdown-toggle w-100" type="button" id="weekDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                            <?php 
                                                if (isset($currentWeek)) {
                                                    echo htmlspecialchars($currentWeek['hafta_araligi']);
                                                    if (!empty($currentWeek['calisan_adi'])) {
                                                        echo ' ' . htmlspecialchars($currentWeek['calisan_adi']);
                                                    }
                                                } else {
                                                    echo "Hafta Seç";
                                                }
                                            ?>
                                        </button>
                                        <ul class="dropdown-menu" aria-labelledby="weekDropdown">
                                            <?php foreach ($allWeeks as $week): ?>
                                                <li>
                                                    <a class="dropdown-item <?php echo (isset($_SESSION['current_week']) && $_SESSION['current_week'] == $week['id']) ? 'active-week' : ''; ?>" href="?select_week=<?php echo htmlspecialchars($week['id']); ?>&year=<?php echo $selectedYear; ?>">
                                                        <?php 
                                                            echo htmlspecialchars($week['hafta_araligi']);
                                                            if (!empty($week['calisan_adi'])) {
                                                                echo ' ' . htmlspecialchars($week['calisan_adi']);
                                                            }
                                                        ?>
                                                    </a>
                                                </li>
                                            <?php endforeach; ?>
                                        </ul>
                                    </div>
                                <?php elseif(checkLogin()): ?>
                                     <label class="form-label">Hafta Seçimi</label>
                                    <p class="text-muted">Bu yıl için oluşturulmuş hafta bulunmamaktadır. Lütfen yukarıdan yeni bir hafta oluşturun.</p>
                                <?php endif; ?>
                            </div>
                        </div>
                        <?php if ($currentWeek): ?>
                            <div class="mb-3">
                                <label class="form-label">Gün Seçerek Veri Girişi Yapın:</label>
                                <div class="d-flex flex-wrap gap-2" id="dayButtonContainer">
                                    <?php
                                        $startDate = new DateTime($currentWeek['hafta_baslangic']);
                                        $mesai_dates = array_column($mesaiKayitlari, 'tarih');
                                        for ($i = 0; $i < 7; $i++) {
                                            $currentDay = clone $startDate;
                                            $currentDay->modify("+$i days");
                                            $formatted_date_value = $currentDay->format('Y-m-d');
                                            $display_kisa_gun = getKisaGun($formatted_date_value); // Yeni fonksiyonla kısaltma al
                                            $display_pazar_info = isPazar($formatted_date_value); // Gets (Pazar) or empty
                                            // Pazar ise (Pazar) metnini kaldır
                                            if ($display_pazar_info === ' (Pazar)') {
                                                $display_pazar_info = '';
                                            }
                                            $formatted_date_display = $display_kisa_gun . ' ' . formatTarih($formatted_date_value) . $display_pazar_info;
                                            $is_entered = in_array($formatted_date_value, $mesai_dates);
                                            $btn_class = $is_entered ? 'kayitli-gun' : 'btn-outline-primary';
                                            // Hafta sonu kontrolü (Pazar = 0, Cumartesi = 6)
                                            $gun_numarasi = $currentDay->format('w');
                                            if ($gun_numarasi == 0 || $gun_numarasi == 6) {
                                                $btn_class .= ' weekend'; // Hafta sonu sınıfını ekle
                                            }
                                            echo '<button type="button" class="btn ' . $btn_class . ' day-selector-btn" data-date="' . htmlspecialchars($formatted_date_value) . '">' . htmlspecialchars($formatted_date_display) . '</button>';
                                        }
                                    ?>
                                </div>
                            </div>
                            <form method="post" class="row g-2">
                                <div class="col-md-3">
                                    <label class="form-label">Tarih</label>
                                    <input type="date" name="tarih" id="mesaiTarihInput" class="form-control" required value="<?php echo htmlspecialchars($currentWeek['hafta_baslangic']); ?>">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Açıklama</label>
                                    <input type="text" name="aciklama" id="mesaiAciklamaInput" class="form-control" required placeholder="Yapılan iş...">
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Saat</label>
                                    <input type="number" step="0.1" name="saat" class="form-control" placeholder="Örn: 8 veya 2.5">
                                </div>
                                <div class="col-12">
                                    <div class="form-check">
                                        <input type="checkbox" name="is_resmi_tatil" class="form-check-input" id="isResmiTatil">
                                        <label class="form-check-label" for="isResmiTatil">Resmi Tatil Mesaisi</label>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <button type="submit" name="submit" class="btn btn-primary">
                                        <i class="fas fa-plus"></i> Kaydet
                                    </button>
                                </div>
                            </form>
                        <?php endif; ?>
                    </div>
                </div>
                <?php if ($currentWeek && !empty($mesaiKayitlari)): ?>
                    <div class="card mb-4">
                        <div class="card-body">
                            <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                                <h3 class="mb-2 mb-md-0">
                                    <?php 
                                        echo htmlspecialchars($currentWeek['hafta_araligi']);
                                        if (!empty($currentWeek['calisan_adi'])) {
                                            echo ' ' . htmlspecialchars($currentWeek['calisan_adi']);
                                        }
                                    ?> 
                                    Mesai Kayıtları
                                </h3>
                                <div class="dropdown">
                                    <button class="btn btn-secondary dropdown-toggle" type="button" id="actionsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="fas fa-cog"></i> İşlemler
                                    </button>
                                    <ul class="dropdown-menu" aria-labelledby="actionsDropdown">
                                        <li>
                                            <button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#editWeekModal">
                                                <i class="fas fa-edit"></i> Haftayı Düzenle
                                            </button>
                                        </li>
                                        <li>
                                            <a class="dropdown-item text-danger" href="?confirm_delete_week=<?php echo htmlspecialchars($currentWeek['id']); ?>&year=<?php echo $selectedYear; ?>">
                                                <i class="fas fa-trash"></i> Haftayı Sil
                                            </a>
                                        </li>
                                        <li>
                                            <button id="toggleEditButton" class="dropdown-item" type="button" onclick="toggleEditButtons()">
                                                <i class="fas fa-edit"></i> Günleri Düzenle
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Tarih</th>
                                            <th>Açıklama</th>
                                            <th>Saat</th>
                                            <th class="edit-header">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($mesaiKayitlari as $item): ?>
                                            <tr class="<?php echo $item['is_resmi_tatil'] ? 'resmi-tatil' : (isPazarBool($item['tarih']) ? 'pazar' : ''); ?> <?php echo ((float)$item['saat'] > 0 || ($item['saat'] === '0' && (isPazarBool($item['tarih']) || $item['is_resmi_tatil'])) ) ? 'soluk' : ''; ?>">
                                                <td><?php echo htmlspecialchars(formatTarih($item['tarih']) . isPazar($item['tarih'])); ?></td>
                                                <td><?php echo htmlspecialchars($item['aciklama'] . ($item['is_resmi_tatil'] ? ' (Resmi Tatil Mesaisi)' : '')); ?></td>
                                                <td><?php echo ((float)$item['saat'] > 0 || ($item['saat'] === '0' && (isPazarBool($item['tarih']) || $item['is_resmi_tatil'])) ) ? htmlspecialchars($item['saat']) . ' saat' : ''; ?></td>
                                                <td class="edit-buttons">
                                                    <button type="button" class="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#editModal<?php echo htmlspecialchars($item['id']); ?>">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <a href="?confirm_delete=<?php echo htmlspecialchars($item['id']); ?>&year=<?php echo $selectedYear; ?>" class="btn btn-sm btn-danger">
                                                        <i class="fas fa-trash"></i>
                                                    </a>
                                                </td>
                                            </tr>
                                            <div class="modal fade" id="editModal<?php echo htmlspecialchars($item['id']); ?>" tabindex="-1">
                                                <div class="modal-dialog">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h5 class="modal-title">Kayıt Düzenle</h5>
                                                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                                        </div>
                                                        <form method="post">
                                                            <div class="modal-body">
                                                                <input type="hidden" name="id" value="<?php echo htmlspecialchars($item['id']); ?>">
                                                                <div class="mb-2">
                                                                    <label class="form-label">Tarih</label>
                                                                    <input type="date" name="tarih" class="form-control" value="<?php echo htmlspecialchars($item['tarih']); ?>" required>
                                                                </div>
                                                                <div class="mb-2">
                                                                    <label class="form-label">Açıklama</label>
                                                                    <input type="text" name="aciklama" class="form-control" value="<?php echo htmlspecialchars($item['aciklama']); ?>" required>
                                                                </div>
                                                                <div class="mb-2">
                                                                    <label class="form-label">Saat</label>
                                                                    <input type="number" step="0.1" name="saat" class="form-control" value="<?php echo htmlspecialchars($item['saat']); ?>">
                                                                </div>
                                                                <div class="form-check">
                                                                    <input type="checkbox" name="is_resmi_tatil" class="form-check-input" id="isResmiTatilEdit<?php echo htmlspecialchars($item['id']); ?>" <?php echo $item['is_resmi_tatil'] ? 'checked' : ''; ?>>
                                                                    <label class="form-check-label" for="isResmiTatilEdit<?php echo htmlspecialchars($item['id']); ?>">Resmi Tatil Mesaisi</label>
                                                                </div>
                                                            </div>
                                                            <div class="modal-footer">
                                                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                                                                <button type="submit" name="edit" class="btn btn-primary">Kaydet</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        <?php endforeach; ?>
                                    </tbody>
                                    <tfoot>
                                        <tr class="table-primary">
                                            <td colspan="2"><strong>Toplam Mesai</strong></td>
                                            <td colspan="2"><strong><?php echo htmlspecialchars($toplam_saat); ?> saat</strong></td>
                                        </tr>
                                        <tr class="table-warning">
                                            <td colspan="2"><strong>Pazar Mesai Sayısı</strong></td>
                                            <td colspan="2"><strong><?php echo htmlspecialchars($pazar_sayisi); ?> adet</strong></td>
                                        </tr>
                                        <?php if ($resmi_tatil_sayisi > 0): ?>
                                        <tr class="table-info">
                                            <td colspan="2"><strong>Resmi Tatil Mesaisi Sayısı</strong></td>
                                            <td colspan="2"><strong><?php echo htmlspecialchars($resmi_tatil_sayisi); ?> adet</strong></td>
                                        </tr>
                                        <?php endif; ?>
                                    </tfoot>
                                </table>
                            </div>
                            <a href="?view=raporlar" class="btn btn-warning mt-3">
                                <i class="fas fa-file-alt"></i> Raporlar
                            </a>
                        </div>
                    </div>
                <?php elseif ($currentWeek): ?>
                     <div class="card mb-4">
                        <div class="card-body">
                             <p class="text-muted">Bu hafta için henüz mesai kaydı bulunmamaktadır. Yukarıdaki formdan veya gün butonlarını kullanarak ekleyebilirsiniz.</p>
                        </div>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        <?php endif; ?>
    </div>
    <?php if ($currentWeek && checkLogin() && !(isset($_GET['view']) && $_GET['view'] === 'admin') && !(isset($_GET['view']) && $_GET['view'] === 'raporlar') ): ?>
    <div class="modal fade" id="editWeekModal" tabindex="-1" aria-labelledby="editWeekModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <form method="post">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editWeekModalLabel">Hafta Düzenle</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Kapat"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" name="week_id" value="<?php echo htmlspecialchars($currentWeek['id']); ?>">
                        <div class="mb-3">
                            <label class="form-label">Hafta Başlangıç Tarihi</label>
                            <input type="date" name="hafta_baslangic" class="form-control edit-week-start-date" value="<?php echo htmlspecialchars($currentWeek['hafta_baslangic']); ?>" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Hafta Aralığı</label>
                            <input type="text" name="hafta_araligi" class="form-control edit-week-interval" value="<?php echo htmlspecialchars($currentWeek['hafta_araligi']); ?>" readonly required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">İptal</button>
                        <button type="submit" name="edit_week" class="btn btn-primary">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <?php endif; ?>
    <footer>
        © <?php echo date("Y"); ?> İlhan Akdeniz - Tüm Hakları Saklıdır.
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function copyToClipboard(text) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(function() {
                    alert('Rapor kopyalandı!');
                }, function(err) {
                    alert('Kopyalama başarısız: ' + err);
                });
            } else {
                var textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    alert('Rapor kopyalandı!');
                } catch (err) {
                    alert('Kopyalama başarısız: ' + err);
                }
                document.body.removeChild(textarea);
            }
        }
        function toggleEditButtons() {
            var buttons = document.querySelectorAll('.edit-buttons');
            var header = document.querySelector('.edit-header');
            var toggleButton = document.getElementById('toggleEditButton');
            var isHidden = buttons.length > 0 && (buttons[0].style.display === 'none' || buttons[0].style.display === '');
            buttons.forEach(function(button) {
                button.style.display = isHidden ? 'table-cell' : 'none';
            });
            if(header) header.style.display = isHidden ? 'table-cell' : 'none';
            if(toggleButton) {
                toggleButton.innerHTML = isHidden ? '<i class="fas fa-times"></i> Düzenlemeyi Kapat' : '<i class="fas fa-edit"></i> Günleri Düzenle';
            }
        }
        function updateWeekInterval(startDateInput, intervalInput) {
            var startDateStr = startDateInput.value;
            if (startDateStr) {
                var startDate = new Date(startDateStr);
                startDate.setDate(startDate.getDate()); // Adjust for timezone issues if any by ensuring it's local
                var endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
                var startDay = startDate.getDate();
                var endDay = endDate.getDate();
                var months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
                var startMonthName = months[startDate.getMonth()];
                var endMonthName = months[endDate.getMonth()];
                var weekInterval = startDate.getMonth() === endDate.getMonth() ?
                    startDay + "-" + endDay + " " + startMonthName :
                    startDay + " " + startMonthName + " - " + endDay + " " + endMonthName;
                intervalInput.value = weekInterval;
            } else {
                intervalInput.value = "Otomatik oluşur";
            }
        }
        document.addEventListener('DOMContentLoaded', function() {
            // For new week creation form
            var newWeekStartDateInput = document.querySelector('input[name="hafta_baslangic"]');
            var newWeekIntervalInput = document.querySelector('input[name="hafta_araligi"]');
            if (newWeekStartDateInput && newWeekIntervalInput) {
                newWeekStartDateInput.addEventListener('change', function() {
                    updateWeekInterval(this, newWeekIntervalInput);
                });
                // Initialize if a value is already there (e.g. after form error)
                if(newWeekStartDateInput.value) updateWeekInterval(newWeekStartDateInput, newWeekIntervalInput);
            }
            // For edit week modal
            var editWeekModal = document.getElementById('editWeekModal');
            if (editWeekModal) {
                var editWeekStartDateInput = editWeekModal.querySelector('.edit-week-start-date');
                var editWeekIntervalInput = editWeekModal.querySelector('.edit-week-interval');
                if (editWeekStartDateInput && editWeekIntervalInput) {
                    editWeekStartDateInput.addEventListener('change', function() {
                        updateWeekInterval(this, editWeekIntervalInput);
                    });
                }
            }
            var userSearchInput = document.getElementById("userSearch");
            if(userSearchInput) {
                userSearchInput.addEventListener("keyup", function() {
                    var filter = this.value.toLowerCase();
                    var rows = document.querySelectorAll("#userTable tbody tr");
                    rows.forEach(function(row) {
                        var text = row.textContent.toLowerCase();
                        row.style.display = text.indexOf(filter) > -1 ? "" : "none";
                    });
                });
            }
            var userReportSearchInput = document.getElementById("userReportSearch");
            if(userReportSearchInput) {
                userReportSearchInput.addEventListener("keyup", function() {
                    var filter = this.value.toLowerCase();
                    var select = document.getElementById("userReportSelect");
                    if (select) {
                        for (var i = 0; i < select.options.length; i++) {
                            var txt = select.options[i].text.toLowerCase();
                            select.options[i].style.display = txt.indexOf(filter) > -1 ? "" : "none";
                        }
                    }
                });
            }
            // Day selector buttons functionality
            const dayButtons = document.querySelectorAll('.day-selector-btn');
            const tarihInput = document.getElementById('mesaiTarihInput');
            const aciklamaInput = document.getElementById('mesaiAciklamaInput');
            if (tarihInput) { 
                dayButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const selectedDate = this.getAttribute('data-date');
                        tarihInput.value = selectedDate;
                        dayButtons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');
                        if (aciklamaInput) {
                            aciklamaInput.focus();
                        }
                    });
                });
                // Set initial active button based on the date input's current value
                if (tarihInput.value && dayButtons.length > 0) {
                    let foundActive = false;
                    dayButtons.forEach(button => {
                        if (button.getAttribute('data-date') === tarihInput.value) {
                            button.classList.add('active');
                            foundActive = true;
                        }
                    });
                     // If no button matches the input (e.g. form error with old date), make the first button active if not already
                    if (!foundActive && !dayButtons[0].classList.contains('kayitli-gun')) {
                       // This might be too aggressive. Let's rely on default value of tarihInput.
                       // If tarihInput has default value (e.g. start of week), its button should be active.
                    }
                } else if (dayButtons.length > 0 && !dayButtons[0].classList.contains('kayitli-gun')) {
                    // If no date is set and first button is not 'entered', make it active and set date
                    // This case is less likely given the default value in PHP
                    // dayButtons[0].classList.add('active');
                    // tarihInput.value = dayButtons[0].getAttribute('data-date');
                }
            }
            var footer = document.querySelector('footer');
            if (footer) {
                setTimeout(function() {
                    footer.style.display = 'none';
                }, 10000);
            }
        });
    </script>
</body>
</html>