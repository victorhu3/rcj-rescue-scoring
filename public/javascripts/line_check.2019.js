/*********************************************************************************/
// This file is a RoboCup Junior Rescue 2019 rule correspondence version. //
/*********************************************************************************/

// register the directive with your app module

var app = angular.module('ddApp', ['ngTouch', 'ngAnimate', 'ui.bootstrap', 'pascalprecht.translate', 'ngCookies']);
var marker = {};


// function referenced by the drop target
app.controller('ddController', ['$scope', '$uibModal', '$log', '$timeout', '$http', '$translate', '$cookies', function ($scope, $uibModal, $log, $timeout, $http, $translate, $cookies) {

    var db_mtile;

    $scope.mcp = [];
    $scope.mcp[0] = 1;
    $scope.arrive = [];
    $scope.mlop = [];


    $scope.mgap = 0;
    $scope.mobstacle = 0;
    $scope.mspeedbump = 0;
    $scope.mintersection = 0;
    $scope.mdeadend = 0;
    $scope.rampUP = 0;
    $scope.rampDOWN = 0;

    $scope.sync = 0;
    $scope.runId = runId;

    $scope.z = 0;
    $scope.placedDropTiles = 0;
    $scope.actualUsedDropTiles = 0; // Count droptiles twice that will be passed two times
    $scope.startedScoring = false;
    $scope.startedTime = false;
    $scope.time = 0;
    $scope.startUnixTime = 0;


    $scope.victim_list = [];
    $scope.victim_tmp = [];
    $scope.LoPs = [];

    $scope.score = 0;


    const http_config = {
        timeout: 10000
    };

    var tileReset = true;

    var date = new Date();
    var prevTime = 0;



    //$cookies.remove('sRotate')
    if ($cookies.get('sRotate')) {
        $scope.sRotate = Number($cookies.get('sRotate'));
    } else $scope.sRotate = 0;



    // Scoring elements of the tiles
    $scope.stiles = [];
    // Map (images etc.) for the tiles
    $scope.mtiles = [];


    function loadNewRun() {
        $http.get("/api/runs/line/" + runId +
            "?populate=true").then(function (response) {

            $scope.mlop = response.data.LoPs;
            $scope.evacuationLevel = response.data.evacuationLevel;
            $scope.exitBonus = response.data.exitBonus;
            $scope.field = response.data.field.name;
            $scope.score = response.data.score;
            $scope.round = response.data.round.name;
            $scope.team = response.data.team;
            $scope.league = response.data.team.league;
            $scope.competition = response.data.competition;
            // Verified time by timekeeper
            $scope.minutes = response.data.time.minutes;
            $scope.seconds = response.data.time.seconds;


            $scope.victim_list = response.data.rescueOrder;

            $scope.showedUp = response.data.showedUp;

            // Scoring elements of the tiles
            $scope.stiles = response.data.tiles;
            console.log($scope.stiles);
            $scope.mcp = [];
            $scope.arrive = [];
            $scope.mcp.push(1);
            $scope.arrive.push(response.data.showedUp?1:0);
            for (var i = 0; i < response.data.tiles.length; i++) {
                if (response.data.tiles[i].isDropTile) {
                    $scope.actualUsedDropTiles++;
                    console.log("USED");
                    marker[i] = true;
                    $scope.mcp.push(i+1);
                    if(response.data.tiles[i].scoredItems[0].scored) $scope.arrive.push(1);
                    else $scope.arrive.push(0);
                }
            }

            $scope.mgap = response.data.manual.gap;
            $scope.mobstacle = response.data.manual.obstacle;
            $scope.mspeedbump = response.data.manual.speedbump;
            $scope.mintersection = response.data.manual.intersection;
            $scope.mdeadend = response.data.manual.deadend;
            $scope.rampUP = response.data.manual.rampUP;
            $scope.rampDOWN = response.data.manual.rampDOWN;

            $scope.started = response.data.started;
            $scope.status = response.data.status;
            var started = response.data.started;

            $scope.score = response.data.score;






            // Get the map
            $http.get("/api/maps/line/" + response.data.map +
                "?populate=true").then(function (response) {
                console.log(response);
                $scope.height = response.data.height;

                $scope.width = response.data.width;
                $scope.length = response.data.length;
                width = response.data.width;
                length = response.data.length;
                $scope.startTile = response.data.startTile;
                $scope.numberOfDropTiles = response.data.numberOfDropTiles;
                $scope.mtiles = {};

                // Get max victim count
                $scope.maxLiveVictims = response.data.victims.live;
                $scope.maxDeadVictims = response.data.victims.dead;

                $scope.mapIndexCount = response.data.indexCount;

                var flag = false;
                var sItem = {
                    item: "",
                    scored: false
                };
                var ntile = {
                    scoredItems:[],
                    isDropTile: false
                }


                if(!started && tileReset && $scope.status == 0){
                    $scope.stiles = [];
                    tileReset = false;
                }

                if($scope.stiles.length < response.data.indexCount){
                    while ($scope.stiles.length < response.data.indexCount) {
                        $scope.stiles.push({
                            scoredItems:[],
                            isDropTile: false
                        });
                        flag = true;
                    }
                    //console.log($scope.stiles);
                    var noCheck = [];
                    for(let i=0,t;t=response.data.tiles[i];i++){
                        for(let j=0;j<t.index.length;j++){
                            //console.log(t.items.obstacles);
                            for(let k=0;k<t.items.obstacles;k++){
                                let addSItem = {
                                    item: "obstacle",
                                    scored: false
                                };
                                $scope.stiles[t.index[j]].scoredItems.push(addSItem);
                            }

                            for(let k=0;k<t.items.speedbumps;k++){
                                let addSItem = {
                                    item: "speedbump",
                                    scored: false
                                };
                                $scope.stiles[t.index[j]].scoredItems.push(addSItem);
                            }


                            for(let k=0;k<t.tileType.gaps;k++){
                                let addSItem = {
                                    item: "gap",
                                    scored: false
                                };
                                $scope.stiles[t.index[j]].scoredItems.push(addSItem);
                            }

                            if(t.tileType.intersections > 0){
                              let addSItem = {
                                  item: "intersection",
                                  scored: false,
                                  count: t.tileType.intersections
                              };
                              $scope.stiles[t.index[j]].scoredItems.push(addSItem);
                            }

                            if(t.items.rampPoints){
                                let addSItem = {
                                    item: "ramp",
                                    scored: false
                                };
                                $scope.stiles[t.index[j]].scoredItems.push(addSItem);
                            }

                            if(t.items.noCheckPoint){
                                noCheck[t.index[j]]= true;
                            }
                        }

                    }

                    for(let i=0; i < $scope.stiles.length-2;i++){
                        if($scope.stiles[i].scoredItems.length == 0 && !noCheck[i]){
                            let addSItem = {
                                        item: "checkpoint",
                                        scored: false
                            };
                            $scope.stiles[i].scoredItems.push(addSItem);
                        }
                    }
                }

                //console.log($scope.stiles);


                db_mtile = response.data.tiles;
                for (var i = 0; i < response.data.tiles.length; i++) {
                    $scope.mtiles[response.data.tiles[i].x + ',' +
                        response.data.tiles[i].y + ',' +
                        response.data.tiles[i].z] = response.data.tiles[i];

                    if ($scope.stiles[response.data.tiles[i].index[0]] &&
                        $scope.stiles[response.data.tiles[i].index[0]].isDropTile) {
                        $scope.placedDropTiles++;
                    }
                }

                $scope.mcp = [];
                $scope.arrive = [];

                $scope.mcp.push(1);
                $scope.arrive.push($scope.showedUp?1:0);
                for (var i = 1; i < $scope.stiles.length; i++) {
                    if ($scope.stiles[i].isDropTile) {
                        $scope.mcp.push(i+1);
                        if($scope.stiles[i].scoredItems[0].scored) $scope.arrive.push(1);
                        else $scope.arrive.push(0);
                    }
                }

                for(let i=0;i<20;i++){
                    $scope.arrive.push(0);
                    $scope.mlop.push(0);
                }

                setTimeout(function () {
                    document.getElementById("first").focus();
                    fEnterChangeTab();
                },500);




            }, function (response) {
                console.log("Error: " + response.statusText);
            });


        }, function (response) {
            console.log("Error: " + response.statusText);
            if (response.status == 401) {
                $scope.go('/home/access_denied');
            }
        });
    }



    loadNewRun();


    $scope.range = function (n) {
        arr = [];
        for (var i = 0; i < n; i++) {
            arr.push(i);
        }
        return arr;
    }




    $scope.send = function () {
            playSound(sClick);
            var run = {}

            run.status = 6;

            $http.put("/api/runs/line/" + runId, run, http_config).then(function (response) {
                playSound(sInfo);
                $scope.go($scope.getParam('return'));
            }, function (response) {
                console.log("Error: " + response.statusText);
                playSound(sError);
                Swal.fire(
                  'Error',
                  response.statusText,
                  'error'
                );
            });
    };


    $scope.getParam = function (key) {
        var str = location.search.split("?");
        if (str.length < 2) {
            return "";
        }

        var params = str[1].split("&");
        for (var i = 0; i < params.length; i++) {
            var keyVal = params[i].split("=");
            if (keyVal[0] == key && keyVal.length == 2) {
                return decodeURIComponent(keyVal[1]);
            }
        }
        return "";
    }

    $scope.go = function (path) {
        playSound(sClick);
        window.location = path
    }


    function undefined2false(tmp){
        if(tmp) return true;
        return false;
    }

    $scope.arriveMark = function (i) {
        if($scope.arrive[i] == null) return saveContent['arrive'][i];
        return $scope.arrive[i];
    }


}]);


let lastTouch = 0;
document.addEventListener('touchend', event => {
    const now = window.performance.now();
    if (now - lastTouch <= 500) {
        event.preventDefault();
    }
    lastTouch = now;
}, true);



window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

var getAudioBuffer = function (url, fn) {
    var req = new XMLHttpRequest();
    req.responseType = 'arraybuffer';

    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 0 || req.status === 200) {
                context.decodeAudioData(req.response, function (buffer) {
                    fn(buffer);
                });
            }
        }
    };

    req.open('GET', url, true);
    req.send('');
};

var playSound = function (buffer) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
};

var sClick, sInfo, sError, sTimeup;
window.onload = function () {
    getAudioBuffer('/sounds/click.mp3', function (buffer) {
        sClick = buffer;
    });
    getAudioBuffer('/sounds/info.mp3', function (buffer) {
        sInfo = buffer;
    });
    getAudioBuffer('/sounds/error.mp3', function (buffer) {
        sError = buffer;
    });
    getAudioBuffer('/sounds/timeup.mp3', function (buffer) {
        sTimeup = buffer;
    });

};
