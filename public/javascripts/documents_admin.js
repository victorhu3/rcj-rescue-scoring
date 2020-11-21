var app = angular.module("DocumentsAdmin", ['ngTouch','ngAnimate', 'pascalprecht.translate', 'ngCookies', 'toastr']);

app.controller("DocumentsAdminController", ['$scope', '$http', '$translate', 'toastr', function ($scope, $http, $translate, $toastr) {
    $scope.competitionId = competitionId

    $scope.go = function (path) {
        window.location = path
    }
    $http.get("/api/competitions/" + competitionId).then(function (response) {
        $scope.competition = response.data
        console.log($scope.competition)
        $scope.defaultDeadline = new Date(response.data.documents.deadline * 1000);
        $scope.docSystemEnabled = response.data.documents.enable;
    })
    $http.get("/api/competitions/leagues").then(function (response) {
        $scope.leagues = response.data
    })

    $scope.set = function(){
        let data = {
            documents: {
                enable: $scope.docSystemEnabled,
                deadline: Math.round( $scope.defaultDeadline.getTime() / 1000 )
            }
        }
      
        $http.put("/api/competitions/" + $scope.competitionId, data).then(function (response) {
            $toastr.success('Successfully saved!');
        }, function (response) {
            $toastr.error(response.data.msg, "Error: " + response.statusText);
        });
    }

    
}])
