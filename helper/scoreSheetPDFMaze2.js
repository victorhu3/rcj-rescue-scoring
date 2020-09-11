"use strict"
const logger = require('../config/logger').mainLogger;
const rule2021 = require('./scoreSheetPDFMaze2-2021');

module.exports.generateScoreSheet = function(res,runs){
  let rule;
  if(runs.length>0){
    rule = runs[0].competition.rule;
  }
  switch(rule){
    case '2021':
    default:
      return rule2021.generateScoreSheet(res,runs);
  }
};
