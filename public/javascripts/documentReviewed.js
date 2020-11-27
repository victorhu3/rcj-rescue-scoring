// register the directive with your app module
var app = angular.module('DocumentReview', ['ngTouch','ngAnimate', 'ui.bootstrap', 'pascalprecht.translate', 'ngCookies', 'ngSanitize']);

// function referenced by the drop target
app.controller('DocumentReviewController', ['$scope', '$uibModal', '$log', '$http', '$translate','$sce', '$timeout' , function ($scope, $uibModal, $log, $http, $translate, $sce, $timeout) {

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

    let upload_mes;
    $translate('document.uploaded').then(function (val) {
        upload_mes = val;
    }, function (translationId) {
    // = translationId;
    });

    let hints_mes;
    $translate('document.form.hints').then(function (val) {
        hints_mes = val;
    }, function (translationId) {
    // = translationId;
    });


    const currentLang = $translate.proposedLanguage() || $translate.use();
    const availableLangs =  $translate.getAvailableLanguageKeys();

    $scope.token = token;

    $scope.currentLang = currentLang;
    $scope.displayLang = currentLang;

    $scope.uploaded = [];
    
    $scope.updateTime = new Date().getTime()/1000;

    $scope.videoRefresh = false;

    $scope.comments = "";

    $http.get("/api/competitions/" + competitionId).then(function (response) {
        $scope.competition = response.data
    })

    $http.get("/api/teams/" + teamId).then(function (response) {
        $scope.team = response.data;

        $http.get("/api/competitions/leagues/"+$scope.team.league).then(function (response) {
            $scope.league = response.data
        });

        $scope.updateUploaded();
        $scope.updateReviewUploaded();
        
        $http.get("/api/competitions/" + competitionId + "/documents/" + $scope.team.league + "/review").then(function (response) {
            $scope.blocks = response.data.blocks;
            $scope.notifications = response.data.notifications;
            $scope.languages = response.data.languages;
            $scope.review = response.data.review;

            $http.get("/api/document/answer/"+ $scope.team._id + "/" + token).then(function (response) {
                $scope.answers = response.data;
                if(!$scope.answers.length){
                    for(let b of $scope.blocks){
                        let ba = [];
                        for(let q of b.questions){
                            if(q.type == "select") ba.push('option0');
                            else ba.push('');
                        }
                        $scope.answers.push(ba);
                    }
                }
            });

            $http.get("/api/document/review/" + teamId).then(function (response) {
                $scope.reviewComments = response.data;
                console.log($scope.reviewComments)
                let fil = $scope.reviewComments.filter((r) => r.reviewer._id == userId);
                $scope.myComments = [];

                if(fil.length == 0){
                    for(let b of $scope.review){
                        let ba = [];
                        for(let q of b.questions){
                            if(q.type == "select"){
                                ba.push('option0');
                            }
                            else{
                                ba.push('');
                            }
                        }
                        $scope.myComments.push(ba);
                    }
                }else{
                    $scope.myComments = fil[0].comments;
                }
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

        
    })

    


    $scope.trust = function(html){
        return($sce.trustAsHtml(html));
    }

    $scope.langContent = function(data, target){
        if(data[target]) return data[target];
        data[target] = $sce.trustAsHtml(data.filter( function( value ) {
            return value.language == $scope.displayLang;        
        })[0][target]);

        return(data[target]);
    }

    $scope.langArray = function(data, target){
        if(data[target]) return data[target];
        data[target] = data.filter( function( value ) {
            return value.language == $scope.displayLang;        
        })[0][target];
        return(data[target]);
    }
    
    $scope.changeLocale = function(){
        $scope.go('/locales');
    }

    $scope.go = function (path) {
        window.location = path
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

    $scope.backPage = function(){
        if($scope.getParam("return")) $scope.go($scope.getParam("return"));
        else window.history.back(-1);
        return false;
    }


    $scope.updateUploaded = function(){
        $http.get("/api/document/files/" + $scope.team._id + '/' + token).then(function (response) {
            $scope.uploaded = response.data;
            $scope.updateTime = new Date().getTime()/1000;
        })
    }

    $scope.updateReviewUploaded = function(){
        $http.get("/api/document/review/files/" + $scope.team._id).then(function (response) {
            $scope.uploadedReview = response.data;
            $scope.updateTime = new Date().getTime()/1000;
        })
    }

    $scope.checkUploaded = function(name){
        return($scope.uploaded.some((n) => new RegExp(name+'\\.').test(n)));
    }

    $scope.checkUploadedReview = function(name, user){
        return($scope.uploadedReview.some((n) => new RegExp(user + '/' + name+'\\.').test(n)));
    }

    $scope.nameUploaded = function(name){
        return($scope.uploaded[$scope.uploaded.findIndex((n) => new RegExp(name+'\\.').test(n))]);
    }

    $scope.nameUploadedReview = function(name, user){
        return($scope.uploadedReview[$scope.uploadedReview.findIndex((n) => new RegExp(user + '/' + name+'\\.').test(n))]);
    }

    $scope.getPdfLink = function(name){
        return("/components/pdfjs/web/viewer.html?file=/api/document/files/" + $scope.team._id + "/" + token + "/" + $scope.nameUploaded(name) + '&v=' + $scope.updateTime);
    }

    $scope.getPdfLinkReview = function(name, user){
        return("/components/pdfjs/web/viewer.html?file=/api/document/review/files/" + $scope.team._id + "/" + $scope.nameUploadedReview(name, user) + '&v=' + $scope.updateTime);
    }

    $scope.getVideoList = function(name){
        let res = $scope.uploaded.filter(function(value) {
            return new RegExp(name+'\\.').test(value);
        });
        return res;
    }

    $scope.getVideoListReview = function(name, user){
        let res = $scope.uploadedReview.filter(function(value) {
            return new RegExp(user + '/' + name+'\\.').test(value);
        });
        return res;
    }


    $scope.getVideoLink = function(path){
        return("/api/document/files/" + $scope.team._id + "/" + token + "/" + path + '?v=' + $scope.updateTime);
    }

    $scope.getVideoLinkReview = function(path){
        return("/api/document/review/files/" + $scope.team._id + "/" + path + '?v=' + $scope.updateTime);
    }

    $scope.getThumbnailLink = function(name){
        return("/api/document/files/" + $scope.team._id + "/" + token + "/" + $scope.nameUploaded(name+'-thumbnail') + '?v=' + $scope.updateTime);
    }

    $scope.getThumbnailLinkReview = function(name, user){
        return("/api/document/review/files/" + $scope.team._id + "/" + $scope.nameUploadedReview(name+'-thumbnail', user) + '?v=' + $scope.updateTime);
    }

    var A = parseInt($('#ANSWER').width(), 10),
        B = parseInt($('#COMMENTS').width(), 10),
        Z = parseInt($('#DRUG').width(), 10),
        minw = parseInt((A + B + Z) * 10 / 100, 10),
        offset = $('#container').offset(),
        splitter = function(event, ui){
            var aw = parseInt(ui.position.left),
                bw = A + B - aw;
            //set widths and information...
            $('#ANSWER').css({width : aw});
            $('#COMMENTS').css({width : bw + 15});
            //qe.container.style.height = (window.innerHeight - qe.container.offsetTop - 90) + 'px';


        };
    $('#DRUG').draggable({
        axis : 'x',
        containment : [
            offset.left + minw,
            offset.top,
            offset.left + A + B - minw,
            offset.top + $('#container').height()
            ],
        drag : splitter
    });

}]);
