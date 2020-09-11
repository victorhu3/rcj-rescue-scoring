// -*- tab-width: 2 -*-
const ObjectId = require('mongoose').Types.ObjectId
const express = require('express')
const router = express.Router()
const auth = require('../helper/authLevels')
const ACCESSLEVELS = require('../models/user').ACCESSLEVELS
const ruleDetector = require('../helper/ruleDetector')


/* GET home page. */
router.get('/', function (req, res) {
  res.render('service_home', {user: req.user})
})

router.get('/editor/maze/:rule', async function (req, res, next) {
  const rule = req.params.rule;
  res.render('maze_editor', {user: req.user,rule: rule, pubService:true})
})

router.get('/editor/simulation/:rule', async function (req, res, next) {
  const rule = req.params.rule;
  res.render('sim_editor', {user: req.user,rule: rule, pubService:true})
})

router.get('/editor/line/2021', function (req, res, next) {
  const rule = req.params.rule;
  res.render('line_editor', {user: req.user,rule: rule, pubService:true})
})




module.exports = router
