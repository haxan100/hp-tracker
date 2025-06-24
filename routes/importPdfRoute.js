const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const mysql = require('mysql2/promise'); // PAKAI YANG PROMISE

require('dotenv').config();

// Setup koneksi langsung di file ini (tanpa pakai models/db)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Setup multer untuk upload file PDF
const storage = multer.diskStorage({
  destination: './uploads/pdf',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Route untuk upload dan import PDF
router.post('/', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const buffer = fs.readFileSync(filePath);

  const { bulan, tahun, ongkir, biaya_admin } = req.body;
  console.log(`Bulan: ${bulan}, Tahun: ${tahun}, Ongkir: ${ongkir}, Biaya Admin: ${biaya_admin}`);

  try {
    // Masukkan transaksi dulu
    const [result] = await db.execute(
      `INSERT INTO transaksi (bulan, tahun, biaya_admin, ongkir, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [bulan, tahun, biaya_admin, ongkir]
    );
    const transaksiId = result.insertId;
    console.log(`Transaksi ID: ${transaksiId}`);

    // Parse PDF
    const data = await pdf(buffer);
    const lines = data.text.split('\n').map(l => l.trim()).filter(Boolean);

    const items = [];
    for (let i = 0; i < lines.length; i++) {
      if (/IMEI/i.test(lines[i])) {
        const hp = lines[i - 1];
        const imei = lines[i].split(':')[1].trim();
        const nextLine = lines[i + 1];

        const grade = nextLine.slice(0, 2).toUpperCase();
        const hargaRaw = nextLine.slice(2).replace(/\./g, '');
        const harga = parseInt(hargaRaw);

        items.push({ hp, imei, grade, harga });
      }
    }

    for (const item of items) {
      await db.execute(
        `INSERT INTO hp_transactions (hp, imei, grade, harga_beli, harga_jual, status, transaksi_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [item.hp, item.imei, item.grade, item.harga, null, 'belum_laku', transaksiId]
      );
    }

    res.redirect('/transaksi?import=success');


  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan ke database' });
  }
});

module.exports = router;
