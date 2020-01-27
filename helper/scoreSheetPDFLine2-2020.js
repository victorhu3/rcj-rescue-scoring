const PDFDocument = require('pdfkit');
const pdf = require('./scoreSheetPDFUtil');
const qr = require('qr-image');
const fs = require('fs');
const logger = require('../config/logger').mainLogger;
const guessLanguage = require('guesslanguage/lib/guessLanguage').guessLanguage;
const glob = require("glob");
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

function guessLanguagePromise(text){
  return new Promise((resolve) => {
    guessLanguage.name(text,(name) => {
      return resolve(name);
    });
  });
}

function getFontPath(lang){
  let list = glob.sync(__dirname + '/../fonts/' + lang + '*');
  if(list.length > 0 ) {
    return list[0];
  }
  return null;
}

async function drawRun(doc, config, scoringRun) {
  //Set template image as a background
  pdf.drawImage(doc,0,0,"scoresheet_generation/line/base2020.png",841.89,595.28,"center");

  //Draw competition name & logo
  pdf.drawTextWithAlign(doc,90,15,scoringRun.competition.name + "  Rescue Line",20,"black",660,"center");

  if(scoringRun.competition.logo != "") pdf.drawImage(doc,730,5,scoringRun.competition.logo,100,30,"right");
  else pdf.drawImage(doc,730,5,"public/images/logo.png",100,30,"right");

  //Draw run QR code
  doc.image(qr.imageSync("L;" + scoringRun._id.toString(), {margin: 2}), 10, 10, {width: 70});

  //Draw team name
  pdf.drawTextWithAlign(doc,124,41,scoringRun.team.name,15,"black",310,"center");

  //Draw start time
  let dateTime = new Date(scoringRun.startTime);
  pdf.drawTextWithAlign(doc,124,60,("0" + dateTime.getHours()).slice(-2) + ":" + ("0" + dateTime.getMinutes()).slice(-2),15,"black",68,"center");

  //Draw round name
  pdf.drawTextWithAlign(doc,227,60,scoringRun.round.name,15,"black",103,"center");

  //Draw field name
  pdf.drawTextWithAlign(doc,365,60,scoringRun.field.name,15,"black",70,"center");

  //Draw map image
  if(isExistFile(__dirname + "/../tmp/course/" + scoringRun.map._id + ".png")){
    pdf.drawImage(doc,20,85,"tmp/course/" + scoringRun.map._id + ".png",413,485,"center");
  }

  //System version
  pdf.drawText(doc,750,573,"RCJ Scoring System v20.0",6,"black");

  let x = 440;
  let y = 35;

  //Draw box of the start tile

  //Simulate before render
  let tiles = [];
  let index = 1;
  let base_size_x = 95;
  let base_size_y = 36;

  y+=base_size_y; // Start tile
  while(1){
    let tile = getTileInfo(scoringRun.map.tiles,index);
    if(tile == null) break;
    if(tile.checkPoint){
      if(y>330-base_size_y*2){
        x += base_size_x;
        y = 35;
      }
      y+=base_size_y*2;
      if(y>330-base_size_y){
        x += base_size_x;
        y = 35;
      }
      let t = Object.create(tile);
      t.nowIndex = index;
      tiles.push(t);
    }
    if(tile.tileType.gaps||tile.tileType.intersections||tile.tileType.seesaw||tile.items.obstacles||tile.items.speedbumps||tile.items.rampPoints){
      let t = Object.create(tile);
      t.nowIndex = index;
      tiles.push(t);
      y+=base_size_y;
      if(y>330-base_size_y){
        x += base_size_x;
        y = 35;
      }
    }

    index++;
  }

  y+=base_size_y; // LoP after final checkpoint
  if(y>330-base_size_y){
    x += base_size_x;
    y = 35;
  }

  console.log(x);
  console.log(y);


  let text_padding = 10;
  switch(x){
    case 820:
      if(y > 35){
        base_size_x = 76;
        base_size_y = 29;
        text_padding = 10;
      }
      break;
    case 915:
      base_size_x = 76;
      base_size_y = 29;
      text_padding = 10;
    default:
      break;
  }

  x = 440;
  y = 35;

  pdf.drawImage(doc,x,y,"scoresheet_generation/line/start.png",base_size_x,50,"center");
  pdf.drawTextWithAlign(doc,x,y+text_padding,1,20,"#ff9f43",base_size_y,"center");
  y += base_size_y;
  let checkPointNum = 0;
  for(let tile of tiles){
    let item = [];
    if(tile.checkPoint){
      if(y>330-base_size_y*2){
        x += base_size_x;
        y = 35;
      }
      if(scoringRun.map.EvacuationAreaLoPIndex == checkPointNum){
        pdf.drawImage(doc,x,y,"scoresheet_generation/line/checkpointE.png",base_size_x,100,"center");
        pdf.drawTextWithAlign(doc,x,y+text_padding,tile.nowIndex+1,20,"#ee5253",base_size_y,"center");
      } else {
        pdf.drawImage(doc,x,y,"scoresheet_generation/line/checkpoint.png",base_size_x,100,"center");
        pdf.drawTextWithAlign(doc,x,y+text_padding,tile.nowIndex+1,20,"#ff9f43",base_size_y,"center");
      }
      checkPointNum++;

      y+=base_size_y*2;
      if(y>330-base_size_y){
        x += base_size_x;
        y = 35;
      }
    }else{
      if(tile.tileType.gaps) item.push("gap");
      if(tile.tileType.intersections) item.push("intersection");
      if(tile.tileType.seesaw) item.push("seesaw");
      if(tile.items.obstacles) item.push("obstacle");
      if(tile.items.speedbumps) item.push("speedbump");
      if(tile.items.rampPoints) item.push("ramp");

      if(item.length > 0){
        pdf.drawImage(doc,x,y,"scoresheet_generation/line/element.png",base_size_x,50,"center");
        pdf.drawTextWithAlign(doc,x,y+text_padding,tile.nowIndex+1,20,"#0abde3",base_size_y,"center");
        let item_x = x+base_size_y+6;
        let item_y = y+3;
        pdf.drawImage(doc,item_x+3,item_y+3,"public/images/tiles/"+tile.tileType.image,base_size_y-10,base_size_y-10,"center",tile.rot);
        pdf.drawRectangle(doc,item_x+3,item_y+3,base_size_y-10,base_size_y-10);
        for(let i of item){
          switch(i){
            case 'seesaw':
            case 'intersection':
            case 'gap':
              break;
            case 'speedbump':
              pdf.drawImage(doc,item_x,item_y,"scoresheet_generation/line/" + i +".png",base_size_y-5,base_size_y-5,"center",tile.rot);
            default:
              pdf.drawImage(doc,item_x,item_y,"scoresheet_generation/line/" + i +".png",base_size_y-5,base_size_y-5,"center");
          }
        }
        y+=base_size_y;
        if(y>330-base_size_y){
          x += base_size_x;
          y = 35;
        }
      }
    }
    index++;
  }

  pdf.drawImage(doc,x,y,"scoresheet_generation/line/after_final.png",base_size_x,50,"center");

  console.log(getTileInfo(scoringRun.map.tiles,0))
  return;
}


function getTileInfo(tiles,index){
  for(let t of tiles){
    for(let i of t.index){
      if(i == index) return t;
    }
  }
  return null;
}


module.exports.generateScoreSheet = async function (res, rounds) {
  let font = null;
  if(rounds.length > 0){
    let tmp = await guessLanguagePromise(rounds[0].competition.name);
    font = getFontPath(tmp);
  }

  let doc = new PDFDocument({autoFirstPage: false});

  doc.pipe(res);

  if(font) doc.font(font);

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
