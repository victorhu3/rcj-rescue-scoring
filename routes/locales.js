// -*- tab-width: 2 -*-
const express = require('express');

const router = express.Router();

router.get('/', function (req, res) {
  res.render('locales', {
    user: req.user,
  });
});

module.exports = router;
