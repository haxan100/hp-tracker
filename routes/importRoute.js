const express = require('express');
const router = express.Router();
const controller = require('../controllers/importController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', controller.form);
router.post('/', upload.single('file'), controller.handleUpload);

module.exports = router;
