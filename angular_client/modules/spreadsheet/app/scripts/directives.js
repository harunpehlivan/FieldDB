/* globals Glosser */
'use strict';
console.log("Declaring the SpreadsheetStyleDataEntryDirectives.");

// var lexiconFactory = LexiconFactory;
// var corpusSpecificGlosser;
// /**
//  * If the glosser & lexicon have not been created, this function makes it possible for users to specify any glosser url or lexicon url to use for downloading the precedece rules.
//  * @param  {String} pouchname   The database for which the glosser is to be created
//  * @param  {String} optionalUrl An optional url to a couchdb map reduce which has a format similar to morphemesPrecedenceContext and is able to create tuples used by the lexicon.
//  */
// var initGlosserAndLexiconIfNecessary = function(pouchname, optionalUrl){
//   //If the url isnt specified, use the users lexicon on corpus server
//   var url =  "https://corpus.lingsync.org/" + pouchname,
//   showWordBoundaries = true;

//   optionalUrl = optionalUrl ||  url + "/_design/lexicon/_view/morphemesPrecedenceContext?group=true";
//   if (!corpusSpecificGlosser) {
//     corpusSpecificGlosser = new Glosser({
//       pouchname: pouchname
//     });
//   }
//   if (!corpusSpecificGlosser.lexicon) {
//     corpusSpecificGlosser.downloadPrecedenceRules(pouchname, optionalUrl, function(precedenceRelations) {
//       corpusSpecificGlosser.lexicon = lexiconFactory({
//         precedenceRelations: precedenceRelations,
//         dbname: pouchname,
//         element: document.getElementById(pouchname+"-lexicon-viz"),
//         dontConnectWordBoundaries: !showWordBoundaries,
//         url: optionalUrl.replace(url, "")
//       });
//     });
//   }
// };

var convertFieldsIntoDatum = function(fieldLabelHolder, dataHolder) {
  var datum = {};
  for (var key in fieldLabelHolder) {
    if (fieldLabelHolder[key].label === "morphemes") {
      datum.morphemes = dataHolder[key];
      datum.morphemesfield = key;
    }
    if (fieldLabelHolder[key].label === "gloss") {
      datum.gloss = dataHolder[key];
      datum.glossfield = key;
    }
    if (fieldLabelHolder[key].label === "utterance") {
      datum.utterance = dataHolder[key];
      datum.utterancefield = key;
    }
    if (fieldLabelHolder[key].label === "allomorphs") {
      datum.allomorphs = dataHolder[key];
      datum.allomorphsfield = key;
    }
  }
  return datum;
};

angular.module('spreadsheetApp')
  .directive('selectFieldFromDefaultCompactTemplate', function() {
    return function(scope, element, attrs) {
      var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
      if (scope.field.label === Preferences.compacttemplate[attrs.selectFieldFromDefaultCompactTemplate].label) {
        element[0].selected = true;
      }
    };
  })
  .directive('selectFieldFromDefaultFullTemplate', function() {
    return function(scope, element, attrs) {
      var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
      if (scope.field.label === Preferences.fulltemplate[attrs.selectFieldFromDefaultFullTemplate].label) {
        element[0].selected = true;
      }
    };
  })
  .directive('selectFieldFromYaleFieldMethodsSpring2014Template', function() {
    return function(scope, element, attrs) {
      var Preferences = JSON.parse(localStorage.getItem('SpreadsheetPreferences'));
      if (scope.field.label === Preferences.yalefieldmethodsspring2014template[attrs.selectFieldFromYaleFieldMethodsSpring2014Template].label) {
        element[0].selected = true;
      }
    };
  })
  .directive('selectDropdownSession', function() {
    return function(scope, element) {
      scope.$watch('activeSession', function() {
        if (scope.session._id === scope.activeSession) {
          element[0].selected = true;
        }
      });
    };
  })
  .directive('spreadsheetCatchArrowKey', function($rootScope) {
    return function(scope, element) {
      element.bind('keyup', function(e) {
        if (e.keyCode !== 40 && e.keyCode !== 38) {
          return;
        }
        scope.$apply(function() {
          if (!scope.allData) {
            return;
          }
          // NOTE: scope.$index represents the the scope index of the record when an arrow key is pressed
          console.log("calculating arrows and requesting numberOfResultPages");
          var lastPage = scope.numberOfResultPages(scope.allData.length);
          var scopeIndexOfLastRecordOnLastPage = $rootScope.resultSize - (($rootScope.resultSize * lastPage) - scope.allData.length) - 1;
          var currentRecordIsLastRecord = false;
          var currentRecordIsFirstRecordOnNonFirstPage = false;
          if ($rootScope.currentPage === (lastPage - 1) && scopeIndexOfLastRecordOnLastPage === scope.$index) {
            currentRecordIsLastRecord = true;
          }
          if ($rootScope.currentPage > 0 && 0 === scope.$index) {
            currentRecordIsFirstRecordOnNonFirstPage = true;
          }

          if (e.keyCode === 40) {
            element[0].scrollIntoView(true);
          }

          if (e.keyCode === 38) {
            element[0].scrollIntoView(false);
          }

          if (e.keyCode === 40 && scope.$index === undefined) {
            // Select first record on next page if arrowing down from new record
            // $rootScope.currentPage = $rootScope.currentPage + 1;
            // scope.selectRow(0);
            //do nothing if it was the newEntry
          } else if (e.keyCode === 40 && currentRecordIsLastRecord === true) {
            // Do not go past very last record
            scope.selectRow('newEntry');
            return;
          } else if (e.keyCode === 40) {
            if (scope.$index + 2 > scope.scopePreferences.resultSize) {
              // If the next record down is on another page, change to that page and select the first record
              $rootScope.currentPage = $rootScope.currentPage + 1;
              scope.selectRow(0);
            } else {
              scope.selectRow(scope.$index + 1);
            }
          } else if (e.keyCode === 38 && scope.$index === undefined) {
            // Select new entry if coming from most recent record
            // scope.selectRow(scopeIndexOfLastRecordOnLastPage);
          } else if (e.keyCode === 38 && $rootScope.currentPage === 0 && (scope.$index === 0 || scope.$index === undefined)) {
            // Select new entry if coming from most recent record
            // scope.selectRow('newEntry');
          } else if (e.keyCode === 38 && scope.$index === 0) {
            // Go back one page and select last record
            $rootScope.currentPage = $rootScope.currentPage - 1;
            scope.selectRow(scope.scopePreferences.resultSize - 1);
          } else if (e.keyCode === 38) {
            scope.selectRow(scope.$index - 1);
          } else {
            return;
          }
        });
      });
    };
  })
  .directive('keypressMarkAsEdited', function($rootScope) {
    return function(scope, element) {
      element.bind('blur', function(e) {
        var keycodesToIgnore = [40, 38, 13, 39, 37, 9];
        if (keycodesToIgnore.indexOf(e.keyCode) === -1) {
          $rootScope.markAsEdited(scope.fieldData, scope.datum);
        } else {
          return;
        }
      });
    };
  })
  .directive('keypressMarkAsNew', function($rootScope) {
    return function(scope, element) {
      element.bind('keyup', function(e) {
        var keycodesToIgnore = [40, 38, 13, 39, 37, 9];
        if (keycodesToIgnore.indexOf(e.keyCode) === -1) {
          $rootScope.newRecordHasBeenEdited = true;
        } else {
          return;
        }
      });
    };
  })
  .directive('spreadsheetCatchFocusOnArrowPress', function($timeout) {
    return function(scope, element) {
      var selfElement = element;
      scope.$watch('activeDatumIndex', function(newIndex, oldIndex) {
        // element.bind('blur', function(e) {

        if (newIndex === oldIndex) {
          console.log('spreadsheetCatchFocusOnArrowPress hasnt changed');
          // return; //cant return, it makes it so you cant go to the next page
        }

        if (scope.activeDatumIndex === 'newEntry' || scope.activeDatumIndex === scope.$index) {
          $timeout(function() {

            if (document.activeElement !== selfElement.find("input")[0]) {
              console.log("arrow old focus", document.activeElement);
              // element[0].focus();
              selfElement.find("input")[0].focus();
              // document.getElementById("firstFieldOfEditingEntry").focus();
              console.log("arrow new focus", document.activeElement);
            }

          }, 0);
        }
      });
    };
  })
  .directive('guessUtteranceFromMorphemes', function() {
    return function(scope, element, attrs) {

      element.bind('blur', function(e) {
        console.log("which field is this", attrs.fieldLabel);
        if (attrs.fieldLabel === "morphemes") {
          var justCopyDontGuessIGT = false;
          if (!attrs.autoGlosserOn || attrs.autoGlosserOn === "false") {
            justCopyDontGuessIGT = true;
          }
          // Ignore arrows
          var keycodesToIgnore = [40, 38, 39, 37];
          if (keycodesToIgnore.indexOf(e.keyCode) > -1) {
            return;
          }
          var dataHolder = scope.fieldData ? scope.fieldData : scope.newFieldData;
          var datum = convertFieldsIntoDatum(scope.fields, dataHolder);
          datum.pouchname = scope.DB.pouchname;
          // initGlosserAndLexiconIfNecessary(scope.DB.pouchname);
          datum = Glosser.guessUtteranceFromMorphemes(datum, justCopyDontGuessIGT);
          scope.$apply(function() {
            dataHolder[datum.utterancefield] = datum.utterance;
          });
        }

      });
    };
  })
  .directive('guessMorphemesFromUtterance', function() {
    return function(scope, element, attrs) {
      element.bind('blur', function(e) {
        console.log("which field is this", attrs.fieldLabel);
        if (attrs.fieldLabel === "utterance") {
          var justCopyDontGuessIGT = false;
          if (!attrs.autoGlosserOn || attrs.autoGlosserOn === "false") {
            justCopyDontGuessIGT = true;
          }
          // Ignore arrows
          var keycodesToIgnore = [40, 38, 39, 37];
          if (keycodesToIgnore.indexOf(e.keyCode) > -1) {
            return;
          }
          var dataHolder = scope.fieldData ? scope.fieldData : scope.newFieldData;
          var datum = convertFieldsIntoDatum(scope.fields, dataHolder);
          datum.pouchname = scope.DB.pouchname;
          // initGlosserAndLexiconIfNecessary(scope.DB.pouchname);
          datum = Glosser.guessMorphemesFromUtterance(datum, justCopyDontGuessIGT);
          scope.$apply(function() {
            dataHolder[datum.morphemesfield] = datum.morphemes;
            dataHolder[datum.glossfield] = datum.gloss;
          });
        }

      });
    };
  })
  .directive('guessGlossFromMorphemes', function() {
    return function(scope, element, attrs) {
      element.bind('blur', function(e) {
        console.log("which field is this", attrs.fieldLabel);
        if (attrs.fieldLabel === "morphemes") {
          var justCopyDontGuessIGT = false;
          if (!attrs.autoGlosserOn || attrs.autoGlosserOn === "false") {
            justCopyDontGuessIGT = true;
          }
          // Ignore arrows
          var keycodesToIgnore = [40, 38, 39, 37];
          if (keycodesToIgnore.indexOf(e.keyCode) > -1) {
            return;
          }
          var dataHolder = scope.fieldData ? scope.fieldData : scope.newFieldData;
          var datum = convertFieldsIntoDatum(scope.fields, dataHolder);
          datum.pouchname = scope.DB.pouchname;
          // initGlosserAndLexiconIfNecessary(scope.DB.pouchname);
          datum = Glosser.guessGlossFromMorphemes(datum, justCopyDontGuessIGT);
          scope.$apply(function() {
            dataHolder[datum.glossfield] = datum.gloss;
          });
        }

      });
    };
  });
// .directive('loadPaginatedDataOnPageChange', function() {
//   return function(scope) {
//     scope.$watch('currentPage', function() {
//       scope.loadPaginatedData();
//     });
//   };
// });
