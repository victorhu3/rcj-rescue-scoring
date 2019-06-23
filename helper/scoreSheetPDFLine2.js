"use strict"
const logger = require('../config/logger').mainLogger;
const rule2019 = require('./scoreSheetPDFLine2-2019');

module.exports.generateScoreSheet = function(res,runs){
  let rule = runs[0].competition.rule;
  switch(rule){
    case '2019':
    default:
      return rule2019.generateScoreSheet(res,runs);
  }
};
