// register the directive with your app module
var app = angular.module('FormPreview', ['ngTouch','ngAnimate', 'ui.bootstrap', 'pascalprecht.translate', 'ngCookies', 'ngQuill', 'toastr', 'ngSanitize', 'ngFileUpload']);

app.constant('NG_QUILL_CONFIG', {
    /*
     * @NOTE: this config/output is not localizable.
     */
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
  
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],     // superscript/subscript
        [{ 'indent': '-1' }, { 'indent': '+1' }],         // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
  
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],
  
        ['clean'],                                         // remove formatting button
  
        ['link', 'image', 'video']                         // link and image, video
      ],
      imageResize: {
      },
      imageDropAndPaste: {
      }
    },
    theme: 'snow',
    debug: 'warn',
    placeholder: '',
    readOnly: false,
    bounds: document.body,
    scrollContainer: null
  })
  
  app.config([
    'ngQuillConfigProvider',
    'NG_QUILL_CONFIG',
  
    function (ngQuillConfigProvider, NG_QUILL_CONFIG) {
      ngQuillConfigProvider.set(NG_QUILL_CONFIG)
    }
  ])

// function referenced by the drop target
app.controller('FormPreviewController', ['$scope', '$uibModal', '$log', '$http', '$translate', 'toastr','$sce', 'Upload', '$timeout' , function ($scope, $uibModal, $log, $http, $translate, $toastr, $sce, Upload, $timeout) {

    const currentLang = $translate.proposedLanguage() || $translate.use();
    const availableLangs =  $translate.getAvailableLanguageKeys();

    $scope.currentLang = currentLang;
    $scope.displayLang = currentLang;

    $http.get("/api/competitions/" + competitionId).then(function (response) {
        $scope.competition = response.data
    })

    $http.get("/api/competitions/" + competitionId + "/documents/" + leagueId).then(function (response) {
        $scope.blocks = response.data.blocks;
        $scope.notifications = response.data.notifications;
        $scope.languages = response.data.languages;

        $scope.answers = [];
        for(let b of $scope.blocks){
            let ba = [];
            for(let q of b.questions){
                if(q.type == "select") ba.push('option0');
                else ba.push('');
            }
            $scope.answers.push(ba);
        }
        console.log($scope.answers);
        
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

    $http.get("/api/competitions/leagues/"+leagueId).then(function (response) {
        $scope.league = response.data
    });

    $scope.save = function () {
        console.log($scope.answers);
        $toastr.success('Successfully saved!');
    }


    $scope.deadline = function(){
        if(!$scope.competition) return;
        let deadline = new Date($scope.competition.documents.deadline * 1000);
        let options = { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric",timeZoneName:"long" };
        return(new Intl.DateTimeFormat(navigator.language, options).format(deadline));
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


    $scope.hints = function(content){
        Swal.fire({
            title: 'ヒント',
            html: '<div style="text-align:initial;">' + content + '</div>',
            showCloseButton: true,
            showCancelButton: false,
            focusConfirm: true
          })
    }
    
    $scope.go = function (path) {
        window.location = path
    }

    $scope.uploadFiles = function(question, file, errFiles) {
        question.f = file;
        question.errFile = errFiles && errFiles[0];
        if(question.errFile){
            $toastr.error(question.errFile.$error + ' : ' + question.errFile.$errorParam, 'Error');
        }
        if (file) {
            file.upload = Upload.upload({
                url: '/',
                data: {file: file}
            });

            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                });
            }, function (response) {
                if (response.status > 0)
                    question.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * 
                                         evt.loaded / evt.total));
            });
        }   
    }
    
    


    

}]);



