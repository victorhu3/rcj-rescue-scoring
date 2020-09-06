// register the directive with your app module
var app = angular.module('SimEditor', ['ngTouch','ngAnimate', 'ui.bootstrap', 'pascalprecht.translate', 'ngCookies']);

// function referenced by the drop target
app.controller('SimEditorController', ['$scope', '$uibModal', '$log', '$http','$translate', function ($scope, $uibModal, $log, $http, $translate) {

    $scope.competitionId = competitionId;
    $scope.mapId = mapId;
    $translate('admin.simMapEditor.import').then(function (val) {
        $("#select").fileinput({'showUpload':false, 'showPreview':false, 'showRemove':false, 'showCancel':false  ,'msgPlaceholder': val,allowedFileExtensions: ['json'] , msgValidationError: "ERROR"});
    }, function (translationId) {
        // = translationId;
    });

    $scope.z = 0;
    $scope.startTile = {
        x: 0,
        y: 0,
        z: 0
    };
    $scope.height = 1;
    $scope.width = 1;
    $scope.length = 1;
    $scope.name = "Awesome Testbana";
    $scope.cells = {};
    $scope.dice = [];
    $scope.saveasname ="";
    $scope.finished = true;
    

    $scope.range = function (n) {
        arr = [];
        for (var i = 0; i < n; i++) {
            arr.push(i);
        }
        return arr;
    }
    
    $scope.changeFloor = function (z){
        $scope.z = z;
    }
    
    $scope.go = function (path) {
        window.location = path
    }

    $scope.$watchCollection('startTile', function (newValue, oldValue) {
        $scope.recalculateLinear();
    });
    
    $scope.$watchCollection('cells', function (newValue, oldValue) {
        
        $scope.recalculateLinear();
    });

    $scope.isUndefined = function (thing) {
        return (typeof thing === "undefined");
    }
    $scope.recalculateLinear = function () {
        console.log("update");
        //console.log($scope.cells)
        $scope.virtualWall = [];
        //console.log($scope.cells);
        if ($scope.startNotSet())
            return;

        // Reset all previous linear walls
        for (var index in $scope.cells) {
            $scope.cells[index].isLinear = false;
            $scope.cells[index].virtualWall = false;
            $scope.cells[index].reachable= false;
        }
        
        // Set to virtual wall around the black tile
        /*for (var index in $scope.cells) {
            if($scope.cells[index].tile){
                if($scope.cells[index].tile.black){
                    //console.log("黒発見")
                    var x = Number(index.split(',')[0]);
                    var y = Number(index.split(',')[1]);
                    var z = Number(index.split(',')[2]);
                    if($scope.cells[x + "," + (y-1) + "," + z]) $scope.cells[x + "," + (y-1) + "," + z].virtualWall = true;
                    else $scope.cells[x + "," + (y-1) + "," + z] = {virtualWall: true};

                    if($scope.cells[(x+1) + "," + y + "," + z]) $scope.cells[(x+1) + "," + y + "," + z].virtualWall = true;
                    else $scope.cells[(x+1) + "," + y + "," + z] = {virtualWall: true};

                    if($scope.cells[(x-1) + "," + y + "," + z]) $scope.cells[(x-1) + "," + y + "," + z].virtualWall = true;
                    else $scope.cells[(x-1) + "," + y + "," + z] = {virtualWall: true};

                    if($scope.cells[x + "," + (y+1) + "," + z]) $scope.cells[x + "," + (y+1) + "," + z].virtualWall = true;
                    else $scope.cells[x + "," + (y+1) + "," + z] = {virtualWall: true};

                }
            }
        }*/
        //console.log($scope.virtualWall)

        // Start it will all 4 walls around the starting tile
        
        recurs($scope.startTile.x - 1, $scope.startTile.y, $scope.startTile.z);
        recurs($scope.startTile.x + 1, $scope.startTile.y, $scope.startTile.z);
        recurs($scope.startTile.x, $scope.startTile.y - 1, $scope.startTile.z);
        recurs($scope.startTile.x, $scope.startTile.y + 1, $scope.startTile.z);

        for (var index in $scope.cells) {
            if($scope.cells[index].x != null &&$scope.cells[index].tile != null && $scope.cells[index].tile.changeFloorTo != null && $scope.cells[index].tile.changeFloorTo != $scope.cells[index].z){
                recurs($scope.cells[index].x-1, $scope.cells[index].y, $scope.cells[index].tile.changeFloorTo);
                recurs($scope.cells[index].x+1, $scope.cells[index].y, $scope.cells[index].tile.changeFloorTo);
                recurs($scope.cells[index].x+1, $scope.cells[index].y-1, $scope.cells[index].tile.changeFloorTo);
                recurs($scope.cells[index].x-1, $scope.cells[index].y+1, $scope.cells[index].tile.changeFloorTo);
            }
        }

        //Search reachable tiles
        reachable($scope.startTile.x, $scope.startTile.y, $scope.startTile.z);
    }

    function reachable(x,y,z){
        if(x<0 || x>$scope.width*2 || y<0 || y>$scope.length*2) return;
        if($scope.cells[x+','+y+','+z]){
            if($scope.cells[x+','+y+','+z].reachable) return;
            $scope.cells[x+','+y+','+z].reachable = true;
        }else{
            $scope.cells[x+','+y+','+z] = {};
            $scope.cells[x+','+y+','+z].reachable = true;
        }

        //Upper
        if($scope.cells[x+','+(y-1)+','+z]==null || !$scope.cells[x+','+(y-1)+','+z].isWall) reachable(x,y-2,z)

        //Bottom
        if($scope.cells[x+','+(y+1)+','+z]==null || !$scope.cells[x+','+(y+1)+','+z].isWall) reachable(x,y+2,z)

        //Right
        if($scope.cells[(x+1)+','+y+','+z]==null || !$scope.cells[(x+1)+','+y+','+z].isWall) reachable(x+2,y,z)

        //Left
        if($scope.cells[(x-1)+','+y+','+z]==null || !$scope.cells[(x-1)+','+y+','+z].isWall) reachable(x-2,y,z)
    }
    

    function isOdd(num) {
        return num % 2;
    }

    function recurs(x, y, z) {
        if (x < 0 || y < 0 || z < 0) {
            return;
        }

        var cell = $scope.cells[x + ',' + y + ',' + z];
        
        

        
        // If this is a wall that doesn't exists
        if (!cell)
            return;
        // Outside of the current maze size. 
        if (x > $scope.width * 2 + 1 || x < 0 ||
            y > $scope.length * 2 + 1 || y < 0 ||
            z > $scope.height || z < 0)
            return;

        // Already visited this, returning
        if (cell.isLinear)
            return;
        if (cell.isWall || cell.virtualWall) {
            cell.isLinear = true;


            // horizontal walls
            if (isOdd(x) && !isOdd(y)) {
                // Set tiles around this wall to linear
                setTileLinear(x - 2, y - 1, z);
                setTileLinear(x, y - 1, z);
                setTileLinear(x + 2, y - 1, z);
                setTileLinear(x - 2, y + 1, z);
                setTileLinear(x, y + 1, z);
                setTileLinear(x + 2, y + 1, z);
                // Check neighbours
                recurs(x + 2, y, z);
                recurs(x - 2, y, z);
                recurs(x - 1, y - 1, z);
                recurs(x - 1, y + 1, z);
                recurs(x + 1, y - 1, z);
                recurs(x + 1, y + 1, z);
            } // Vertical wall
            else if (!isOdd(x) && isOdd(y)) {
                // Set tiles around this wall to linear
                setTileLinear(x - 1, y - 2, z);
                setTileLinear(x - 1, y, z);
                setTileLinear(x - 1, y + 2, z);
                setTileLinear(x + 1, y - 2, z);
                setTileLinear(x + 1, y, z);
                setTileLinear(x + 1, y + 2, z);
                // Check neighbours
                recurs(x, y - 2, z);
                recurs(x, y + 2, z);
                recurs(x - 1, y - 1, z);
                recurs(x - 1, y + 1, z);
                recurs(x + 1, y - 1, z);
                recurs(x + 1, y + 1, z);
            }
            
        }
    }

    function setTileLinear(x, y, z) {
        if (x < 0 || y < 0 || z < 0) {
            return;
        }

        // Check that this is an actual tile, not a wall
        var cell = $scope.cells[x + ',' + y + ',' + z];
        if (cell) {
            cell.isLinear = true;
        } else {
            $scope.cells[x + ',' + y + ',' + z] = {
                isTile: true,
                isLinear: true,
                tile: {
                    changeFloorTo: z
                }
            };
        }
    }

    $scope.startNotSet = function () {
        return $scope.startTile.x == 0 && $scope.startTile.y == 0 &&
            $scope.startTile.z == 0;
    }


    $scope.itemNumber = function(type,x,y,z){
        let count = 0;
        for(let i=1,l=$scope.length*2+1;i<l;i+=2){
            for(let j=1,m=$scope.width*2+1;j<m;j+=2){
                if(!$scope.cells[j + ',' + i + ',' + z]) continue;
                if($scope.cells[j + ',' + i + ',' + z].tile[type]) count++;
                if(x == j && y == i) return count;
            }
        }
        return count;
    };

    $scope.victimNumber = function(type,x,y,z,place){
        let linear = $scope.cells[x + ',' + y + ',' + z].isLinear;
        let count = 0;
        for(let i=1,l=$scope.length*2+1;i<l;i+=2){
            for(let j=1,m=$scope.width*2+1;j<m;j+=2){
                if(!$scope.cells[j + ',' + i + ',' + z]) continue;
                if($scope.cells[j + ',' + i + ',' + z].isLinear == linear){
                    let victims = $scope.cells[j + ',' + i + ',' + z].tile.victims;
                    if(victims){
                        if(victims.top == type) count++;
                        if(x == j && y == i && place == 'top'){
                            if(linear) return big[count-1];
                            else return small[count-1];
                        }
                        if(victims.left == type) count++;
                        if(x == j && y == i && place == 'left'){
                            if(linear) return big[count-1];
                            else return small[count-1];
                        }
                        if(victims.right == type) count++;
                        if(x == j && y == i && place == 'right'){
                            if(linear) return big[count-1];
                            else return small[count-1];
                        }
                        if(victims.bottom == type) count++;
                        if(x == j && y == i && place == 'bottom'){
                            if(linear) return big[count-1];
                            else return small[count-1];
                        }
                    }
                }
            }
        }
    };

    function Range(first, last) {
        var first = first.charCodeAt(0);
        var last = last.charCodeAt(0);
        var result = new Array();
        for(var i = first; i <= last; i++) {
            result.push(String.fromCodePoint(i));
        }
        return result;
    }
    var big = Range('A', 'Z');
    var small = Range('α', 'ω');

    $scope.isVictim = function(type,x,y,z){
        if($scope.cells[x + ',' + y + ',' + z] && $scope.cells[x + ',' + y + ',' + z].tile){
            if($scope.cells[x + ',' + y + ',' + z].tile.victims.bottom == type) return true;
            if($scope.cells[x + ',' + y + ',' + z].tile.victims.top == type) return true;
            if($scope.cells[x + ',' + y + ',' + z].tile.victims.right == type) return true;
            if($scope.cells[x + ',' + y + ',' + z].tile.victims.left == type) return true;
        }
        return false;
    };

    $scope.makeImage = function(){
        window.scrollTo(0,0);
        html2canvas(document.getElementById("outputImageArea"),{
            scale: 5
        }).then(function(canvas) {
            let ctx = canvas.getContext("2d");

            //Detect image area
            let topY = 0;
            for(let y=0;y<canvas.height;y++){
                let imagedata = ctx.getImageData(canvas.width/2, y, 1, 1);
                if(imagedata.data[0] != 255){
                    topY = y;
                    break;
                }
            }
            let bottomY = 0;
            for(let y=canvas.height-1;y>=0;y--){
                let imagedata = ctx.getImageData(canvas.width/2, y, 1, 1);
                if(imagedata.data[0] != 255){
                    bottomY = y;
                    break;
                }
            }
            mem_canvas = document.createElement("canvas");
            mem_canvas.width = canvas.width;
            mem_canvas.height = bottomY-topY;
            ctx2 = mem_canvas.getContext("2d");
            ctx2.drawImage(canvas, 0, topY, canvas.width, bottomY-topY, 0, 0, canvas.width, bottomY-topY);
            let imgData = mem_canvas.toDataURL();
            $http.post("/api/maps/line/image/" + mapId, {img: imgData}).then(function (response) {
                alert("Created image!");
            }, function (response) {
                console.log(response);
                console.log("Error: " + response.statusText);
                alert(response.data.msg);
            });
        });
    };

    $scope.makeImageDl = function(){
        window.scrollTo(0,0);
        html2canvas(document.getElementById("outputImageArea"),{
            scale: 5
        }).then(function(canvas) {
            let ctx = canvas.getContext("2d");

            //Detect image area
            let topY = 0;
            for(let y=0;y<canvas.height;y++){
                let imagedata = ctx.getImageData(canvas.width/2, y, 1, 1);
                if(imagedata.data[0] != 255){
                    topY = y;
                    break;
                }
            }
            let bottomY = 0;
            for(let y=canvas.height-1;y>=0;y--){
                let imagedata = ctx.getImageData(canvas.width/2, y, 1, 1);
                if(imagedata.data[0] != 255){
                    bottomY = y;
                    break;
                }
            }
            mem_canvas = document.createElement("canvas");
            mem_canvas.width = canvas.width;
            mem_canvas.height = bottomY-topY;
            ctx2 = mem_canvas.getContext("2d");
            ctx2.drawImage(canvas, 0, topY, canvas.width, bottomY-topY, 0, 0, canvas.width, bottomY-topY);
            let imgData = mem_canvas.toDataURL();
            downloadURI(imgData,$scope.name+'.png')
        });
    };

    function downloadURI(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        delete link;
    }

    $scope.wallColor = function(x,y,z,rotate=0){
        let cell = $scope.cells[x+','+y+','+z];
        if(!cell) return {};
        if(cell.isWall) return cell.isLinear?{'background-color': 'black'}:{'background-color': 'navy'};

        if(cell.halfWall > 0){
            let direction = 180*(cell.halfWall-1)+(y%2==1?0:90);

            //Wall color
            let color = 'navy';
            switch (direction) {
                case 0:
                    if(wallCheck($scope.cells[(x-1)+','+(y+1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x+1)+','+(y+1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x)+','+(y+2)+','+z])) color = 'black';
                    break;
                case 90:
                    if(wallCheck($scope.cells[(x-1)+','+(y+1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x-1)+','+(y-1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x-2)+','+(y)+','+z])) color = 'black';
                    break;
                case 180:
                    if(wallCheck($scope.cells[(x-1)+','+(y-1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x+1)+','+(y-1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x)+','+(y-2)+','+z])) color = 'black';
                    break;
                case 270:
                    if(wallCheck($scope.cells[(x+1)+','+(y+1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x+1)+','+(y-1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x+2)+','+(y)+','+z])) color = 'black';
                    break;
            }

            direction += rotate;
            if(direction>=360) direction-=360;

            let gradient = String(direction) + "deg," + color + " 0%," + color + " 50%,white 50%,white 100%";
            return {'background': 'linear-gradient(' + gradient + ')'};

        }

    };

    function wallCheck(cell){
        if(!cell) return false;
        return (cell.isWall || cell.virtualWall) && cell.isLinear;
    }

    $scope.saveMapAs = function (name) {
        if ($scope.startNotSet()) {
            alert("You must define a starting tile by clicking a tile");
            return;
        }
        console.log($scope.se_competition);
        console.log(competitionId);

        if (name == $scope.name && $scope.se_competition == competitionId) {
            alert("You must have a new name when saving as!");
            return;
        }


        var map = {
            competition: $scope.se_competition,
            name: name,
            length: $scope.length,
            height: $scope.height,
            width: $scope.width,
            finished: $scope.finished,
            startTile: $scope.startTile,
            cells: $scope.cells
        };
        console.log(map);
        $http.post("/api/maps/maze", map).then(function (response) {
            alert("Created map!");
            console.log(response.data);
            window.location.replace("/admin/" + $scope.se_competition + "/maze/editor/" + response.data.id)
        }, function (response) {
            console.log(response);
            console.log("Error: " + response.statusText);
            alert(response.data.msg);
        });
    }

    $scope.saveMap = function (loc) {
        if ($scope.startNotSet()) {
            alert("You must define a starting tile by clicking a tile");
            return;
        }
        var map = {
            competition: $scope.competitionId,
            dice: $scope.dice,
            name: $scope.name,
            length: $scope.length,
            height: $scope.height,
            width: $scope.width,
            finished: $scope.finished,
            startTile: $scope.startTile,
            cells: $scope.cells
        };
        console.log($scope.finished);
        console.log(map);
        console.log("Update map", mapId);
        console.log("Competition ID", $scope.competitionId);
        if (mapId) {
            $http.put("/api/maps/maze/" + mapId, map).then(function (response) {
                if (!loc) alert("Updated map");
                console.log(response.data);
                if (loc) window.location.replace("/admin/" + competitionId + "/maze/editor/" + loc)
            }, function (response) {
                console.log(response);
                console.log("Error: " + response.statusText);
                alert(response.data.msg);
            });
        } else {
            $http.post("/api/maps/maze", map).then(function (response) {
                alert("Created map!");
                console.log(response.data);
                if (loc) window.location.replace("/admin/" + competitionId + "/maze/editor/" + loc)
                else window.location.replace("/admin/" + competitionId + "/maze/editor/" + response.data.id)

            }, function (response) {
                console.log(response);
                console.log("Error: " + response.statusText);
                alert(response.data.msg);
            });
        }
    }
    
    
    $scope.export = function(){
        console.log($scope.cells)
        var map = {
            name: $scope.name,
            length: $scope.length,
            height: $scope.height,
            width: $scope.width,
            finished: $scope.finished,
            startTile: $scope.startTile,
            cells: $scope.cells
        };
         var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(map))
         var downloadLink = document.createElement('a')
         document.body.appendChild(downloadLink);
         downloadLink.setAttribute("href",dataStr)
         downloadLink.setAttribute("download", $scope.name + '.json')
         downloadLink.click()
         document.body.removeChild(downloadLink);
    }

    $scope.exportW = function(){
        let w = createWorld();
        let blob = new Blob([w],{type:"text/plan"});
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = $scope.name+'.wbt';
        link.click();
    }

    function checkForCorners(pos, walls){
        //Surrounding tile directions
        let around = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        //Needed corners
        let corners = [false, false, false, false];

        let surroundingTiles = [];

        let thisWall = walls[pos[1]][pos[0]];

        if(!thisWall[0]) return corners;

        //For each surrounding card
        for(let a of around){
            //Get the position
            let xPos = pos[0] + a[0]
            let yPos = pos[1] + a[1]
            //If it is a valid position
            if(xPos > -1 && xPos < $scope.width && yPos > -1 && yPos < $scope.length){
                //Add the tile to the surrounding list
                surroundingTiles.push(walls[yPos][xPos]);
            }else{
                //Otherwise add a null value
                surroundingTiles.push([false, [false, false, false, false], false, false, false]);
            }   
        }

        //If top right is needed
        corners[0] = surroundingTiles[0][1][1] && surroundingTiles[1][1][0] && !thisWall[1][0] && !thisWall[1][1];
        //If bottom right is needed
        corners[1] = surroundingTiles[1][1][2] && surroundingTiles[2][1][1] && !thisWall[1][1] && !thisWall[1][2];
        //If bottom left is needed
        corners[2] = surroundingTiles[2][1][3] && surroundingTiles[3][1][2] && !thisWall[1][2] && !thisWall[1][3];
        //If top left is needed
        corners[3] = surroundingTiles[0][1][3] && surroundingTiles[3][1][0] && !thisWall[1][3] && !thisWall[1][0];

        return corners;
    }

    function checkForExternalWalls(pos, walls){
        let thisWall = walls[pos[1]][pos[0]];
        if(!thisWall[0]) return [false, false, false, false];

        //Surrounding tiles
        let around = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        let otherTiles = [false, false, false, false];

        let d = 0;

        for(let a of around){
            //Get the tiles position
            let xPos = pos[0] + a[0];
            let yPos = pos[1] + a[1];
            //If it is a valid positon
            if(xPos > -1 && xPos < $scope.width && yPos > -1 && yPos < $scope.length){
                //Add the tiles present data
                otherTiles[d] = walls[yPos][xPos][0];
            }else{
                //No tile present
                otherTiles[d] = false;
            }
                
            //Add one to direction counter
            d = d + 1
        }
        //Convert to needed walls
        externalsNeeded = [!otherTiles[0], !otherTiles[1], !otherTiles[2], !otherTiles[3]]
        return externalsNeeded
    }

    function checkForNotch (pos, walls){
        //Variables to store if each notch is needed
        let needLeft = false;
        let needRight = false;

        //No notches needed if there is not a floor
        if(!walls[pos[1]][pos[0]][0]) return [false, false, 0];

        let rotations = [3.14159, 1.57079, 0, -1.57079];

        //Surrounding tiles
        let around = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        //Tiles to check if notches are needed
        let notchAround = [[ [1, -1], [-1, -1] ],
                            [ [1, 1], [1, -1] ],
                            [ [-1, 1], [1, 1] ],
                            [ [-1, -1], [-1, 1] ]];

        //Current direction
        let d = 0;
        //Number of surrounding tiles
        let surround = 0;

        //Direction of present tile
        let dire = -1;

        //Iterate for surrounding tiles
        for(a of around){
            //If x axis is within array
            if(pos[0] + a[0] < $scope.width && pos[0] + a[0] > -1){
                //If y axis is within array
                if(pos[1] + a[1] < $scope.length && pos[1] + a[1] > -1){
                    //If there is a tile there
                    if(walls[pos[1] + a[1]][pos[0] + a[0]][0]){
                        //Add to number of surrounding tiles
                        surround = surround + 1
                        //Store direction
                        dire = d
                    }
                }
            }
            //Increment direction
            d = d + 1
        }

        let rotation = 0
        //If there was only one connected tile and there is a valid stored direction
        if(surround == 1 && dire > -1 && dire < notchAround.length){
            //Get the left and right tile positions to check
            let targetLeft = [pos[0] + notchAround[dire][0][0], pos[1] + notchAround[dire][0][1]];
            let targetRight = [pos[0] + notchAround[dire][1][0], pos[1] + notchAround[dire][1][1]];
            
            //If the left tile is a valid target position
            if(targetLeft[0] < $scope.width && targetLeft[0] > -1 && targetLeft[1] < $scope.length && targetLeft[1] > -1){
                //If there is no tile there
                if(!walls[targetLeft[1]][targetLeft[0]][0]){
                    //A left notch is needed
                    needLeft = true;
                }
            }

            //If the right tile is a valid target position
            if(targetRight[0] < $scope.width && targetRight[0] > -1 && targetRight[1] < $scope.length && targetRight[1] > -1){
                //If there is no tile there
                if(!walls[targetRight[1]][targetRight[0]][0]){
                    //A right notch is needed
                    needRight = true;
                }
            }

            rotation = rotations[dire];
        }

        //Return information about needed notches
        return [needLeft, needRight, rotation]
    }

    function u2f(v){
        if(v) return true;
        return false;
    }

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    function orgRound(value, base) {
        return Math.round(value / base) * base;
    }

    function createWorld(){
        let walls = [];
        for(let x=1,l=$scope.length*2+1;x<l;x+=2){
            let row = [];
            for(let z=1,m=$scope.width*2+1;z<m;z+=2){
                row.push([false, [false, false, false, false], false, false, false, false, 0, 0, false, false]);
            }
            walls.push(row);
        }

        for(let y=1,l=$scope.length*2+1;y<l;y+=2){
            for(let x=1,m=$scope.width*2+1;x<m;x+=2){

                let thisCell = $scope.cells[x+','+y+',0'];
                let arWall = [false, false, false, false];
                if($scope.cells[(x)+','+(y-1)+',0'] && $scope.cells[(x)+','+(y-1)+',0'].isWall) arWall[0] = true;
                if($scope.cells[(x+1)+','+(y)+',0'] && $scope.cells[(x+1)+','+(y)+',0'].isWall) arWall[1] = true;
                if($scope.cells[(x)+','+(y+1)+',0'] && $scope.cells[(x)+','+(y+1)+',0'].isWall) arWall[2] = true;
                if($scope.cells[(x-1)+','+(y)+',0'] && $scope.cells[(x-1)+','+(y)+',0'].isWall) arWall[3] = true;

                let humanType = 0; // 1 - harmed, 2 - unharmed, 3 - stable, 4 - thermal
                let humanPlace = 0;

                if(thisCell.tile.victims){
                    if(thisCell.tile.victims.top){
                        switch(thisCell.tile.victims.top){
                            case 'None':
                                break;
                            case 'Heated':
                                humanType = 4;
                                humanPlace = 0;
                                break;
                            case 'H':
                                humanType = 1;
                                humanPlace = 0;
                                break;
                            case 'S':
                                humanType = 3;
                                humanPlace = 0;
                                break;
                            case 'U':
                                humanType = 2;
                                humanPlace = 0;
                                break;
                                
                        }
                        
                    }else if(thisCell.tile.victims.right){
                        switch(thisCell.tile.victims.right){
                            case 'None':
                                break;
                            case 'Heated':
                                humanType = 4;
                                humanPlace = 1;
                                break;
                            case 'H':
                                humanType = 1;
                                humanPlace = 1;
                                break;
                            case 'S':
                                humanType = 3;
                                humanPlace = 1;
                                break;
                            case 'U':
                                humanType = 2;
                                humanPlace = 1;
                                break;
                                
                        }
                    }else if(thisCell.tile.victims.bottom){
                        switch(thisCell.tile.victims.bottom){
                            case 'None':
                                break;
                            case 'Heated':
                                humanType = 4;
                                humanPlace = 2;
                                break;
                            case 'H':
                                humanType = 1;
                                humanPlace = 2;
                                break;
                            case 'S':
                                humanType = 3;
                                humanPlace = 2;
                                break;
                            case 'U':
                                humanType = 2;
                                humanPlace = 2;
                                break;
                                
                        }
                    }else if(thisCell.tile.victims.left){
                        switch(thisCell.tile.victims.left){
                            case 'None':
                                break;
                            case 'Heated':
                                humanType = 4;
                                humanPlace = 3;
                                break;
                            case 'H':
                                humanType = 1;
                                humanPlace = 3;
                                break;
                            case 'S':
                                humanType = 3;
                                humanPlace = 3;
                                break;
                            case 'U':
                                humanType = 2;
                                humanPlace = 3;
                                break;
                                
                        }
                    }
                }

                if(thisCell){
                    walls[(y-1)/2][(x-1)/2] = [u2f(thisCell.reachable), arWall, u2f(thisCell.tile.checkpoint), u2f(thisCell.tile.black), x == $scope.startTile.x && y == $scope.startTile.y, u2f(thisCell.tile.swamp), humanType, humanPlace, u2f(thisCell.isLinear), u2f(thisCell.tile.obstacle)]
                }
                
            }
        }


        let arr = [];
        //General scale for tiles - adjusts position and size of pieces and obstacles
        let tileScale = [0.4, 0.4, 0.4];
        //The vertical position of the floor
        let floorPos = -0.075 * tileScale[1];

        //Strings to hold the tile parts
        let allTiles = "";
        //Strings to hold the boundaries for special tiles
        let allCheckpointBounds = "";
        let allTrapBounds = "";
        let allGoalBounds = "";
        let allSwampBounds = "";
        let allObstacles = "";

        //
        const fileHeader = ({y, z}) => `#VRML_SIM R2020a utf8
        WorldInfo {
          basicTimeStep 16
        }
        Viewpoint {
          orientation -1 0 0 0.85
          position -0.08 ${y} ${z}
        }
        TexturedBackground {
        }
        TexturedBackgroundLight {
        }
        `;

        const protoTilePart = ({name, x, z, fl, tw, rw, bw, lw, tlc, blc, brc, trc, tex, rex, bex, lex, notch, notchR, start, trap, checkpoint, swamp, width, height, id, xScale, yScale, zScale}) => `
        DEF ${name} worldTile {
            xPos ${x}
            zPos ${z}
            floor ${fl}
            topWall ${tw}
            rightWall ${rw}
            bottomWall ${bw}
            leftWall ${lw}
            topLeftCorner ${tlc}
            bottomLeftCorner ${blc}
            bottomRightCorner ${brc}
            topRightCorner ${trc}
            topExternal ${tex}
            rightExternal ${rex}
            bottomExternal ${bex}
            leftExternal ${lex}
            notch "${notch}"
            notchRotation ${notchR}
            start ${start}
            trap ${trap}
            checkpoint ${checkpoint}
            swamp ${swamp}
            width ${width}
            height ${height}
            id "${id}"
            xScale ${xScale}
            yScale ${yScale}
            zScale ${zScale}
          }
        `;

        const boundsPart = ({name, id, xmin, zmin, xmax, zmax, y}) => `
        DEF boundary Group {
            children [
              DEF ${name}${id}min Transform {
                    translation ${xmin} ${y} ${zmin}
              }
              DEF ${name}${id}max Transform {
                    translation ${xmax} ${y} ${zmax}
              }
            ]
          }     
        `;

        const thermalHumanPart = ({x, z, rot, id, score}) => `
        HeatVictim {
            translation ${x} 0 ${z}
            rotation 0 1 0 ${rot}
            name "HeatVictim${id}"
            scoreWorth ${score}
        }        
        `;

        const visualHumanPart = ({x, z, rot, id, type, score}) => `
        Victim {
            translation ${x} 0 ${z}
            rotation 0 1 0 ${rot}
            name "Victim${id}"
            type "${type}"
            scoreWorth ${score}
        }        
        `;

        const obstaclePart = ({id, xSize, ySize, zSize, x, y, z, rot}) => `
        DEF OBSTACLE${id} Solid {
            translation ${x} ${y} ${z}
			rotation 0 1 0 ${rot}
            children [
                Shape {
                    appearance Appearance {
						material Material {
						diffuseColor 0.45 0.45 0.45
						}
                    }
                    geometry DEF OBSTACLEBOX${id} Box {
						size ${xSize} ${ySize} ${zSize}
                    }
                }
            ]
            name "obstacle${id}"
            boundingObject USE OBSTACLEBOX${id}
	    recognitionColors [
			0.45 0.45 0.45
		]
        }  
        `;

        const groupPart = ({data, name}) => `
        DEF ${name} Group {
            children [
              ${data}
            ]
        }
        `;

        const supervisorPart = `
        DEF MAINSUPERVISOR Robot {
            children [
              Receiver {
                channel 1
              }
            ]
            supervisor TRUE
            controller "MainSupervisor"
            window "MainSupervisorWindow"
            showWindow TRUE
          }          
        `;

        //Upper left corner to start placing tiles from
        let width = $scope.width;
        let height = $scope.length;
        let startX = -($scope.width * (0.3 * tileScale[0]) / 2.0);
        let startZ = -($scope.length * (0.3 * tileScale[2]) / 2.0);

        let fileData = fileHeader({ y: 0.2*height, z : 0.17*height})

        //Rotations of humans for each wall
        let humanRotation = [3.14, 1.57, 0, -1.57]
        //Offsets for visual and thermal humans
        let humanOffset = [[0, -0.1375 * tileScale[2]], [0.1375 * tileScale[0], 0], [0, 0.1375 * tileScale[2]], [-0.1375 * tileScale[0], 0]]
        let humanOffsetThermal = [[0, -0.136 * tileScale[2]], [0.136 * tileScale[0], 0], [0, 0.136 * tileScale[2]], [-0.136 * tileScale[0], 0]]
        //Names of types of visual human
        let humanTypesVisual = ["harmed", "unharmed", "stable"]

        //Id numbers used to give a unique but interable name to tile pieces
        let tileId = 0
        let checkId = 0
        let trapId = 0
        let goalId = 0
        let swampId = 0
        let humanId = 0
        let obstacleId = 0;

        //String to hold all the humans
        let allHumans = ""
        for(let x=0;x<$scope.width;x++){
            for(let z=0;z<$scope.length;z++){
                //Check which corners and external walls and notches are needed
                let corners = checkForCorners([x, z], walls)
                let externals = checkForExternalWalls([x, z], walls)
                let notchData = checkForNotch([x, z], walls)
                let notch = ""
                //Name to be given to the tile
                let tileName = "TILE"
                if(walls[z][x][4]) tileName = "START_TILE"
                //Set notch string to correct value
                if(notchData[0]) notch = "left"
                if(notchData[1]) notch = "right"
                //Create a new tile with all the data
                tile = protoTilePart({name: tileName, x: x, z: z, fl: walls[z][x][0] && !walls[z][x][3], tw: walls[z][x][1][0], rw: walls[z][x][1][1], bw: walls[z][x][1][2], lw: walls[z][x][1][3], trc: corners[0], brc: corners[1], blc: corners[2], tlc: corners[3], tex: externals[0], rex: externals[1], bex: externals[2], lex: externals[3], notch: notch, notchR: notchData[2], start: walls[z][x][4], trap: walls[z][x][3], checkpoint: walls[z][x][2], swamp: walls[z][x][5], width: width, height: height, id: tileId, xScale: tileScale[0], yScale: tileScale[1], zScale: tileScale[2]});
                tile = tile.replace(/true/g, "TRUE")
                tile = tile.replace(/false/g, "FALSE")
                allTiles = allTiles + tile
                //checkpoint
                if(walls[z][x][2]){
                    //Add bounds to the checkpoint boundaries
                    allCheckpointBounds += boundsPart({name: "checkpoint", id: checkId, xmin: (x * 0.3 * tileScale[0] + startX) - (0.15 * tileScale[0]), zmin: (z * 0.3 * tileScale[2] + startZ) - (0.15 * tileScale[2]), xmax: (x * 0.3 * tileScale[0] + startX) + (0.15 * tileScale[0]), zmax: (z * 0.3 * tileScale[2] + startZ) + (0.15 * tileScale[2]), y: floorPos});
                    //Increment id counter
                    checkId = checkId + 1
                }
                //trap
                if(walls[z][x][3]){
                    //Add bounds to the trap boundaries
                    allTrapBounds += boundsPart({name: "trap", id: trapId, xmin: (x * 0.3 * tileScale[0] + startX) - (0.15 * tileScale[0]), zmin: (z * 0.3 * tileScale[2] + startZ) - (0.15 * tileScale[2]), xmax: (x * 0.3 * tileScale[0] + startX) + (0.15 * tileScale[0]), zmax: (z * 0.3 * tileScale[2] + startZ) + (0.15 * tileScale[2]), y: floorPos});
                    //Increment id counter
                    trapId = trapId + 1
                }
                //goal
                if(walls[z][x][4]){
                    //Add bounds to the goal boundaries
                    allGoalBounds += boundsPart({name: "start", id: goalId, xmin: (x * 0.3 * tileScale[0] + startX) - (0.15 * tileScale[0]), zmin: (z * 0.3 * tileScale[2] + startZ) - (0.15 * tileScale[2]), xmax: (x * 0.3 * tileScale[0] + startX) + (0.15 * tileScale[0]), zmax: (z * 0.3 * tileScale[2] + startZ) + (0.15 * tileScale[2]), y: floorPos});
                    //Increment id counter
                    goalId = goalId + 1
                }
                //swamp
                if(walls[z][x][5]){
                    //Add bounds to the goal boundaries
                    allSwampBounds += boundsPart({name: "swamp", id: swampId, xmin: (x * 0.3 * tileScale[0] + startX) - (0.15 * tileScale[0]), zmin: (z * 0.3 * tileScale[2] + startZ) - (0.15 * tileScale[2]), xmax: (x * 0.3 * tileScale[0] + startX) + (0.15 * tileScale[0]), zmax: (z * 0.3 * tileScale[2] + startZ) + (0.15 * tileScale[2]), y: floorPos});
                    //Increment id counter
                    swampId = swampId + 1
                }
                //Increment id counter
                tileId = tileId + 1

                //Human
                if(walls[z][x][6] != 0){
                    //Position of tile
                    let humanPos = [(x * 0.3 * tileScale[0]) + startX , (z * 0.3 * tileScale[2]) + startZ]
                    let humanRot = humanRotation[walls[z][x][7]]
                    //Randomly move human left and right on wall
                    let randomOffset = [0, 0]
                    if(walls[z][x][7] == 0 || walls[z][x][7] == 2){
                        //X offset for top and bottom
                        randomOffset = [orgRound(getRandomArbitrary(-0.1 * tileScale[0], 0.1 * tileScale[0]), 0.001), 0]
                    }else{
                        //Z offset for left and right
                        randomOffset = [0, orgRound(getRandomArbitrary(-0.1 * tileScale[2], 0.1 * tileScale[2]), 0.001)]
                    }
                    //Thermal
                    if(walls[z][x][6] == 4){
                        humanPos[0] = humanPos[0] + humanOffsetThermal[walls[z][x][7]][0] + randomOffset[0]
                        humanPos[1] = humanPos[1] + humanOffsetThermal[walls[z][x][7]][1] + randomOffset[1]
                        let score = 30
                        if(walls[z][x][8]) score = 10
                        allHumans = allHumans + thermalHumanPart({x: humanPos[0], z: humanPos[1], rot: humanRot, id: humanId, score: score})
                    }else{
                        humanPos[0] = humanPos[0] + humanOffset[walls[z][x][7]][0] + randomOffset[0]
                        humanPos[1] = humanPos[1] + humanOffset[walls[z][x][7]][1] + randomOffset[1]
                        let score = 30
                        if(walls[z][x][8]) score = 10
                        allHumans = allHumans + visualHumanPart({x: humanPos[0], z: humanPos[1], rot: humanRot, id: humanId, type: humanTypesVisual[walls[z][x][6] - 1], score: score})
                    }
                    humanId = humanId + 1
                }
                //Obstacle
                if(walls[z][x][9] != 0){
                    //Default height for static obstacle
                    let height = 0.15

                    //Default size contstraints for static obstacle
                    let minSize = 5
                    let maxSize = 15

                    //Generate random size
                    let width = getRandomArbitrary(minSize, maxSize) / 100.0
                    let depth = getRandomArbitrary(minSize, maxSize) / 100.0

                    //Calculate radius of obstacle
                    let r = (((width / 2.0) ** 2) + ((depth / 2.0) ** 2)) ** 0.50

                    //Boundaries of tile to pick
                    console.log(r)
                    let xBounds = [-0.1 + r, 0.1 - r]
                    let zBounds = [-0.1 + r, 0.1 - r]
                    
                    //Get the centre position of the tile
                    let tPos = [(x * 0.3 * tileScale[0]) + startX , (z * 0.3 * tileScale[2]) + startZ]

                    //Get a random position
                    let pos = [orgRound(getRandomArbitrary(xBounds[0], xBounds[1]), 0.00001), orgRound(getRandomArbitrary(zBounds[0], zBounds[1]), 0.00001)]
                    //Offset with tile position
                    pos[0] = pos[0] + tPos[0]
                    pos[1] = pos[1] + tPos[1]
                    
                    //Random rotation for obstacle
                    let rot = orgRound(getRandomArbitrary(0.00, 6.28), 0.001)

                    allObstacles += obstaclePart({id: obstacleId, xSize: width * tileScale[0], ySize: height * tileScale[1], zSize: depth * tileScale[2], x: pos[0], y: 0 , z: pos[1], rot: rot})
                    //Increment id counter
                    obstacleId = obstacleId + 1

                }
            }
        }

        //Add the data pieces to the file data
        fileData = fileData + groupPart({data: allTiles, name: "WALLTILES"})
        fileData = fileData + groupPart({data: allCheckpointBounds, name: "CHECKPOINTBOUNDS"})
        fileData = fileData + groupPart({data: allTrapBounds, name: "TRAPBOUNDS"})
        fileData = fileData + groupPart({data: allGoalBounds, name: "STARTBOUNDS"})
        fileData = fileData + groupPart({data: allSwampBounds, name: "SWAMPBOUNDS"})
        fileData = fileData + groupPart({data: allObstacles, name: "OBSTACLES"})
        fileData = fileData + groupPart({data: allHumans, name: "HUMANGROUP"})
        fileData = fileData + supervisorPart
        return fileData

    }
    
     // File APIに対応しているか確認
        if (window.File) {
            var select = document.getElementById('select');

            // ファイルが選択されたとき
            select.addEventListener('change', function (e) {
                // 選択されたファイルの情報を取得
                var fileData = e.target.files[0];

                var reader = new FileReader();
                // ファイル読み取りに失敗したとき
                reader.onerror = function () {
                    alert('ファイル読み取りに失敗しました')
                }
                // ファイル読み取りに成功したとき
                reader.onload = function () {
                    var data = JSON.parse(reader.result);
                    $scope.cells = data.cells;
                    $scope.competitionId = competitionId;

                    $scope.startTile = data.startTile;
                    $scope.numberOfDropTiles = data.numberOfDropTiles;
                    $scope.height = data.height;
                    $scope.width = data.width;
                    $scope.length = data.length;
                    $scope.name = data.name;
                    $scope.finished = data.finished;
                    
                    if(data.startTile) $scope.cells[data.startTile.x + ',' + data.startTile.y + ',' + data.startTile.z].tile.checkpoint = false;
                    
                    $scope.$apply();
                }

                // ファイル読み取りを実行
                reader.readAsText(fileData);
            }, false);
        }


    $scope.cellClick = function (x, y, z, isWall, isTile) {

        var cell = $scope.cells[x + ',' + y + ',' + z];
        console.log(cell)

        // If wall 
        if (isWall) {
            if (!cell) {
                $scope.cells[x + ',' + y + ',' + z] = {
                    isWall: true,
                    halfWall: 0
                };
            } else {
                if(cell.isWall){
                    cell.isWall = false;
                    /*cell.halfWall = 1;
                }else if(cell.halfWall == 1){
                    cell.halfWall = 2;
                }else if(cell.halfWall == 2){
                    cell.halfWall = 0;*/
                }else{
                    cell.isWall = true;
                }
            }
        } else if (isTile) {
            if (!cell) {
                $scope.cells[x + ',' + y + ',' + z] = {
                    isTile: true,
                    tile: {
                        changeFloorTo: z
                    }
                };
            }
            $scope.open(x, y, z);
        }
        $scope.recalculateLinear();
    }

    $scope.open = function (x, y, z) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/templates/sim_editor_modal.html',
            controller: 'ModalInstanceCtrl',
            size: 'sm',
            scope: $scope,
            resolve: {
                x: function () {
                    return x;
                },
                y: function () {
                    return y;
                },
                z: function () {
                    return z;
                }
            }
        });
    };
}]);


// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

app.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, x, y, z) {
    $scope.cell = $scope.$parent.cells[x + ',' + y + ',' + z];
    $scope.isStart = $scope.$parent.startTile.x == x &&
        $scope.$parent.startTile.y == y &&
        $scope.$parent.startTile.z == z;
    $scope.height = $scope.$parent.height;
    $scope.z = z;
    $scope.oldFloorDestination = $scope.cell.tile.changeFloorTo;

    $scope.startChanged = function () {
        if ($scope.isStart) {
            $scope.$parent.startTile.x = x;
            $scope.$parent.startTile.y = y;
            $scope.$parent.startTile.z = z;
        }
    }
    
    $scope.blackChanged = function () {
        $scope.$parent.recalculateLinear();
    }

    $scope.range = function (n) {
        arr = [];
        for (var i = 0; i < n; i++) {
            arr.push(i);
        }
        return arr;
    }
    $scope.ok = function () {
        $scope.$parent.recalculateLinear();
        $uibModalInstance.close();
    };
});
