const express = require('express');
const router = express.Router();

const USER = 'heyiamhasan';
const PASS = 'DuniaHasan2012s*';

router.get('/', (req, res) => {
  res.render('login', { error: null });
});

router.post('/', (req, res) => {
  const { username, password } = req.body;
  if (username === USER && password === PASS) {
    req.session.loggedIn = true;
    res.redirect('/import');
  } else {
    res.render('login', { error: 'Username atau password salah' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
