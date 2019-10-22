var app = angular.module("TeamAdmin", ['ngTouch','pascalprecht.translate', 'ngCookies']).controller("TeamAdminController", function ($scope, $http) {
    $scope.competitionId = competitionId;
    $scope.showCode = false;
    updateTeamList();

    $http.get("/api/competitions/" + competitionId).then(function (response) {
        $scope.competition = response.data
    })

    $http.get("/api/teams/leagues").then(function (response) {
        $scope.leagues = response.data
        console.log($scope.leagues)
    })

    $scope.teamCode = [];

    $scope.addTeam = function () {
        var team = {
            name: $scope.teamName,
            league: $scope.teamLeague,
            competition: competitionId,
            code: $scope.passcode,
            country: $scope.country
        };

        $http.post("/api/teams", team).then(function (response) {
            console.log(response)
            updateTeamList()
        }, function (error) {
            console.log(error)
        })
    };


    $scope.updateCode = async function (team) {
        const {
            value: operation
        } = await swal({
            title: "Update team code",
            text: "Update team code from '" + $scope.teams.teamCode + "'",
            type: "info",
            showCancelButton: true,
            confirmButtonText: "Update",
            confirmButtonColor: "#3bacec",
            input: 'text',
            inputPlaceholder: 'Enter NEW team code here'
        });

        if (operation) {
            $http.get("/api/teams/set/" + team._id + "/" + operation).then(function (response) {
                updateTeamList()
            }, function (error) {
                console.log(error)
            })
        }


    }

    $scope.selectAll = function () {
        angular.forEach($scope.teams, function (team) {
            team.checked = true;
        });
    }


    $scope.removeSelectedTeam = function () {
        var chk = [];
        angular.forEach($scope.teams, function (team) {
            if (team.checked) chk.push(team._id);
        });
        $scope.removeTeam(chk.join(","));
    }
    
    $scope.removeTeam = async function (teamId) {
            const {
                value: operation
            } = await swal({
                title: "Remove team?",
                text: "Are you sure you want to remove?",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Remove it!",
                confirmButtonColor: "#ec6c62",
                input: 'text',
                inputPlaceholder: 'Enter "DELETE" here',
                inputValidator: (value) => {
                    return value != 'DELETE' && 'You need to write "DELETE" !'
                }
            })

            if (operation) {
                $http.delete("/api/teams/" + teamId).then(function (response) {
                    console.log(response)
                    updateTeamList()
                }, function (error) {
                    console.log(error)
                })
            }


        }

    function updateTeamList() {
        $http.get("/api/competitions/" + competitionId +
            "/teams").then(function (response) {
            $scope.teams = response.data;

            $scope.showCode = false;
            for(let t of $scope.teams){
                if(t.teamCode != ""){
                    $scope.showCode = true;
                    break;
                }
            }
            console.log($scope.teams)
        })
    }
    $scope.go = function (path) {
        window.location = path
    }
})
