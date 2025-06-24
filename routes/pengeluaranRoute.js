const express = require('express');
const router = express.Router();
const controller = require('../controllers/pengeluaranController');

router.get('/', controller.getList);
router.post('/tambah', controller.tambah);
router.post('/hapus', controller.hapus);

module.exports = router;