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



    $scope.calc_victim_points = function (type, effective) {
        let tmp_point = 0;
        if (!effective) tmp_point = 5;
        else if ($scope.evacuationLevel == 1) { // Low Level
            if (type == "L") tmp_point = 30;
            else tmp_point = 20;
        } else { // High Level
            if (type == "L") tmp_point = 40;
            else tmp_point = 30;
        }
        return Math.max(tmp_point - $scope.LoPs[$scope.actualUsedDropTiles] * 5, 0);
    }

    $scope.count_victim_list = function (type) {
        let count = 0
        for (victiml of $scope.victim_list) {
            if (!victiml.type.indexOf(type)) {
                count++;
            }
        }
        return count;
    }

    $scope.count_victim_tmp = function (type) {
        let count = 0
        for (victiml of $scope.victim_tmp) {
            if (!victiml.indexOf(type)) {
                count++;
            }
        }
        return count;
    }

    $scope.addVictimTmp = function (type) {
        playSound(sClick);
        if (type == "L") {
            if ($scope.count_victim_list("L") + $scope.count_victim_tmp("L") >= $scope.maxLiveVictims) return;
        } else {
            if ($scope.count_victim_list("D") + $scope.count_victim_tmp("D") >= $scope.maxDeadVictims) return;
        }
        $scope.victim_tmp.push(type);
        $scope.victimRegist();
    }

    $scope.addVictim = function (type) {
        let tmp = {};
        tmp.effective = true;
        if (type == "L") {
            tmp.type = "L";
            if ($scope.count_victim_list("L") >= $scope.maxLiveVictims) return;
        } else {
            tmp.type = "D";
            if ($scope.count_victim_list("D") >= $scope.maxDeadVictims) return;
            if ($scope.count_victim_list("L") >= $scope.maxLiveVictims) { // All live victims rescued

            } else {
                tmp.effective = false;
            }
        }


        $scope.victim_list.push(tmp);
    }

    function reStateVictim() {
        let count = 0;
        for (victiml of $scope.victim_list) {
            if (!victiml.type.indexOf("L")) {
                count++;
            }
            if (!victiml.type.indexOf("D")) {
                if (count >= $scope.maxLiveVictims) {
                    victiml.effective = true;
                } else {
                    victiml.effective = false;
                }
            }

        }
    }

    $scope.delete_victim = function (index) {
        playSound(sClick);
        $scope.victim_list.splice(index, 1);
        reStateVictim();


    }
    $scope.delete_victim_tmp = function (index) {
        playSound(sClick);
        $scope.victim_tmp.splice(index, 1);
    }

    $scope.victimRegist = function () {
        playSound(sClick);
        let live = 0;
        let dead = 0;
        for (victiml of $scope.victim_tmp) {
            if (!victiml.indexOf("L")) {
                live++;
            } else {
                dead++;
            }
        }
        for (let i = 0; i < live; i++) {
            $scope.addVictim("L");
        }
        for (let i = 0; i < dead; i++) {
            $scope.addVictim("D");
        }
        $scope.victim_tmp_clear();

    }

    $scope.victim_tmp_clear = function () {
        playSound(sClick);
        $scope.victim_tmp = [];
    }

    $scope.changeLevel = function (n) {
        playSound(sClick);
        $scope.evacuationLevel = n;

    }


    $scope.send = function () {
            playSound(sClick);
            var run = {}
            run.LoPs = $scope.mlop.slice(0,$scope.mcp.length);
            run.evacuationLevel = $scope.evacuationLevel;
            run.exitBonus = $scope.exitBonus;
            run.rescueOrder = $scope.victim_list;
            run.showedUp = true;
            run.started = true;

            for(let i=0;i<$scope.mcp.length;i++){
                if(i==0){
                    run.showedUp = $scope.arrive[i];
                }else {
                    $scope.stiles[$scope.mcp[i] - 1].isDropTile = true;
                    if ($scope.arrive[i]) {
                        $scope.stiles[$scope.mcp[i] - 1].scoredItems[0].scored = true;
                    }else{
                        $scope.stiles[$scope.mcp[i] - 1].scoredItems[0].scored = false;
                    }
                }
            }

            run.tiles = $scope.stiles;
            run.retired = false;
            run.time = {
                minutes: $scope.minutes,
                seconds: $scope.seconds
            };
            run.status = 4;

            run.manualFlag = true;
            run.manual = {};
            run.manual.gap = $scope.mgap;
            run.manual.obstacle = $scope.mobstacle;
            run.manual.speedbump = $scope.mspeedbump;
            run.manual.intersection = $scope.mintersection;
            run.manual.deadend = $scope.mdeadend;
            run.manual.rampUP = $scope.rampUP;
            run.manual.rampDOWN = $scope.rampDOWN;


            $http.put("/api/runs/line/" + runId, run, http_config).then(function (response) {
                playSound(sInfo);
                $scope.go($scope.getParam('return'));
                return;
                Swal.fire({
                    title: response.data.score + "  points",
                    text: "Please write it down on the scoresheet.",
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Wrote!'
                }).then((result) => {
                    playSound(sClick);
                    $scope.go($scope.getParam('return'));
                })
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

    $scope.changeExitBonus = function () {
        playSound(sClick);
        $scope.exitBonus = !$scope.exitBonus
    }

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

    var saveContent = [];
    $scope.focused = function (name,i) {
        if(i || i == 0){
            if(!saveContent[name]) saveContent[name] = [];
            saveContent[name][i] = $scope[name][i];
            $scope[name][i] = null;
        }else {
            if($scope[name] >= 0) {
                saveContent[name] = $scope[name];
                $scope[name] = "";
            }
        }
       fEnterChangeTab();
    };

    $scope.blured = function (name,i,flag) {

        if(i || i == 0){
            if($scope[name][i] == null){
                $scope[name][i] = saveContent[name][i];
                if($scope[name][i] == null && flag) {
                    $scope[name].splice(i, 1);
                    moveFocusNumber((i-1)*2+4);
                }
            }else if($scope[name][i] == 0 && flag){
                $scope[name].splice(i, 1);
            }
        }else{
            if($scope[name] == ""){
                if(typeof($scope[name]) == 'number'){
                    console.log("NUMBER");
                }else{
                    $scope[name] = saveContent[name];
                }
            }
        }
        fEnterChangeTab();
    };

    $scope.arriveMark = function (i) {
        if($scope.arrive[i] == null) return saveContent['arrive'][i];
        return $scope.arrive[i];
    }

}]);

function moveFocusNumber(num){
    var oObject = "#inputcontent :input:not(:button):not(:hidden)";
    cNext = ":eq(" + num + ")";
    $(oObject + cNext).focus();
}

function fEnterChangeTab(){
    var oObject = "#inputcontent :input:not(:button):not(:hidden)";
    $(oObject).off("keypress");
    $(oObject).keypress(function(e) {
        var c = e.which ? e.which : e.keyCode;
        if (c == 13) {
            var index = $(oObject).index(this);
            var cNext = "";
            var nLength = $(oObject).length;
            for(i=index;i<nLength;i++){
                cNext = e.shiftKey ? ":lt(" + index + "):last" : ":gt(" + index + "):first";
                if ($(oObject + cNext).attr("readonly") == "readonly") {
                    if (e.shiftKey) index--;
                    else index++;
                }
                else if ($(oObject + cNext).prop("disabled") == true) {
                    if (e.shiftKey) index--;
                    else index++;
                }
                else break;
            }
            if (index == nLength - 1) {
                if (! e.shiftKey){
                    cNext = ":eq(1)";
                }
            }
            if (index == 0) {
                if (e.shiftKey) {
                    cNext = ":eq(" + (nLength - 1) + ")";
                }
            }
            $(oObject + cNext).focus();
            e.preventDefault();
        }
    });
}

if(window.attachEvent){
    window.attachEvent('onload',fEnterChangeTab);
}
else if (window.opera){
    window.addEventListener('load',fEnterChangeTab,false);
}
else {
    window.addEventListener('load',fEnterChangeTab,false);
}

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
