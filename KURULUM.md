# Mesai Takip Sistemi Kurulum Rehberi

Bu uygulama PHP tabanlı bir sistemden, Google Sheets veritabanı kullanan modern bir HTML/JS uygulamasına dönüştürülmüştür. Kurulum adımlarını sırasıyla takip ederek uygulamayı kullanıma hazır hale getirebilirsiniz.

## 1. Veritabanını Hazırlama (Google Sheets)

1. Proje klasöründeki `mesaitakip_db.xlsx` dosyasını bilgisayarınıza indirin.
2. Google Drive hesabınızı açın ve bu `.xlsx` dosyasını Drive'a yükleyin.
3. Yüklediğiniz dosyaya sağ tıklayıp **Birlikte Aç > Google E-Tablolar** seçeneğini seçin.
4. Açılan e-tabloda **Dosya > Google E-Tablo olarak kaydet** diyerek dosyayı Google Sheet formatına dönüştürün (**ÇOK ÖNEMLİ:** Drive'ınızda birisi .xlsx diğeri Google Sheet ikonu olan iki dosya olmalı. Uygulama Google Sheet olanla çalışır).
5. Bu Google Sheet'in (XLSX olan değil!) URL'sindeki ID kısmını kopyalayın (Örn: `https://docs.google.com/spreadsheets/d/ID_BURADA/edit` kısmındaki `ID_BURADA`).

## 2. Backend Scriptini Hazırlama (Google Apps Script)

1. Google Sheets dosyanız açıkken **Uzantılar > Apps Script** menüsüne tıklayın.
2. Projedeki `backend.gs` dosyasının içeriğini kopyalayın ve Apps Script editöründeki `Kod.gs` içeriğini silip buraya yapıştırın.
3. Dosyanın en başındaki `SPREADSHEET_ID` değişkenine kopyaladığınız ID'yi yapıştırın (İsteğe bağlı, `SpreadsheetApp.getActiveSpreadsheet()` kullandığımız için boş da kalabilir).
4. Sağ üstteki **Dağıt (Deploy) > Yeni dağıtım** seçeneğine tıklayın.
5. Tür olarak **Web Uygulaması** seçin.
6. "Uygulamayı şu kişi olarak yürüt" kısmında **Ben** seçili olsun.
7. "Erişimi olanlar" kısmında **Herkes (Anyone)** seçeneğini seçin (Bu çok önemlidir).
8. **Dağıt** butonuna basın ve gerekli izinleri onaylayın.
9. Size verilen **Web Uygulaması URL'sini** kopyalayın.

## 3. Frontend Ayarları

1. Projedeki `index.html` dosyasını açın.
2. JavaScript kısmındaki `var API_URL = 'LUTFEN_BURAYA_WEB_APP_URL_YAZIN';` satırını bulun.
3. Tırnak işaretleri arasına Apps Script'ten kopyaladığınız URL'yi yapıştırın.
4. Dosyayı kaydedin.

## 4. Uygulamayı Kullanma

* `index.html` dosyasını herhangi bir web tarayıcısında açarak uygulamayı kullanmaya başlayabilirsiniz.
* Uygulama tamamen istemci taraflı (Client-side) çalışmaktadır ve tüm verileriniz Google Sheets dosyanızda güvenle saklanmaktadır.
* Mobil cihazlarınızdan erişmek için bu `index.html` dosyasını bir web sunucusuna (GitHub Pages, Netlify vb.) yükleyebilir veya doğrudan telefonunuza atıp tarayıcı ile açabilirsiniz.

## ÖNEMLİ NOTLAR - Veriler Neden Görünmüyor Olabilir?

1.  **XLSX vs Google Sheets:** Drive'a yüklediğiniz `.xlsx` dosyasını mutlaka "Google E-Tablo olarak kaydet" diyerek dönüştürmelisiniz. Uygulama ham `.xlsx` dosyasıyla konuşamaz.
2.  **Kullanıcı Eşleşmesi:** Veriler `user_id` sütununa göre filtrelenir. Eğer yeni bir kullanıcı açarsanız eski verileri göremezsiniz. Mevcut kullanıcılarla (örn: `djmaster`) giriş yapmalısınız.
3.  **Hafta Seçimi:** Giriş yaptığınızda veriler gelmiyorsa, sağ üstteki "Yıl Seçimi"nin doğru olduğundan emin olun.
4.  **Şifreler:** Orijinal veritabanındaki şifreler şifrelenmiş (hashed) haldedir. Bu yeni sistemde şifreler düz metin olarak karşılaştırılır. Eğer giriş yapamazsanız, Google Sheets'teki `kullanicilar` sekmesine gidip kendi satırınızdaki `password` kısmını manuel olarak istediğiniz bir şifreyle (örn: `123456`) değiştirip tekrar giriş yapmayı deneyin.

**Güvenlik Uyarısı:** Apps Script dağıtımını yaparken "Erişimi olanlar" kısmını **Herkes (Anyone)** seçtiğinizden emin olun, aksi takdirde uygulama veritabanına ulaşamaz.
