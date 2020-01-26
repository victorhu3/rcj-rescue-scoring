// -*- tab-width: 2 -*-
const express = require('express')
const router = express.Router()
const ObjectId = require('mongoose').Types.ObjectId
const auth = require('../helper/authLevels')
const ACCESSLEVELS = require('../models/user').ACCESSLEVELS


/* GET home page. */
router.get('/', function (req, res) {
  res.render('home', {user: req.user});
})

router.get('/scanner/:mode', function (req, res, next) {
  const mode = req.params.mode

  res.render('scanner', {mode: mode, user: req.user})
})

router.get('/:competitionid', function (req, res, next) {
  const id = req.params.competitionid
  
  if (!ObjectId.isValid(id)) {
    return next()
  }

  res.render('competition_home', {id: id, user: req.user, judge: auth.authCompetition(req.user,id,ACCESSLEVELS.JUDGE)})
})

router.get('/access_denied', function (req, res) {
  res.render('access_denied', {user: req.user});
})

module.exports = router
