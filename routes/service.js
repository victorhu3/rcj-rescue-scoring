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

router.get('/editor/maze/2020', async function (req, res, next) {
  res.render('maze_editor', {user: req.user, pubService:true})
})


router.get('/editor/line/2020', function (req, res, next) {
  res.render('line_editor', {user: req.user, pubService:true})
})




module.exports = router
