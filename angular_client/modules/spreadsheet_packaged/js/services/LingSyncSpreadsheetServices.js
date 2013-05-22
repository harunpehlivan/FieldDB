console.log("Loading the LingSyncSpreadsheetServices.");

'use strict';
define([ "angular" ], function(angular) {
  var LingSyncSpreadsheetServices = angular.module('LingSyncSpreadsheet.services', [ 'ngResource' ])
      .factory(
          'LingSyncData',
          function($http, $rootScope) {
            return {
              'async' : function(DB, UUID) {
                var couchInfo;
                if (UUID != undefined) {
                  couchInfo = $rootScope.server + DB
                  + "/" + UUID;
                  console.log("Contacting the DB to get LingSync record data "
                      + couchInfo);
                  var promise = $http.get(couchInfo).then(function(response) {
                    console.log("Receiving LingSync data results ");
                    return response.data;
                  });
                  return promise;
                } else {
                  couchInfo = $rootScope.server + DB
                  + "/_design/pages/_view/datums";
                  console.log("Contacting the DB to get all LingSync corpus data for " + DB + " " 
                      + couchInfo);
                  var promise = $http.get(couchInfo).then(function(response) {
                    console.log("Receiving LingSync data results ");
                    return response.data.rows;
                  });
                  return promise;
                }
              },'datumFields' : function(DB) {
                var couchInfo = $rootScope.server + DB
                + "/_design/pages/_view/get_datum_fields";
                console.log("Contacting the DB to get LingSync datum fields for "
                    + couchInfo);
                var promise = $http.get(couchInfo).then(function(response) {
                  console.log("Receiving LingSync datum fields ");
                  return response.data.rows;
                });
                return promise;
              },
              'login' : function(user, password) {
                var couchInfo = $rootScope.server + "_session";
                var userInfo = {
                    "name" : user,
                    "password" : password
                };
                var promise = $http.post(couchInfo, userInfo).then(function(response) {
                  return response;
                }, function() {chrome.app.window.create('popup_error.html', {
                  width : 200,
                  height : 100
                }); $rootScope.loading=false;});
                return promise;
              },
              'saveNew' : function(DB, newRecord) {
                var couchInfo = $rootScope.server + DB;
                console.log("Contacting the DB to save new record. "
                    + couchInfo);
                var promise = $http.post(couchInfo, newRecord).then(function(response) {
                  return response;
                });
                return promise;
              },
              'saveEditedRecord' : function(DB, UUID, newRecord, rev) {
                var couchInfo;
                if (rev) {
                  couchInfo = $rootScope.server + DB + "/" + UUID + "?rev=" + rev;
                } else {
                  couchInfo = $rootScope.server + DB + "/" + UUID;
                }
                console.log("Contacting the DB to save edited record. "
                    + couchInfo);
                var promise = $http.put(couchInfo, newRecord).then(function(response) {
                  return response;
                });
                return promise;
              },
              'blankTemplate' : function() {
                var promise = $http.get('data/blank_template.json').then(function(response) {
                  return response.data;
                });
                return promise;
              },
              'blankSessionTemplate' : function() {
                var promise = $http.get('data/blank_session_template.json').then(function(response) {
                  return response.data;
                });
                return promise;
              },
              'removeRecord' : function(DB, UUID, rev) {
                var couchInfo = $rootScope.server + DB + "/" + UUID + "?rev=" + rev;
                console.log("Contacting the DB to delete record. "
                    + couchInfo);
                var promise = $http.delete(couchInfo).then(function(response) {
                  return response;
                });
                return promise;
              }
            };
          });
  return LingSyncSpreadsheetServices;
});