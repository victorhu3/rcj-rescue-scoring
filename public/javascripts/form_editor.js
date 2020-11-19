// register the directive with your app module
var app = angular.module('FormEditor', ['ngTouch','ngAnimate', 'ui.bootstrap', 'pascalprecht.translate', 'ngCookies', 'color.picker', 'ngQuill']);

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
app.controller('FormEditorController', ['$scope', '$uibModal', '$log', '$http', '$translate', function ($scope, $uibModal, $log, $http, $translate) {

    let i18n_update,i18n_update_mes,i18n_create,i18n_create_mes,i18n_sameName,i18n_sameName_mes;
    $translate('signage.editor.alert.update').then(function (val) {
        i18n_update = val;
    }, function (translationId) {
        // = translationId;
    });
    $translate('signage.editor.alert.update_mes').then(function (val) {
        i18n_update_mes = val;
    }, function (translationId) {
        // = translationId;
    });
    $translate('signage.editor.alert.create').then(function (val) {
        i18n_create = val;
    }, function (translationId) {
        // = translationId;
    });
    $translate('signage.editor.alert.create_mes').then(function (val) {
        i18n_create_mes = val;
    }, function (translationId) {
        // = translationId;
    });
    $translate('signage.editor.alert.sameName').then(function (val) {
        i18n_sameName = val;
    }, function (translationId) {
        // = translationId;
    });
    $translate('signage.editor.alert.sameName_mes').then(function (val) {
        i18n_sameName_mes = val;
    }, function (translationId) {
        // = translationId;
    });

    $http.get("/api/competitions/" + competitionId).then(function (response) {
        $scope.competition = response.data
    })

    $http.get("/api/competitions/leagues/"+leagueId).then(function (response) {
        $scope.league = response.data
    });

    const currentLang = $translate.proposedLanguage() || $translate.use();
    const availableLangs =  $translate.getAvailableLanguageKeys();

    $scope.blocks = [];
    
    $scope.addBlock = function (number){
        let i18n = [{
            language: currentLang,
            title: '',
        }];

        for(let l of availableLangs){
            if(l != currentLang){
                i18n.push({
                    language: l,
                    title: '',
                });
            }
        }
        
        let tmp = {
            i18n: i18n,
            color: '2980b9',
            questions: []
        };
        $scope.blocks.splice(number,0,tmp);
    }

    $scope.moveBlock = function (origin, destination) {
        let temp = $scope.blocks[destination];
        $scope.blocks[destination] = $scope.blocks[origin];
        $scope.blocks[origin] = temp;
    };

    $scope.removeBlock = function (number){
        $scope.blocks.splice(number,1);
    }

    $scope.addQuestion = function (block, number, type){

        let i18n = [{
            language: currentLang,
            question: '',
            detail: '',
            example: '',
            options: [{
                value: 'option0',
                text: ''
            }]
        }];

        for(let l of availableLangs){
            if(l != currentLang){
                i18n.push({
                    language: l,
                    question: '',
                    detail: '',
                    example: '',
                    options: [{
                        value: 'option0',
                        text: ''
                    }]
                });
            }
        }

        let tmp = {
            i18n: i18n,
            type: type,
            required: true,
            fileName: ''
        };
        $scope.blocks[block].questions.splice(number,0,tmp);
    }

    $scope.moveQuestion = function (blockNo, origin, destination) {
        let temp = $scope.blocks[blockNo].questions[destination];
        $scope.blocks[blockNo].questions[destination] = $scope.blocks[blockNo].questions[origin];
        $scope.blocks[blockNo].questions[origin] = temp;
    };

    $scope.removeQuestion = function (blockNo, number){
        $scope.blocks[blockNo].questions.splice(number,1);
    }

    $scope.addOption = function(blockNo, questionNo, i18nNo){
        let otmp = {
            value: 'option'+$scope.blocks[blockNo].questions[questionNo].i18n[i18nNo].options.length,
            text: ''
        };
        $scope.blocks[blockNo].questions[questionNo].i18n[i18nNo].options.push(otmp);
    }

    $scope.moveOption = function (blockNo, questionNo, i18nNo, origin, destination) {
        let temp = $scope.blocks[blockNo].questions[questionNo].i18n[i18nNo].options[destination].text;
        $scope.blocks[blockNo].questions[questionNo].i18n[i18nNo].options[destination].text = $scope.blocks[blockNo].questions[questionNo].i18n[i18nNo].options[origin].text;
        $scope.blocks[blockNo].questions[questionNo].i18n[i18nNo].options[origin].text = temp;
    };
    
    $scope.removeOption = function (blockNo, questionNo, i18nNo, number){
        $scope.blocks[blockNo].questions[questionNo].i18n[i18nNo].options.splice(number,1);
    }
    
    
    
    $scope.go = function (path) {
        window.location = path
    }

    
    
    $scope.save = function () {
        console.log($scope.blocks);
    }

}]);



