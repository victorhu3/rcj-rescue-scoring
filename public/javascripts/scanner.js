var app = angular.module("Scanner", ['ngTouch','pascalprecht.translate', 'ngCookies','ngSanitize']);
app.controller("ScannerController", ['$scope', '$http', '$translate', function ($scope, $http, $translate) {
    $scope.secretCommand = false;


    
    


    $scope.go = function (path) {
        window.location = path
    }

    document.getElementById("first").focus();

    $scope.handleKeydown = function(e) {
        console.log(e.keyCode)
        if (e.keyCode == 13) {
            let result = $scope.data.split(';');
            let url = ""
            switch (result[0]) {
                case 'L':
                    url = "/line/" + mode + "/" + result[1] + "?return=/home/scanner/" + mode;
                    break;
                case 'M':
                    url = "/maze/" + mode + "/" + result[1] + "?return=/home/scanner/" + mode;
                    break;
            }
            $scope.go(url);
        }
    }

}]);
