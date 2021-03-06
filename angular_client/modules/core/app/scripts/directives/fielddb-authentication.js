"use strict";
/* globals FieldDB */


/**
 * @ngdoc directive
 * @name fielddbAngularApp.directive:fielddbAuthentication
 * @description
 * # fielddbAuthentication
 */
angular.module("fielddbAngularApp").directive("fielddbAuthentication", function() {

  var controller = function($scope, $location, $timeout) {
    /* initialize or confirm scope is prepared */
    $scope.loginDetails = $scope.loginDetails || {};
    // $scope.application.authentication = $scope.application.authentication || {};
    // $scope.application.authentication.user = $scope.application.authentication.user || {};
    if ($scope.application && typeof $scope.application.debug === "function") {
      $scope.application.debug("Scope authentication is ", $scope.application.authentication);
    } else {
      console.warn("Somethign is wrong, there is no app defined. ");
    }
    var processUserDetails = function(user) {
      user.authenticated = true;
      user.accessibleDBS = user.accessibleDBS || [];
      user.mostrecentdb = "/";
      user.roles.map(function(role) {
        var dbname = role.substring(0, role.lastIndexOf("_"));
        if (role.indexOf("-") > -1 && role.indexOf("_reader") > -1 && user.accessibleDBS.indexOf(dbname) === -1) {
          dbname = dbname.replace("-", "/");
          user.accessibleDBS.push(dbname);
          if (dbname.indexOf("public") === -1 && dbname.indexOf("lingllama") === -1) {
            user.mostrecentdb = dbname;
          }
        }
        return role;
      });
      // try {
      //   // $scope.application.authentication.user = new FieldDB.User(user);
      // } catch (e) {
      //   console.log("problem parsing user", e, user);
      // }

      // $scope.team = user;
      // $rootScope.authenticated = true;
      // console.log($scope);

      if ($scope.application.authentication.user.accessibleDBS.indexOf("sails/fr-ca") > -1) {
        console.log("Redirecting the user to the manage sails dashboard" + "/sails/fr-ca/datalists");
        $scope.$apply(function() {
          $location.path("/sails/fr-ca/datalists", false);
        });
      } else if ($location.path() === "/welcome" || $location.path() === "/bienvenu" || window.location.pathname === "/welcome" || window.location.pathname === "/bienvenu") {
        $scope.$apply(function() {
          //http://joelsaupe.com/programming/angularjs-change-path-without-reloading/
          $location.path("/" + $scope.application.authentication.user.mostrecentdb, false);
        });
      }
      $timeout(function() {
        if (!$scope.$$phase) {
          $scope.$digest(); //$digest or $apply
        }
      }, 500);
    };
    $scope.register = function(registerDetails) {
      console.warn("TODO use $scope.corpus.register", registerDetails);
    };

    $scope.login = function(loginDetails) {
      $scope.isContactingServer = true;
      $scope.application.authentication.error = "";
      FieldDB.Database.prototype.login(loginDetails).then(function(user) {
        console.log("User has been downloaded. ", user);
        $scope.application.authentication.user.alwaysConfirmOkay = true;
        $scope.application.authentication.user.prefs.alwaysConfirmOkay = true;
        $scope.application.authentication.user.prefs.unicodes.alwaysConfirmOkay = true;
        $scope.application.authentication.user.merge("self", user);
        processUserDetails($scope.application.authentication.user);
        // $scope.isContactingServer = false;
      }, function(reason) {
        $scope.application.authentication.error = reason;
        // $scope.isContactingServer = false;
      }).catch(function() {
        $scope.isContactingServer = false;
        $scope.loginDetails.password = "";
        $scope.$digest();
      }).done(function() {
        $scope.isContactingServer = false;
        $scope.loginDetails.password = "";
        $scope.$digest();
      });
    };

    $scope.logout = function() {
      $scope.application.authentication.error = "";
      FieldDB.Database.prototype.logout().then(function(serverReply) {
        console.log("User has been logged out. ", serverReply);
        $scope.application.authentication = {
          user: new FieldDB.User({
            authenticated: false
          })
        };
        if (window.location.pathname !== "/welcome" && window.location.pathname !== "/bienvenu") {
          $scope.$apply(function() {
            // $location.path("/welcome/", false);
            window.location.replace("/#/welcome");
          });
        }
        $scope.$digest();
      }, function(reason) {
        $scope.application.authentication.error = reason;
        $scope.$digest();
      }).done(function() {
        $scope.isContactingServer = false;
        $scope.$digest();
      });
    };

    $scope.resumeAuthenticationSession = function() {
      // if (!$scope.corpus) {
      //   console.log("User cant resume authentication session, corpus is not defined ");
      //   return;
      // }
      FieldDB.Database.prototype.resumeAuthenticationSession().then(function(sessionInfo) {
        $scope.application.debug(sessionInfo);
        if (sessionInfo.ok && sessionInfo.userCtx.name) {
          $scope.application.authentication.user.username = sessionInfo.userCtx.name;
          $scope.application.authentication.user.roles = sessionInfo.userCtx.roles;
          processUserDetails($scope.application.authentication.user);
        } else {
          $scope.$apply(function() {
            $location.path("/welcome");
          });
        }
      }, function(reason) {
        console.log("Unable to login ", reason);
        $scope.error = "Unable to resume.";
        $scope.$digest();
        // $scope.$apply(function() {
        //   $location.path("/welcome");
        // });
      });
    };
    $scope.resumeAuthenticationSession();


  };
  controller.$inject = ["$scope", "$location", "$timeout"];

  /* Directive declaration */
  var directiveDefinitionObject = {
    templateUrl: "views/authentication.html", // or // function(tElement, tAttrs) { ... },
    restrict: "A",
    transclude: false,
    // scope: {
    //   authentication: "=json"
    // },
    controller: controller,
    link: function postLink() {},
    priority: 0,
    replace: true,
    controllerAs: "stringAlias"
  };
  return directiveDefinitionObject;
});
