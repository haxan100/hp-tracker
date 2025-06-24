const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', (req, res) => {
  const { bulan, tahun } = req.query;
  if (!bulan || !tahun) return res.render('transaksi', { data: [], bulan: null, tahun: null });

  db.query(`
    SELECT hp.id, hp.no, hp.hp, hp.imei, hp.grade, hp.harga_beli, hp.harga_jual, hp.status
    FROM hp_transactions hp
    JOIN transaksi t ON hp.transaksi_id = t.id
    WHERE t.bulan = ? AND t.tahun = ?
  `, [bulan, tahun], (err, result) => {
    if (err) throw err;
    res.render('transaksi', { data: result, bulan, tahun });
  });
});
router.post('/update', async (req, res) => {
  const { id, harga_jual } = req.body;

  try {
    await db.execute(
      `UPDATE hp_transactions SET harga_jual = ?, status = 'laku' WHERE id = ?`,
      [harga_jual, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});
  
  
router.get('/rekap', async (req, res) => {
  const { bulan, tahun } = req.query;
  if (!bulan || !tahun) return res.render('rekap', { summary: null, compare: null, bulan, tahun });

  const dbQuery = (sql, params) =>
    new Promise((resolve, reject) =>
      db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)))
    );

  try {
    // Ambil total beli/jual dan biaya_admin + ongkir hanya dari 1 transaksi (LIMIT 1)
    const rows = await dbQuery(`
      SELECT 
        SUM(hp.harga_beli) AS total_beli,
        SUM(hp.harga_jual) AS total_jual,
        t.biaya_admin,
        t.ongkir
      FROM hp_transactions hp
      JOIN transaksi t ON hp.transaksi_id = t.id
      WHERE t.bulan = ? AND t.tahun = ?
      LIMIT 1
    `, [bulan, tahun]);

    const row = rows[0];

    const pengeluaranTambahan = await dbQuery(
      `SELECT SUM(nominal) AS total_pengeluaran FROM pengeluaran WHERE bulan = ? AND tahun = ?`,
      [bulan, tahun]
    );

    const pengeluaranEkstra = Number(pengeluaranTambahan[0].total_pengeluaran) || 0;

    if (!row.total_beli && !row.total_jual && pengeluaranEkstra === 0) {
      return res.render('rekap', { summary: null, compare: null, bulan, tahun });
    }

    const summary = {
      total_beli: Number(row.total_beli) || 0,
      total_jual: Number(row.total_jual) || 0,
      total_admin: Number(row.biaya_admin) || 0,
      total_ongkir: Number(row.ongkir) || 0,
      pengeluaran_tambahan: pengeluaranEkstra
    };

    summary.pengeluaran = summary.total_beli + summary.total_admin + summary.total_ongkir + summary.pengeluaran_tambahan;
    summary.laba = summary.total_jual - summary.pengeluaran;

    // Hitung bulan lalu
    let bulanLalu = parseInt(bulan) - 1;
    let tahunLalu = parseInt(tahun);
    if (bulanLalu <= 0) {
      bulanLalu = 12;
      tahunLalu -= 1;
    }

    const prevRows = await dbQuery(`
      SELECT 
        SUM(hp.harga_beli) AS total_beli,
        SUM(hp.harga_jual) AS total_jual,
        t.biaya_admin,
        t.ongkir
      FROM hp_transactions hp
      JOIN transaksi t ON hp.transaksi_id = t.id
      WHERE t.bulan = ? AND t.tahun = ?
      LIMIT 1
    `, [bulanLalu, tahunLalu]);

    const pengeluaranLalu = await dbQuery(
      `SELECT SUM(nominal) AS total_pengeluaran FROM pengeluaran WHERE bulan = ? AND tahun = ?`,
      [bulanLalu, tahunLalu]
    );

    const prev = {
      total_beli: Number(prevRows[0].total_beli) || 0,
      total_jual: Number(prevRows[0].total_jual) || 0,
      total_admin: Number(prevRows[0].biaya_admin) || 0,
      total_ongkir: Number(prevRows[0].ongkir) || 0,
      pengeluaran_tambahan: Number(pengeluaranLalu[0].total_pengeluaran) || 0
    };

    const prev_pengeluaran = prev.total_beli + prev.total_admin + prev.total_ongkir + prev.pengeluaran_tambahan;
    const prev_laba = prev.total_jual - prev_pengeluaran;

    const selisih = summary.laba - prev_laba;
    const persen = prev_laba === 0 ? 100 : (selisih / Math.abs(prev_laba)) * 100;

    const compare = {
      bulanLalu,
      tahunLalu,
      prev_laba,
      selisih,
      persen: persen.toFixed(2)
    };

    res.render('rekap', { summary, compare, bulan, tahun });
  } catch (err) {
    console.error(err);
    res.send('Terjadi kesalahan saat menghitung rekap.');
  }
});

  
  
module.exports = router;
