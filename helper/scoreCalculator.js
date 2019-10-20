"use strict"
const logger = require('../config/logger').mainLogger
const rule2020 = require('./scoreCalculator-2020');


module.exports.calculateLineScore = function (run) {
  let rule = run.competition.rule;
  switch(rule){
    case '2020':
    default:
      return rule2020.calculateLineScore(run);
  }
}

module.exports.calculateLineScoreManual = function (run) {
  let rule = run.competition.rule;
  switch(rule){
    case '2020':
    default:
      return rule2020.calculateLineScoreManual(run);
  }
}

module.exports.calculateMazeScore = function (run) {
  let rule = run.competition.rule;
  switch(rule){
    case '2020':
    default:
      return rule2020.calculateMazeScore(run);
  }
}

module.exports.calculateMazeScoreManual = function (run) {
  let rule = run.competition.rule;
  switch(rule){
    case '2020':
    default:
      return rule2020.calculateMazeScoreManual(run);
  }
}
