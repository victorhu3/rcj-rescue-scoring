// -*- tab-width: 2 -*-
var express = require('express')
var publicRouter = express.Router()
var privateRouter = express.Router()
var adminRouter = express.Router()
var competitiondb = require('../models/competition')
const logger = require('../config/logger').mainLogger
var ObjectId = require('mongoose').Types.ObjectId
const auth = require('../helper/authLevels')
const ACCESSLEVELS = require('../models/user').ACCESSLEVELS

/* GET home page. */

privateRouter.get('/:teamId', function (req, res, next) {
  const teamId = req.params.teamId;
  
  if (!ObjectId.isValid(teamId)) {
    return next()
  }

  console.log(teamId);

  competitiondb.team.findById(teamId)
  .populate('competition')
  .select("competition document.deadline document.token")
  .exec(function (err, dbTeam) {
    console.log(dbTeam);
          if (err || dbTeam == null) {
              if(!err) err = {message: 'No team found'};
              res.status(400).send({
                  msg: "Could not get team",
                  err: err.message
              })
          } else if (dbTeam) {
            console.log(dbTeam);
            if(auth.authCompetition(req.user,dbTeam.competition,ACCESSLEVELS.VIEW)){
              let teamDeadline = dbTeam.document.deadline;
              let deadline = dbTeam.competition.documents.deadline;
              if(teamDeadline != null) deadline = teamDeadline;

              let now = new Date();
              let timestamp = Math.floor(now.getTime()/1000);

              res.render('document_form', {deadline: deadline, editable: deadline >= timestamp, competition: dbTeam.competition._id, team: teamId, token: dbTeam.document.token, user: req.user})
            }else{
              res.render('access_denied', {user: req.user})
            }
          }
      }
  )
})


publicRouter.get('/:teamId/:token', function (req, res, next) {
  const teamId = req.params.teamId;
  const token = req.params.token;
  
  if (!ObjectId.isValid(teamId)) {
    return next()
  }

  competitiondb.team.findById(teamId)
  .populate('competition')
  .select("competition document.deadline document.token")
  .exec(function (err, dbTeam) {
          if (err || dbTeam == null) {
              if(!err) err = {message: 'No team found'};
              res.status(400).send({
                  msg: "Could not get team",
                  err: err.message
              })
          } else if (dbTeam) {
            console.log(dbTeam)
            if(dbTeam.document.token == token){
              let teamDeadline = dbTeam.document.deadline;
              let deadline = dbTeam.competition.documents.deadline;
              if(teamDeadline != null) deadline = teamDeadline;

              let now = new Date();
              let timestamp = Math.floor(now.getTime()/1000);

              res.render('document_form', {deadline: deadline, editable: deadline >= timestamp, competition: dbTeam.competition._id, team: teamId, token: dbTeam.document.token, user: req.user})
            }else{
              res.render('access_denied', {user: req.user})
            }
          }
      }
  )
})


privateRouter.get('/:competitionid/do/:teamid', function (req, res, next) {
  const id = req.params.competitionid
  const tid = req.params.teamid
  
  if (!ObjectId.isValid(id)) {
    return next()
  }
  if(auth.authCompetition(req.user,id,ACCESSLEVELS.JUDGE)) res.render('do_interview', {id: id, tid: tid, user: req.user})
  else res.render('access_denied', {user: req.user})
})

adminRouter.get('/:competitionid/pub/:teamid', function (req, res, next) {
  const id = req.params.competitionid
  const tid = req.params.teamid
  
  if (!ObjectId.isValid(id)) {
    return next()
  }
  if(auth.authCompetition(req.user,id,ACCESSLEVELS.ADMIN)) res.render('pub_interview', {id: id, tid: tid, user: req.user})
  else res.render('access_denied', {user: req.user})
})

publicRouter.get('/:competitionid/view/:teamid', function (req, res, next) {
  const id = req.params.competitionid
  const tid = req.params.teamid
  
  if (!ObjectId.isValid(id)) {
    return next()
  }
  if(auth.authCompetition(req.user,id,ACCESSLEVELS.JUDGE))res.render('view_interview', {id: id, tid: tid, user: req.user, judge: 1})
  else res.render('view_interview', {id: id, tid: tid, user: req.user, judge: 0})
  //if(auth.authCompetition(req.user,id,ACCESSLEVELS.JUDGE)) res.render('view_interview', {id: id, tid: tid, user: req.user})
  //else res.render('access_denied', {user: req.user})
})



publicRouter.all('*', function (req, res, next) {
  next()
})
privateRouter.all('*', function (req, res, next) {
  next()
})

module.exports.public = publicRouter
module.exports.private = privateRouter
module.exports.admin = adminRouter
