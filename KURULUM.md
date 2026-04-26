# Mesai Takip Sistemi Kurulum Rehberi

Bu uygulama PHP tabanlı bir sistemden, Google Sheets veritabanı kullanan modern bir HTML/JS uygulamasına dönüştürülmüştür. Kurulum adımlarını sırasıyla takip ederek uygulamayı kullanıma hazır hale getirebilirsiniz.

## 1. Veritabanını Hazırlama (Google Sheets)

1. Proje klasöründeki `mesaitakip_db.xlsx` dosyasını bilgisayarınıza indirin.
2. Google Drive hesabınızı açın ve bu `.xlsx` dosyasını Drive'a yükleyin.
3. Yüklediğiniz dosyaya sağ tıklayıp **Birlikte Aç > Google E-Tablolar** seçeneğini seçin.
4. Açılan e-tabloda **Dosya > Google E-Tablo olarak kaydet** diyerek dosyayı Google Sheet formatına dönüştürün (Artık Drive'ınızda bir de Google Sheet ikonu olan dosya olmalı).
5. Bu Google Sheet'in URL'sindeki ID kısmını kopyalayın (Örn: `https://docs.google.com/spreadsheets/d/ID_BURADA/edit` kısmındaki `ID_BURADA`).

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

## Eski Veriler
`mesaitakip_db.xlsx` dosyası orijinal veritabanındaki tüm verileri içermektedir. Google Sheets'e dönüştürdüğünüzde tüm eski kayıtlarınız ve kullanıcılarınız (djmaster, Ege vb.) hazır gelecektir.

**Not:** Güvenlik için Apps Script dağıtımını yaparken izinleri doğru verdiğinizden emin olun.
