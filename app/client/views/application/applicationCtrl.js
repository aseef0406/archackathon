const angular = require("angular");
const swal = require("sweetalert");

angular.module('reg')
  .controller('ApplicationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    'currentUser',
    'settings',
    'Session',
    'UserService',
    function($scope, $rootScope, $state, $http, currentUser, settings, Session, UserService) {

      // Set up the user
      $scope.user = currentUser.data;

      // Is the student from MIT?
      $scope.isMitStudent = $scope.user.email.split('@')[1] == 'mit.edu';


      // Populate the school dropdown
      populateEmails();
      //populateSchools();
      _setupForm();

      $scope.regIsClosed = Date.now() > settings.data.timeClose;
      $scope.teamS=[];
      $scope.teamSizeFunc = function(){
        
        var i;
        for (i = 0; i < $scope.user.profile.teamSize; i++) {
          $scope.teamS.push(i)
        }
      }
      $scope.teamS.length=0;
      /**
       * TODO: JANK WARNING
       */function populateEmails(){
        var emails1=new Array();
        $scope.str="";
        UserService
          .getEmails()
          .then(response => {
            $scope.error = null;
            $scope.emailslist = response.data;
            console.log($scope.emailslist);
            for(i=0;i<$scope.emailslist.length;i++){
              //console.log($scope.emailslist[i]["email"]);
              $scope.str=$scope.str.concat($scope.emailslist[i]["email"]+",");
              
            }
            $scope.emails=$scope.str.split(",");
            console.log($scope.emails);
            for(i = 0; i < $scope.emails.length; i++) {
              $scope.emails[i] = $scope.emails[i].trim();
              content.push({title: $scope.emails[i]});
            }

            $('#teammem.ui.search')
              .search({
                source: content,
                cache: true,
                onSelect: function(result, response) {
                  $scope.user.idea.teammembers.emails.email1 = result.title.trim();
                }
              });
            //$scope.emails1=emails1;
          })
        //$scope.emails=['vamshi@arcserve.com','aseef@arcserve.com','francis@arcserve.com','aseef@arcserve.com','francis@arcserve.com'];
            //$scope.schools.push('Other');
            console.log($scope.emails);
            console.log($scope.emails);
            var content = [];
            for(i=0;i<emails1.length;i++){
              console.log(emails1[i]);
            }
            
        }
        /*
      function populateSchools(){
        $http
          .get('/assets/schools.json')
          .then(function(res){
            var schools = res.data;
            var email = $scope.user.email.split('@')[1];

            if (schools[email]){
              $scope.user.profile.school = schools[email].school;
              $scope.autoFilledSchool = true;
            }
          });

        $http
          .get('/assets/schools.csv')
          .then(function(res){
            $scope.schools = res.data.split('\n');
            $scope.schools.push('Other');

            var content = [];

            for(i = 0; i < $scope.schools.length; i++) {
              $scope.schools[i] = $scope.schools[i].trim();
              content.push({title: $scope.schools[i]});
            }

            $('#school.ui.search')
              .search({
                source: content,
                cache: true,
                onSelect: function(result, response) {
                  $scope.user.profile.school = result.title.trim();
                }
              });
          });
      }*/

      $scope.teammemname="";
      $scope.getUserByEmail = function(){
        console.log("yes email1");
        //console.log($scope.user.idea.teammembers.emails.email1);
        UserService
          .getUserByEmail($scope.user.idea.teammembers.emails.email1)
          .then(response=>{
            //console.log(response.data[0].profile.name);
            if(response.data[0]==null){
              $scope.teammemname1="Not Registered";
            }
            else{
            $scope.teammemname1=response.data[0].profile.name;
            }
          })
      }
      $scope.getUserByEmail2 = function(){
        console.log("yes email2");
        //console.log($scope.user.idea.teammembers.emails.email1);
        UserService
          .getUserByEmail($scope.user.idea.teammembers.emails.email2)
          .then(response=>{
            //console.log(response.data);
            if(response.data[0]==null){
              $scope.teammemname2="Not Registered";
            }
            else{
            $scope.teammemname2=response.data[0].profile.name;
            }
          })      }

      function _updateUser(e){
        UserService
          .updateProfile(Session.getUserId(), $scope.user.profile)
          .then(response => {
            swal("Awesome!", "Your application has been saved.", "success")//.then(value => {
              //$state.go("app.dashboard");
           // })
           ;
          }, response => {
            swal("Uh oh!", "Something went wrong.", "error");
          });
          /*var idea=$scope.user.idea;
          UserService
          .updateConfirmation(user._id, idea)
          .then(response => {
            swal("Woo!", "You're confirmed!", "success").then(value => {
              $state.go("app.dashboard");
            });
          }, response => {
            swal("Uh oh!", "Something went wrong.", "error");
          });*/
          console.log($scope.user.idea);
          console.log($scope.user.haveIdea);
          if($scope.user.haveIdea==true){
            console.log("yup inside ifblock")
            UserService
            .updateIdea(Session.getUserId(), $scope.user.idea);

            UserService
            .joinOrCreateTeam($scope.user.teamName)
            .then(response => {
              $scope.error = null;
              $scope.user = response.data;
            }, response => {
              $scope.error = response.data.message;
            });
            if($scope.user.idea.teamSize==1){
              console.log("teamsize=1");
              console.log($scope.user.teamName)
              UserService
                .setTeamName($scope.user.idea.teammembers.emails.email1,$scope.user.teamName).then(response => {
                  swal("Awesome!", "Your application has been saved.", "success")//.then(value => {
                    //$state.go("app.dashboard");
                 // })
                 ;
                }, response => {
                  swal("Uh oh!", "Something went wrong.", "error");
                });

            }
            if($scope.user.idea.teamSize==2){
              console.log("teamsize=2");
              UserService
              .setTeamName($scope.user.idea.teammembers.emails.email1,$scope.user.teamName).then(response => {
                swal("Awesome!", "Your application has been saved.", "success")//.then(value => {
                  //$state.go("app.dashboard");
               // })
               ;
              }, response => {
                swal("Uh oh!", "Something went wrong.", "error");
              });
              UserService
              .setTeamName($scope.user.idea.teammembers.emails.email2,$scope.user.teamName).then(response => {
                swal("Awesome!", "Your application has been saved.", "success")//.then(value => {
                  //$state.go("app.dashboard");
               // })
               ;
              }, response => {
                swal("Uh oh!", "Something went wrong.", "error");
              });

            }
          }
      }

      function isMinor() {
        return !$scope.user.profile.adult;
      }

      function minorsAreAllowed() {
        return settings.data.allowMinors;
      }

      function minorsValidation() {
        // Are minors allowed to register?
        if (isMinor() && !minorsAreAllowed()) {
          return false;
        }
        return true;
      }

      function _setupForm(){
        // Custom minors validation rule
        $.fn.form.settings.rules.allowMinors = function (value) {
          return minorsValidation();
        };

        // Semantic-UI form validation
        $('.ui.form').form({
          inline: true,
          fields: {
            /*name: {
              identifier: 'name',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your name.'
                }
              ]
            },
            school: {
              identifier: 'school',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter your school name.'
                }
              ]
            },
            year: {
              identifier: 'year',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select your graduation year.'
                }
              ]
            },
            gender: {
              identifier: 'gender',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please select a gender.'
                }
              ]
            },
            adult: {
              identifier: 'adult',
              rules: [
                {
                  type: 'allowMinors',
                  prompt: 'You must be an adult, or an MIT student.'
                }
              ]
            }*/
          }
        });
      }

      $scope.submitForm = function(){
        if ($('.ui.form').form('is valid')){
          _updateUser();
        } else {
          swal("Uh oh!", "Please Fill The Required Fields", "error");
        }
      };
    }]);
