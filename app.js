const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const app = express();
require('dotenv').config();




const transaksiApi = require('./routes/api/transaksi');
app.use('/api/transaksi', transaksiApi);

const importPdfRoute = require('./routes/importPdfRoute');
app.use('/api/import-pdf', importPdfRoute);




// ✅ Middleware untuk parsing body dari form
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Optional, kalau kamu butuh kirim data JSON













// ✅ Session setup (harus sebelum login dan proteksi)
app.use(session({
  secret: 'secretbanget',
  resave: false,
  saveUninitialized: false
}));

// ✅ Layout setup
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout'); // Gunakan views/layout.ejs
app.use((req, res, next) => {
  res.locals.req = req;
  next();
});
// ✅ Static folder
app.use('/uploads', express.static('uploads'));

// ✅ Route bebas akses dulu
const loginRoute = require('./routes/loginRoute');
app.use('/login', loginRoute);

// ✅ Middleware proteksi semua route di bawahnya
function authMiddleware(req, res, next) {
  // Kalau path diawali /api, skip login check
  if (req.path.startsWith('/api')) return next();

  if (req.session && req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
}
app.use(authMiddleware);

// ✅ Routes utama (butuh login)
const importRoute = require('./routes/importRoute');
const transaksiRoute = require('./routes/transaksiRoute');
app.get('/', (req, res) => res.redirect('/import'));
app.use('/import', importRoute);
app.use('/transaksi', transaksiRoute);
const pengeluaranRoute = require('./routes/pengeluaranRoute');
app.use('/pengeluaran', pengeluaranRoute);
// ✅ Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
const importViewRoute = require('./routes/importViewRoute');
app.use('/hasil-import', importViewRoute);
const importFormRoute = require('./routes/importFormRoute');
app.use('/upload', importFormRoute);