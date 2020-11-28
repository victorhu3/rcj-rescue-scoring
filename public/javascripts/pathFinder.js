
function pathFinder (map) {
  let tiles = map.tiles;
  let startTile = tiles[map.startTile.x + ',' + map.startTile.y + ',' + map.startTile.z];
  if(!startTile) return map;
  let startDir = "";
  let startPaths = startTile.tileType.paths;
  Object.keys(startPaths).forEach(function (dir, index) {
    let nextTile = tiles[nextCoord(startTile, rotateDir(dir, startTile.rot))];
    if (nextTile !== undefined) {
      startDir = rotateDir(dir, startTile.rot)
    }
  });

  return traverse(startTile, startDir, tiles, map, 0, 0);
};

function evacTile(tile){
  return tile.tileType._id == "58cfd6549792e9313b1610e1" || tile.tileType._id == "58cfd6549792e9313b1610e2" || tile.tileType._id == "58cfd6549792e9313b1610e3";
}

function traverse(curTile, entryDir, tiles, map, index, chpCount) {
  if(curTile.checkPoint) chpCount++;
  let next_Coord = nextCoord(curTile, entryDir);
  tiles[curTile.x + ',' + curTile.y + ',' + curTile.z].index.push(index);
  let nextTile = tiles[next_Coord];

  if (curTile.tileType._id == '58cfd6549792e9313b1610e0') {
    map.indexCount = index + 1;
    map.tiles = tiles;
    return map;
  }
  
  if (nextTile === undefined || evacTile(nextTile)) {
    let startTile2 = tiles[map.startTile2.x + ',' + map.startTile2.y + ',' + map.startTile2.z];
    if(startTile2 === undefined || startTile2.index.length > 0){
      map.EvacuationAreaLoPIndex = chpCount;
      map.indexCount = index + 1;
      map.tiles = tiles;
      return map;
    }
    let startDir2 = "";
    let startPaths2 = startTile2.tileType.paths;
    for (const [key, value] of Object.entries(startPaths2)) {
      if(key == "$init") continue;
      if(!value) continue;

      let entryDir2 = rotateDir(key, startTile2.rot);
      let nextTile2 = tiles[nextCoord(startTile2, entryDir2)];
      if (nextTile2 !== undefined) {
        if(evacTile(nextTile2)){
          nextTile2.evacExit = dir2num(flipDir(exitDir(startTile2, entryDir2)));
          startDir2 = exitDir(startTile2, entryDir2);
        }
      }
    }
    tiles[curTile.x + ',' + curTile.y + ',' + curTile.z].next.push(next_Coord);
    map.EvacuationAreaLoPIndex = chpCount;
    return traverse(startTile2, startDir2, tiles, map, index + 1, chpCount);

  }
  tiles[curTile.x + ',' + curTile.y + ',' + curTile.z].next.push(next_Coord);

  return traverse(nextTile, flipDir(exitDir(curTile, entryDir)), tiles, map, index + 1, chpCount);
}

function exitDir(curTile, entryDir) {
  let dir = rotateDir(entryDir, -curTile.rot);
  return rotateDir(curTile.tileType.paths[dir], curTile.rot);
}

function nextCoord(curTile, entryDir) {
  let exit = exitDir(curTile, entryDir);
  let coord;
  switch (exit) {
    case "top":
      coord = curTile.x + ',' + (curTile.y - 1);
      break;
    case "right":
      coord = (curTile.x + 1) + ',' + curTile.y;
      break;
    case "bottom":
      coord = curTile.x + ',' + (curTile.y + 1);
      break;
    case "left":
      coord = (curTile.x - 1) + ',' + curTile.y;
      break;
  }
  
  if (curTile.levelUp !== undefined && exit == curTile.levelUp) {
    coord += ',' + (curTile.z + 1);
  } else if (curTile.levelDown !== undefined && exit == curTile.levelDown) {
    coord += ',' + (curTile.z - 1);
  } else {
    coord += ',' + curTile.z;
  }
  
  return coord;
}

function rotateDir(dir, rot) {
  switch (rot) {
    case 0:
      return dir;
    
    case -270:
    case 90:
      switch (dir) {
        case "top":
          return "right";
        case "right":
          return "bottom";
        case "bottom":
          return "left";
        case "left":
          return "top";
      }
    
    case -180:
    case 180:
      return flipDir(dir);
    
    case -90:
    case 270:
      switch (dir) {
        case "top":
          return "left";
        case "right":
          return "top";
        case "bottom":
          return "right";
        case "left":
          return "bottom";
      }
  }
}

function flipDir(dir) {
  switch (dir) {
    case "top":
      return "bottom";
    case "right":
      return "left";
    case "bottom":
      return "top";
    case "left":
      return "right";
  }
}

function dir2num(dir){
  switch (dir) {
    case "top":
      return 0;
    case "right":
      return 90;
    case "bottom":
      return 180;
    case "left":
      return 270;
  }
}