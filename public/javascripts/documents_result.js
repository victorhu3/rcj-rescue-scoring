var app = angular.module("DocumentResult", ['ngTouch','ngAnimate', 'ui.bootstrap', 'pascalprecht.translate', 'ngCookies']);
app.controller('DocumentResultController', ['$scope', '$uibModal', '$log', '$http', '$translate', '$sce', function ($scope, $uibModal, $log, $http, $translate, $sce) {

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });

    let saved_mes;
    $translate('document.saved').then(function (val) {
        saved_mes = val;
    }, function (translationId) {
    // = translationId;
    });

    const currentLang = $translate.proposedLanguage() || $translate.use();
    const availableLangs =  $translate.getAvailableLanguageKeys();

    $scope.currentLang = currentLang;
    $scope.displayLang = currentLang;

    $scope.competitionId = competitionId;
    updateTeamList();

    $http.get("/api/competitions/" + competitionId).then(function (response) {
        $scope.competition = response.data
        console.log($scope.competition)
    })

    $scope.Rleagues = {};
    $http.get("/api/teams/leagues").then(function (response) {
        $scope.leagues = response.data;

        for(let l of $scope.leagues){
            $scope.Rleagues[l] = false;
        }
    })


    function updateTeamList() {
        $http.get("/api/competitions/" + competitionId +
            "/teams/documents").then(function (response) {
            $scope.teams = response.data.filter(function(value) {
                return value.league == leagueId;
            });
            console.log($scope.teams)
            $scope.showCode = false;

        })
    }

    $http.get("/api/competitions/" + competitionId + "/documents/" + leagueId + "/review").then(function (response) {
        $scope.languages = response.data.languages;
        $scope.review = response.data.review;

        $scope.scaleBlock = [];
        for(let b in $scope.review){
            let blockFlag = false;
            for(let q of $scope.review[b].questions){
                if(q.type == 'scale'){
                    blockFlag = true;
                    break;
                }
            }
            if(blockFlag){
                $scope.scaleBlock.push(b)
            }
        }

        $http.get("/api/document/reviews/" + competitionId).then(function (response) {
          console.log(response.data)
            $scope.reviewCommentsTeams = response.data.filter(function(value) {
                return value.team && value.team.league == leagueId;
            });
            console.log($scope.reviewCommentsTeams)

            $scope.rating=[];
            $scope.ratingFlag = [];
            if(!$scope.reviewCommentsTeams) return 0;
            for(let c of $scope.reviewCommentsTeams){
                let teamId = c.team._id;
                if(!$scope.rating[teamId]) $scope.rating[teamId] = [];
                for(let b in c.comments){
                    for(let q in c.comments[b]){
                        if(!$scope.review[b].questions[q]) continue;
                        if(c.comments[b][q] == '' || isNaN(c.comments[b][q]) || $scope.review[b].questions[q].type != 'scale') continue;

                        let r = Number(c.comments[b][q]);
                        if(!$scope.rating[teamId][b]) $scope.rating[teamId][b] = [];
                        if(!$scope.rating[teamId][b][q]) $scope.rating[teamId][b][q] = [];
                        $scope.rating[teamId][b][q].push(r);
                    }
                }
            }
            console.log($scope.rating)
        })

        //Check 1st lang
        for(let l of $scope.languages){
            if(l.language == $scope.displayLang && l.enable) return;
        }

        //Set alternative lang
        for(let l of $scope.languages){
            if(l.enable){
                $scope.displayLang = l.language;
                return;
            }
        }
    })

    $scope.langContent = function(data, target){
        data[target] = $sce.trustAsHtml(data.filter( function( value ) {
            return value.language == $scope.displayLang;
        })[0][target]);

        return(data[target]);
    }

    const average = function(arr) {
        if (typeof arr !== 'object' || arr.length === 0) return false;

        var key, totalNumber = 0;
        for (key in arr) totalNumber = totalNumber + Number(arr[key]);

        return totalNumber / arr.length;
    };
    $scope.rateScoreAve = function(team, block){
      if(!$scope.rating || !$scope.rating[team]) return 0;
        let score = 0;
        for(let q of $scope.rating[team][block]){
            score += average(q)
        }
        return(score);
    }

    $scope.rateScoreTotal = function(team){
        let score = 0;
        for(let b of $scope.scaleBlock){
            score += $scope.rateScoreAve(team, b)
        }
        return(score);
    }

    $scope.go = function (path) {
        window.location = path
    }

    var showAllLeagues = true;
    $scope.refineName = "";
    $scope.refineCode = "";
    $scope.refineRegion = "";

    $scope.$watch('Rleagues', function (newValue, oldValue) {
        showAllLeagues = true
        //console.log(newValue)
        for (let league in newValue) {
            if (newValue.hasOwnProperty(league)) {
                if (newValue[league]) {
                    showAllLeagues = false
                    return
                }
            }
        }
    }, true);

    $scope.list_filter = function (value, index, array) {
        return (showAllLeagues || $scope.Rleagues[value.league])  && (~value.name.indexOf($scope.refineName)) && (~value.teamCode.indexOf($scope.refineCode)) && (~value.country.indexOf($scope.refineRegion))
    }

    $scope.openLog = function(team){
        let logUrl = "/api/document/files/" + team._id + "/" + team.document.token + "/log.txt";
        $http.get(logUrl).then(function (response) {
            let log = response.data.split(/\r?\n/g);
            log = log.reverse().join('<br>');

            Swal.fire({
                title: 'Log Viewer',
                html: "<div style='text-align:left;max-height:calc(100vh - 200px);overflow:auto;'>" + log + "</div>",
                width: "100%",
                height: "100%",
                showCloseButton: true,
            })
        }, function (response) {
            Toast.fire({
                type: 'error',
                title: "Error: " + response.statusText,
                html: response.data.msg
            })
        })

    }

    $scope.copy = function(team){
        let link = `${location.protocol}//${location.host}/document/${team._id}/${team.document.token}`;
        if(navigator.clipboard){
            navigator.clipboard.writeText(link);
            Toast.fire({
                type: 'success',
                title: "Copied!",
                html: link
            });
        }else{
            Toast.fire({
                type: 'error',
                title: "Not supported!"
            });
        }

    }

    $scope.deadlineColour = function(deadline){
        if(!deadline) return '';
        let today = new Date();
        let tomorrow = new Date();

        tomorrow.setDate(today.getDate() + 1);

        if(deadline > tomorrow) return '#bcffbc';
        if(deadline > today) return '#ffffc6';
        return '#ffcccc';
    }
}]);
