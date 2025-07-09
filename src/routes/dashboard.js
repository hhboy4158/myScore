const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middlewares/auth');

router.get('/dashboard', requireLogin, (req, res) => {
  return res.render('dashboard', { title: 'MyScore 首頁', user: req.user});
});

module.exports = router;