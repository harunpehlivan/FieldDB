console.log("Loading the LingSyncSpreadsheetServices.");

'use strict';
define([ "angular" ], function(angular) {
  var LingSyncSpreadsheetServices = angular.module('LingSyncSpreadsheet.services', [ 'ngResource' ])
      .factory(
          'LingSyncData',
          function($http) {
            return {
              'async' : function(DB, UUID) {
                var couchInfo;
                if (UUID != undefined) {
                  couchInfo = "https://ifielddevs.iriscouch.com/" + DB
                  + "/" + UUID;
                  console.log("Contacting the DB to get LingSync data "
                      + couchInfo);
                  var promise = $http.get(couchInfo).then(function(response) {
                    console.log("Receiving LingSync data results ");
                    return response.data;
                  });
                  return promise;
                } else {
                  couchInfo = "https://lingllama:phoneme@ifielddevs.iriscouch.com/" + DB
                  + "/_design/data/_view/all_data";
                  console.log("Contacting the DB to get LingSync data "
                      + couchInfo);
                  var promise = $http.get(couchInfo).then(function(response) {
                    console.log("Receiving LingSync data results ");
                    return response.data.rows;
                  });
                  return promise;
                }
                
                
              },
              'saveNew' : function(DB, newRecord) {
                var couchInfo = "https://ifielddevs.iriscouch.com/" + DB;
                console.log("Contacting the DB to save new record. "
                    + couchInfo);
                var promise = $http.post(couchInfo, newRecord).then(function(response) {
                  return response;
                });
                return promise;
              },
              'saveEditedRecord' : function(DB, UUID, newRecord) {
                var couchInfo = "https://ifielddevs.iriscouch.com/" + DB + "/" + UUID;
                console.log("Contacting the DB to save edited record. "
                    + couchInfo);
                var promise = $http.put(couchInfo, newRecord).then(function(response) {
                  return response;
                });
                return promise;
              },
              'removeRecord' : function(DB, UUID, rev) {
                  var couchInfo = "https://ifielddevs.iriscouch.com/" + DB + "/" + UUID + "?rev=" + rev;
                  console.log("Contacting the DB to delete record. "
                      + couchInfo);
                  var promise = $http.delete(couchInfo).then(function(response) {
                    return response;
                    console.loge("response: " + JSON.stringify(response));
                  });
                  return promise;
                },
              'blankTemplate' : function() {
                var promise = $http.get('data/blank_template.json').then(function(response) {
                  return response.data;
                });
                return promise;
              },
              'getDatumFields' : function(DB) {
            	  console.log("Getting datum fields from server. https://ifielddevs.iriscouch.com/" + DB + "/_design/get_datum_fields/_view/get_datum_fields?group=true");
                var promise = $http.get("https://ifielddevs.iriscouch.com/" + DB + "/_design/get_datum_fields/_view/get_datum_fields?group=true").then(function(response) {
                  return response.data.rows;
                });
                return promise;
              }
            };
          });
  return LingSyncSpreadsheetServices;
});