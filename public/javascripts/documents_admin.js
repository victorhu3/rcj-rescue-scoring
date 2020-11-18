var app = angular.module("DocumentsAdmin", ['ngTouch','pascalprecht.translate', 'ngCookies']).controller("DocumentsAdminController", function ($scope, $http) {
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
        console.log($scope.defaultDeadline);
        console.log($scope.docSystemEnabled);
        console.log(Math.round( $scope.defaultDeadline.getTime() / 1000 ));

        let data = {
            documents: {
                enable: $scope.docSystemEnabled,
                deadline: Math.round( $scope.defaultDeadline.getTime() / 1000 )
            }
          }
      
          $http.put("/api/competitions/" + $scope.competitionId, data).then(function (response) {
            console.log(response.data);
            location.reload();
          }, function (response) {
            console.log("Error: " + response.statusText);
            alert(response.data.msg);
          });
    }
})
