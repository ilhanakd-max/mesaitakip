/**
 * Mesai Takip Sistemi - Google Apps Script Backend
 * Bu script Google Sheets dosyasina bagli olarak calisir.
 */

var SPREADSHEET_ID = 'LUTFEN_BURAYA_SPREADSHEET_ID_YAZIN'; // Kurulum sirasinda guncellenecek

function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Basliklari olustur
    if (name === 'kullanicilar') {
      sheet.appendRow(['id', 'username', 'password', 'adsoyad', 'created_at', 'is_banned', 'is_admin']);
    } else if (name === 'haftalar') {
      sheet.appendRow(['id', 'hafta_baslangic', 'hafta_araligi', 'calisan_adi', 'user_id', 'created_at']);
    } else if (name === 'mesai_kayitlari') {
      sheet.appendRow(['id', 'hafta_id', 'tarih', 'aciklama', 'saat', 'is_resmi_tatil', 'created_at', 'treat_as_normal']);
    }
  }
  return sheet;
}

function getData(sheetName) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data.shift();
  return data.map(function(row) {
    var obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function doGet(e) {
  var action = e.parameter.action;
  var response = {};

  try {
    if (action === 'getWeeks') {
      var userId = e.parameter.userId;
      var year = e.parameter.year;
      var allWeeks = getData('haftalar');
      response.weeks = allWeeks.filter(function(w) {
        var date = new Date(w.hafta_baslangic);
        return w.user_id == userId && (year ? date.getFullYear() == year : true);
      }).sort(function(a, b) { return new Date(b.hafta_baslangic) - new Date(a.hafta_baslangic); });

      var years = [];
      allWeeks.forEach(function(w) {
        if (w.user_id == userId) {
          var y = new Date(w.hafta_baslangic).getFullYear();
          if (years.indexOf(y) === -1) years.push(y);
        }
      });
      response.years = years.sort(function(a, b) { return b - a; });
    }
    else if (action === 'getRecords') {
      var haftaId = e.parameter.haftaId;
      var allRecords = getData('mesai_kayitlari');
      response.records = allRecords.filter(function(r) {
        return r.hafta_id == haftaId;
      }).sort(function(a, b) { return new Date(a.tarih) - new Date(b.tarih); });
    }
    else if (action === 'getUsers') {
      // Admin kontrolu frontend tarafindan yapilmali ama burada da userId gonderilebilir
      response.users = getData('kullanicilar').map(function(u) {
        delete u.password; // Guvenlik icin
        return u;
      });
    }
    else if (action === 'generateReport') {
      response.reportText = handleReportGeneration(e.parameter);
    }

    return ContentService.createTextOutput(JSON.stringify({status: 'success', data: response}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var postData = JSON.parse(e.postData.contents);
  var action = postData.action;
  var response = {};

  try {
    if (action === 'login') {
      var users = getData('kullanicilar');
      var user = users.find(function(u) {
        return u.username === postData.username && u.password === postData.password; // Basit eslesme, gelistirilip hash eklenebilir
      });
      if (user) {
        if (user.is_banned == 1) {
          response = {status: 'error', message: 'Bu hesap banlanmistir!'};
        } else {
          delete user.password;
          response = {status: 'success', data: user};
        }
      } else {
        response = {status: 'error', message: 'Hatali kullanici adi veya sifre!'};
      }
    }
    else if (action === 'register') {
      var users = getData('kullanicilar');
      if (users.some(function(u) { return u.username === postData.username; })) {
        response = {status: 'error', message: 'Bu kullanici adi zaten kullaniliyor!'};
      } else {
        var sheet = getSheet('kullanicilar');
        var newId = users.length > 0 ? Math.max.apply(Math, users.map(function(u) { return u.id; })) + 1 : 1;
        var newUser = [newId, postData.username, postData.password, postData.adsoyad, new Date(), 0, 0];
        sheet.appendRow(newUser);
        response = {status: 'success', data: {id: newId, username: postData.username, adsoyad: postData.adsoyad, is_admin: 0}};
      }
    }
    else if (action === 'createWeek') {
      var sheet = getSheet('haftalar');
      var weeks = getData('haftalar');
      var newId = weeks.length > 0 ? Math.max.apply(Math, weeks.map(function(w) { return w.id; })) + 1 : 1;
      sheet.appendRow([newId, postData.hafta_baslangic, postData.hafta_araligi, postData.adsoyad, postData.userId, new Date()]);
      response = {status: 'success', data: {id: newId}};
    }
    else if (action === 'deleteWeek') {
      deleteRowsByColumn('haftalar', 'id', postData.weekId);
      deleteRowsByColumn('mesai_kayitlari', 'hafta_id', postData.weekId);
      response = {status: 'success'};
    }
    else if (action === 'editWeek') {
      updateRow('haftalar', postData.id, {
        hafta_baslangic: postData.hafta_baslangic,
        hafta_araligi: postData.hafta_araligi
      });
      response = {status: 'success'};
    }
    else if (action === 'saveRecord') {
      var sheet = getSheet('mesai_kayitlari');
      var records = getData('mesai_kayitlari');

      // Tarih kontrolu
      if (records.some(function(r) { return r.hafta_id == postData.hafta_id && formatDateISO(r.tarih) === postData.tarih; })) {
         return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Bu tarih icin kayit zaten mevcut!'}))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var newId = records.length > 0 ? Math.max.apply(Math, records.map(function(r) { return r.id; })) + 1 : 1;
      sheet.appendRow([newId, postData.hafta_id, postData.tarih, postData.aciklama, postData.saat, postData.is_resmi_tatil ? 1 : 0, new Date(), postData.treat_as_normal ? 1 : 0]);
      response = {status: 'success'};
    }
    else if (action === 'editRecord') {
      updateRow('mesai_kayitlari', postData.id, {
        tarih: postData.tarih,
        aciklama: postData.aciklama,
        saat: postData.saat,
        is_resmi_tatil: postData.is_resmi_tatil ? 1 : 0,
        treat_as_normal: postData.treat_as_normal ? 1 : 0
      });
      response = {status: 'success'};
    }
    else if (action === 'deleteRecord') {
      deleteRowsByColumn('mesai_kayitlari', 'id', postData.recordId);
      response = {status: 'success'};
    }
    else if (action === 'adminUpdateUser') {
      var updateData = {
        username: postData.new_username,
        adsoyad: postData.new_adsoyad
      };
      if (postData.new_password) updateData.password = postData.new_password;
      updateRow('kullanicilar', postData.user_id, updateData);
      response = {status: 'success'};
    }
    else if (action === 'toggleBan') {
      var user = getData('kullanicilar').find(function(u) { return u.id == postData.user_id; });
      updateRow('kullanicilar', postData.user_id, {is_banned: user.is_banned == 1 ? 0 : 1});
      response = {status: 'success'};
    }
    else if (action === 'toggleAdmin') {
      var user = getData('kullanicilar').find(function(u) { return u.id == postData.user_id; });
      updateRow('kullanicilar', postData.user_id, {is_admin: user.is_admin == 1 ? 0 : 1});
      response = {status: 'success'};
    }
    else if (action === 'deleteUser') {
       deleteRowsByColumn('kullanicilar', 'id', postData.user_id);
       // Haftalarini ve kayitlarini da silmek gerekebilir (PHP'de oyleydi)
       var weeks = getData('haftalar').filter(function(w) { return w.user_id == postData.user_id; });
       weeks.forEach(function(w) {
         deleteRowsByColumn('mesai_kayitlari', 'hafta_id', w.id);
       });
       deleteRowsByColumn('haftalar', 'user_id', postData.user_id);
       response = {status: 'success'};
    }
    else if (action === 'changePassword') {
       var user = getData('kullanicilar').find(function(u) { return u.id == postData.userId; });
       if (user.password === postData.currentPassword) {
         updateRow('kullanicilar', postData.userId, {password: postData.newPassword});
         response = {status: 'success'};
       } else {
         response = {status: 'error', message: 'Mevcut sifreniz yanlis!'};
       }
    }

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Yardımcı Fonksiyonlar

function deleteRowsByColumn(sheetName, columnName, value) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var colIndex = headers.indexOf(columnName);

  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][colIndex] == value) {
      sheet.deleteRow(i + 1);
    }
  }
}

function updateRow(sheetName, id, updateObj) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idIndex = headers.indexOf('id');

  for (var i = 1; i < data.length; i++) {
    if (data[i][idIndex] == id) {
      for (var key in updateObj) {
        var colIndex = headers.indexOf(key);
        if (colIndex > -1) {
          sheet.getRange(i + 1, colIndex + 1).setValue(updateObj[key]);
        }
      }
      break;
    }
  }
}

function formatDateISO(date) {
  if (!date) return '';
  var d = new Date(date);
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}

function formatTarihTR(date) {
  var aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  var d = new Date(date);
  return d.getDate() + ' ' + aylar[d.getMonth()];
}

function isPazar(date, treat_as_normal) {
  if (treat_as_normal == 1) return '';
  var d = new Date(date);
  return d.getDay() === 0 ? ' (Pazar)' : '';
}

function handleReportGeneration(params) {
  var reportType = params.reportType;
  var allRecords = getData('mesai_kayitlari');
  var allWeeks = getData('haftalar');
  var reportText = "";

  if (reportType === 'week') {
    var week = allWeeks.find(function(w) { return w.id == params.weekId; });
    var records = allRecords.filter(function(r) { return r.hafta_id == params.weekId; })
                            .sort(function(a, b) { return new Date(a.tarih) - new Date(b.tarih); });

    if (week && records.length > 0) {
      reportText += week.hafta_araligi + " " + (week.calisan_adi || "") + " - Planlanan Mesailer\n";
      var totalHours = 0, pazarCount = 0, tatilCount = 0;
      records.forEach(function(r) {
        var pazarText = isPazar(r.tarih, r.treat_as_normal);
        var tatilText = r.is_resmi_tatil == 1 ? ' (Resmi Tatil Mesaisi)' : '';
        var saatText = (r.saat > 0 || (r.saat == 0 && (pazarText || tatilText))) ? r.saat + " saat" : "";
        reportText += formatTarihTR(r.tarih) + pazarText + " (" + r.aciklama + tatilText + ") " + saatText + "\n";
        totalHours += parseFloat(r.saat);
        if (new Date(r.tarih).getDay() === 0 && r.treat_as_normal != 1) pazarCount++;
        if (r.is_resmi_tatil == 1) tatilCount++;
      });
      reportText += "\nToplam Mesai Saati: " + totalHours;
      reportText += "\nPazar Mesai Sayısı: " + pazarCount;
      if (tatilCount > 0) reportText += "\nResmi Tatil Mesaisi Sayısı: " + tatilCount;
    }
  }
  else if (reportType === 'dateRange') {
    var start = new Date(params.startDate);
    var end = new Date(params.endDate);
    var userId = params.userId;

    var userWeeks = allWeeks.filter(function(w) { return w.user_id == userId; });
    var weekIds = userWeeks.map(function(w) { return w.id; });

    var records = allRecords.filter(function(r) {
      var d = new Date(r.tarih);
      return weekIds.indexOf(r.hafta_id) > -1 && d >= start && d <= end;
    }).sort(function(a, b) { return new Date(a.tarih) - new Date(b.tarih); });

    if (records.length > 0) {
       reportText += formatTarihTR(start) + " - " + formatTarihTR(end) + " " + (userWeeks[0].calisan_adi || "") + " - Mesai Raporu\n";
       var totalHours = 0, pazarCount = 0, tatilCount = 0;
       records.forEach(function(r) {
          var pazarText = isPazar(r.tarih, r.treat_as_normal);
          var tatilText = r.is_resmi_tatil == 1 ? ' (Resmi Tatil Mesaisi)' : '';
          var saatText = (r.saat > 0 || (r.saat == 0 && (pazarText || tatilText))) ? r.saat + " saat" : "";
          reportText += formatTarihTR(r.tarih) + pazarText + " (" + r.aciklama + tatilText + ") " + saatText + "\n";
          totalHours += parseFloat(r.saat);
          if (new Date(r.tarih).getDay() === 0 && r.treat_as_normal != 1) pazarCount++;
          if (r.is_resmi_tatil == 1) tatilCount++;
       });
       reportText += "\nToplam Mesai Saati: " + totalHours;
       reportText += "\nPazar Mesai Sayısı: " + pazarCount;
       if (tatilCount > 0) reportText += "\nResmi Tatil Mesaisi Sayısı: " + tatilCount;
    }
  }
  else if (reportType === 'adminAll') {
    var start = new Date(params.startDate);
    var end = new Date(params.endDate);

    var records = allRecords.filter(function(r) {
      var d = new Date(r.tarih);
      return d >= start && d <= end;
    }).sort(function(a, b) {
       var weekA = allWeeks.find(function(w){return w.id == a.hafta_id;});
       var weekB = allWeeks.find(function(w){return w.id == b.hafta_id;});
       if (weekA.calisan_adi < weekB.calisan_adi) return -1;
       if (weekA.calisan_adi > weekB.calisan_adi) return 1;
       return new Date(a.tarih) - new Date(b.tarih);
    });

    if (records.length > 0) {
       reportText += "Tüm Kullanıcılar Mesai Raporu: " + formatTarihTR(start) + " - " + formatTarihTR(end) + "\n";
       var currentName = "";
       var tHours = 0, tPazar = 0, tTatil = 0;

       records.forEach(function(r) {
         var week = allWeeks.find(function(w){return w.id == r.hafta_id;});
         if (currentName !== week.calisan_adi) {
           if (currentName !== "") {
             reportText += "\nKullanıcı Toplam Mesai Saati: " + tHours + " saat, Pazar Mesai Sayısı: " + tPazar;
             if (tTatil > 0) reportText += ", Resmi Tatil Mesaisi Sayısı: " + tTatil;
             reportText += "\n";
           }
           currentName = week.calisan_adi;
           tHours = 0; tPazar = 0; tTatil = 0;
           reportText += "Kullanıcı: " + currentName + "\n";
         }
         var pazarText = isPazar(r.tarih, r.treat_as_normal);
         var tatilText = r.is_resmi_tatil == 1 ? ' (Resmi Tatil Mesaisi)' : '';
         var saatText = (r.saat > 0 || (r.saat == 0 && (pazarText || tatilText))) ? r.saat + " saat" : "";
         reportText += formatTarihTR(r.tarih) + pazarText + " (" + r.aciklama + tatilText + ") " + saatText + " - " + week.hafta_araligi + "\n";
         tHours += parseFloat(r.saat);
         if (new Date(r.tarih).getDay() === 0 && r.treat_as_normal != 1) tPazar++;
         if (r.is_resmi_tatil == 1) tTatil++;
       });
       reportText += "\nKullanıcı Toplam Mesai Saati: " + tHours + " saat, Pazar Mesai Sayısı: " + tPazar;
       if (tTatil > 0) reportText += ", Resmi Tatil Mesaisi Sayısı: " + tTatil;
    }
  }

  return reportText;
}
