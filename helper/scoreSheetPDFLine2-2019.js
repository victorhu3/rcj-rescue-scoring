const PDFDocument = require('pdfkit');
const pdf = require('./scoreSheetPDFUtil');
const qr = require('qr-image');
const fs = require('fs');
const logger = require('../config/logger').mainLogger;

/**
 * Defines some important numbers for the placement of different objects in the scoresheet.
 */
const globalConfig = {
  paperSize: {x:841.89 ,y:595.28},
};

function isExistFile(file) {
  try {
    fs.statSync(file);
    return true
  } catch(err) {
    if(err.code === 'ENOENT') return false
  }
}

function drawRun(doc, config, scoringRun) {
  //Set template image as a background
  pdf.drawImage(doc,0,0,"public/images/sheetL.jpg",841.89,595.28,"center");

  //Draw competition name & logo
  pdf.drawTextWithAlign(doc,90,15,scoringRun.competition.name + "  Scoresheet",20,"black",660,"center");
  pdf.drawImage(doc,730,5,"public/images/logo.png",100,30,"right");

  //Draw run QR code
  doc.image(qr.imageSync("L;" + scoringRun._id.toString(), {margin: 2}), 10, 10, {width: 65});

  //Draw team name
  pdf.drawTextWithAlign(doc,120,41,scoringRun.team.name,15,"black",315,"center");

  //Draw start time
  let dateTime = new Date(scoringRun.startTime);
  pdf.drawTextWithAlign(doc,120,60,("0" + dateTime.getHours()).slice(-2) + ":" + ("0" + dateTime.getMinutes()).slice(-2),15,"black",65,"center");

  //Draw round name
  pdf.drawTextWithAlign(doc,225,60,scoringRun.round.name,15,"black",100,"center");

  //Draw field name
  pdf.drawTextWithAlign(doc,360,60,scoringRun.field.name,15,"black",70,"center");

  //Draw map image
  if(isExistFile(__dirname + "/../tmp/course/" + scoringRun.map._id + ".png")){
    pdf.drawImage(doc,13,85,"tmp/course/" + scoringRun.map._id + ".png",420,496,"center");
  }

  //Draw max victim number
  pdf.drawText(doc,740,347,scoringRun.map.victims.live,15,"black");
  pdf.drawText(doc,805,347,scoringRun.map.victims.dead,15,"black");

  //Footer
  pdf.drawText(doc,15,583,"Rule: " + scoringRun.competition.rule,5,"black");
  pdf.drawText(doc,450,470,"Number of checkpoint markers: " + scoringRun.map.numberOfDropTiles,10,"black");
  //System version
  pdf.drawText(doc,780,583,"RCJ Scoring System v19.7",4,"black");
  return;
}

module.exports.generateScoreSheet = function (res, rounds) {
  let doc = new PDFDocument({autoFirstPage: false});

  doc.pipe(res);

  //doc.registerFont('Cardo', 'helper/NotoSans-Regular.ttf');
  //doc.font('Cardo');

  for (let i = 0; i < rounds.length; i++) {
    doc.addPage({
      margin: 0,
      size: [globalConfig.paperSize.x,globalConfig.paperSize.y]
    });
    drawRun(doc, globalConfig, rounds[i]);
  }

  doc.end();

  return;
};
