"use strict"
const logger = require('../config/logger').mainLogger;
const rule2020 = require('./scoreSheetPDFLine2-2020');

module.exports.generateScoreSheet = function(res,runs){
  let rule;
  if(runs.length>0){
    rule = runs[0].competition.rule;
  }
  switch(rule){
    case '2020':
    default:
      return rule2020.generateScoreSheet(res,runs);
  }
};
