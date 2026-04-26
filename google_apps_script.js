const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

function doGet(e) {
  return ContentService.createTextOutput("Mesai Takip API is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  try {
    switch(action) {
      case 'login': return login(data);
      case 'register': return register(data);
      case 'getInitialData': return getInitialData(data);
      case 'getOvertime': return getOvertime(data);
      case 'saveOvertime': return saveOvertime(data);
      case 'createWeek': return createWeek(data);
      case 'updateEntry': return updateEntry(data);
      case 'deleteEntry': return deleteEntry(data);
      case 'getAdminData': return getAdminData(data);
      case 'changePassword': return changePassword(data);
      case 'deleteWeek': return deleteWeek(data);
      case 'getDateRangeReport': return getDateRangeReport(data);
      case 'toggleBan': return toggleBan(data);
      default: return error("Geçersiz işlem.");
    }
  } catch (err) {
    return error(err.toString());
  }
}

function error(msg) {
  return ContentService.createTextOutput(JSON.stringify({ error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(name);
}

function getRows(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function hashPassword(password) {
  var signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  var hexString = "";
  for (var i = 0; i < signature.length; i++) {
    var byte = signature[i];
    if (byte < 0) byte += 256;
    var byteStr = byte.toString(16);
    if (byteStr.length == 1) byteStr = "0" + byteStr;
    hexString += byteStr;
  }
  return hexString;
}

function login(data) {
  const users = getRows('kullanicilar');
  const user = users.find(u => u.username === data.username);
  if (user) {
    const hashedInput = hashPassword(data.password);
    if (user.password === hashedInput) {
      if (user.is_banned == 1) return error("Bu hesap banlanmıştır.");
      return json({ user: { id: user.id, username: user.username, adsoyad: user.adsoyad, is_admin: user.is_admin == 1 } });
    }
  }
  return error("Hatalı kullanıcı adı veya şifre.");
}

function register(data) {
  const sheet = getSheet('kullanicilar');
  const users = getRows('kullanicilar');
  if (users.some(u => u.username === data.username)) return error("Bu kullanıcı adı zaten kullanılıyor.");

  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const hashed = hashPassword(data.password);
  sheet.appendRow([newId, data.username, hashed, data.adsoyad, new Date(), 0, 0]);
  return json({ user: { id: newId, username: data.username, adsoyad: data.adsoyad, is_admin: false } });
}

function getInitialData(data) {
  const allWeeks = getRows('haftalar');
  const userWeeks = allWeeks.filter(w => w.user_id == data.user_id);
  return json({ weeks: userWeeks });
}

function getOvertime(data) {
  const allRecords = getRows('mesai_kayitlari');
  const records = allRecords.filter(r => r.hafta_id == data.week_id);
  return json({ records: records });
}

function saveOvertime(data) {
  const sheet = getSheet('mesai_kayitlari');
  const records = getRows('mesai_kayitlari');

  // Check if exists
  const existingIndex = records.findIndex(r => r.hafta_id == data.hafta_id && new Date(r.tarih).toISOString().split('T')[0] === data.tarih);

  if (existingIndex > -1) return error("Bu tarih için mesai verisi zaten girilmiş.");

  const newId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
  sheet.appendRow([
    newId,
    data.hafta_id,
    data.tarih,
    data.aciklama,
    data.saat || 0,
    data.is_resmi_tatil,
    new Date(),
    data.is_resmi_tatil,
    0,
    data.treat_as_normal
  ]);
  return json({ success: true });
}

function createWeek(data) {
  const sheet = getSheet('haftalar');
  const weeks = getRows('haftalar');
  const users = getRows('kullanicilar');
  const user = users.find(u => u.id == data.user_id);

  const newId = weeks.length > 0 ? Math.max(...weeks.map(w => w.id)) + 1 : 1;
  sheet.appendRow([newId, data.hafta_baslangic, data.hafta_araligi, user.adsoyad, data.user_id, new Date()]);
  return json({ success: true, id: newId });
}

function deleteEntry(data) {
  const sheet = getSheet('mesai_kayitlari');
  const dataRange = sheet.getDataRange().getValues();
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] == data.id) {
      sheet.deleteRow(i + 1);
      return json({ success: true });
    }
  }
  return error("Kayıt bulunamadı.");
}

function updateEntry(data) {
  const sheet = getSheet('mesai_kayitlari');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == data.id) {
      sheet.getRange(i + 1, 3, 1, 4).setValues([[
        data.tarih,
        data.aciklama,
        data.saat,
        data.is_resmi_tatil
      ]]);
      sheet.getRange(i + 1, 10).setValue(data.treat_as_normal);
      return json({ success: true });
    }
  }
  return error("Kayıt bulunamadı.");
}

function getAdminData(data) {
  const users = getRows('kullanicilar');
  return json({ users: users });
}

function deleteWeek(data) {
  const sheet = getSheet('haftalar');
  const mSheet = getSheet('mesai_kayitlari');

  // Delete records
  const mData = mSheet.getDataRange().getValues();
  for (let i = mData.length - 1; i >= 1; i--) {
    if (mData[i][1] == data.id) mSheet.deleteRow(i + 1);
  }

  // Delete week
  const wData = sheet.getDataRange().getValues();
  for (let i = 1; i < wData.length; i++) {
    if (wData[i][0] == data.id) {
      sheet.deleteRow(i + 1);
      return json({ success: true });
    }
  }
  return error("Hafta bulunamadı.");
}

function getDateRangeReport(data) {
  const allRecords = getRows('mesai_kayitlari');
  const allWeeks = getRows('haftalar');

  const userWeeks = allWeeks.filter(w => w.user_id == data.user_id).map(w => w.id);
  const records = allRecords.filter(r => {
    const d = new Date(r.tarih).toISOString().split('T')[0];
    return userWeeks.includes(r.hafta_id) && d >= data.start && d <= data.end;
  });

  return json({ records: records });
}

function toggleBan(data) {
  const sheet = getSheet('kullanicilar');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == data.id) {
      const newVal = rows[i][5] == 1 ? 0 : 1;
      sheet.getRange(i + 1, 6).setValue(newVal);
      return json({ success: true });
    }
  }
  return error("Kullanıcı bulunamadı.");
}

function changePassword(data) {
  const sheet = getSheet('kullanicilar');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == data.user_id) {
      const currentHashed = hashPassword(data.current_password);
      if (rows[i][2] != currentHashed) return error("Mevcut şifre yanlış.");
      const newHashed = hashPassword(data.new_password);
      sheet.getRange(i + 1, 3).setValue(newHashed);
      return json({ success: true });
    }
  }
  return error("Kullanıcı bulunamadı.");
}
