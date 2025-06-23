const db = require('../models/db');
const XLSX = require('xlsx');

exports.form = (req, res) => {
  res.render('form');
};

exports.handleUpload = (req, res) => {
  const { bulan, tahun, admin, ongkir } = req.body;
  const filePath = req.file.path;

  // Simpan transaksi ke tabel utama
  db.query(
    "INSERT INTO transaksi (bulan, tahun, biaya_admin, ongkir) VALUES (?, ?, ?, ?)", 
    [bulan, tahun, admin, ongkir],
    (err, result) => {
      if (err) throw err;
      const transaksi_id = result.insertId;

      // Baca isi file excel
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Buang baris header
      rows.slice(1).forEach(row => {
        const [no, hp, grade, imei, harga_beli] = row;

        if (hp && imei) { // validasi minimal data terisi
          db.query(
            "INSERT INTO hp_transactions (no, hp, grade, imei, harga_beli, transaksi_id) VALUES (?, ?, ?, ?, ?, ?)",
            [no, hp, grade, imei, harga_beli, transaksi_id]
          );
        }
      });

      res.send(`✅ Transaksi berhasil diimport. ID: ${transaksi_id}`);
    }
  );
};
