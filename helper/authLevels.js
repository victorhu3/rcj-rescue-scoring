"use strict"
var mongoose = require('mongoose');
const logger = require('../config/logger').mainLogger

const ACCESSLEVELS = require('../models/user').ACCESSLEVELS

/**
 * View only started runs to public
 * @param user
 * @param run
 */
function authViewRun(user, run, level) {
  if (run == null) {
    return 0
  }
  
  if (user == null) {
    if(run.sign.captain != ""){
        return 2
    }
    if(run.status == 6) return 2
    return 0
  }
  
  if (user.superDuperAdmin) {
    return 1
  }
  
  if (run.competition != undefined && run.competition.constructor == String) {
    var competitionId = run.competition
  } else if (run.competition != undefined &&
             run.competition.constructor == Object) {
    var competitionId = run.competition._id
  }
  if (authCompetition(user, competitionId, level)) {
    return 1
  }
  if(run.sign.captain != ""){
        return 2
  }
  if(run.status == 6) return 2
  return 0
}
module.exports.authViewRun = authViewRun

function authJudgeRun(user, run, level) {
    
  if (run == null) {
    return false
  }
  if (user == null) {
    return false
  }
  
  if (user.superDuperAdmin) {
    return true
  }
  if (run.competition != undefined && run.competition.constructor == String) {
    var competitionId = run.competition
  } else if (run.competition != undefined &&
             run.competition.constructor == Object) {
    var competitionId = run.competition._id
  }
  if (authCompetition(user, competitionId, level)) {
    return true
  }
  return false
}
module.exports.authJudgeRun = authJudgeRun

function authCompetition(user, competitionId, level) {
  
  if (user == null) {
    return false
  }
  
  if (user.superDuperAdmin) {
    return true
  }
  if (user.competitions != undefined) {
    return user.competitions.some((c) => c.id.toString == competitionId && c.accessLevel >= level);
  }
  return false
}
module.exports.authCompetition = authCompetition

function competitionLevel(user,competitionId){
    if (user == null) {
        return ACCESSLEVELS.NONE;
    }
    if (competitionId == null){
        return ACCESSLEVELS.NONE;
    }
    if (user.superDuperAdmin) {
        return ACCESSLEVELS.SUPERADMIN;
    }
    if (user.competitions != undefined) {
      return user.competitions.find((c) => c.id.toString() == competitionId).accessLevel;
    }
    return ACCESSLEVELS.NONE;  
}
module.exports.competitionLevel = competitionLevel
