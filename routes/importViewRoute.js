const express = require('express');
const router = express.Router();
const db = require('../models/db'); // sesuaikan jika pakai pool

router.get('/:id', async (req, res) => {
  const transaksiId = req.params.id;

  try {
    const [rows] = await db.execute(`
      SELECT * FROM hp_transactions 
      WHERE transaksi_id = ?
    `, [transaksiId]);

    res.render('import_result', {
      data: rows,
      transaksiId
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal mengambil data hasil import');
  }
});

module.exports = router;
