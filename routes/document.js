// -*- tab-width: 2 -*-
const express = require('express')
const publicRouter = express.Router()
const privateRouter = express.Router()
const adminRouter = express.Router()
const competitiondb = require('../models/competition')
const logger = require('../config/logger').mainLogger
const ObjectId = require('mongoose').Types.ObjectId
const auth = require('../helper/authLevels')
const ACCESSLEVELS = require('../models/user').ACCESSLEVELS
const dateformat = require('dateformat');
const fs = require('fs')


function getIP(req) {
  if (req.headers['x-forwarded-for']) {
    return req.headers['x-forwarded-for'];
  }
  if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress;
  }
  if (req.connection.socket && req.connection.socket.remoteAddress) {
    return req.connection.socket.remoteAddress;
  }
  if (req.socket && req.socket.remoteAddress) {
    return req.socket.remoteAddress;
  }
  return '0.0.0.0';
};

function writeLog(req, competitionId, teamId, message){
  let output = "[" + dateformat(new Date(), 'mm/dd/yy HH:MM:ss') + "] " + getIP(req) + " : " + message + "\n";
  fs.appendFile(__dirname + "/../documents/" + competitionId + "/" + teamId + "/log.txt", output, (err) => {
    if (err) logger.error(err.message);
  });
}


privateRouter.get('/review/:teamId', function (req, res, next) {
  const teamId = req.params.teamId;
  
  if (!ObjectId.isValid(teamId)) {
    return next()
  }

  competitiondb.team.findById(teamId)
  .select("competition document.token")
  .exec(function (err, dbTeam) {
          if (err || dbTeam == null) {
              if(!err) err = {message: 'No team found'};
              res.status(400).send({
                  msg: "Could not get team",
                  err: err.message
              })
          } else if (dbTeam) {
            if(auth.authCompetition(req.user,dbTeam.competition,ACCESSLEVELS.JUDGE)){
              res.render('document_review', {competition: dbTeam.competition, team: teamId, user: req.user, token: dbTeam.document.token})
            }else{
              res.render('access_denied', {user: req.user})
            }
          }
      }
  )
})

privateRouter.get('/reviewed/:teamId', function (req, res, next) {
  const teamId = req.params.teamId;
  
  if (!ObjectId.isValid(teamId)) {
    return next()
  }

  competitiondb.team.findById(teamId)
  .select("competition document.token")
  .exec(function (err, dbTeam) {
          if (err || dbTeam == null) {
              if(!err) err = {message: 'No team found'};
              res.status(400).send({
                  msg: "Could not get team",
                  err: err.message
              })
          } else if (dbTeam) {
            if(auth.authCompetition(req.user,dbTeam.competition,ACCESSLEVELS.VIEW)){
              res.render('document_reviewed', {competition: dbTeam.competition, team: teamId, user: req.user, token: dbTeam.document.token})
            }else{
              res.render('access_denied', {user: req.user})
            }
          }
      }
  )
})

privateRouter.get('/:teamId', function (req, res, next) {
  const teamId = req.params.teamId;
  
  if (!ObjectId.isValid(teamId)) {
    return next()
  }


  competitiondb.team.findById(teamId)
  .populate('competition')
  .select("competition document.deadline document.token document.enabled")
  .exec(function (err, dbTeam) {
          if (err || dbTeam == null) {
              if(!err) err = {message: 'No team found'};
              res.status(400).send({
                  msg: "Could not get team",
                  err: err.message
              })
          } else if (dbTeam) {
            if(auth.authCompetition(req.user,dbTeam.competition._id,ACCESSLEVELS.VIEW)){
              if(dbTeam.competition.documents.enable && dbTeam.document.enabled){
                let teamDeadline = dbTeam.document.deadline;
                let deadline = dbTeam.competition.documents.deadline;
                if(teamDeadline != null) deadline = teamDeadline;

                let now = new Date();
                let timestamp = Math.floor(now.getTime()/1000);

                res.render('document_form', {deadline: deadline, editable: deadline >= timestamp, competition: dbTeam.competition._id, team: teamId, token: dbTeam.document.token, user: req.user})
              }else{
                res.render('access_denied', {user: req.user})
              }
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
  .select("competition document.deadline document.token document.enabled")
  .exec(function (err, dbTeam) {
          if (err || dbTeam == null) {
              if(!err) err = {message: 'No team found'};
              res.status(400).send({
                  msg: "Could not get team",
                  err: err.message
              })
          } else if (dbTeam) {
            if(dbTeam.document.token == token){
              if(dbTeam.competition.documents.enable && dbTeam.document.enabled){
                let teamDeadline = dbTeam.document.deadline;
                let deadline = dbTeam.competition.documents.deadline;
                if(teamDeadline != null) deadline = teamDeadline;

                let now = new Date();
                let timestamp = Math.floor(now.getTime()/1000);

                res.render('document_form', {deadline: deadline, editable: deadline >= timestamp, competition: dbTeam.competition._id, team: teamId, token: dbTeam.document.token, user: req.user})
                writeLog(req, dbTeam.competition._id, dbTeam._id, "Accessed the document submission page.");
              }else{
                res.render('access_denied', {user: req.user})
                writeLog(req, dbTeam.competition._id, dbTeam._id, "Tried to access the document submission page, but they are not allowed to do so.");
              }
              
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
