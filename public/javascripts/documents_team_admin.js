var app = angular.module("TeamAdmin", ['ngTouch','ngAnimate', 'ui.bootstrap', 'pascalprecht.translate', 'ngCookies', 'toastr']);
app.controller('TeamAdminController', ['$scope', '$uibModal', '$log', '$http', '$translate', 'toastr', function ($scope, $uibModal, $log, $http, $translate, $toastr) {

    let saved_mes;
    $translate('document.saved').then(function (val) {
        saved_mes = val;
    }, function (translationId) {
    // = translationId;
    });

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


    $scope.save = function(data){
        let tmp = {
            _id: data._id,
            competition: data.competition,
            document:{
                deadline: Math.round( data.document.deadline.getTime() / 1000 ),
                enabled: data.document.enabled
            }
        };

        $http.put("/api/competitions/" + competitionId + "/teams/documents", tmp).then(function (response) {
            $toastr.success(saved_mes);
        }, function (response) {
            $toastr.error(response.data.msg, "Error: " + response.statusText);
        });
    }

    function updateTeamList() {
        $http.get("/api/competitions/" + competitionId +
            "/teams/documents").then(function (response) {
            $scope.teams = response.data;
            console.log($scope.teams)

            $scope.showCode = false;
            for(let t of $scope.teams){
                if(t.document.deadline){
                    t.document.deadline = new Date(t.document.deadline * 1000);
                }
            }
        })
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
}]);
