// -*- tab-width: 2 -*-
const express = require('express');

const router = express.Router();
const { ObjectId } = require('mongoose').Types;
const auth = require('../helper/authLevels');
const { ACCESSLEVELS } = require('../models/user');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('home', { user: req.user });
});

router.get('/scanner/:mode', function (req, res, next) {
  const { mode } = req.params;

  res.render('scanner', { mode, user: req.user });
});

router.get('/:competitionid', function (req, res, next) {
  const id = req.params.competitionid;

  if (!ObjectId.isValid(id)) {
    return next();
  }

  res.render('competition_home', {
    id,
    user: req.user,
    judge: auth.authCompetition(req.user, id, ACCESSLEVELS.JUDGE),
  });
});

router.get('/:competitionid/teams', function (req, res, next) {
  const id = req.params.competitionid;

  if (!ObjectId.isValid(id)) {
    return next();
  }

  res.render('team_home', {
    id,
    user: req.user,
    judge: auth.authCompetition(req.user, id, ACCESSLEVELS.JUDGE),
    view: auth.authCompetition(req.user, id, ACCESSLEVELS.VIEW),
  });
});

router.get('/access_denied', function (req, res) {
  res.render('access_denied', { user: req.user });
});

module.exports = router;
