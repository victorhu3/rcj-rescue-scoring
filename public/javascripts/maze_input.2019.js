// register the directive with your app module
var app = angular.module('ddApp', ['ngTouch','ngAnimate', 'ui.bootstrap', 'pascalprecht.translate', 'ngCookies']);

// function referenced by the drop target
app.controller('ddController', ['$scope', '$uibModal', '$log', '$timeout', '$http','$translate', '$cookies',function ($scope, $uibModal, $log, $timeout, $http, $translate, $cookies) {


    $scope.runId = runId;
    var date = new Date();

    const http_config = {
        timeout: 10000
    };

    $scope.cells = {};
    $scope.tiles = {};

    var db_cells;

    $http.get("/api/runs/maze/" + runId +
        "?populate=true").then(function (response) {

        console.log(response.data);
        $scope.exitBonus = response.data.exitBonus;
        $scope.field = response.data.field.name;
        $scope.round = response.data.round.name;
        $scope.team = response.data.team;
        $scope.league = response.data.team.league;
        $scope.competition = response.data.competition;
        $scope.LoPs = response.data.LoPs;
        $scope.MisIdent = response.data.misidentification;

        // Verified time by timekeeper
        $scope.minutes = response.data.time.minutes;
        $scope.seconds = response.data.time.seconds;

        // Scoring elements of the tiles
        for (let i = 0; i < response.data.tiles.length; i++) {
            $scope.tiles[response.data.tiles[i].x + ',' +
                response.data.tiles[i].y + ',' +
                response.data.tiles[i].z] = response.data.tiles[i];
        }

        if(response.data.manual){
            let manual = response.data.manual;
            let victim = manual.victims;
            let linear = victim.linear;
            let floating = victim.floating;
            $scope.lui = linear.u.identify;
            $scope.luk = linear.u.kit;
            $scope.lsi = linear.s.identify;
            $scope.lsk = linear.s.kit;
            $scope.lhi = linear.h.identify;
            $scope.lhk = linear.h.kit;
            $scope.lhhi = linear.heated.identify;
            $scope.lhhk = linear.heated.kit;

            $scope.fui = floating.u.identify;
            $scope.fuk = floating.u.kit;
            $scope.fsi = floating.s.identify;
            $scope.fsk = floating.s.kit;
            $scope.fhi = floating.h.identify;
            $scope.fhk = floating.h.kit;
            $scope.fhhi = floating.heated.identify;
            $scope.fhhk = floating.heated.kit;

            $scope.checkpoints = manual.checkpoints;
            $scope.speedbumps = manual.speedbumps;
            $scope.rampUP = manual.rampUP;
            $scope.rampDOWN = manual.rampDOWN;
        }else{
            $scope.lui = 0;
            $scope.luk = 0;
            $scope.lsi = 0;
            $scope.lsk = 0;
            $scope.lhi = 0;
            $scope.lhk = 0;
            $scope.lhhi = 0;
            $scope.lhhk = 0;

            $scope.fui = 0;
            $scope.fuk = 0;
            $scope.fsi = 0;
            $scope.fsk = 0;
            $scope.fhi = 0;
            $scope.fhk = 0;
            $scope.fhhi = 0;
            $scope.fhhk = 0;

            $scope.checkpoints = 0;
            $scope.speedbumps = 0;
            $scope.rampUP = 0;
            $scope.rampDOWN = 0;
        }
        $scope.focused('lui');
    }, function (response) {
        console.log("Error: " + response.statusText);
        if (response.status == 401) {
            $scope.go('/home/access_denied');
        }
    });


    $scope.range = function (n) {
        arr = [];
        for (let i = 0; i < n; i++) {
            arr.push(i);
        }
        return arr;
    }

    $scope.send = function () {
        playSound(sClick);
        let run = {};

        run.manualFlag = true;

        run.exitBonus = $scope.exitBonus;
        run.LoPs = $scope.LoPs;
        run.misidentification = $scope.MisIdent;

        // Scoring elements of the tiles
        //run.tiles = $scope.tiles;

        // Verified time by timekeeper
        if($scope.minutes > 8 || $scope.seconds >= 60){
            playSound(sError);
            Swal.fire(
              'Error',
              'Please check time is correct!',
              'error'
            );
            return;
        }
        run.time = {};
        run.time.minutes = $scope.minutes;;
        run.time.seconds = $scope.seconds;
        run.status = 4;

        // Set manual input value
        run.manual = {};
        run.manual.victims = {};
        run.manual.victims.linear = {};
        run.manual.victims.linear.u = {};
        run.manual.victims.linear.u.identify = checkNull($scope.lui);
        run.manual.victims.linear.u.kit = checkNull($scope.luk);
        run.manual.victims.linear.s = {};
        run.manual.victims.linear.s.identify = checkNull($scope.lsi);
        run.manual.victims.linear.s.kit = checkNull($scope.lsk);
        run.manual.victims.linear.h = {};
        run.manual.victims.linear.h.identify = checkNull($scope.lhi);
        run.manual.victims.linear.h.kit = checkNull($scope.lhk);
        run.manual.victims.linear.heated = {};
        run.manual.victims.linear.heated.identify = checkNull($scope.lhhi);
        run.manual.victims.linear.heated.kit = checkNull($scope.lhhk);

        run.manual.victims.floating = {};
        run.manual.victims.floating.u = {};
        run.manual.victims.floating.u.identify = checkNull($scope.fui);
        run.manual.victims.floating.u.kit = checkNull($scope.fuk);
        run.manual.victims.floating.s = {};
        run.manual.victims.floating.s.identify = checkNull($scope.fsi);
        run.manual.victims.floating.s.kit = checkNull($scope.fsk);
        run.manual.victims.floating.h = {};
        run.manual.victims.floating.h.identify = checkNull($scope.fhi);
        run.manual.victims.floating.h.kit = checkNull($scope.fhk);
        run.manual.victims.floating.heated = {};
        run.manual.victims.floating.heated.identify = checkNull($scope.fhhi);
        run.manual.victims.floating.heated.kit = checkNull($scope.fhhk);

        run.manual.checkpoints = checkNull($scope.checkpoints);
        run.manual.speedbumps = checkNull($scope.speedbumps);
        run.manual.rampUP = checkNull($scope.rampUP);
        run.manual.rampDOWN = checkNull($scope.rampDOWN);

        $http.put("/api/runs/maze/" + runId, run).then(function (response) {
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
    };

    $scope.go = function (path) {
        playSound(sClick);
        window.location = path
    };

    var saveContent = [];
    $scope.focused = function (name) {
        saveContent[name] = $scope[name];
        $scope[name] = "";
    };

    $scope.blured = function (name) {
        console.log($scope[name]);
        if($scope[name] == ""){
            if(typeof($scope[name]) == 'number'){
                console.log("NUMBER");
            }else{
                $scope[name] = saveContent[name];
            }

        }
    };

    $scope.changeExitBonus = function () {
        playSound(sClick);
        $scope.exitBonus = ! $scope.exitBonus
        upload_run({
            exitBonus: $scope.exitBonus
        });
    }

    function  checkNull(val) {
        if(val) return val;
        return 0;
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

var getAudioBuffer = function(url, fn) {
  var req = new XMLHttpRequest();
  req.responseType = 'arraybuffer';

  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      if (req.status === 0 || req.status === 200) {
        context.decodeAudioData(req.response, function(buffer) {
          fn(buffer);
        });
      }
    }
  };

  req.open('GET', url, true);
  req.send('');
};

var playSound = function(buffer) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
};

var sClick,sInfo,sError,sTimeup;
window.onload = function() {
  getAudioBuffer('/sounds/click.mp3', function(buffer) {
      sClick = buffer;
  });
  getAudioBuffer('/sounds/info.mp3', function(buffer) {
      sInfo = buffer;
  });
  getAudioBuffer('/sounds/error.mp3', function(buffer) {
      sError = buffer;
  });
  getAudioBuffer('/sounds/timeup.mp3', function(buffer) {
      sTimeup = buffer;
  });
  document.getElementById("first").focus();
};

function fEnterChangeTab(){
    var oObject = "#inputcontent :input:not(:button):not(:hidden)";

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