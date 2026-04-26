# Mesai Takip Sistemi Kurulum Rehberi

Bu uygulama PHP tabanlı bir sistemden, Google Sheets veritabanlı bir HTML/JavaScript uygulamasına dönüştürülmüştür.

## 1. Veritabanı Hazırlığı (Google Sheets)

1. Bilgisayarınızdaki `mesaitakip_db.xlsx` dosyasını Google Drive'a yükleyin.
2. Google Drive'da dosyaya sağ tıklayın ve "Google E-Tablolar ile aç" seçeneğini seçin.
3. Dosyanın "Google E-Tablo" formatında kaydedildiğinden emin olun (Dosya > Google E-Tablo olarak kaydet).
4. E-tablo açıldığında tarayıcı adres çubuğundaki ID'yi kopyalayın. ID, `https://docs.google.com/spreadsheets/d/` ve `/edit` arasındaki kısımdır.
   - Örn: `1abc1234567890QWERTYUIOPasdfghjkl`

## 2. Google Apps Script Kurulumu

1. Google E-tablo içinde **Uzantılar > Apps Script** menüsüne gidin.
2. Açılan pencereye projedeki `google_apps_script.js` dosyasının içeriğini kopyalayıp yapıştırın.
3. Kodun en üstündeki `SPREADSHEET_ID` değişkenine kopyaladığınız ID'yi yapıştırın:
   ```javascript
   const SPREADSHEET_ID = 'KOPYALADIGINIZ_ID';
   ```
4. Projeye bir isim verin (örn: "Mesai API").
5. Sağ üstteki **Dağıt > Yeni dağıtım** butonuna tıklayın.
6. Tür seçin: **Web uygulaması**.
7. Yapılandırma:
   - Açıklama: Mesai Takip API
   - Uygulamayı şu kişi olarak çalıştır: **Ben** (Sizin mailiniz)
   - Erişimi olan kişi: **Herkes** (Anyone)
8. **Dağıt** butonuna basın. Size bir "Web uygulaması URL'si" verecektir. Bunu kopyalayın.

## 3. Frontend Yapılandırması

1. Projedeki `index.html` dosyasını açın.
2. En alttaki `<script>` bloğunda `SCRIPT_URL` değişkenine kopyaladığınız Web Uygulaması URL'sini yapıştırın:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';
   ```
3. Dosyayı kaydedin.

## 4. Kullanım

Artık `index.html` dosyasını herhangi bir tarayıcıda açarak veya bir web sunucusuna yükleyerek kullanmaya başlayabilirsiniz.
- Giriş bilgileri e-tablonuzdaki `kullanicilar` sayfasında bulunmaktadır.
- Mobil uyumludur, telefonunuzdan da erişebilirsiniz.

## Önemli Notlar

1. **Şifre Uyumluluğu:** Eski PHP uygulamasında şifreler "Bcrypt" formatında saklanmaktaydı. Yeni sistemde güvenlik için "SHA-256" algoritması kullanılmaktadır. Bu nedenle Excel'den aktarılan mevcut kullanıcıların şifreleri ilk girişte hata verecektir.
   - **Çözüm:** Mevcut kullanıcıların şifrelerini Google E-tablo üzerinden manuel olarak temizleyebilir veya Admin panelinden yeni şifre belirleyebilirsiniz. Yeni kayıt olan kullanıcılar için herhangi bir sorun yaşanmayacaktır.
2. **Güvenlik:** Google Apps Script dağıtımını yaparken erişimi "Herkes" olarak ayarlamanız gerekir, ancak uygulama içindeki kullanıcı login sistemi verilerinize sadece yetkili kullanıcıların erişmesini sağlar.
