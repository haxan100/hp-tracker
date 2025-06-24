const db = require('../models/db');

exports.getList = (req, res) => {
  const { bulan, tahun } = req.query;
  if (!bulan || !tahun) {
    return res.render('pengeluaran', { list: [], bulan: '', tahun: '' });
  }

  db.query('SELECT * FROM pengeluaran WHERE bulan = ? AND tahun = ?', [bulan, tahun], (err, result) => {
    if (err) throw err;
    res.render('pengeluaran', { list: result, bulan, tahun });
  });
};

exports.tambah = (req, res) => {
  const { bulan, tahun, keterangan, nominal } = req.body;
  db.query('INSERT INTO pengeluaran (bulan, tahun, keterangan, nominal) VALUES (?, ?, ?, ?)',
    [bulan, tahun, keterangan, nominal],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Gagal menyimpan data' });
      res.json({ success: true, id: result.insertId });
    });
};

exports.hapus = (req, res) => {
  const { id } = req.body;
  db.query('DELETE FROM pengeluaran WHERE id = ?', [id], err => {
    if (err) return res.status(500).json({ error: 'Gagal menghapus' });
    res.json({ success: true });
  });
};
