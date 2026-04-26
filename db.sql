-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: sql211.infinityfree.com
-- Üretim Zamanı: 26 Nis 2026, 11:28:03
-- Sunucu sürümü: 11.4.10-MariaDB
-- PHP Sürümü: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `if0_40197167_mesaitakip`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `haftalar`
--

CREATE TABLE `haftalar` (
  `id` int(11) NOT NULL,
  `hafta_baslangic` date NOT NULL,
  `hafta_araligi` varchar(50) NOT NULL,
  `calisan_adi` varchar(100) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `haftalar`
--

INSERT INTO `haftalar` (`id`, `hafta_baslangic`, `hafta_araligi`, `calisan_adi`, `user_id`, `created_at`) VALUES
(1, '2025-02-21', '21-27 Şubat 2025', 'ilhan Akdeniz', 1, '2025-02-18 10:22:08'),
(2, '2025-02-14', '14-20 Şubat 2025', 'ilhan Akdeniz', 1, '2025-02-18 10:46:59'),
(3, '2025-02-07', '7-13 Şubat 2025', 'ilhan Akdeniz', 1, '2025-02-18 10:58:40'),
(4, '2025-01-31', '31 Ocak-6 Şubat 2025', 'ilhan Akdeniz', 1, '2025-02-18 11:06:19'),
(5, '2025-02-28', '28 Şubat - 6 Mart 2025', 'ilhan Akdeniz', 1, '2025-02-18 11:12:49'),
(7, '2025-05-01', '1-7 Ekim', 'Ege ', 3, '2025-02-19 09:07:43'),
(19, '2025-02-15', '15-21 Mart 2025', 'İlhan Akdeniz', 1, '2025-02-27 07:54:42'),
(21, '2025-02-01', '1-7 Şubat 2025', 'Serkan Akdeniz', 8, '2025-02-27 09:23:56'),
(22, '2025-02-01', '1-7 Şubat 2025', 'Deejay Master', 9, '2025-02-27 09:42:34'),
(23, '2025-02-08', '8-14 Şubat 2025', 'Deejay Master', 9, '2025-02-27 09:44:18'),
(24, '2024-12-24', '24-30 Aralık 2024', 'İlhan Akdeniz', 1, '2025-03-01 09:28:21'),
(25, '2025-02-28', '28 Şubat - 6 Mart 2025', 'Serkan Akdeniz', 8, '2025-03-01 10:12:36'),
(26, '2025-03-08', '8-14 Mart 2025', 'Serkan Akdeniz', 8, '2025-03-01 10:12:47'),
(27, '2025-03-07', '7-13 Mart 2025', 'İlhan Akdeniz', 1, '2025-03-04 07:52:01'),
(29, '2025-03-07', '7-13 Mart 2025', 'Deneme Testoğlu', 11, '2025-03-04 10:37:04'),
(30, '2025-03-14', '14-20 Mart 2025', 'İlhan Akdeniz', 1, '2025-03-05 14:35:37'),
(36, '2025-03-14', '14-20 Mart 2025', 'Serdar Ortaç', 16, '2025-03-09 07:13:52'),
(37, '2025-03-21', '21-27 Mart 2025', 'İlhan Akdeniz', 1, '2025-03-15 13:14:40'),
(38, '2025-03-28', '28 Mart - 3 Nisan 2025', 'İlhan Akdeniz', 1, '2025-03-23 07:07:35'),
(39, '2025-04-04', '4-10 Nisan 2025', 'İlhan Akdeniz', 1, '2025-04-02 09:25:23'),
(41, '2025-04-11', '11-17 Nisan 2025', 'İlhan Akdeniz', 1, '2025-04-05 12:59:20'),
(42, '2025-04-18', '18-24 Nisan 2025', 'İlhan Akdeniz', 1, '2025-04-10 20:12:47'),
(43, '2025-04-17', '17-23 Nisan 2025', 'Bashar Al Assad', 21, '2025-04-16 15:33:51'),
(44, '2025-04-25', '25 Nisan - 1 Mayıs', 'İlhan Akdeniz', 1, '2025-04-17 12:46:18'),
(45, '2025-04-25', '25 Nisan - 1 Mayıs 2025', 'Egemen Akdeniz', 20, '2025-04-22 08:17:35'),
(46, '2025-05-02', '2-8 Mayıs', 'İlhan Akdeniz', 1, '2025-04-28 11:54:18'),
(47, '2025-05-09', '9-15 Mayıs', 'İlhan Akdeniz', 1, '2025-05-05 12:54:51'),
(48, '2025-05-16', '16-22 Mayıs', 'İlhan Akdeniz', 1, '2025-05-12 07:26:51'),
(49, '2025-05-23', '23-29 Mayıs', 'İlhan Akdeniz', 1, '2025-05-13 13:49:23'),
(50, '2025-05-30', '30 Mayıs - 5 Haziran', 'İlhan Akdeniz', 1, '2025-05-19 08:25:45'),
(51, '2025-06-06', '6-12 Haziran 2025', 'İlhan Akdeniz', 1, '2025-06-02 11:47:53'),
(52, '2025-06-13', '13-19 Haziran', 'İlhan Akdeniz', 1, '2025-06-10 11:29:02'),
(53, '2025-06-20', '20-26 Haziran', 'İlhan Akdeniz', 1, '2025-06-23 07:43:02'),
(54, '2025-06-27', '27 Haziran - 3 Temmuz', 'İlhan Akdeniz', 1, '2025-06-23 07:43:52'),
(55, '2025-06-27', '27 Haziran - 3 Temmuz', 'Gönül Aktaş', 22, '2025-06-24 06:59:00'),
(57, '2025-06-07', '7-13 Haziran', 'Gönül Aktaş', 22, '2025-06-24 10:33:40'),
(58, '2025-07-04', '4-10 Temmuz', 'İlhan Akdeniz', 1, '2025-06-30 11:11:55'),
(59, '2025-07-25', '25-31 Temmuz', 'İlhan Akdeniz', 1, '2025-07-21 06:35:51'),
(60, '2025-08-01', '1-7 Ağustos', 'İlhan Akdeniz', 1, '2025-07-29 11:46:12'),
(61, '2025-08-08', '8-14 Ağustos', 'İlhan Akdeniz', 1, '2025-08-05 06:15:28'),
(62, '2025-08-15', '15-21 Ağustos', 'İlhan Akdeniz', 1, '2025-08-12 09:46:23'),
(63, '2025-08-22', '22-28 Ağustos', 'İlhan Akdeniz', 1, '2025-08-19 13:20:13'),
(64, '2025-08-29', '29 Ağustos - 4 Eylül', 'İlhan Akdeniz', 1, '2025-08-26 12:04:35'),
(65, '2025-09-05', '5-11 Eylül', 'İlhan Akdeniz', 1, '2025-09-02 06:28:31'),
(66, '2025-09-13', '13-19 Eylül', 'İlhan Akdeniz', 1, '2025-09-09 07:10:17'),
(67, '2025-09-20', '20-26 Eylül', 'İlhan Akdeniz', 1, '2025-09-16 08:08:26'),
(68, '2025-09-27', '27 Eylül - 3 Ekim', 'İlhan Akdeniz', 1, '2025-09-24 07:23:21'),
(69, '2025-10-04', '4-10 Ekim', 'İlhan Akdeniz', 1, '2025-09-30 06:47:41'),
(70, '2025-10-11', '11-17 Ekim', 'İlhan Akdeniz', 1, '2025-10-07 06:40:34'),
(71, '2025-10-18', '18-24 Ekim', 'İlhan Akdeniz', 1, '2025-10-14 08:09:02'),
(72, '2025-10-25', '25-31 Ekim', 'İlhan Akdeniz', 1, '2025-10-21 06:59:09'),
(73, '2025-11-22', '22-28 Kasım', 'İlhan Akdeniz', 1, '2025-11-19 14:02:44'),
(74, '2025-11-29', '29 Kasım - 5 Aralık', 'İlhan Akdeniz', 1, '2025-11-25 16:27:12'),
(75, '2025-12-06', '6-12 Aralık', 'İlhan Akdeniz', 1, '2025-12-01 16:47:42'),
(76, '2025-12-13', '13-19 Aralık', 'İlhan Akdeniz', 1, '2025-12-09 13:29:37'),
(77, '2025-12-20', '20-26 Aralık', 'İlhan Akdeniz', 1, '2025-12-15 19:05:09'),
(78, '2026-01-03', '3-9 Ocak', 'İlhan Akdeniz', 1, '2025-12-30 13:04:25'),
(79, '2026-01-09', '9-15 Ocak', 'İlhan Akdeniz', 1, '2026-01-06 14:53:25'),
(80, '2026-01-16', '16-22 Ocak', 'İlhan Akdeniz', 1, '2026-01-13 15:50:05'),
(81, '2026-01-23', '23-29 Ocak', 'İlhan Akdeniz', 1, '2026-01-20 09:41:12'),
(82, '2026-01-30', '30 Ocak - 5 Şubat', 'İlhan Akdeniz', 1, '2026-01-26 11:05:45'),
(83, '2026-02-06', '6-12 Şubat', 'İlhan Akdeniz', 1, '2026-02-03 12:18:22'),
(84, '2026-02-13', '13-19 Şubat', 'İlhan Akdeniz', 1, '2026-02-10 09:00:24'),
(85, '2026-02-20', '20-26 Şubat', 'İlhan Akdeniz', 1, '2026-02-17 12:43:55'),
(87, '2026-02-28', '28 Şubat - 6 Mart', 'İlhan Akdeniz', 1, '2026-02-24 19:04:28'),
(88, '2026-03-07', '7-13 Mart', 'İlhan Akdeniz', 1, '2026-03-03 13:05:06'),
(89, '2026-03-14', '14-20 Mart', 'İlhan Akdeniz', 1, '2026-03-10 15:18:41'),
(90, '2026-03-21', '21-27 Mart', 'İlhan Akdeniz', 1, '2026-03-16 08:32:39'),
(91, '2026-03-28', '28 Mart - 3 Nisan', 'İlhan Akdeniz', 1, '2026-03-24 15:22:50'),
(92, '2026-04-04', '4-10 Nisan', 'İlhan Akdeniz', 1, '2026-03-31 12:40:40'),
(93, '2026-04-11', '11-17 Nisan', 'İlhan Akdeniz', 1, '2026-04-07 13:30:02'),
(94, '2026-04-18', '18-24 Nisan', 'İlhan Akdeniz', 1, '2026-04-14 12:38:43'),
(95, '2026-04-25', '25 Nisan - 1 Mayıs', 'İlhan Akdeniz', 1, '2026-04-22 09:59:11');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `kullanicilar`
--

CREATE TABLE `kullanicilar` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `adsoyad` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `is_banned` tinyint(1) DEFAULT 0,
  `is_admin` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `kullanicilar`
--

INSERT INTO `kullanicilar` (`id`, `username`, `password`, `adsoyad`, `created_at`, `is_banned`, `is_admin`) VALUES
(1, 'djmaster', '$2y$10$QNX3kmQ0QybVw1TFvE9TMuGumtsAwJigPUHtmzjyj3UrA3/mtbiVS', 'İlhan Akdeniz', '2025-02-18 10:21:17', 0, 1),
(3, 'Ege', '$2y$10$lwf2dbQViCorXZQdE/1DK.e12l0VuDDjSPRlMgscKYi.tkawFYEZ2', 'Ege Akdeniz', '2025-02-19 09:01:24', 0, 1),
(8, 'master', '$2y$10$v.KD2fgIHGoiVH95h5ltV.Ac5C4ZpCi3ViUSFVQnbYv3ykRJHh.Ui', 'Serkan Akdeniz', '2025-02-27 09:23:40', 0, 0),
(9, 'djmaster35', '$2y$10$4cGliXqD6BWIOU25RNGrtOQN8lNSiDR4foe/F33I83f0pTMZQj1TO', 'Deejay Master', '2025-02-27 09:42:12', 0, 1),
(11, 'test', '$2y$10$t8Gu1K6G4cZZ0omb6WropeAusGxePMh2XCiP5eVlDwRR6gTCBbnZ6', 'Deneme Testoğlu', '2025-03-04 10:36:54', 0, 0),
(16, 'serdar', '$2y$10$QD88YK7jRkHBcicQRX4JcO4VaE6rzZbCqbuQxPUOrciiQNFbfiHeO', 'Serdar Ortaç', '2025-03-09 07:13:36', 0, 0),
(20, 'egemen', '$2y$10$qbJlhWGi38.xEfwpZkp9VuR2Y3eiFKEftwZx6vB2FKba519AeawEy', 'Egemen Akdeniz', '2025-04-05 13:28:02', 0, 0),
(21, 'EgeA', '$2y$10$.AUx4sIzDlQtnqYLHP7buuIPnbI1Kuz3nlhT58VOZYE.WWGJa66Se', 'Bashar Al Assad', '2025-04-16 15:33:36', 0, 0),
(22, 'Gonul', '$2y$10$6s9/1VlNfBzJSRd1J3iDyu26DttzCFQ37254Yp1KP1T0/vPKztAO.', 'Gönül Aktaş', '2025-06-24 06:58:23', 0, 0);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `mesai_kayitlari`
--

CREATE TABLE `mesai_kayitlari` (
  `id` int(11) NOT NULL,
  `hafta_id` int(11) NOT NULL,
  `tarih` date NOT NULL,
  `aciklama` varchar(255) NOT NULL,
  `saat` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_resmi_tatil` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `resmi_tatil` tinyint(1) DEFAULT 0,
  `is_normal_day` tinyint(1) NOT NULL DEFAULT 0,
  `treat_as_normal` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `mesai_kayitlari`
--

INSERT INTO `mesai_kayitlari` (`id`, `hafta_id`, `tarih`, `aciklama`, `saat`, `is_resmi_tatil`, `created_at`, `resmi_tatil`, `is_normal_day`, `treat_as_normal`) VALUES
(1, 1, '2025-02-21', 'Müzik kursları', '2.00', 0, '2025-02-18 10:22:25', 0, 0, 0),
(2, 1, '2025-02-22', 'ÇYDD Genel Kurul - Bale Kurs', '2.00', 0, '2025-02-18 10:24:45', 0, 0, 0),
(3, 1, '2025-02-23', 'TSM Konseri', '6.00', 0, '2025-02-18 10:25:09', 0, 0, 0),
(4, 1, '2025-02-24', 'Müzik ve plates kursları', '2.00', 0, '2025-02-18 10:25:50', 0, 0, 0),
(5, 1, '2025-02-25', 'Müzik ve Tiyatro kursları', '5.00', 0, '2025-02-18 10:26:22', 0, 0, 0),
(6, 1, '2025-02-26', 'Müzik kursları', '2.00', 0, '2025-02-18 10:26:52', 0, 0, 0),
(7, 1, '2025-02-27', 'Müzik ve Halk dansları kursları', '3.00', 0, '2025-02-18 10:27:33', 0, 0, 0),
(8, 2, '2025-02-14', 'Müzik kursları', '3.00', 0, '2025-02-18 10:48:01', 0, 0, 0),
(9, 2, '2025-02-15', 'Müzik ve bale kursları - Tiyatro gösteri', '6.00', 0, '2025-02-18 10:48:46', 0, 0, 0),
(10, 2, '2025-02-16', 'Müzik ve Bale kursları', '2.00', 0, '2025-02-18 10:49:32', 0, 0, 0),
(11, 2, '2025-02-17', 'Müzik kursları', '2.00', 0, '2025-02-18 10:49:56', 0, 0, 0),
(12, 2, '2025-02-18', 'Müzik,Halk dansları ve tiyatro kurs', '3.00', 0, '2025-02-18 10:51:02', 0, 0, 0),
(13, 2, '2025-02-19', 'Müzik kursları', '2.00', 0, '2025-02-18 10:51:23', 0, 0, 0),
(14, 2, '2025-02-20', 'Müzik ve Halk oyunları kurs', '3.00', 0, '2025-02-18 10:52:13', 0, 0, 0),
(15, 3, '2025-02-07', 'Müzik kursları', '2.00', 0, '2025-02-18 10:59:21', 0, 0, 0),
(16, 3, '2025-02-08', 'Bale ve müzik kursları', '2.00', 0, '2025-02-18 10:59:49', 0, 0, 0),
(17, 3, '2025-02-09', 'Bale ve Müzik kursları - Tiyatro gösteri', '2.00', 0, '2025-02-18 11:00:47', 0, 0, 0),
(18, 3, '2025-02-10', 'Müzik kursları', '2.00', 0, '2025-02-18 11:01:18', 0, 0, 0),
(19, 3, '2025-02-11', 'Müzik ve Tiyatro kursları', '5.00', 0, '2025-02-18 11:01:51', 0, 0, 0),
(20, 3, '2025-02-12', 'Kurslar - Tiyatro gösteri ', '2.00', 0, '2025-02-18 11:02:31', 0, 0, 0),
(21, 3, '2025-02-13', 'Müzik ve Halk dansları kursları', '3.00', 0, '2025-02-18 11:03:11', 0, 0, 0),
(22, 4, '2025-01-31', 'Piyano kurs - Kent Konseyi genel kurul', '3.00', 0, '2025-02-18 11:07:17', 0, 0, 0),
(23, 4, '2025-02-01', 'Bale - Gitar kursları', '5.00', 0, '2025-02-18 11:07:44', 0, 0, 0),
(24, 4, '2025-02-02', 'Bale ve Piyano kurs', '1.00', 0, '2025-02-18 11:08:35', 0, 0, 0),
(25, 4, '2025-02-03', 'Piyano kursu', '2.00', 0, '2025-02-18 11:09:18', 0, 0, 0),
(26, 4, '2025-02-04', 'Piyano ve Tiyatro kurs ', '5.00', 0, '2025-02-18 11:10:00', 0, 0, 0),
(27, 4, '2025-02-05', 'Piyano kurs', '2.00', 0, '2025-02-18 11:10:35', 0, 0, 0),
(28, 4, '2025-02-06', 'Piyano kursu', '2.00', 0, '2025-02-18 11:11:03', 0, 0, 0),
(29, 5, '2025-02-28', 'Müzik kursları', '1.00', 0, '2025-02-18 11:13:44', 0, 0, 0),
(41, 5, '2025-03-01', 'Bale müzik kursları', '4.00', 0, '2025-02-20 08:08:48', 0, 0, 0),
(43, 5, '2025-03-03', 'Müzik kursları', '2.00', 0, '2025-02-20 08:10:49', 0, 0, 0),
(44, 5, '2025-03-04', 'Müzik ve tiyatro kursları', '5.00', 0, '2025-02-20 08:12:06', 0, 0, 0),
(45, 5, '2025-03-05', 'Müzik kursları', '2.00', 0, '2025-02-20 08:13:00', 0, 0, 0),
(46, 5, '2025-03-06', 'Müzik ve Halk dansları kurs.', '3.00', 0, '2025-02-20 08:14:15', 0, 0, 0),
(55, 21, '2025-02-01', 'deniz turu', '3.00', 0, '2025-02-27 09:24:15', 0, 0, 0),
(56, 21, '2025-02-02', 'eşek adası turu', '5.00', 0, '2025-02-27 09:24:45', 0, 0, 0),
(57, 21, '2025-02-03', 'deneme işi', '2.00', 0, '2025-02-27 09:25:08', 0, 0, 0),
(58, 22, '2025-02-01', 'Gece etkiliği', '5.00', 0, '2025-02-27 09:42:57', 0, 0, 0),
(59, 22, '2025-02-02', 'Haftasonu etkinliği', '0.00', 0, '2025-02-27 09:43:28', 0, 0, 0),
(60, 23, '2025-02-08', 'Başka bir etkinlik', '4.00', 0, '2025-02-27 09:44:32', 0, 0, 0),
(61, 23, '2025-02-09', 'Hafta sonu tiyatrosu', '0.00', 0, '2025-02-27 09:44:52', 0, 0, 0),
(62, 24, '2024-12-24', 'Tiyatro Kursu', '5.00', 0, '2025-03-01 09:30:16', 0, 0, 0),
(63, 24, '2024-12-25', 'Piyano kursu ', '3.00', 0, '2025-03-01 09:30:53', 0, 0, 0),
(64, 24, '2024-12-26', 'Piyano kurs', '3.00', 0, '2025-03-01 09:36:49', 0, 0, 0),
(65, 24, '2024-12-28', 'Müzik kursları', '5.00', 0, '2025-03-01 09:37:25', 0, 0, 0),
(66, 24, '2024-12-29', 'Bale kursu', '0.00', 0, '2025-03-01 09:37:55', 0, 0, 0),
(67, 24, '2024-12-30', 'Piyano kursu', '3.00', 0, '2025-03-01 09:38:15', 0, 0, 0),
(69, 27, '2025-03-07', 'Müzik kursları', '2.00', 0, '2025-03-04 07:54:51', 0, 0, 0),
(70, 27, '2025-03-08', 'Bale ve müzik kursları', '4.00', 0, '2025-03-04 07:55:30', 0, 0, 0),
(72, 27, '2025-03-10', 'Müzik kursları', '2.00', 0, '2025-03-04 07:57:01', 0, 0, 0),
(73, 27, '2025-03-11', 'Müzik ve tiyatro kursları', '4.00', 0, '2025-03-04 07:58:21', 0, 0, 0),
(74, 27, '2025-03-12', 'Müzik kursları', '2.00', 0, '2025-03-04 07:59:02', 0, 0, 0),
(75, 27, '2025-03-13', 'Müzik ve halk dansları kurs', '3.00', 0, '2025-03-04 07:59:55', 0, 0, 0),
(79, 27, '2025-03-09', 'Bale ve müzik kursları', '0.00', 0, '2025-03-04 09:41:09', 0, 0, 0),
(83, 29, '2025-03-07', 'etkinlik kilise', '3.00', 0, '2025-03-04 10:37:30', 0, 0, 0),
(84, 29, '2025-03-09', 'konser anfi', '0.00', 0, '2025-03-04 10:37:47', 0, 0, 0),
(85, 30, '2025-03-14', 'Müzik kursları', '2.00', 0, '2025-03-05 14:36:38', 0, 0, 0),
(86, 30, '2025-03-15', 'Bale kurs-Cocuk tiyatrosu ', '6.00', 0, '2025-03-06 07:55:48', 0, 0, 0),
(87, 30, '2025-03-16', 'Bale ve müzik kursları , Tiyatro gösteri ', '0.00', 0, '2025-03-06 08:01:47', 0, 0, 0),
(88, 30, '2025-03-17', 'Müzik kursu ', '1.00', 0, '2025-03-06 08:03:38', 0, 0, 0),
(89, 30, '2025-03-18', 'Müzik ve tiyatro kursları ', '5.00', 0, '2025-03-06 08:04:51', 0, 0, 0),
(90, 30, '2025-03-19', 'Müzik kursu ', '1.00', 0, '2025-03-06 08:05:40', 0, 0, 0),
(91, 30, '2025-03-20', 'Müzik kursu ve Halk dansları ', '3.00', 0, '2025-03-06 08:06:47', 0, 0, 0),
(97, 36, '2025-03-14', 'deneme mesaisi', '4.00', 0, '2025-03-09 07:14:14', 0, 0, 0),
(98, 36, '2025-03-16', 'konser', '0.00', 0, '2025-03-09 07:14:31', 0, 0, 0),
(99, 37, '2025-03-21', 'Müzik kursları - Tiyatro gösteri ', '5.00', 0, '2025-03-15 13:15:17', 0, 0, 0),
(100, 37, '2025-03-22', 'Müzik ve bale kursları - CHP Salon hazırlık', '8.00', 0, '2025-03-16 07:52:12', 0, 0, 0),
(101, 37, '2025-03-23', 'Bale ve Müzik Kyrsları - CHP Seçim', '4.00', 0, '2025-03-16 07:53:24', 0, 0, 0),
(102, 37, '2025-03-24', 'Müzik kursları', '2.00', 0, '2025-03-16 07:54:06', 0, 0, 0),
(103, 37, '2025-03-25', 'Müzik kursları - Belediye Tiyatrosu gösteri', '6.00', 0, '2025-03-16 07:55:15', 0, 0, 0),
(104, 37, '2025-03-26', 'Müzik kursları - Başkan Esnaf Toplantısı', '3.00', 0, '2025-03-16 07:55:47', 0, 0, 0),
(105, 37, '2025-03-27', 'Müzik kursları - Halk dansları kurs', '3.00', 0, '2025-03-16 07:56:41', 0, 0, 0),
(106, 38, '2025-03-28', 'Müzik kursları ', '2.00', 0, '2025-03-23 07:08:41', 0, 0, 0),
(107, 38, '2025-03-29', 'Bale ve müzik kursları ', '4.00', 0, '2025-03-23 07:09:15', 0, 0, 0),
(110, 38, '2025-04-03', 'Müzik ve dans kursları ', '3.00', 0, '2025-03-23 08:59:48', 0, 0, 0),
(111, 39, '2025-04-05', 'Bale ve müzik kursları', '5.00', 0, '2025-04-02 09:26:40', 0, 0, 0),
(112, 39, '2025-04-06', 'Bale ve müzik kursları', '0.00', 0, '2025-04-02 09:28:01', 0, 0, 0),
(113, 39, '2025-04-07', 'Müzik kursları', '3.00', 0, '2025-04-02 09:28:51', 0, 0, 0),
(114, 39, '2025-04-08', 'Müzik, tiyatro ve dans kursları', '5.00', 0, '2025-04-02 09:29:36', 0, 0, 0),
(115, 39, '2025-04-09', 'Müzik kursları', '3.00', 0, '2025-04-02 09:30:45', 0, 0, 0),
(116, 39, '2025-04-10', 'Müzik ve Halk dansları Kursu', '3.00', 0, '2025-04-02 09:32:08', 0, 0, 0),
(118, 41, '2025-04-11', 'Müzik kursları', '3.00', 0, '2025-04-05 13:00:22', 0, 0, 0),
(119, 41, '2025-04-12', 'Müzik ve Bale kursları', '5.00', 0, '2025-04-05 13:01:06', 0, 0, 0),
(120, 41, '2025-04-13', 'Bale ve müzik kursları', '0.00', 0, '2025-04-05 13:25:14', 0, 0, 0),
(121, 41, '2025-04-14', 'Müzik kursları', '3.00', 0, '2025-04-05 13:30:28', 0, 0, 0),
(122, 41, '2025-04-15', 'Müzik, Dans ve Tiyatro kursları', '5.00', 0, '2025-04-05 13:31:39', 0, 0, 0),
(123, 41, '2025-04-16', 'Müzik kursları', '3.00', 0, '2025-04-05 13:32:17', 0, 0, 0),
(125, 41, '2025-04-17', 'Müzik ve dans kursları', '3.00', 0, '2025-04-05 13:46:47', 0, 0, 0),
(126, 42, '2025-04-18', 'Bale ve müzik kursları', '3.00', 0, '2025-04-14 07:55:22', 0, 0, 0),
(127, 42, '2025-04-19', 'Bele ve müzik kursları', '5.00', 0, '2025-04-14 07:59:11', 0, 0, 0),
(128, 42, '2025-04-20', 'Bale ve müzik kursları ', '0.00', 0, '2025-04-14 08:11:08', 0, 0, 0),
(129, 42, '2025-04-21', 'Müzik kursu', '2.00', 0, '2025-04-14 08:13:49', 0, 0, 0),
(130, 42, '2025-04-22', 'Müzik, Halk danslari ve tiyatro kursları ', '5.00', 0, '2025-04-14 08:15:19', 0, 0, 0),
(131, 42, '2025-04-23', 'Plates ve müzik kurslar', '1.00', 0, '2025-04-14 08:16:51', 0, 0, 0),
(132, 42, '2025-04-24', 'Müzik kursu ve Halk dansları kursu ', '3.00', 0, '2025-04-14 08:17:41', 0, 0, 0),
(133, 43, '2025-04-17', 'Mesai test', '7.00', 0, '2025-04-16 15:34:07', 0, 0, 0),
(134, 44, '2025-04-25', 'Ege Ünv.Tiyatro Prova ', '6.00', 0, '2025-04-17 13:35:00', 0, 0, 0),
(135, 44, '2025-04-26', 'Bale ve Müzik Kursları - Ege Unv.Tiyatro Göst.', '11.00', 0, '2025-04-21 08:28:12', 0, 0, 0),
(136, 44, '2025-04-27', 'Bale ve müzik kursları - Çocuk tiyatro gösterileri', '0.00', 0, '2025-04-21 08:30:13', 0, 0, 0),
(137, 44, '2025-04-28', 'Müzik kursları - Kent konseyi seminer', '3.00', 0, '2025-04-21 08:31:54', 0, 0, 0),
(138, 44, '2025-04-29', 'Halk dansları - Tiyatro kurs', '5.00', 0, '2025-04-21 08:33:01', 0, 0, 0),
(139, 44, '2025-04-30', 'Müzik kursları - Türk Halk Müziği koro provası ', '5.00', 0, '2025-04-21 08:33:50', 0, 0, 0),
(140, 44, '2025-05-01', 'Fen işleri tadilat  (1 Mayıs)', '0.00', 1, '2025-04-21 08:34:46', 0, 0, 0),
(141, 45, '2025-04-25', 'deneme etkinlik', '2.00', 0, '2025-04-22 08:18:12', 0, 0, 0),
(142, 45, '2025-04-26', 'baska etkinlik', '2.00', 0, '2025-04-22 08:18:35', 0, 0, 0),
(143, 45, '2025-04-27', 'kurslar', '0.00', 0, '2025-04-22 08:18:54', 0, 0, 0),
(144, 46, '2025-05-02', 'Belediye THM Korosu konseri ', '9.00', 0, '2025-04-28 11:55:00', 0, 0, 0),
(145, 46, '2025-05-03', 'Bale ve müzik kursları ', '6.00', 0, '2025-04-28 11:56:49', 0, 0, 0),
(146, 46, '2025-05-04', 'Bale ve müzik kursları - Atatürk Lisesi prova ', '0.00', 0, '2025-04-28 11:57:52', 0, 0, 0),
(147, 46, '2025-05-05', 'Müzik kursları ', '3.00', 0, '2025-04-28 11:58:38', 0, 0, 0),
(148, 46, '2025-05-06', 'Müzik kursları ve Belediye tiyatrosu kurs', '5.00', 0, '2025-04-28 11:59:32', 0, 0, 0),
(149, 46, '2025-05-07', 'Müzik kursları - Atatürk Lisesi Gösteri ', '6.00', 0, '2025-04-28 12:00:42', 0, 0, 0),
(150, 47, '2025-05-09', 'Müzik kursları, Bilgiç Koleji Yilsonu gösterisi ', '7.00', 0, '2025-05-06 08:26:19', 0, 0, 0),
(151, 47, '2025-05-10', 'Bale ve Müzik kursları, Çocuktan al haberi Tiyatro gosterisi', '12.00', 0, '2025-05-06 08:28:59', 0, 0, 0),
(152, 47, '2025-05-11', 'Bale ve müzik kursları ', '0.00', 0, '2025-05-06 08:29:38', 0, 0, 0),
(153, 47, '2025-05-12', 'Müzik kursları, Belediye yıl sonu etkinlikleri prova', '6.00', 0, '2025-05-06 08:30:52', 0, 0, 0),
(154, 47, '2025-05-13', 'Müzik ve tiyatro kursları ', '5.00', 0, '2025-05-06 08:31:44', 0, 0, 0),
(155, 47, '2025-05-14', 'Müzik kursları ', '3.00', 0, '2025-05-06 08:32:45', 0, 0, 0),
(156, 47, '2025-05-15', 'Müzik ve Halk dansları kursala', '3.00', 0, '2025-05-06 08:34:13', 0, 0, 0),
(157, 48, '2025-05-16', 'Bilgiç Koleji gösteri', '8.00', 0, '2025-05-12 07:28:22', 0, 0, 0),
(158, 48, '2025-05-17', 'Belediye kursları genel prova', '9.00', 0, '2025-05-12 07:29:47', 0, 0, 0),
(159, 48, '2025-05-18', 'Bale ve müzik kursları', '0.00', 0, '2025-05-12 07:30:30', 0, 0, 0),
(160, 48, '2025-05-20', 'Müzik kursları, Belediye tiyatro kursu', '5.00', 0, '2025-05-12 07:33:37', 0, 0, 0),
(161, 48, '2025-05-21', 'Belediye Tiyatro prova', '6.00', 0, '2025-05-12 07:34:49', 0, 0, 0),
(162, 48, '2025-05-22', 'Belediye yıl sonu etkinlik prova', '5.00', 0, '2025-05-12 07:35:44', 0, 0, 0),
(176, 49, '2025-05-23', 'Atatürk İlköğretim Okulu Tiyatro gösterisi', '7.00', 0, '2025-05-19 07:54:02', 0, 0, 0),
(177, 49, '2025-05-24', 'Bale ve Müzik kursları', '5.00', 0, '2025-05-19 07:55:04', 0, 0, 0),
(178, 49, '2025-05-25', 'Bale ve Müzik Kursları', '0.00', 0, '2025-05-19 07:56:59', 0, 0, 0),
(179, 49, '2025-05-26', 'Belediye Tiyatrosu prova', '6.00', 0, '2025-05-19 07:58:04', 0, 0, 0),
(180, 49, '2025-05-27', 'Müzik, Halk Dansları ve Belediye tiyatrosu ', '6.00', 0, '2025-05-19 07:59:13', 0, 0, 0),
(181, 49, '2025-05-28', 'Belediye tiyatrosu prova', '6.00', 0, '2025-05-19 08:00:06', 0, 0, 0),
(182, 49, '2025-05-29', 'Müzik ve Halk Dansları kursları', '3.00', 0, '2025-05-19 08:01:03', 0, 0, 0),
(183, 48, '2025-05-19', 'Salon temizlik', '0.00', 1, '2025-05-19 08:24:34', 0, 0, 0),
(184, 50, '2025-06-01', 'Belediye yıl sonu gösterisi', '6.00', 0, '2025-05-19 10:35:29', 0, 0, 0),
(185, 50, '2025-05-30', 'Belediye yıl sonu prova', '5.00', 0, '2025-05-26 10:12:03', 0, 0, 0),
(186, 50, '2025-05-31', 'Namık Kemal okulu tiyatro gösterisi', '10.00', 0, '2025-05-26 10:13:09', 0, 0, 0),
(187, 50, '2025-06-04', 'Çeşme Belediye Spor Topl.', '2.00', 0, '2025-05-26 10:15:58', 0, 0, 0),
(194, 52, '2025-06-15', 'Konut Yapı Kooperatifi Genel Kurulu', '0.00', 0, '2025-06-10 11:30:39', 0, 0, 0),
(195, 54, '2025-06-29', 'Çakader Konser Prova', '0.00', 0, '2025-06-23 07:44:50', 0, 0, 0),
(197, 55, '2025-06-28', 'Mavi balonu gösteri', '9.00', 0, '2025-06-24 07:00:41', 0, 0, 0),
(199, 57, '2025-06-07', 'Mavi balonu gösteri', '10.00', 0, '2025-06-24 10:34:15', 0, 0, 0),
(200, 58, '2025-07-06', 'Disk Emeklisen Aziz Nesin ve Cumhuriyet Söyleşi', '0.00', 0, '2025-06-30 11:14:16', 0, 0, 0),
(201, 59, '2025-07-27', 'Genç Engelliler Tiyatro gösterisi', '0.00', 0, '2025-07-21 06:37:18', 0, 0, 0),
(202, 61, '2025-08-09', 'CHP Kadın Kolları toplantı. - Katolik Ayini', '7.00', 0, '2025-08-12 09:45:24', 0, 0, 0),
(203, 62, '2025-08-16', 'Engelsiz Hayat Tiyatro Gösterisi', '7.00', 0, '2025-08-12 09:48:42', 0, 0, 0),
(204, 61, '2025-08-11', 'Plates', '2.00', 0, '2025-08-13 07:00:49', 0, 0, 0),
(205, 62, '2025-08-18', 'Plates', '2.00', 0, '2025-08-13 07:02:51', 0, 0, 0),
(206, 63, '2025-08-22', 'Standup Gösterisi', '6.00', 0, '2025-08-19 13:21:32', 0, 0, 0),
(207, 63, '2025-08-27', 'Çeşme Spor Genel Kurul', '4.00', 0, '2025-08-19 13:23:56', 0, 0, 0),
(208, 64, '2025-08-30', 'Hristiyan vatandalar ayin töreni', '0.00', 1, '2025-08-26 12:06:06', 0, 0, 0),
(209, 64, '2025-08-31', 'Disk Emeklisen Söyleşi programı', '0.00', 0, '2025-08-26 12:06:58', 0, 0, 0),
(211, 64, '2025-09-02', 'Penguenler Adası Tiyatro gösterisi', '3.00', 0, '2025-08-26 12:10:41', 0, 0, 0),
(212, 67, '2025-09-20', 'İyi parti kongre toplantisi', '6.00', 0, '2025-09-16 08:16:22', 0, 0, 0),
(213, 67, '2025-09-25', 'Neşet Ertaş anma Lonseri', '8.00', 0, '2025-09-20 09:14:27', 0, 0, 0),
(214, 68, '2025-09-27', 'CHP Kongre', '7.00', 0, '2025-09-24 07:27:33', 0, 0, 0),
(215, 68, '2025-10-03', 'Alaçatı Ilıca Kült.Snt.Dern. Tiyatro Prova', '6.00', 0, '2025-09-24 07:31:05', 0, 0, 0),
(216, 69, '2025-10-04', 'Masal Kabere Tiyatro Gösterisi', '7.00', 0, '2025-09-30 06:49:18', 0, 0, 0),
(217, 69, '2025-10-10', 'DEV-SEN Kongre', '6.00', 0, '2025-09-30 06:50:42', 0, 0, 0),
(218, 69, '2025-10-06', 'Müzik kursları ve tiyatro kursu', '5.00', 0, '2025-10-06 19:12:10', 0, 0, 0),
(219, 69, '2025-10-07', 'Bağlama kursu', '4.00', 0, '2025-10-06 19:12:51', 0, 0, 0),
(220, 69, '2025-10-08', 'Bağlama kursu', '4.00', 0, '2025-10-06 19:13:10', 0, 0, 0),
(221, 69, '2025-10-09', 'Müzik kursları', '4.00', 0, '2025-10-06 19:18:25', 0, 0, 0),
(223, 70, '2025-10-11', 'Müzik ve Bale kursları', '7.00', 0, '2025-10-07 07:51:02', 0, 0, 0),
(224, 70, '2025-10-12', 'Müzik ve Bale kursları', '2.00', 0, '2025-10-07 07:52:03', 0, 0, 0),
(225, 70, '2025-10-13', 'Müzik ve Tiyatro kursları', '2.00', 0, '2025-10-07 07:53:07', 0, 0, 0),
(227, 70, '2025-10-15', 'Bağlama kursu', '4.00', 0, '2025-10-07 07:54:22', 0, 0, 0),
(229, 70, '2025-10-17', 'Müzik kursları', '2.00', 0, '2025-10-07 08:48:24', 0, 0, 0),
(230, 71, '2025-10-18', 'Bale ve müzik kursları', '8.00', 0, '2025-10-15 13:59:50', 0, 0, 0),
(232, 71, '2025-10-20', 'Müzik ve tiyatro kursları', '2.00', 0, '2025-10-15 14:00:42', 0, 0, 0),
(233, 71, '2025-10-21', 'Müzik kursları', '4.00', 0, '2025-10-15 14:01:02', 0, 0, 0),
(234, 71, '2025-10-22', 'Müzik kursları', '4.00', 0, '2025-10-15 14:01:15', 0, 0, 0),
(235, 71, '2025-10-23', 'Müzik müzik kursları', '4.00', 0, '2025-10-15 14:02:25', 0, 0, 0),
(236, 71, '2025-10-24', 'Müzik kursları', '4.00', 0, '2025-10-15 14:02:43', 0, 0, 0),
(237, 72, '2025-10-26', 'Kurslar ve Kuromi Çocuk tiyatro gösteri', '2.00', 0, '2025-10-21 07:39:36', 0, 0, 0),
(238, 72, '2025-10-27', 'Müzik kursları ve Kent Enstitüsü Tiyatro çalışması', '5.00', 0, '2025-10-21 07:40:43', 0, 0, 0),
(239, 72, '2025-10-29', 'Sinema gösterimi', '0.00', 1, '2025-10-21 07:42:14', 0, 0, 0),
(243, 73, '2025-11-24', 'Öğretmenler Günü', '6.00', 0, '2025-11-19 14:03:37', 0, 0, 0),
(248, 74, '2025-11-29', 'Çocuk Tiyatrosu gösteri ve kurslar', '7.00', 0, '2025-11-25 16:28:41', 0, 0, 0),
(249, 74, '2025-11-30', 'Çocuk Tiyatro gösterisi ve kurslar', '0.00', 0, '2025-11-25 16:30:05', 0, 0, 0),
(250, 74, '2025-12-01', 'Belediye tiyatro kurdu', '2.00', 0, '2025-11-25 16:31:09', 0, 0, 0),
(252, 74, '2025-12-02', 'Müzik kursları', '3.00', 0, '2025-12-01 16:46:51', 0, 0, 0),
(253, 75, '2025-12-06', 'Çocuk Tiyatrosu gösteri ve kurslar', '7.00', 0, '2025-12-01 16:50:36', 0, 0, 0),
(254, 75, '2025-12-07', 'Tiyatro gösterisi ve müzik kursları', '0.00', 0, '2025-12-01 16:51:13', 0, 0, 0),
(255, 75, '2025-12-08', 'Çeşme Belediyesi Kent Enstitüsü Tiyatro Çalışması', '1.00', 0, '2025-12-01 16:52:11', 0, 0, 0),
(256, 75, '2025-12-11', 'CHP Toplantı', '2.00', 0, '2025-12-01 16:53:25', 0, 0, 0),
(258, 74, '2025-12-04', 'Osman Hoca koro çalışması', '2.00', 0, '2025-12-04 12:42:12', 0, 0, 0),
(259, 76, '2025-12-15', 'Çeşme Belediyesi Kent Enstitüsü Tiyatro çalışması  tüm gün', '1.00', 0, '2025-12-09 13:32:52', 0, 0, 0),
(260, 76, '2025-12-18', 'Osman Hoca Koro Çalışması', '1.50', 0, '2025-12-09 13:33:47', 0, 0, 0),
(261, 77, '2025-12-20', 'Nazan Kesal: Yaralarım Aşktandır Oyunu', '6.00', 0, '2025-12-15 19:06:58', 0, 0, 0),
(262, 77, '2025-12-21', 'Çocuk tiyatrosu - Yetişkin Tiyarosu [Gece]', '6.00', 0, '2025-12-15 19:09:46', 0, 0, 0),
(263, 77, '2025-12-22', 'Çeşme Belediyesi Kent Enstitüsü Tiyatro çalışması  tüm gün', '1.50', 0, '2025-12-15 19:10:37', 0, 0, 0),
(264, 78, '2026-01-06', 'Belediye Tiyatro Kursu', '1.50', 0, '2025-12-30 13:06:59', 0, 0, 0),
(265, 78, '2026-01-08', 'THM Koro Kursu', '1.50', 0, '2025-12-30 13:07:38', 0, 0, 0),
(266, 79, '2026-01-09', 'Çeşme Belediyesi Türk Halk Müziği Korosu Konser', '4.00', 0, '2026-01-06 14:54:38', 0, 0, 0),
(267, 79, '2026-01-12', 'Tiyatro Kursu', '1.50', 0, '2026-01-07 09:13:06', 0, 0, 0),
(268, 79, '2026-01-15', 'Türk Halk Müziği Koro çalışması', '1.50', 0, '2026-01-07 09:14:20', 0, 0, 0),
(269, 80, '2026-01-16', 'İstanbul PAYE Çocuk Tiyatrosu', '2.00', 0, '2026-01-13 15:51:57', 0, 0, 0),
(270, 80, '2026-01-17', 'Yarı yıl etkinlikleri', '4.00', 0, '2026-01-13 16:00:07', 0, 0, 0),
(271, 80, '2026-01-18', 'Yarı yıl etkinlikleri', '0.00', 0, '2026-01-13 16:00:38', 0, 0, 0),
(278, 82, '2026-01-30', 'İZBB Hayal Kasabası Çocuk Tiyatrosu', '3.00', 0, '2026-01-26 11:08:10', 0, 0, 0),
(280, 83, '2026-02-07', 'İzmir Kent Tiyatrosu tiyatro gösterisi', '10.00', 0, '2026-02-03 12:20:15', 0, 0, 0),
(281, 83, '2026-02-08', 'Atatürkçü Düşünce Derneği Olağan Genel Kurul Toplantısı ve kurslar', '2.00', 0, '2026-02-03 12:21:29', 0, 0, 0),
(282, 83, '2026-02-09', 'Tiyatro Kursu', '2.00', 0, '2026-02-03 12:22:43', 0, 0, 0),
(284, 83, '2026-02-12', 'Halk Müziği Korosu Kursu', '1.50', 0, '2026-02-03 12:25:43', 0, 0, 0),
(286, 84, '2026-02-14', 'Müzik ve Bale kursları', '6.00', 0, '2026-02-10 09:04:24', 0, 0, 0),
(287, 84, '2026-02-15', 'Belediye TSM Konseri', '8.00', 0, '2026-02-10 09:05:32', 0, 0, 0),
(288, 84, '2026-02-16', 'Belediye Tiyatro Kursu', '2.00', 0, '2026-02-10 09:10:38', 0, 0, 0),
(289, 84, '2026-02-19', 'Osman Hoca Koro Çalışması', '2.00', 0, '2026-02-10 09:15:16', 0, 0, 0),
(291, 85, '2026-02-21', 'Şoförler Odası Genel Kurul - Müzik Kursları', '7.00', 0, '2026-02-17 13:09:12', 0, 0, 0),
(292, 85, '2026-02-22', 'Bale ve Müzik Kursları - Lüküs Hayat Tiyatro gösterisi', '0.00', 0, '2026-02-17 13:12:14', 0, 0, 0),
(293, 85, '2026-02-23', 'Belediye Tiyatro Kursu', '1.50', 0, '2026-02-17 13:13:24', 0, 0, 0),
(298, 87, '2026-02-28', 'Müzik ve Bale kursları', '4.00', 0, '2026-02-24 19:05:45', 0, 0, 0),
(299, 87, '2026-03-01', 'Müzik ve Bale kursları', '4.00', 0, '2026-02-24 19:06:03', 0, 0, 1),
(300, 87, '2026-03-05', 'Müdahil Tiyatro Oyunu', '4.00', 0, '2026-02-24 19:08:50', 0, 0, 0),
(301, 87, '2026-03-06', 'Dünyada Bir Yerde Tiyatro Oyunu', '4.00', 0, '2026-02-24 19:09:57', 0, 0, 0),
(302, 87, '2026-03-02', 'Belediye Tiyatro Kursu', '2.50', 0, '2026-02-24 19:12:23', 0, 0, 0),
(303, 88, '2026-03-09', 'Belediye Tiyatro Kursu', '3.00', 0, '2026-03-03 13:07:50', 0, 0, 0),
(304, 88, '2026-03-12', 'Osman Hoca Koro Çalışması', '2.00', 0, '2026-03-03 13:24:33', 0, 0, 0),
(305, 89, '2026-03-14', 'Bale müzik kursları - Tiyatro Gösterisi', '6.00', 0, '2026-03-12 12:30:58', 0, 0, 0),
(306, 90, '2026-03-27', 'Çeşme Kaymakamlığı THM Konseri', '5.00', 0, '2026-03-16 08:34:09', 0, 0, 0),
(307, 90, '2026-03-23', 'Belediye Tiyatro Kursu', '3.00', 0, '2026-03-17 06:57:48', 0, 0, 0),
(310, 91, '2026-03-28', 'Müzik ve Bale kursları', '2.00', 0, '2026-03-24 15:25:21', 0, 0, 0),
(311, 91, '2026-03-29', 'Müzik ve Bale kursları', '2.00', 0, '2026-03-24 15:25:45', 0, 0, 1),
(312, 91, '2026-03-30', 'Belediye Tiyatro Kursu', '2.50', 0, '2026-03-24 15:26:28', 0, 0, 0),
(313, 91, '2026-04-02', 'Osman Hoca Koro Çalışması', '2.50', 0, '2026-03-24 15:27:12', 0, 0, 0),
(315, 92, '2026-04-05', 'Müzik ve Bale kursları', '2.00', 0, '2026-03-31 12:41:56', 0, 0, 1),
(316, 92, '2026-04-09', 'Osman Hoca Koro Çalışması', '3.00', 0, '2026-03-31 12:43:42', 0, 0, 0),
(318, 93, '2026-04-16', 'KENT ENS. TİYATRO DERSİ', '2.00', 0, '2026-04-07 14:20:46', 0, 0, 0),
(320, 94, '2026-04-19', 'Artiz Mektebi Tiyatro Oyunu', '6.00', 0, '2026-04-14 12:44:09', 0, 0, 1),
(321, 95, '2026-04-25', 'Müzik ve Bale kursları', '5.00', 0, '2026-04-22 10:00:58', 0, 0, 0),
(322, 95, '2026-04-26', 'Müzik ve Bale kursları', '0.00', 0, '2026-04-22 10:01:13', 0, 0, 0),
(323, 95, '2026-04-30', 'Sokratesin Savunması Tiyatro Oyunu', '4.00', 0, '2026-04-22 10:02:37', 0, 0, 0),
(324, 94, '2026-04-23', 'İZMİR AŞKINA PROVA', '0.00', 1, '2026-04-22 16:42:00', 0, 0, 0);

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `haftalar`
--
ALTER TABLE `haftalar`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Tablo için indeksler `kullanicilar`
--
ALTER TABLE `kullanicilar`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Tablo için indeksler `mesai_kayitlari`
--
ALTER TABLE `mesai_kayitlari`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hafta_id` (`hafta_id`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `haftalar`
--
ALTER TABLE `haftalar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- Tablo için AUTO_INCREMENT değeri `kullanicilar`
--
ALTER TABLE `kullanicilar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Tablo için AUTO_INCREMENT değeri `mesai_kayitlari`
--
ALTER TABLE `mesai_kayitlari`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=325;

--
-- Dökümü yapılmış tablolar için kısıtlamalar
--

--
-- Tablo kısıtlamaları `haftalar`
--
ALTER TABLE `haftalar`
  ADD CONSTRAINT `haftalar_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `kullanicilar` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `mesai_kayitlari`
--
ALTER TABLE `mesai_kayitlari`
  ADD CONSTRAINT `mesai_kayitlari_ibfk_1` FOREIGN KEY (`hafta_id`) REFERENCES `haftalar` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
