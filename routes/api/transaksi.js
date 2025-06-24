// routes/api/transaksi.js
const express = require('express');
const router = express.Router();
const db = require('../../models/db');

router.post('/', (req, res) => {
  console.log(req.body); // Log request body for debugging
  
  const { bulan, tahun } = req.body;

  if (!bulan || !tahun) {
    return res.status(400).json({ success: false, message: 'Bulan dan tahun wajib diisi' });
  }

  const sql = `
    SELECT * FROM hp_transactions 
    WHERE bulan = ? AND tahun = ?
    ORDER BY id DESC
  `;

  db.query(sql, [bulan, tahun], (err, result) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data transaksi' });
    }

    res.json({
      success: true,
      bulan: parseInt(bulan),
      tahun: parseInt(tahun),
      data: result
    });
  });
});

module.exports = router;
