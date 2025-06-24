const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('import_form'); // view untuk form upload
});

module.exports = router;
