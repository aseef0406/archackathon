const angular = require('angular');
const moment = require('moment');
const showdown = require('showdown');
const swal = require('sweetalert');

angular.module('reg')
  .controller('DashboardCtrl', [
    '$rootScope',
    '$scope',
    '$sce',
    'currentUser',
    '$state',
    '$stateParams',
    'settings',
    'Utils',
    'AuthService',
    'UserService',
    'EVENT_INFO',
    'DASHBOARD',
    function($rootScope, $scope, $sce, currentUser, settings, Utils, $state, $stateParams, AuthService, UserService, EVENT_INFO, DASHBOARD){
      var Settings = settings.data;
      var user = currentUser.data;
      $scope.user = user;
      //$scope.timeClose = Utils.formatTime(Settings.timeClose);
      //$scope.timeConfirm = Utils.formatTime(Settings.timeConfirm);

      $scope.DASHBOARD = DASHBOARD;
      
     /* for (var msg in $scope.DASHBOARD) {
        if ($scope.DASHBOARD[msg].includes('[APP_DEADLINE]')) {
          $scope.DASHBOARD[msg] = $scope.DASHBOARD[msg].replace('[APP_DEADLINE]', Utils.formatTime(Settings.timeClose));
        }
        if ($scope.DASHBOARD[msg].includes('[CONFIRM_DEADLINE]')) {
          $scope.DASHBOARD[msg] = $scope.DASHBOARD[msg].replace('[CONFIRM_DEADLINE]', Utils.formatTime(user.status.confirmBy));
        }
      }
*/
      // Is registration open?
     // var regIsOpen = $scope.regIsOpen = Utils.isRegOpen(Settings);

      // Is it past the user's confirmation time?
     // var pastConfirmation = $scope.pastConfirmation = Utils.isAfter(user.status.confirmBy);

      $scope.dashState = function(status){
        var user = $scope.user;
        switch (status) {
          case 'unverified':
            return !user.verified;
          case 'openAndIncomplete':
            return regIsOpen && user.verified && !user.status.completedProfile;
          case 'openAndSubmitted':
            return regIsOpen && user.status.completedProfile && !user.status.admitted;
          case 'closedAndIncomplete':
            return !regIsOpen && !user.status.completedProfile && !user.status.admitted;
          case 'closedAndSubmitted': // Waitlisted State
            return !regIsOpen && user.status.completedProfile && !user.status.admitted;
          case 'admittedAndCanConfirm':
            return !pastConfirmation &&
              user.status.admitted &&
              !user.status.confirmed &&
              !user.status.declined;
          case 'admittedAndCannotConfirm':
            return pastConfirmation &&
              user.status.admitted &&
              !user.status.confirmed &&
              !user.status.declined;
          case 'confirmed':
            return user.status.admitted && user.status.confirmed && !user.status.declined;
          case 'declined':
            return user.status.declined;
        }
        return false;
      };

     // $scope.showWaitlist = !regIsOpen && user.status.completedProfile && !user.status.admitted;

      $scope.resendEmail = function(){
        AuthService
          .resendVerificationEmail()
          .then(response => {
            swal("Your email has been sent.");
          });
      };


      // -----------------------------------------------------
      // Text!
      // -----------------------------------------------------
      var converter = new showdown.Converter();
     // $scope.acceptanceText = $sce.trustAsHtml(converter.makeHtml(Settings.acceptanceText));
      //$scope.confirmationText = $sce.trustAsHtml(converter.makeHtml(Settings.confirmationText));
      //$scope.waitlistText = $sce.trustAsHtml(converter.makeHtml(Settings.waitlistText));
      $scope.show_table=false;
      $scope.listIdeas = function(){
        $scope.show_table=true;
        UserService
          .getIdeas()
          .then(response => {
            $scope.error = null;
            $scope.ideaslist = response.data;
          });

      }
      $scope.joinTeam = function(){
        UserService
          .joinOrCreateTeam($scope.modalTeamname)
          .then(response => {
            $scope.error = null;
            $scope.user = response.data;
            swal("You have joined the team successfully!!!!!");
          }, response => {
            $scope.error = response.data.message;
          });
      };
      
      $scope.openModal = function(user){
        $scope.modalIdeatitle=user.idea.ideatitle;
        $scope.modalIdeadesc=user.idea.ideadesc;
        
        $scope.modalName=user.profile.name;
        $scope.modalTeamname=user.teamName;
        console.log("aseef : "+ $scope.modalTeamname);
        getTeammates(user._id,$scope.modalTeamname);
      };

      getTeammates = function(id,teamname){
        UserService
          .getMyTeammates(id,teamname)
          .then(response => {
            $scope.error = null;
            $scope.teammates = response.data;
          });

      }

      $scope.leaveTeam = function(){
        UserService
          .leaveTeam()
          .then(response => {
            $scope.error = null;
            $scope.user = response.data;
          }, response => {
            $scope.error = response.data.message;
          });
      };
      $scope.acceptUser = function($event, user, index) {
        $event.stopPropagation();

        console.log(user);
            UserService
              .admitUser(user._id)
        swal({
          title: "Sweet!",
          text: "you like it",
        })
              
          
        
      };
      $scope.declineAdmission = function(user){
        console.log("aseef");
      swal({
        title: "Whoa!",
        text: "Are decline your admission? \n\n You can't go back!",
        icon: "warning",
        buttons: {
          cancel: {
            text: "Cancel",
            value: null,
            visible: true
          },
          confirm: {
            text: "Yes, I can't make it",
            value: true,
            visible: true,
            className: "danger-button"
          }
        }
      }).then(value => {
        if (!value) {
          return;
        }

        UserService
          .declineAdmission(user._id)
          .then(response => {
            $rootScope.currentUser = response.data;
            $scope.user = response.data;
          });
      });

            
    };
  }]);
